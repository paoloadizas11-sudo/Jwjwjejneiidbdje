# BotHub — Vercel dashboard

A no-login, mobile-first Python bot hosting dashboard.

## Important architecture

Vercel hosts the **dashboard and API**. A Telegram bot that must stay running continuously should run on a persistent worker/container, not as an ordinary Vercel Function. Set:

`RUNNER_URL=https://your-worker.example/deploy`

The dashboard sends a deployment manifest to that endpoint.

## Included features

- No-login UI
- Python / ZIP project picker
- Optional bot token
- Optional admin IDs
- Detect/describe requirements
- Runtime/status dashboard
- Logs console UI
- Restart/stop UI foundation
- Mobile-first design
- Vercel-compatible Python API

## MLBB bot dependencies detected from the supplied mlbb_bot2.py

The supplied bot imports:
- python-telegram-bot[job-queue]
- zstandard
- pycryptodome

The source also contains its own package bootstrap, so this dashboard does not modify the bot.

## Deploy to Vercel

1. Upload this folder to GitHub.
2. Import the repository into Vercel.
3. Deploy.
4. Add `RUNNER_URL` in Vercel Environment Variables when you have a persistent worker.
5. Redeploy.

## Security

Do not hard-code Telegram bot tokens into the dashboard. Keep secrets in environment variables or your worker's secret store. This starter does not execute uploaded Python code inside Vercel.
