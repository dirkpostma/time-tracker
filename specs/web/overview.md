# Marketing Website Overview

Marketing website for the Time Tracker mobile app, providing public-facing pages for App Store listing and legal compliance.

## Tech Stack

| Component      | Technology                |
|----------------|---------------------------|
| Framework      | Next.js 15 (App Router)   |
| Language       | TypeScript                |
| Styling        | Tailwind CSS v4           |
| E2E Testing    | Playwright                |
| Email          | Resend (optional)         |
| Hosting        | Vercel                    |

## Package Location

```
packages/web/
├── app/
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Landing page
│   ├── privacy/page.tsx     # Privacy policy
│   ├── terms/page.tsx       # Terms of service
│   ├── contact/page.tsx     # Contact form
│   └── api/contact/route.ts # Contact form API
├── components/
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Screenshots.tsx
│   ├── CTA.tsx
│   ├── Footer.tsx
│   └── ui/
│       ├── Button.tsx
│       └── Section.tsx
├── e2e/                     # Playwright tests
│   ├── smoke.spec.ts
│   ├── landing.spec.ts
│   ├── navigation.spec.ts
│   ├── legal.spec.ts
│   └── contact.spec.ts
└── public/
    ├── app-store-badge.svg
    └── screenshots/
```

## Production URL

https://web-phi-ruddy-48.vercel.app

## Running Locally

```bash
cd packages/web
npm install
npm run dev
# Open http://localhost:3000
```

## Running Tests

```bash
cd packages/web

# All tests
npm test

# With UI
npm run test:ui

# Headed mode
npm run test:headed
```

## Environment Variables

| Variable        | Description                        | Required |
|-----------------|------------------------------------|----------|
| RESEND_API_KEY  | API key for sending contact emails | No       |
| CONTACT_EMAIL   | Destination for contact form       | No       |
