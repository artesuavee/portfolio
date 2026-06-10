"""Демо-база знаний и «заказы» для агента поддержки.

В реальном проекте заменяется на подключение к вашей БД/CRM/Notion/Confluence.
"""
from __future__ import annotations

KNOWLEDGE_BASE: list[dict[str, str]] = [
    {
        "q": "Сроки доставки",
        "a": "Доставка по городу — 1-2 дня, по России — 3-7 дней. Курьер привозит в выбранный интервал.",
    },
    {
        "q": "Возврат товара",
        "a": "Вернуть товар можно в течение 14 дней с момента получения, если он не был в использовании.",
    },
    {
        "q": "Способы оплаты",
        "a": "Принимаем карты Visa/MasterCard/МИР, СБП и оплату при получении.",
    },
    {
        "q": "Гарантия",
        "a": "На всю технику действует гарантия производителя 12 месяцев.",
    },
]

# Демо-«база заказов» (обычно — запрос в CRM/БД).
_ORDERS = {
    "4821": {"status": "в пути", "eta": "сегодня до 18:00", "track": "RU481200735"},
    "4822": {"status": "собирается", "eta": "завтра", "track": None},
}


def search_kb(query: str) -> str:
    """Поиск в базе знаний по ключевым словам (демо: простое вхождение)."""
    query_l = query.lower()
    hits = [item for item in KNOWLEDGE_BASE if any(w in query_l for w in item["q"].lower().split())]
    if not hits:
        return "В базе знаний нет точного ответа на этот вопрос."
    return "\n".join(f"- {h['q']}: {h['a']}" for h in hits)


def get_order_status(order_id: str) -> str:
    """Статус заказа по номеру (демо)."""
    order = _ORDERS.get(str(order_id).strip())
    if not order:
        return f"Заказ №{order_id} не найден. Уточните номер."
    track = f", трек: {order['track']}" if order["track"] else ""
    return f"Заказ №{order_id}: {order['status']}, ожидаемая доставка — {order['eta']}{track}."
