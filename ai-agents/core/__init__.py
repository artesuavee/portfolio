"""Общее ядро для всех ИИ-агентов."""
from .claude_client import ClaudeClient
from .config import settings

__all__ = ["ClaudeClient", "settings"]
