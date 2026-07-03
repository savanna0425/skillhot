import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { categoryMeta } from './catalog-taxonomy.mjs'

const overridePayload = readOptionalJson(new URL('./project-profile-overrides.json', import.meta.url))

export const manualProjectProfiles = {
  'obra/superpowers': {
    plainIntro: 'superpowers 是一套给 Claude Code、Codex 这类编程智能体使用的软件开发方法和技能集合，帮助它们按更稳定的流程写代码、测试、评审和交付。',
    whatItIs: '它不是一个单独的 UI 工具，也不是一组零散 prompt，而是一套可以放进 Agent 环境里的软件工程工作方法。你可以把它理解成给编程智能体配的一本团队开发手册：什么时候先计划、什么时候写测试、什么时候调试、什么时候做代码评审，都有对应的 skill 来约束流程。',
    problemSolved: [
      '编程智能体容易跳过计划、测试或复盘，任务一长就开始跑偏。',
      '同一套开发习惯很难稳定复用，每次都要重新写一大段提示词。',
      '团队想让 AI 写代码更像真实工程流程，而不是只靠一次性聊天指令。',
    ],
    coreCapabilities: [
      '让智能体按计划、实现、测试、评审这些步骤推进任务。',
      '把常用软件开发方法沉淀成可重复调用的 skills。',
      '在复杂任务中提醒 Agent 先确认需求、再计划，再实现，再验证。',
      '帮助你把个人或团队的开发纪律变成 Agent 能执行的工作流。',
    ],
    bestFor: [
      '经常用 Claude Code、Codex、OpenCode 等工具写代码的开发者。',
      '希望 AI 编程过程更稳定、更可复盘的人。',
      '想把团队工程规范沉淀成可复用 Agent 工作流的小团队。',
    ],
    notFor: [
      '只想找一个可视化 UI 组件库或桌面软件的人。',
      '不使用 Claude Code、Codex 或类似编程智能体的人。',
      '只需要一次性 prompt，不打算维护长期工作流的人。',
    ],
    howItWorks: [
      '仓库提供一组面向软件开发流程的 skills 和方法说明。',
      '你把需要的 skill 安装到对应 Agent 环境后，在任务中让 Agent 调用它。',
      'Agent 会按 skill 里的流程提醒自己：先理解问题，再计划，再实现，再验证。',
    ],
    gettingStarted: [
      '先打开 README，确认你的 Agent 工具是否支持这种 skill 组织方式。',
      '把仓库里的相关 skill 复制或安装到自己的 Agent Skills 目录。',
      '用一个小代码任务试跑，观察它是否真的按计划、测试、评审流程执行。',
    ],
    expectedOutcome: [
      'AI 写代码时更少跳步骤，长任务更容易保持纪律。',
      '重复的开发方法可以被复用，而不是每次重新写提示词。',
      '你能更快判断一次 AI 改动是否经过了必要的验证。',
    ],
    caveats: [
      '它提供的是方法和 skill 框架，不会替你自动保证代码质量。',
      '不同 Agent 工具的 skill 安装方式可能不同，仍要按 README 核对。',
      '如果你的团队流程很特殊，需要基于它再改成自己的版本。',
    ],
  },
  'anthropics/skills': {
    plainIntro: 'anthropics/skills 是 Agent Skills 的官方公共仓库，集中放了 Anthropic 提供的规范示例和参考实现，适合用来学习一个 Skill 应该怎么组织、描述和交付。',
    whatItIs: '它更像一个官方样板间，而不是单个业务工具。你可以在这里看 Anthropic 如何组织 Agent Skills：目录结构怎么放、说明文档怎么写、技能边界怎么定义，以及一个可复用 skill 应该交代哪些信息。',
    problemSolved: [
      '想写自己的 skill，但不知道标准结构和说明应该长什么样。',
      '网上有很多零散示例，难判断哪些写法更接近官方推荐。',
      '团队需要一个参考仓库，统一内部 skills 的命名、描述和交付方式。',
    ],
    coreCapabilities: [
      '提供官方 Agent Skills 示例，方便学习结构和写法。',
      '作为创建自定义 skills 时的参考模板。',
      '帮助团队统一 skill 文档、入口和使用说明的风格。',
    ],
    bestFor: [
      '准备创建或维护 Agent Skills 的开发者。',
      '想研究 Anthropic 官方 skill 设计方式的人。',
      '需要给团队建立 skills 规范的技术负责人。',
    ],
    notFor: [
      '想直接找某个垂直业务工具的人。',
      '不打算自己创建或改造 skills 的普通使用者。',
    ],
    howItWorks: [
      '仓库按 skill 示例和说明组织内容。',
      '你可以复制其中的结构，改成自己的领域能力。',
      '也可以把它当作检查清单，对照自己的 skill 是否说明清楚。',
    ],
    gettingStarted: [
      '先阅读 README，了解官方对 Agent Skills 的基本组织方式。',
      '选择一个与你需求接近的示例，观察它的目录和说明文档。',
      '用同样结构新建自己的 skill，再在 Agent 环境里测试。',
    ],
    expectedOutcome: [
      '更快理解官方 skill 的写法，不从零摸索。',
      '写出来的 skill 更容易被别人理解、安装和复用。',
      '团队内部的 skills 更统一，后续维护成本更低。',
    ],
    caveats: [
      '它主要是示例和参考，不等于所有 skill 都能直接解决你的业务问题。',
      '官方仓库会变化，具体格式仍以最新 README 为准。',
    ],
  },
  'farion1231/cc-switch': {
    plainIntro: 'cc-switch 是一个用来管理 Claude Code、Codex 等编程智能体配置和模型服务的工具，适合在多个 Agent、模型或 API 配置之间快速切换。',
    whatItIs: '它解决的是“我有好几个编程智能体和模型配置，不想每次手动改环境变量或配置文件”的问题。你可以把它理解成一个 Agent 配置切换器：把不同模型、不同服务商、不同工具的配置整理起来，需要时一键切换。',
    problemSolved: [
      '同时使用 Claude Code、Codex 或其他 Agent 时，配置容易混乱。',
      '不同模型服务的 API 地址、Key、模型名经常要手动切换。',
      '临时改配置容易出错，也不方便回到之前的工作环境。',
    ],
    coreCapabilities: [
      '集中管理多个 Agent 或模型服务配置。',
      '在不同 Claude Code、Codex 或模型提供商配置之间快速切换。',
      '减少手动改配置文件、环境变量带来的错误。',
    ],
    bestFor: [
      '同时使用多个编程智能体或模型服务的开发者。',
      '经常在不同 API 提供商、模型或项目环境之间切换的人。',
      '想把本地 Agent 配置管理得更清楚的重度用户。',
    ],
    notFor: [
      '只固定使用一个模型、一个工具、一个配置的人。',
      '完全不想接触命令行或本地配置文件的人。',
    ],
    howItWorks: [
      '你先把不同 Agent 或模型服务的配置写入 cc-switch 支持的配置格式。',
      '需要切换时，通过命令选择目标配置。',
      '工具会把当前环境切到对应模型、服务商或 Agent 配置。',
    ],
    gettingStarted: [
      '先阅读 README，确认它支持你正在使用的 Agent 工具。',
      '准备好不同服务商的 API 地址、Key 和模型名。',
      '按示例创建配置，再用一个低风险项目测试切换是否生效。',
    ],
    expectedOutcome: [
      '多个 Agent 和模型配置不再散落在不同文件里。',
      '切换模型服务更快，出错概率更低。',
      '你可以更清楚地知道当前项目正在用哪套配置。',
    ],
    caveats: [
      '它是配置管理工具，不是模型服务本身，也不会提供 API Key。',
      '涉及 API Key 时要注意本地权限和密钥泄露风险。',
      '不同工具版本的配置格式可能变化，使用前要核对 README。',
    ],
  },
}

