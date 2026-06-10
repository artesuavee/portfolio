"""Агент продаж: квалифицирует лид, рассказывает о тарифах, доводит до оплаты."""
from __future__ import annotations

from core import ClaudeClient

from .catalog import get_plans, payment_link, save_lead

SYSTEM = (
    "Ты — менеджер по продажам SaaS-сервиса. Цель — помочь клиенту выбрать тариф "
    "и довести до оплаты, без навязчивости. Отвечай по-русски, дружелюбно и по делу. "
    "Сначала выясни потребность (размер команды, задачи). Используй get_plans для цен. "
    "Когда клиент готов — собери имя и контакт через save_lead и дай ссылку payment_link. "
    "Не выдумывай условия, которых нет в каталоге."
)

TOOLS = [
    {
        "name": "get_plans",
        "description": "Вернуть список тарифов с ценами и возможностями.",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "save_lead",
        "description": "Сохранить контакт заинтересованного клиента (лид).",
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "contact": {"type": "string", "description": "Телефон или email"},
                "plan": {"type": "string"},
                "note": {"type": "string"},
            },
            "required": ["name", "contact"],
        },
    },
    {
        "name": "payment_link",
        "description": "Сгенерировать ссылку на оплату тарифа (standard/business/enterprise).",
        "input_schema": {
            "type": "object",
            "properties": {"plan_id": {"type": "string"}},
            "required": ["plan_id"],
        },
    },
]


class SalesAgent:
    def __init__(self) -> None:
        self.client = ClaudeClient(system=SYSTEM)
        self.handlers = {
            "get_plans": get_plans,
            "save_lead": save_lead,
            "payment_link": payment_link,
        }

    def reply(self, message: str) -> str:
        return self.client.ask_with_tools(message, TOOLS, self.handlers)
