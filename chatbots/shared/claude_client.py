"""Лёгкий Claude клиент для Telegram ботов — с историей диалога per-user."""
from __future__ import annotations

from anthropic import Anthropic
from .config import Config


class BotClaudeClient:
    def __init__(self, system: str, max_tokens: int = 1024):
        self._client = Anthropic(api_key=Config.require_api_key())
        self.system = system
        self.max_tokens = max_tokens
        self._histories: dict[int, list[dict]] = {}

    def ask(self, user_id: int, message: str) -> str:
        history = self._histories.setdefault(user_id, [])
        history.append({"role": "user", "content": message})

        resp = self._client.messages.create(
            model=Config.ANTHROPIC_MODEL,
            max_tokens=self.max_tokens,
            system=self.system,
            messages=history,
        )
        text = "".join(b.text for b in resp.content if b.type == "text")
        history.append({"role": "assistant", "content": text})

        if len(history) > 40:
            self._histories[user_id] = history[-20:]

        return text

    def reset(self, user_id: int) -> None:
        self._histories.pop(user_id, None)
