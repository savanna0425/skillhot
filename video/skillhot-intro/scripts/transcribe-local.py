#!/usr/bin/env python3
"""Transcribe the cloned narration locally with cached MLX Whisper."""

import json
from pathlib import Path

from mlx_audio.stt import load


ROOT = Path(__file__).resolve().parents[1]
MODEL = "mlx-community/whisper-large-v3-turbo-asr-fp16"
model = load(MODEL)
result = model.generate(
    str(ROOT / "assets/narration.wav"),
    language="zh",
    verbose=False,
    word_timestamps=True,
)
payload = {
    "model": MODEL,
    "language": result.language,
    "text": result.text,
    "segments": result.segments,
}
(ROOT / "assets/narration.transcript.json").write_text(
    json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
print(f"wrote {ROOT / 'assets/narration.transcript.json'} ({len(result.segments)} segments)")
