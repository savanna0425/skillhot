#!/usr/bin/env python3
"""Create faithful Chinese summaries with a local MLX model.

This is a manual review tool, not part of the daily workflow. It translates the
repository author's own description one item at a time, rejects repetitive or
overlong output, checkpoints after every repository, and uses zero API tokens.
The deterministic category audit lives in catalog-taxonomy.mjs.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

from mlx_lm import generate, load
from mlx_lm.sample_utils import make_sampler


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "public/data/skills.json"
PROGRESS_PATH = ROOT / ".local/catalog-review-progress.json"
OUTPUT_PATH = ROOT / "scripts/catalog-review.json"
DEFAULT_MODEL = Path.home() / ".OminiX/models/Qwen3.5-2B-MLX-4bit"

MANUAL = {
    "obra/superpowers": "为编程智能体提供从需求澄清、规划到测试交付的完整开发方法",
    "affaan-m/ECC": "面向 Claude Code、Codex 等编程 Agent 的性能优化与工程方法系统",
    "farion1231/cc-switch": "跨平台管理 Claude Code、Codex 等编程智能体及模型服务配置",
    "SaladDay/cc-switch-cli": "在命令行统一管理 Claude Code、Codex 与 Gemini CLI 配置",
    "openclaw/openclaw": "可运行在多种系统和平台上的开源个人 AI 助手",
    "danny-avila/LibreChat": "支持多模型切换、Agent、MCP、Skills 与自托管的开源 AI 对话平台",
    "heygen-com/hyperframes": "让智能体使用 HTML、CSS 与 GSAP 制作可确定性渲染视频的框架",
    "NousResearch/hermes-agent": "可随用户使用持续成长的开源 AI Agent",
    "xpzouying/xiaohongshu-mcp": "通过 MCP 接入小红书能力的开源服务",
    "mindfold-ai/Trellis": "用于构建和运行 AI Agent 的开源执行框架",
    "ibelick/ui-skills": "面向设计工程师的 UI 设计与实现 Skills 集合",
    "1jehuang/jcode": "用于构建和运行代码 Agent 的开源框架",
    "BuilderIO/skills": "供编码 Agent 使用的工程技能集合",
    "withastro/flue": "用于在隔离沙箱中运行 Agent 的开源框架",
    "emilkowalski/skills": "面向设计工程师的 Skills 集合",
    "formkit/formkit": "专为编码 Agent 设计的表单开发框架",
    "vercel-labs/zerolang": "面向 AI Agent 设计的编程语言",
    "PurpleAILAB/Decepticon": "面向红队安全测试的自主攻击 Agent",
    "amitness/learning": "记录作者持续学习内容与知识笔记的仓库",
    "microsoft/apm": "用于安装、发布与管理 Agent 软件包的包管理器",
    "sanbuphy/learn-coding-agent": "聚焦 Coding Agent 原理与实践的研究资料",
    "microsoft/AI-Engineering-Coach": "用于改进 Agent 工程实践的 AI 教练项目",
    "K-Dense-AI/claude-scientific-writer": "适用于多学科研究场景的通用科学写作 Agent",
    "Dimillian/Skills": "作者维护的 Codex Skills 个人合集",
    "masoncl/review-prompts": "用于 AI 输出评审与质量检查的提示词集合",
    "tradecatlabs/tradecat-public": "面向交易猫业务的数据系统项目",
}


def description_hash(skill: dict) -> str:
    value = f"{skill.get('fullName', '')}\n{skill.get('description', '').strip()}"
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:16]


def clean(text: str) -> str:
    text = re.sub(r"^```(?:text)?\s*|\s*```$", "", text.strip(), flags=re.I)
    text = text.splitlines()[0].strip().strip('"“”')
    text = re.sub(r"[\U0001F300-\U0001FAFF]", "", text)
    return re.sub(r"\s+", " ", text).strip().rstrip("。")


def trustworthy(text: str) -> bool:
    return (
        bool(re.search(r"[\u3400-\u9fff]", text))
        and 6 <= len(text) <= 120
        and not re.search(r"(\S{2,8})\1{4,}", text)
        and "作为一个AI" not in text
        and not re.search(r"可用于扩展 Agent|是一个面向.+的开源项目|提供可复用的 Agent 工作流|汇总并整理相关 Agent", text)
    )


def translate(model, tokenizer, skill: dict, temperature: float) -> str:
    prompt = tokenizer.apply_chat_template(
        [
            {
                "role": "system",
                "content": "你是专业英中翻译。忠实翻译作者的开源仓库简介，不增删功能，不解释，不评价。保留项目名、Claude、Codex、MCP、RAG 等专名。只输出一行简体中文译文。",
            },
            {"role": "user", "content": skill["description"].strip()},
        ],
        tokenize=False,
        add_generation_prompt=True,
        enable_thinking=False,
    )
    result = generate(
        model,
        tokenizer,
        prompt,
        verbose=False,
        max_tokens=180,
        sampler=make_sampler(temp=temperature, min_p=0.05),
    )
    return clean(result)


def fallback(skill: dict) -> str:
    current = clean(skill.get("summary", ""))
    if trustworthy(current) and not re.search(r"可用于扩展 Agent|是一个面向.+的开源项目", current):
        return current
    return f"{skill['name']} 的作者尚未提供足够简介，请查看 README 了解具体用途"


def save(items: dict[str, dict], source_generated_at: str) -> None:
    PROGRESS_PATH.parent.mkdir(parents=True, exist_ok=True)
    PROGRESS_PATH.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    output = {
        "meta": {
            "sourceGeneratedAt": source_generated_at,
            "repositories": len(items),
            "method": "author description + local Qwen3.5 translation + deterministic QA",
            "paidApiTokens": 0,
        },
        "items": items,
    }
    OUTPUT_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default=str(DEFAULT_MODEL))
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--retry-fallbacks", action="store_true")
    args = parser.parse_args()

    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    skills = data["skills"][: args.limit or None]
    progress = {} if args.force or not PROGRESS_PATH.exists() else json.loads(PROGRESS_PATH.read_text(encoding="utf-8"))
    # Manual corrections are authoritative and can be applied instantly without
    # re-running the local model across the full catalog.
    by_name = {skill["fullName"]: skill for skill in skills}
    for name, summary in MANUAL.items():
        if name in by_name:
            progress[name] = {
                "descriptionHash": description_hash(by_name[name]),
                "summary": summary,
                "reviewedBy": "manual",
            }
    if args.retry_fallbacks:
        progress = {name: item for name, item in progress.items() if "fallback" not in item.get("reviewedBy", "")}
    pending = [skill for skill in skills if skill["fullName"] not in progress]
    needs_model = any(skill.get("description") and not re.search(r"[\u3400-\u9fff]", skill["description"]) and skill["fullName"] not in MANUAL for skill in pending)
    model = tokenizer = None
    if needs_model:
        model, tokenizer = load(args.model)

    print(f"catalog={len(skills)} reviewed={len(progress)} pending={len(pending)}")
    for index, skill in enumerate(pending, start=1):
        name = skill["fullName"]
        if name in MANUAL:
            summary, method = MANUAL[name], "manual"
        elif re.search(r"[\u3400-\u9fff]", skill.get("description", "")):
            summary, method = clean(skill["description"]), "author-description-zh"
        elif skill.get("description"):
            candidate = ""
            for temperature in (0.3, 0.55, 0.75):
                candidate = translate(model, tokenizer, skill, temperature)
                if trustworthy(candidate):
                    break
            if trustworthy(candidate):
                summary, method = candidate, "local-translation"
            else:
                summary, method = fallback(skill), "qa-fallback"
        else:
            summary, method = fallback(skill), "metadata-fallback"
        progress[name] = {
            "descriptionHash": description_hash(skill),
            "summary": summary,
            "reviewedBy": method,
        }
        save(progress, data["meta"]["generatedAt"])
        if index % 25 == 0 or index == len(pending):
            print(f"reviewed {index}/{len(pending)}")

    ordered = {skill["fullName"]: progress[skill["fullName"]] for skill in skills}
    save(ordered, data["meta"]["generatedAt"])
    print(f"wrote {OUTPUT_PATH} ({len(ordered)} repositories, zero paid API tokens)")


if __name__ == "__main__":
    main()
