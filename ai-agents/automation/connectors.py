"""Коннекторы к внешним сервисам для агента автоматизации.

Если переменные окружения не заданы — коннектор работает в режиме «сухого прогона»
(печатает действие в консоль), чтобы сценарий можно было протестировать без реальных ключей.
"""
from __future__ import annotations

import smtplib
from email.mime.text import MIMEText

import httpx

from core.config import settings


def push_to_crm(contact: dict) -> str:
    if not settings.crm_webhook_url:
        print(f"[CRM dry-run] создан контакт/сделка: {contact}")
        return "crm: dry-run"
    r = httpx.post(settings.crm_webhook_url, json=contact, timeout=20)
    r.raise_for_status()
    return f"crm: {r.status_code}"


def notify_telegram(text: str) -> str:
    token = settings.telegram_token
    chat_id = settings.telegram_notify_chat_id
    if not (token and chat_id):
        print(f"[Telegram dry-run] менеджеру: {text}")
        return "telegram: dry-run"
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    r = httpx.post(url, json={"chat_id": chat_id, "text": text}, timeout=20)
    r.raise_for_status()
    return "telegram: sent"


def send_email(to: str, subject: str, body: str) -> str:
    if not (settings.smtp_host and settings.smtp_user):
        print(f"[Email dry-run] -> {to} | {subject}\n{body}")
        return "email: dry-run"
    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = settings.smtp_user
    msg["To"] = to
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as s:
        s.starttls()
        s.login(settings.smtp_user, settings.smtp_password)
        s.send_message(msg)
    return "email: sent"
