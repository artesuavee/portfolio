"""Агент ревью кода — находит баги, предлагает улучшения, оценивает качество."""
from __future__ import annotations

import json
import sys
import os
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from core import ClaudeClient

SYSTEM = """Ты — опытный senior-разработчик, проводишь code review.

Анализируй код и возвращай СТРОГО JSON (без текста вне JSON):
{
  "overall_score": <1-10>,
  "language": "python|javascript|typescript|...",
  "issues": [
    {
      "line": <номер строки или null>,
      "severity": "critical|warning|suggestion",
      "category": "bug|security|performance|style|maintainability",
      "message": "Описание проблемы",
      "suggestion": "Как исправить"
    }
  ],
  "positives": ["Что сделано хорошо..."],
  "summary": "Общее резюме ревью в 2-3 предложениях"
}

Severity:
- critical: баг или уязвимость, которая сломает код или создаст проблему
- warning: потенциальная проблема или плохая практика
- suggestion: улучшение качества кода"""


class CodeReviewAgent:
    def __init__(self) -> None:
        self.ai = ClaudeClient(system=SYSTEM, max_tokens=1500)

    def review(self, code: str, language: str = "auto", context: str = "") -> dict:
        prompt = f"Проведи code review.\nЯзык: {language}\n\nКод:\n```\n{code}\n```"
        if context:
            prompt += f"\n\nКонтекст: {context}"

        raw = self.ai.ask(prompt)
        self.ai.reset()

        try:
            start, end = raw.find("{"), raw.rfind("}")
            return json.loads(raw[start : end + 1])
        except Exception:
            return {
                "overall_score": 5,
                "language": language,
                "issues": [],
                "positives": [],
                "summary": raw[:500],
            }

    def review_file(self, path: str | Path) -> dict:
        p = Path(path)
        code = p.read_text(encoding="utf-8")
        lang = p.suffix.lstrip(".") or "auto"
        return self.review(code, language=lang)
