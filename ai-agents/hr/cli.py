"""CLI: python -m hr.cli resume.txt [--job job.txt]"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .agent import HRAgent


def main() -> None:
    parser = argparse.ArgumentParser(description="HR screening agent")
    parser.add_argument("resume", help="Path to resume file (.txt)")
    parser.add_argument("--job", help="Path to job description file (.txt)", default="")
    args = parser.parse_args()

    resume_text = Path(args.resume).read_text(encoding="utf-8")
    job_text = Path(args.job).read_text(encoding="utf-8") if args.job else ""

    agent = HRAgent()
    result = agent.screen(resume_text, job_text)

    print(json.dumps(result, ensure_ascii=False, indent=2))
    rec = result.get("recommendation", "")
    score = result.get("score", 0)
    symbol = {"hire": "✅", "maybe": "⚠️", "reject": "❌"}.get(rec, "?")
    print(f"\n{symbol} Оценка: {score}/100 — {rec.upper()}")


if __name__ == "__main__":
    main()
