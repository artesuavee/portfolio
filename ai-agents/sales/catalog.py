"""Демо-каталог тарифов и сохранение лидов для агента продаж."""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

PLANS = [
    {
        "id": "standard",
        "name": "Стандарт",
        "price": "9 900 ₽/мес",
        "features": ["До 10 сотрудников", "Базовые интеграции", "Поддержка в рабочие часы"],
    },
    {
        "id": "business",
        "name": "Бизнес",
        "price": "19 900 ₽/мес",
        "features": ["До 50 сотрудников", "Интеграции CRM", "Поддержка 24/7"],
    },
    {
        "id": "enterprise",
        "name": "Корпоративный",
        "price": "по запросу",
        "features": ["Без лимита", "Выделенный менеджер", "SLA и кастомизация"],
    },
]

_LEADS_FILE = Path(__file__).parent / "leads.jsonl"


def get_plans() -> str:
    lines = []
    for p in PLANS:
        feats = "; ".join(p["features"])
        lines.append(f"{p['name']} — {p['price']}. {feats}")
    return "\n".join(lines)


def save_lead(name: str, contact: str, plan: str = "", note: str = "") -> str:
    """Сохранить лид (в реальности — запись в CRM)."""
    lead = {
        "ts": datetime.now().isoformat(timespec="seconds"),
        "name": name,
        "contact": contact,
        "plan": plan,
        "note": note,
    }
    with _LEADS_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(lead, ensure_ascii=False) + "\n")
    return f"Лид сохранён: {name} ({contact}), интерес: {plan or 'не указан'}."


def payment_link(plan_id: str) -> str:
    """Сгенерировать (демо) ссылку на оплату выбранного тарифа."""
    valid = {p["id"] for p in PLANS}
    if plan_id not in valid:
        return "Такого тарифа нет. Доступны: standard, business, enterprise."
    return f"https://pay.example.com/checkout?plan={plan_id}"
