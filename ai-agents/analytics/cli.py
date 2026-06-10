"""Отчёт ИИ-аналитика:  python -m analytics.cli [path_to_csv]"""
from __future__ import annotations

import sys
from pathlib import Path

from analytics.analyzer import AnalyticsAgent


def main() -> None:
    path = sys.argv[1] if len(sys.argv) > 1 else Path(__file__).parent / "sample_data.csv"
    print(AnalyticsAgent().report(path))


if __name__ == "__main__":
    main()