const categoryProfiles = {
  'UI设计': {
    noun: '界面与视觉质量工具',
    problemSolved: ['让 Agent 做出来的页面缺少设计感，细节经常显得粗糙。', '团队需要把设计原则、组件规范或审美约束交给 Agent 复用。', '从想法到可展示界面之间缺少一个稳定的辅助流程。'],
    coreCapabilities: ['辅助生成或改进界面、组件、演示页面与视觉方案。', '把设计系统、布局、色彩或可访问性要求整理成 Agent 可执行的步骤。', '帮助你在打开 README 前判断它是否适合当前 UI 任务。'],
    bestFor: ['用 Agent 做网页、App 原型或视觉材料的人。', '希望提高前端页面完成度的开发者。', '需要把设计规范沉淀为可复用流程的小团队。'],
    notFor: ['只想下载现成 UI 模板、不打算接入 Agent 工作流的人。', '需要完整商业设计服务或品牌策略的人。'],
    howItWorks: ['通常通过文档、Skill、CLI 或示例约束 Agent 的设计输出。', '用户把它接入目标工具后，在界面任务中调用对应流程。', '具体生成效果取决于你的模型能力、素材质量和项目约束。'],
    gettingStarted: ['先看 README 中的示例截图或输出案例。', '确认它支持你的前端框架、设计工具或 Agent 客户端。', '用一个小页面或组件试跑，再决定是否用于正式项目。'],
    expectedOutcome: ['更快得到可展示的界面雏形。', '减少“能运行但不好看”的 Agent 输出。', '把审美要求变成更稳定的工作流。'],
  },
  '编程开发': {
    noun: '软件开发辅助项目',
    problemSolved: ['Agent 写代码时容易跳过规划、测试、评审或上下文整理。', '复杂代码任务需要更明确的工程流程，而不是只靠一句提示。', '团队希望把开发经验沉淀成可重复执行的能力。'],
    coreCapabilities: ['辅助完成代码生成、调试、测试、评审、架构或工程交付。', '把软件开发方法整理成 Agent 可以跟随的流程或工具。', '帮助你先判断它是否适合你的当前任务，再决定是否深入 README。'],
    bestFor: ['经常用 Claude Code、Codex、Cursor 或类似工具写代码的开发者。', '需要让 Agent 参与真实工程任务的团队。', '想把开发流程标准化、可复盘的人。'],
    notFor: ['只想找一个无需配置的成品 SaaS 工具的人。', '不打算让 Agent 参与代码或工程流程的人。'],
    howItWorks: ['通常通过 Skill、脚本、CLI、模板或工作流说明接入开发环境。', 'Agent 会根据仓库提供的方法处理具体开发任务。', '最终质量仍需要你用测试、构建和代码评审来确认。'],
    gettingStarted: ['先读 README 的安装步骤和示例任务。', '在一个小仓库或低风险分支中试用。', '确认它和你的语言、框架、Agent 客户端兼容后再扩大使用范围。'],
    expectedOutcome: ['开发流程更有章法，长任务更不容易散。', '重复性的工程经验可以被复用。', '你能更快判断一个仓库是否值得投入时间试用。'],
  },
  '办公效率': {
    noun: '办公与个人效率工具',
    problemSolved: ['文档、邮件、日程、笔记或资料整理经常占用大量重复时间。', '不同办公工具之间的信息流转需要手动复制、整理和检查。', '用户想把个人工作流交给 Agent 承接，但缺少现成入口。'],
    coreCapabilities: ['辅助处理文档、表格、邮件、笔记、PDF 或日程相关任务。', '把常见办公流程封装成更容易调用的 Agent 能力。', '帮助你判断它是否能接入自己的日常工具链。'],
    bestFor: ['经常处理文档、知识库、邮件或会议资料的人。', '希望用 Agent 降低重复办公成本的个人或团队。', '需要把资料整理流程标准化的人。'],
    notFor: ['需要严格企业级权限审计但尚未核对安全边界的场景。', '只想找传统办公软件替代品、不打算使用 Agent 的人。'],
    howItWorks: ['通常通过 API、CLI、插件或 Skill 与办公工具连接。', '用户授权或配置后，让 Agent 执行整理、生成、查询或同步任务。', '涉及个人数据时，需要自己确认权限和隐私设置。'],
    gettingStarted: ['先确认它支持你正在用的办公平台。', '用不敏感的测试文档或样例数据试跑。', '再决定是否接入真实邮箱、日历、文档或知识库。'],
    expectedOutcome: ['重复整理工作减少。', '资料查找、生成和同步更快。', '个人工作流更容易被 Agent 接住。'],
  },
  '内容创作': {
    noun: '内容生产辅助项目',
    problemSolved: ['图片、视频、演示、文案或社交内容制作流程容易碎片化。', '同一套内容风格难以稳定复用。', '创作任务需要把素材、脚本、生成和发布流程串起来。'],
    coreCapabilities: ['辅助生成或整理图文、视频、演示、脚本、字幕、音频等内容。', '把创作步骤、风格要求或发布流程沉淀成 Agent 可调用能力。', '帮助你先判断它是否适合当前内容生产任务。'],
    bestFor: ['内容创作者、运营、设计师和需要频繁产出素材的人。', '用 Agent 做短视频、PPT、封面、文案或图文的人。', '想把固定内容流程模板化的小团队。'],
    notFor: ['需要专业版权、品牌法务或成片质检但尚未人工复核的场景。', '只想要一键生成所有内容且不参与编辑的人。'],
    howItWorks: ['通常通过模板、提示词、脚本、Skill 或生成工具串联创作流程。', '用户提供主题、素材或目标平台后，让 Agent 生成初稿或半成品。', '最终发布前仍需要人工审稿、校对和版权检查。'],
    gettingStarted: ['先看 README 里的输入格式和示例输出。', '用一条低风险内容试做，观察风格是否符合你的账号定位。', '确认可编辑性和导出格式后再纳入正式流程。'],
    expectedOutcome: ['从选题到初稿的速度更快。', '内容风格更容易保持一致。', '重复性创作流程可以被复用。'],
  },
  '数据分析': {
    noun: '数据分析辅助项目',
    problemSolved: ['SQL、表格、统计、可视化或数据清洗步骤容易重复。', '非数据团队成员看不懂数据处理流程。', 'Agent 做数据任务时需要更明确的工具和边界。'],
    coreCapabilities: ['辅助处理 SQL、表格、统计、图表、数据清洗或分析报告。', '把数据任务拆成可执行步骤，方便 Agent 跟进。', '帮助你判断它是否适合当前分析场景。'],
    bestFor: ['需要快速探索数据的开发者、分析师和运营人员。', '希望用 Agent 生成分析脚本、图表或报告的人。', '想把常见数据流程标准化的团队。'],
    notFor: ['要求严格审计、合规或生产级数据治理但尚未核验的场景。', '完全不愿检查结果准确性的人。'],
    howItWorks: ['通常通过脚本、Notebook、CLI、数据库连接或 Skill 执行分析流程。', '用户提供数据源或问题，Agent 按步骤生成查询、处理和解读。', '关键结论仍要回到原始数据验证。'],
    gettingStarted: ['先用公开或脱敏数据试跑。', '确认依赖环境、数据库权限和导出格式。', '再用于真实业务数据，并保留人工复核。'],
    expectedOutcome: ['更快完成数据探索和初步报告。', '重复分析步骤更容易复用。', '数据任务的输入、处理和输出更清楚。'],
  },
  '研究学习': {
    noun: '研究与学习辅助项目',
    problemSolved: ['资料、论文、课程或知识点太分散，整理成本高。', 'Agent 做研究任务时容易缺少来源意识和结构化步骤。', '学习或调研需要从大量材料中快速建立脉络。'],
    coreCapabilities: ['辅助完成资料检索、文献阅读、知识整理、推理或学习计划。', '把研究问题拆成可追踪、可复核的步骤。', '帮助你判断它是否适合当前研究主题。'],
    bestFor: ['学生、研究者、知识工作者和需要快速调研的人。', '想让 Agent 帮忙读论文、整理资料或建立学习路线的人。', '需要把研究过程沉淀成固定流程的团队。'],
    notFor: ['把输出直接当作学术结论、医疗建议或投资建议的人。', '不愿核对来源和原文的人。'],
    howItWorks: ['通常通过资料检索、阅读模板、引用整理或 Skill 流程辅助研究。', '用户给出主题后，Agent 会按仓库说明收集、归纳或生成结构化内容。', '可信度取决于来源质量和你的人工复核。'],
    gettingStarted: ['先用一个小主题测试它的资料组织方式。', '确认输出是否保留来源、链接或可追溯线索。', '再用于正式论文、报告或学习项目。'],
    expectedOutcome: ['更快看清一个主题的主要脉络。', '阅读和整理资料的重复劳动减少。', '学习或研究过程更容易复盘。'],
  },
  '自动化': {
    noun: '流程自动化项目',
    problemSolved: ['网页操作、工具集成和重复流程经常需要人工一步步处理。', '跨平台工作流缺少统一入口。', 'Agent 想执行真实操作时，需要可靠的工具连接方式。'],
    coreCapabilities: ['辅助自动化浏览器、网页抓取、工具调用、批处理或跨系统集成。', '把重复任务封装成 Agent 可以触发的流程。', '帮助你判断它是否适合当前自动化任务。'],
    bestFor: ['经常处理重复网页操作、数据搬运或工具联动的人。', '想让 Agent 执行半自动流程的开发者和运营人员。', '需要把日常任务脚本化的小团队。'],
    notFor: ['涉及账号风控、违规抓取或平台禁止自动化的场景。', '没有能力检查自动化结果和异常的人。'],
    howItWorks: ['通常通过浏览器控制、API、CLI、Webhook 或 Skill 执行任务。', '用户配置目标工具后，让 Agent 按流程操作。', '稳定性取决于目标网站、权限和异常处理。'],
    gettingStarted: ['先用测试账号或非关键任务验证。', '确认它是否遵守目标平台规则。', '把失败重试、日志和人工确认步骤补上后再扩大使用。'],
    expectedOutcome: ['重复操作耗时减少。', '跨工具流程更顺。', 'Agent 可以承担更多可控的执行型任务。'],
  },
  '安全': {
    noun: '安全与风险检查项目',
    problemSolved: ['代码、配置、依赖或 Agent 工具链里的风险不容易系统检查。', '安全排查需要固定流程，不能只靠临时经验。', '团队希望把安全审计能力前置到开发或使用阶段。'],
    coreCapabilities: ['辅助安全审计、漏洞研究、权限检查、合规排查或威胁分析。', '把安全检查步骤整理成可复用的 Agent 工作流。', '帮助你判断它是否适合当前风险场景。'],
    bestFor: ['开发者、安全研究员和需要做风险自查的团队。', '想把安全检查嵌入 Agent 或开发流程的人。', '需要快速筛查配置、依赖或代码风险的人。'],
    notFor: ['未经授权的攻击、绕过或滥用场景。', '把工具输出当作最终安全结论而不做人工复核的人。'],
    howItWorks: ['通常通过规则、脚本、扫描器、Skill 或报告模板执行检查。', '用户提供目标代码、配置或范围后，Agent 按流程分析并输出线索。', '安全结论需要结合上下文和专业复核。'],
    gettingStarted: ['先阅读许可和使用边界。', '在你有授权的项目中试跑。', '把发现的问题交给人工确认后再修复或披露。'],
    expectedOutcome: ['更早发现潜在风险。', '安全检查过程更有结构。', '团队可以复用固定审计流程。'],
  },
  '记忆与上下文': {
    noun: '记忆与上下文管理项目',
    problemSolved: ['长任务容易丢上下文，Agent 记不住项目历史。', '资料、代码和决策分散，下一次会话很难续接。', '团队需要让 Agent 更可靠地检索旧信息。'],
    coreCapabilities: ['提供记忆、上下文压缩、知识检索、RAG 或知识图谱能力。', '帮助 Agent 在长任务中保留关键事实和决策。', '帮助你判断它是否适合当前长期项目。'],
    bestFor: ['长期使用 Agent 做项目的人。', '需要跨会话续接、知识库检索或团队记忆的人。', '代码库、文档库或资料库较大的团队。'],
    notFor: ['只做一次性短任务、不需要保存上下文的人。', '涉及敏感数据但没有权限隔离和清理方案的场景。'],
    howItWorks: ['通常通过本地文件、数据库、向量检索、知识图谱或 Skill 接入 Agent。', '用户把项目资料写入或同步到记忆层后，Agent 可按需检索。', '效果取决于数据质量、分块方式和权限管理。'],
    gettingStarted: ['先用一个小项目或公开资料库测试。', '确认数据存储位置、权限和删除方式。', '再把长期项目资料逐步迁入。'],
    expectedOutcome: ['跨会话续接更顺。', 'Agent 更容易找回项目背景和历史决策。', '长任务的上下文管理成本下降。'],
  },
  'Agent工具与平台': {
    noun: 'Agent 工具或运行平台',
    problemSolved: ['多个 Agent、模型、工具和配置之间切换成本高。', '想让 Agent 执行真实任务，但缺少统一运行环境或编排方式。', '模型、工具、记忆和权限散落在不同地方，不方便管理。'],
    coreCapabilities: ['提供 Agent 客户端、模型路由、工具接入、任务编排或运行环境。', '把模型、插件、工作流和配置集中管理。', '帮助你判断它是否适合自己的 Agent 工具链。'],
    bestFor: ['重度使用 Claude、Codex、Cursor、OpenCode、Gemini 等工具的人。', '需要管理多个模型、多个 Agent 或多个项目环境的开发者。', '想搭建个人或团队 Agent 工作台的人。'],
    notFor: ['只需要一个简单聊天窗口、不想配置工具链的人。', '不愿处理 API Key、权限、部署或本地环境的人。'],
    howItWorks: ['通常通过桌面端、CLI、Web 服务、MCP 或配置文件连接模型和工具。', '用户配置模型服务、权限和项目后，在平台里发起任务。', '稳定性取决于模型服务、插件生态和本地/云端配置。'],
    gettingStarted: ['先确认它支持你常用的模型和 Agent 客户端。', '用低权限 API Key 或测试配置跑一个小任务。', '确认日志、权限和密钥存储方式后再接入正式项目。'],
    expectedOutcome: ['多个 Agent 或模型配置更清楚。', '任务编排和工具调用更集中。', '个人 Agent 工作流更容易长期维护。'],
  },
  '产品与商业': {
    noun: '产品与商业工作流项目',
    problemSolved: ['产品、营销、销售、增长或商业分析任务经常依赖大量模板和重复调研。', '团队想让 Agent 辅助决策，但需要更清晰的流程。', '从用户需求到策略输出之间缺少可复用方法。'],
    coreCapabilities: ['辅助产品发现、市场调研、增长分析、营销内容、销售或商业决策。', '把商业工作流整理成 Agent 可以执行的步骤。', '帮助你判断它是否适合当前业务问题。'],
    bestFor: ['产品经理、创业者、运营、市场和销售团队。', '想用 Agent 做用户研究、竞品分析或增长方案的人。', '需要把业务流程模板化的小团队。'],
    notFor: ['把输出直接当作法律、财务或投资建议的人。', '没有真实业务数据和人工判断，只想自动替代决策的人。'],
    howItWorks: ['通常通过模板、研究流程、脚本或 Skill 辅助产出业务材料。', '用户输入目标、背景和约束后，Agent 按流程生成分析或方案。', '最终决策仍需要结合真实数据和业务经验。'],
    gettingStarted: ['先用一个具体业务问题试跑。', '补充目标用户、市场背景和约束条件。', '把输出当作初稿，再用真实数据和团队经验修订。'],
    expectedOutcome: ['业务分析和材料初稿更快。', '产品或增长流程更容易复用。', '团队讨论有更清楚的起点。'],
  },
  '技能开发': {
    noun: 'Skills 创建与管理工具',
    problemSolved: ['想创建 Skill，但不知道结构、规范、安装和验证流程。', '团队内部 skills 越来越多，缺少管理、复用和分发方式。', '把现有知识转成 Agent 可调用能力时容易不成体系。'],
    coreCapabilities: ['辅助创建、生成、验证、安装、管理或分发 Agent Skills。', '把技能文件、说明文档和触发方式组织起来。', '帮助你判断它是否适合搭建自己的技能库。'],
    bestFor: ['准备写自定义 Agent Skills 的开发者。', '需要维护团队技能库或插件库的人。', '想把文档、流程或经验产品化为 Skill 的团队。'],
    notFor: ['只想直接使用现成工具、不打算创建或维护 Skill 的人。', '没有明确技能场景，只想批量生成空壳的人。'],
    howItWorks: ['通常通过 CLI、模板、规范检查或生成器创建 Skill 文件。', '用户输入领域说明或现有材料后，工具生成可安装结构。', '生成后仍需要在真实 Agent 环境里测试。'],
    gettingStarted: ['先阅读它支持的 Skill 格式。', '用一个很小的技能需求生成或校验。', '放进目标 Agent 客户端试跑，再迭代说明文档。'],
    expectedOutcome: ['创建 Skill 的门槛降低。', '技能结构更统一，别人更容易安装和理解。', '团队知识更容易变成可执行能力。'],
  },
  '技能合集': {
    noun: 'Skills 目录或合集',
    problemSolved: ['相关 Skills 分散在 GitHub、文档和社区里，逐个搜索很费时间。', '用户不知道哪些技能值得先看。', '团队需要一个集中入口来对比不同资源。'],
    coreCapabilities: ['集中整理 Skills、插件、示例、教程或资源链接。', '按领域、平台或用途帮助用户快速发现项目。', '帮助你判断哪些条目值得继续打开 README。'],
    bestFor: ['正在为 Claude、Codex、Cursor、OpenCode 等工具找技能的人。', '想快速了解某个生态有哪些资源的人。', '需要给团队建立候选清单的人。'],
    notFor: ['想要一个单一成品工具、马上解决具体业务问题的人。', '不愿逐项筛选和阅读 README 的人。'],
    howItWorks: ['通常以 README、目录结构或清单形式维护资源。', '用户从目录里选择具体项目，再进入对应仓库安装或试用。', '质量取决于维护者更新频率和收录标准。'],
    gettingStarted: ['先看目录是否按平台、领域或用途分类。', '优先打开更新较新、说明完整、Stars 和社区反馈较好的条目。', '选出 2 到 3 个候选后再实际安装测试。'],
    expectedOutcome: ['减少搜索同类项目的时间。', '更快建立一个技能生态的整体地图。', '选型时更容易横向比较。'],
  },
  '其他': {
    noun: '开源 Agent 相关项目',
    problemSolved: ['项目用途可能比较垂直，单看仓库名不容易判断是否相关。', '用户需要先快速判断它和自己的任务有没有关系。', '没有统一分类时，仍需要一个可读的选型入口。'],
    coreCapabilities: ['整理仓库公开信息，帮助你理解它可能服务的任务。', '把平台、用法、限制和下一步试用方式摆在同一页。', '帮助你决定是否继续打开 README。'],
    bestFor: ['愿意探索垂直开源项目的人。', '需要快速筛选 GitHub 项目的开发者和 Agent 用户。', '想发现非典型但可能有用工具的人。'],
    notFor: ['需要成熟商业产品和完整售后的人。', '不愿阅读 README 或自己验证项目质量的人。'],
    howItWorks: ['通常依赖仓库提供的 README、代码、示例或安装命令。', '用户按文档把它接入目标环境。', '真实效果需要通过小任务试用来判断。'],
    gettingStarted: ['先看作者原始描述和 README。', '确认许可证、最近更新和安装方式。', '用低风险样例任务测试，再决定是否收藏或深入使用。'],
    expectedOutcome: ['更快判断项目是否值得继续看。', '减少在 GitHub 上反复跳转的成本。', '为后续选型留下一个清晰起点。'],
  },
}

