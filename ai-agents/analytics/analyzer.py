"""ИИ-аналитик: считает KPI по данным и формулирует выводы/рекомендации.

Работает на стандартной библиотеке (csv) — без pandas, чтобы запускалось «из коробки».
"""
from __future__ import annotations

import csv
from pathlib import Path

from core import ClaudeClient

SYSTEM = (
    "Ты — ИИ-аналитик данных. На основе переданных метрик сформулируй 3-5 кратких "
    "выводов и конкретные рекомендации для роста бизнеса. Пиши по-русски, по пунктам, "
    "опирайся только на цифры из данных, без воды."
)


def load_csv(path: str | Path) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def compute_kpis(rows: list[dict]) -> dict:
    revenue = [float(r["revenue"]) for r in rows]
    orders = [int(r["orders"]) for r in rows]
    visitors = [int(r["visitors"]) for r in rows]
    total_rev = sum(revenue)
    total_ord = sum(orders)
    total_vis = sum(visitors)
    best = max(rows, key=lambda r: float(r["revenue"]))
    return {
        "период": f"{rows[0]['date']} — {rows[-1]['date']}",
        "выручка_всего": round(total_rev),
        "заказов_всего": total_ord,
        "средний_чек": round(total_rev / total_ord) if total_ord else 0,
        "конверсия_%": round(total_ord / total_vis * 100, 2) if total_vis else 0,
        "лучший_день": f"{best['date']} ({round(float(best['revenue']))} ₽)",
        "рост_выручки_%": round((revenue[-1] - revenue[0]) / revenue[0] * 100, 1)
        if revenue[0]
        else 0,
    }


class AnalyticsAgent:
    def __init__(self) -> None:
        self.client = ClaudeClient(system=SYSTEM, max_tokens=900)

    def report(self, csv_path: str | Path) -> str:
        rows = load_csv(csv_path)
        kpis = compute_kpis(rows)
        kpi_text = "\n".join(f"- {k}: {v}" for k, v in kpis.items())
        insights = self.client.ask("Метрики за период:\n" + kpi_text)
        return f"📊 KPI\n{kpi_text}\n\n💡 Выводы ИИ\n{insights}"
