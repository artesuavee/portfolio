"""Конфигурация из переменных окружения (.env)."""
from __future__ import annotations

import os
from dataclasses import dataclass

try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # python-dotenv не обязателен в рантайме
    pass


@dataclass(frozen=True)
class Settings:
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    model: str = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-5")
    max_tokens: int = int(os.getenv("ANTHROPIC_MAX_TOKENS", "1024"))

    telegram_token: str = os.getenv("TELEGRAM_BOT_TOKEN", "")

    crm_webhook_url: str = os.getenv("CRM_WEBHOOK_URL", "")
    telegram_notify_chat_id: str = os.getenv("TELEGRAM_NOTIFY_CHAT_ID", "")
    smtp_host: str = os.getenv("SMTP_HOST", "")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_user: str = os.getenv("SMTP_USER", "")
    smtp_password: str = os.getenv("SMTP_PASSWORD", "")

    def require_api_key(self) -> str:
        if not self.anthropic_api_key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY не задан. Скопируйте .env.example в .env и впишите ключ."
            )
        return self.anthropic_api_key


settings = Settings()
