"""Агент поддержки 24/7.

Отвечает на типовые вопросы через базу знаний, проверяет статус заказа,
и эскалирует сложные/негативные обращения живому оператору.
"""
from __future__ import annotations

from core import ClaudeClient

from .knowledge_base import get_order_status, search_kb

SYSTEM = (
    "Ты — вежливый виртуальный помощник службы поддержки интернет-магазина. "
    "Отвечай кратко, дружелюбно, по-русски, с эмодзи в меру. "
    "Используй инструмент search_kb для вопросов о доставке, возврате, оплате, гарантии. "
    "Используй get_order_status, если клиент спрашивает про конкретный заказ по номеру. "
    "Если клиент агрессивен, вопрос юридический/финансовый или ты не уверен — "
    "вызови escalate_to_human, не выдумывай ответ."
)

TOOLS = [
    {
        "name": "search_kb",
        "description": "Поиск ответа в базе знаний (доставка, возврат, оплата, гарантия).",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "Запрос клиента"}},
            "required": ["query"],
        },
    },
    {
        "name": "get_order_status",
        "description": "Получить статус заказа по его номеру.",
        "input_schema": {
            "type": "object",
            "properties": {"order_id": {"type": "string", "description": "Номер заказа"}},
            "required": ["order_id"],
        },
    },
    {
        "name": "escalate_to_human",
        "description": "Передать обращение живому оператору с кратким резюме.",
        "input_schema": {
            "type": "object",
            "properties": {"reason": {"type": "string"}, "summary": {"type": "string"}},
            "required": ["reason", "summary"],
        },
    },
]


def _escalate(reason: str, summary: str) -> str:
    # В реальности — создание тикета в Help Desk / уведомление оператору.
    print(f"\n[ЭСКАЛАЦИЯ ОПЕРАТОРУ] причина: {reason}\nрезюме: {summary}\n")
    return "Передал ваш вопрос специалисту — он скоро подключится к диалогу. 🙏"


class SupportAgent:
    def __init__(self) -> None:
        self.client = ClaudeClient(system=SYSTEM)
        self.handlers = {
            "search_kb": search_kb,
            "get_order_status": get_order_status,
            "escalate_to_human": _escalate,
        }

    def reply(self, message: str) -> str:
        return self.client.ask_with_tools(message, TOOLS, self.handlers)
