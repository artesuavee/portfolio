"""Сценарий «Новая заявка» — цепочка задач без участия человека.

Шаги (как на демо-схеме):
  1. Заявка с сайта (триггер)
  2. ИИ обрабатывает (классифицирует + готовит ответ)
  3. Запись в CRM
  4. Уведомление менеджеру в Telegram
  5. Автоответ клиенту на email
"""
from __future__ import annotations

import json

from core import ClaudeClient

from . import connectors

SYSTEM = (
    "Ты — бэк-офисный ИИ. Получаешь заявку с сайта и возвращаешь СТРОГО JSON "
    'вида {"category": "...", "priority": "low|medium|high", '
    '"manager_note": "...", "client_reply": "..."}. '
    "category — тип запроса; manager_note — краткое резюме для менеджера; "
    "client_reply — вежливый автоответ клиенту. Без текста вне JSON."
)


class LeadWorkflow:
    def __init__(self) -> None:
        self.ai = ClaudeClient(system=SYSTEM, max_tokens=700)

    def _analyze(self, lead: dict) -> dict:
        raw = self.ai.ask(json.dumps(lead, ensure_ascii=False))
        self.ai.reset()  # каждая заявка — независимо
        try:
            start, end = raw.find("{"), raw.rfind("}")
            return json.loads(raw[start : end + 1])
        except Exception:
            return {
                "category": "unknown",
                "priority": "medium",
                "manager_note": raw[:200],
                "client_reply": "Спасибо за заявку! Мы свяжемся с вами в ближайшее время.",
            }

    def run(self, lead: dict) -> dict:
        """lead: {name, email, message}. Возвращает лог шагов."""
        log: list[str] = ["1. Заявка получена: " + lead.get("name", "—")]

        analysis = self._analyze(lead)
        log.append(f"2. ИИ: {analysis['category']} / приоритет {analysis['priority']}")

        log.append(
            "3. " + connectors.push_to_crm(
                {
                    "name": lead.get("name"),
                    "email": lead.get("email"),
                    "category": analysis["category"],
                    "priority": analysis["priority"],
                }
            )
        )
        log.append(
            "4. " + connectors.notify_telegram(
                f"🆕 Заявка [{analysis['priority']}] {lead.get('name')}: "
                f"{analysis['manager_note']}"
            )
        )
        log.append(
            "5. " + connectors.send_email(
                lead.get("email", ""), "Ваша заявка принята", analysis["client_reply"]
            )
        )
        return {"analysis": analysis, "log": log}
