
# Ghost Agent App (Next.js PWA)

Installable web app with streaming chat to host your Ghost Agent.

## Quick start
```bash
npm i
cp .env.example .env.local   # add your OpenAI key
npm run dev                   # http://localhost:3000
```

## What’s included
- Next.js App Router (PWA-ready)
- `/api/chat` streaming endpoint using OpenAI Chat Completions
- Minimal chat UI with token streaming
- `/api/leads` stub for future lead capture
- PWA `manifest.json` so users can "Add to Home Screen"

## Deploy
- Push to GitHub → Import on Vercel → add `OPENAI_API_KEY` in Vercel project settings.
