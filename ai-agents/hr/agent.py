"""HR-скрининг агент — анализирует резюме и возвращает структурированную оценку."""
from __future__ import annotations

import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from core import ClaudeClient

SYSTEM = """Ты — опытный HR-скрининг агент. Анализируешь резюме кандидатов.

Получаешь текст резюме и возвращаешь СТРОГО JSON (без текста вне JSON):
{
  "score": <0-100>,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "recommendation": "hire|reject|maybe",
  "experience_years": <число или null>,
  "key_skills": ["...", "..."],
  "summary": "Краткое резюме в 2-3 предложениях"
}

Критерии оценки:
- 80-100: Сильный кандидат, рекомендован к найму
- 60-79: Перспективный, стоит рассмотреть (maybe)
- 0-59: Не соответствует базовым требованиям (reject)"""


class HRAgent:
    def __init__(self) -> None:
        self.ai = ClaudeClient(system=SYSTEM, max_tokens=800)

    def screen(self, resume_text: str, job_description: str = "") -> dict:
        prompt = f"Резюме кандидата:\n{resume_text}"
        if job_description:
            prompt += f"\n\nОписание вакансии:\n{job_description}"

        raw = self.ai.ask(prompt)
        self.ai.reset()

        try:
            start, end = raw.find("{"), raw.rfind("}")
            return json.loads(raw[start : end + 1])
        except Exception:
            return {
                "score": 50,
                "strengths": [],
                "weaknesses": ["Не удалось разобрать резюме"],
                "recommendation": "maybe",
                "experience_years": None,
                "key_skills": [],
                "summary": raw[:300],
            }