export function sourceHashForProfile(skill) {
  return createHash('sha256').update([
    skill.fullName,
    skill.description,
    skill.summary,
    skill.category,
    skill.updatedAt,
    skill.pushedAt,
    ...(skill.platforms || []),
    ...(skill.scenarios || []),
    ...(skill.repoTopics || []),
  ].join('\n')).digest('hex').slice(0, 16)
}

export function projectProfileFor(skill) {
  const override = overrideProfileFor(skill)
  if (override) return override
  const manual = manualProjectProfiles[skill.fullName]
  if (manual) return manual
  return deterministicProjectProfileFor(skill)
}

export function hasCompleteProjectProfile(profile) {
  if (!profile || typeof profile !== 'object') return false
  const stringFields = ['plainIntro', 'whatItIs']
  const arrayFields = ['problemSolved', 'coreCapabilities', 'bestFor', 'notFor', 'howItWorks', 'gettingStarted', 'expectedOutcome', 'caveats']
  return stringFields.every((field) => typeof profile[field] === 'string' && /[㐀-鿿]/.test(profile[field]))
    && arrayFields.every((field) => Array.isArray(profile[field]) && profile[field].length >= 2 && profile[field].every((item) => typeof item === 'string' && /[㐀-鿿]/.test(item)))
}

