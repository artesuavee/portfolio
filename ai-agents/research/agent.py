"""Веб-ресёрч агент — исследует тему с помощью tool calling и возвращает отчёт."""
from __future__ import annotations

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from core import ClaudeClient

from .tools import TOOLS_SCHEMA, HANDLERS, get_notes

SYSTEM = """Ты — профессиональный исследовательский агент. Твоя задача — глубоко изучить заданную тему.

Алгоритм работы:
1. Сначала выполни 2-3 поисковых запроса по теме
2. Открой и изучи 2-3 наиболее релевантных страницы
3. Сохраняй ключевые факты и инсайты через save_note
4. После исследования напиши структурированный отчёт:
   - Краткое резюме (3-5 предложений)
   - Ключевые факты (5-7 пунктов)
   - Тренды и инсайты
   - Источники

Будь методичен и всесторонен."""


class ResearchAgent:
    def __init__(self) -> None:
        self.ai = ClaudeClient(system=SYSTEM, max_tokens=2000)

    def research(self, topic: str, depth: str = "medium") -> dict:
        """
        topic — тема для исследования
        depth — "quick" | "medium" | "deep"
        """
        max_steps = {"quick": 3, "medium": 6, "deep": 10}.get(depth, 6)

        prompt = f"Исследуй тему: {topic}\n\nСоздай подробный аналитический отчёт."
        report = self.ai.ask_with_tools(
            prompt,
            tools=TOOLS_SCHEMA,
            handlers=HANDLERS,
            max_steps=max_steps,
        )
        self.ai.reset()

        return {
            "topic": topic,
            "report": report,
            "notes": get_notes(),
        }
