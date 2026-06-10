"""Прогон сценария автоматизации:  python -m automation.cli"""
from __future__ import annotations

from automation.workflow import LeadWorkflow

DEMO_LEAD = {
    "name": "Иван Петров",
    "email": "ivan@example.com",
    "message": "Здравствуйте! Хочу внедрить вашу CRM на 30 человек. Срочно, бюджет есть.",
}


def main() -> None:
    wf = LeadWorkflow()
    result = wf.run(DEMO_LEAD)
    print("\n".join(result["log"]))
    print("\nОтвет клиенту:\n" + result["analysis"]["client_reply"])


if __name__ == "__main__":
    main()
