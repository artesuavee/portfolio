"""Многоязычный переводчик с пониманием контекста и специализированной лексики."""
from __future__ import annotations

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from core import ClaudeClient

LANGUAGES = {
    "ru": "Русский", "en": "English", "kz": "Қазақша",
    "de": "Deutsch", "zh": "中文", "fr": "Français", "es": "Español",
}

CONTEXTS = {
    "general": "общий текст",
    "technical": "технический текст (IT, инженерия)",
    "marketing": "маркетинг и реклама",
    "legal": "юридический текст",
    "medical": "медицинский текст",
    "business": "деловая переписка",
}

SYSTEM = """Ты — профессиональный переводчик с глубоким пониманием контекста.

Правила:
- Переводи точно, сохраняя смысл и стиль оригинала
- Учитывай контекст (технический, маркетинговый, юридический)
- Для технических текстов — используй принятую терминологию
- Для маркетинга — адаптируй культурные отсылки
- Возвращай ТОЛЬКО перевод, без пояснений и комментариев"""


class TranslatorAgent:
    def __init__(self) -> None:
        self.ai = ClaudeClient(system=SYSTEM, max_tokens=2000)

    def translate(
        self,
        text: str,
        target_lang: str = "en",
        source_lang: str = "auto",
        context: str = "general",
    ) -> str:
        lang_name = LANGUAGES.get(target_lang, target_lang)
        ctx_name = CONTEXTS.get(context, context)
        src_name = LANGUAGES.get(source_lang, source_lang) if source_lang != "auto" else "автоопределение"

        prompt = (
            f"Переведи на {lang_name}.\n"
            f"Исходный язык: {src_name}\n"
            f"Контекст: {ctx_name}\n\n"
            f"Текст для перевода:\n{text}"
        )
        result = self.ai.ask(prompt)
        self.ai.reset()
        return result

    def batch_translate(self, texts: list[str], target_lang: str = "en",
                        context: str = "general") -> list[str]:
        return [self.translate(t, target_lang=target_lang, context=context) for t in texts]

    def detect_language(self, text: str) -> str:
        prompt = (
            f"Определи язык текста. Ответь ТОЛЬКО кодом языка: ru/en/kz/de/zh/fr/es/other\n\n{text[:200]}"
        )
        result = self.ai.ask(prompt).strip().lower()
        self.ai.reset()
        return result
