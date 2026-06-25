"""Контент-маркетинг агент — генерирует тексты под разные форматы и аудитории."""
from __future__ import annotations

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from core import ClaudeClient

CONTENT_TYPES = {
    "post": "пост для социальных сетей (Instagram/LinkedIn/Telegram)",
    "email": "email-рассылка (тема + тело письма)",
    "product": "описание товара для интернет-магазина",
    "article": "короткая статья или блог-пост",
    "ad": "рекламный текст (заголовок + текст объявления)",
    "bio": "краткое описание компании/персоны (bio)",
}

SYSTEM = """Ты — профессиональный контент-маркетолог. Создаёшь тексты, которые вовлекают и конвертируют.

Правила:
- Пиши живо и естественно, без канцелярита
- Адаптируй тон под аудиторию (B2B — деловой, B2C — дружелюбный)
- Включай призыв к действию (CTA) где уместно
- Не превышай оптимальную длину для формата
- Отвечай только готовым текстом, без пояснений"""


class ContentAgent:
    def __init__(self) -> None:
        self.ai = ClaudeClient(system=SYSTEM, max_tokens=1200)

    def generate(
        self,
        content_type: str,
        topic: str,
        audience: str = "широкая аудитория",
        tone: str = "дружелюбный",
        language: str = "ru",
        extra: str = "",
    ) -> str:
        type_desc = CONTENT_TYPES.get(content_type, content_type)
        prompt = (
            f"Создай {type_desc}.\n"
            f"Тема: {topic}\n"
            f"Целевая аудитория: {audience}\n"
            f"Тон: {tone}\n"
            f"Язык: {language}"
        )
        if extra:
            prompt += f"\nДополнительно: {extra}"

        result = self.ai.ask(prompt)
        self.ai.reset()
        return result

    def variants(self, content_type: str, topic: str, count: int = 3) -> list[str]:
        results = []
        for i in range(count):
            tone = ["дружелюбный", "профессиональный", "вдохновляющий"][i % 3]
            results.append(self.generate(content_type, topic, tone=tone))
        return results