function deterministicProjectProfileFor(skill) {
  const category = categoryProfiles[skill.category] ? skill.category : '其他'
  const template = categoryProfiles[category]
  const name = displayName(skill)
  const summary = cleanSentence(skill.summary || skill.description || `${name} 和 ${categoryMeta[category] || 'Agent 工作流'}相关`)
  const scenario = firstText(skill.scenarios) || categoryMeta[category] || 'Agent 工作流'
  const platformText = platformsText(skill)
  const originalDescription = cleanSentence(skill.description || '')
  const descriptionLine = /[㐀-鿿]/.test(originalDescription) && !similarText(originalDescription, summary)
    ? `作者原始描述提到：${originalDescription}。`
    : ''

  if (skill.isCollection || category === '技能合集') {
    return withDynamicCaveats(skill, {
      plainIntro: `${name} 是一个面向 ${platformText} 的 Skills 目录或资源合集，用来帮你集中发现、比较和筛选相关项目。`,
      whatItIs: `${name} 可以先理解为一个选型入口：它把分散的 Skills、插件、示例或社区资源放到一起。${descriptionLine}你可以先判断它是否适合你的当前任务，再决定打开哪些具体仓库继续阅读 README。`,
      ...pickFields(template, skill),
    })
  }

  return withDynamicCaveats(skill, {
    plainIntro: `${name}：${summary}。适合在 ${platformText} 相关工作流里先做选型判断。`,
    whatItIs: `${name} 可以先理解为一个「${template.noun}」。它围绕「${scenario}」这类任务，把公开仓库里的方法、工具或流程整理成可试用的开源入口。${descriptionLine}你可以先判断它是否适合你的当前任务，再决定是否打开 README 深入配置。`,
    ...pickFields(template, skill),
  })
}

