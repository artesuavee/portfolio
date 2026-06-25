"""CLI: python -m code_review.cli path/to/file.py [--lang python]"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .agent import CodeReviewAgent

SEVERITY_ICONS = {"critical": "🔴", "warning": "🟡", "suggestion": "🔵"}


def main() -> None:
    parser = argparse.ArgumentParser(description="AI Code Review agent")
    parser.add_argument("file", help="Путь к файлу для ревью")
    parser.add_argument("--lang", default="auto", help="Язык программирования")
    parser.add_argument("--json", action="store_true", help="Вывод в JSON")
    args = parser.parse_args()

    path = Path(args.file)
    if not path.exists():
        print(f"Файл не найден: {path}", file=sys.stderr)
        sys.exit(1)

    agent = CodeReviewAgent()
    print(f"🔍 Анализирую {path.name}...")
    result = agent.review_file(path)

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return

    score = result.get("overall_score", "?")
    print(f"\n⭐ Оценка: {score}/10 — {result.get('language', '')}")
    print(f"📋 {result.get('summary', '')}\n")

    issues = result.get("issues", [])
    if issues:
        print(f"Найдено проблем: {len(issues)}\n")
        for issue in issues:
            icon = SEVERITY_ICONS.get(issue.get("severity", ""), "•")
            line = f"строка {issue['line']}" if issue.get("line") else "общее"
            print(f"{icon} [{line}] {issue.get('message', '')}")
            if issue.get("suggestion"):
                print(f"   → {issue['suggestion']}")
        print()

    positives = result.get("positives", [])
    if positives:
        print("✅ Что хорошо:")
        for p in positives:
            print(f"   • {p}")


if __name__ == "__main__":
    main()
