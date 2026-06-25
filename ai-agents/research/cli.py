"""CLI: python -m research.cli "Рынок AI в Казахстане" [--depth quick|medium|deep]"""
from __future__ import annotations

import argparse

from .agent import ResearchAgent


def main() -> None:
    parser = argparse.ArgumentParser(description="Web research agent")
    parser.add_argument("topic", help="Тема для исследования")
    parser.add_argument("--depth", choices=["quick", "medium", "deep"], default="medium")
    args = parser.parse_args()

    print(f"🔍 Исследую тему: {args.topic} (глубина: {args.depth})\n")
    agent = ResearchAgent()
    result = agent.research(args.topic, args.depth)

    print("=" * 60)
    print(result["report"])
    if result["notes"]:
        print(f"\n📝 Заметок сохранено: {len(result['notes'])}")


if __name__ == "__main__":
    main()