function pickFields(template, skill) {
  const scenario = firstText(skill.scenarios)
  const platforms = platformsText(skill)
  const skillCountLine = skill.skillCount > 1
    ? `仓库信息显示它包含 ${skill.skillCount}+ 项能力或技能线索，适合先按目录筛选。`
    : `它更像一个单项工具或单一方向项目，适合先用小任务验证。`

  return {
    problemSolved: dedupe([
      ...template.problemSolved,
      scenario ? `如果你的任务和「${scenario}」有关，它能帮你先建立一个可试用的入口。` : '',
    ]).slice(0, 4),
    coreCapabilities: dedupe([
      ...template.coreCapabilities,
      `把仓库公开信息、平台和安装入口集中展示，减少你在 GitHub 来回翻找。`,
    ]).slice(0, 4),
    bestFor: dedupe([
      ...template.bestFor,
      platforms ? `正在使用 ${platforms} 等 Agent 工具链的人。` : '',
    ]).slice(0, 4),
    notFor: template.notFor,
    howItWorks: dedupe([
      ...template.howItWorks,
      skillCountLine,
    ]).slice(0, 4),
    gettingStarted: template.gettingStarted,
    expectedOutcome: template.expectedOutcome,
    caveats: template.caveats || [],
  }
}

function withDynamicCaveats(skill, profile) {
  const caveats = dedupe([
    ...(profile.caveats || []),
    skill.license ? `许可证为 ${skill.license}，商用或二次分发前仍建议核对条款。` : '仓库未声明许可证，商用或二次分发前需要谨慎核对。',
    skill.activity === '低活跃'
      ? '项目近期更新较少，试用前要确认依赖和平台版本是否仍兼容。'
      : '这份说明来自仓库公开信息和规则整理，关键功能仍建议打开 README 核对。',
  ])
  return {
    ...profile,
    caveats: caveats.slice(0, 4),
  }
}

