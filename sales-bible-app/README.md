# IBM Sales Bible App

An interactive sales enablement app for IBM AI P&P IND sellers. Situation router, step-by-step plays, AI call prep builder, objection coaching, and email generator.

## Setup

1. Clone this repo
2. `npm install`
3. Set environment variable: `ANTHROPIC_API_KEY=your_key`
4. Deploy to Netlify (connect repo, set env var in Netlify dashboard)

## Local dev

```bash
npm install -g netlify-cli
netlify dev
```

## Tech
- React + Vite
- Netlify serverless functions (Anthropic API proxy)
- No backend, no database, no auth required for v1
