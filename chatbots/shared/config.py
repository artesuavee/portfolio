"""Общая конфигурация для всех чат-ботов."""
from __future__ import annotations

import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass


class Config:
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    ANTHROPIC_MODEL: str = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")
    BOT_TOKEN: str = os.getenv("BOT_TOKEN", "")

    @classmethod
    def require_api_key(cls) -> str:
        if not cls.ANTHROPIC_API_KEY:
            raise RuntimeError("ANTHROPIC_API_KEY не задан в .env")
        return cls.ANTHROPIC_API_KEY

    @classmethod
    def require_bot_token(cls) -> str:
        if not cls.BOT_TOKEN:
            raise RuntimeError("BOT_TOKEN не задан в .env")
        return cls.BOT_TOKEN