function overrideProfileFor(skill) {
  const profiles = overridePayload?.profiles || {}
  const exact = profiles[skill.fullName] || profiles[skill.fullName.toLowerCase()]
  const profile = exact?.profile || exact
  if (!hasCompleteProjectProfile(profile)) return null
  if (exact?.sourceHash && exact.sourceHash !== sourceHashForProfile(skill)) return null
  return profile
}

function readOptionalJson(url) {
  try {
    return JSON.parse(readFileSync(url, 'utf8'))
  } catch {
    return {}
  }
}

function displayName(skill) {
  return skill.name || String(skill.fullName || '').split('/').pop() || '这个项目'
}

function cleanSentence(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/[。！？；,.，、\s]+$/u, '')
    .trim()
}

function firstText(items) {
  return Array.isArray(items) ? items.find((item) => typeof item === 'string' && item.trim()) : ''
}

function platformsText(skill) {
  const platforms = (skill.platforms || []).filter(Boolean)
  if (!platforms.length) return 'Agent Skills'
  if (platforms.length === 1) return platforms[0]
  return platforms.slice(0, 3).join('、')
}

function dedupe(items) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))]
}

function similarText(a, b) {
  const left = cleanSentence(a).toLowerCase()
  const right = cleanSentence(b).toLowerCase()
  return left && right && (left.includes(right) || right.includes(left))
}
