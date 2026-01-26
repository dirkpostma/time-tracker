# Marketing Website Plan

## Overview

Create a marketing website for the Time Tracker mobile app, hosted on Vercel. The site will serve as the public face for App Store listing, legal compliance, and future user dashboard.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 15 (App Router) | Server components, API routes, excellent Vercel integration |
| Styling | Tailwind CSS | Consistent with mobile app, fast development |
| Package location | `packages/web` | Fits existing monorepo structure |
| Email service | Resend | Simple API, generous free tier, good DX |
| Legal pages | MDX files | No CMS overhead, version controlled |
| Hosting | Vercel | Zero-config for Next.js monorepos |

## Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Project setup | Pending |
| 2 | Marketing pages | Pending |
| 3 | Legal pages | Pending |
| 4 | Contact form | Pending |
| 5 | E2E testing (Playwright) | Pending |
| 6 | Deployment | Pending |
| 7 | User dashboard | Future |

## Phase Details

### Phase 1: Project Setup

Create `packages/web` with Next.js 15 and configure for monorepo:

```
packages/web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

**Tasks:**
- [ ] Initialize Next.js project in `packages/web`
- [ ] Configure Tailwind CSS
- [ ] Set up TypeScript with project references
- [ ] Add to workspace in root `package.json`
- [ ] Verify `npm run dev` works from packages/web

### Phase 2: Marketing Pages

Build the landing page with sections:

**Hero Section**
- App name and tagline
- App Store badge (link to listing)
- Hero screenshot of the app

**Features Section**
- Time tracking with one tap
- Multiple clients and projects
- History and reporting
- Offline support
- Beautiful themes

**Screenshots Section**
- Showcase different themes
- Timer, history, and settings screens

**CTA Section**
- Download on App Store button
- Contact link

**Footer**
- Links to Privacy Policy, Terms
- Copyright

**Tasks:**
- [ ] Create reusable UI components (Button, Section, etc.)
- [ ] Build Hero section with App Store badge
- [ ] Build Features section
- [ ] Build Screenshots gallery
- [ ] Build Footer with legal links
- [ ] Add responsive design for mobile/tablet/desktop
- [ ] Optimize images (next/image)

### Phase 3: Legal Pages

Create privacy policy and terms pages required for App Store:

```
app/
├── privacy/
│   └── page.tsx
└── terms/
    └── page.tsx
```

**Privacy Policy must cover:**
- What data is collected (email, time entries)
- How data is stored (Supabase)
- Third-party services (Supabase Auth)
- User rights (access, deletion)
- Contact information

**Terms of Service must cover:**
- Acceptance of terms
- User responsibilities
- Intellectual property
- Limitation of liability
- Termination
- Governing law

**Tasks:**
- [ ] Write privacy policy content
- [ ] Write terms of service content
- [ ] Create shared legal page layout
- [ ] Add last updated date
- [ ] Link from app settings and App Store listing

### Phase 4: Contact Form

Simple contact form for user inquiries:

```
app/
├── contact/
│   └── page.tsx
└── api/
    └── contact/
        └── route.ts
```

**Form fields:**
- Name
- Email
- Message
- Honeypot field (spam protection)

**API route:**
- Validate input
- Check honeypot
- Send email via Resend
- Return success/error

**Tasks:**
- [ ] Create contact form UI
- [ ] Add client-side validation
- [ ] Set up Resend account and API key
- [ ] Implement API route with Resend
- [ ] Add rate limiting (optional)
- [ ] Add success/error states

### Phase 5: E2E Testing (Playwright)

Set up Playwright for end-to-end testing, similar to Maestro for mobile:

```
packages/web/
├── e2e/
│   ├── landing.spec.ts      # Landing page tests
│   ├── legal.spec.ts        # Privacy & terms pages
│   ├── contact.spec.ts      # Contact form tests
│   └── navigation.spec.ts   # Links and routing
├── playwright.config.ts
```

**Test Coverage:**

| Area | Tests |
|------|-------|
| Landing page | Hero renders, App Store link works, all sections visible |
| Features | Each feature card displays correctly |
| Screenshots | Gallery loads, images visible |
| Navigation | All internal links work, footer links work |
| Privacy page | Content loads, last updated shows |
| Terms page | Content loads, last updated shows |
| Contact form | Validation works, successful submission, error states |
| Responsive | Mobile, tablet, desktop viewports |
| Accessibility | Basic a11y checks (headings, alt text, focus) |

**Tasks:**
- [ ] Install Playwright and configure
- [ ] Create landing page tests
- [ ] Create legal pages tests
- [ ] Create contact form tests (mock Resend API)
- [ ] Create navigation tests
- [ ] Add responsive viewport tests
- [ ] Add basic accessibility tests
- [ ] Add npm scripts for running tests
- [ ] Configure CI to run tests on PR

**NPM Scripts:**
```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed"
  }
}
```

**Playwright Config Highlights:**
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
});
```

### Phase 6: Deployment

Deploy to Vercel from monorepo:

**Vercel Configuration:**
- Root Directory: `packages/web`
- Framework: Next.js (auto-detected)
- Build Command: (default)
- Output Directory: (default)

**Environment Variables:**
- `RESEND_API_KEY` - for contact form emails
- `CONTACT_EMAIL` - destination for contact form

**Domain Setup:**
- Configure custom domain
- Set up SSL (automatic)
- Add domain to App Store listing

**Tasks:**
- [ ] Create Vercel project
- [ ] Connect GitHub repo
- [ ] Configure root directory
- [ ] Add environment variables
- [ ] Configure custom domain
- [ ] Test production deployment
- [ ] Update App Store privacy policy URL

### Phase 7: User Dashboard (Future)

Authenticated dashboard for viewing/exporting time entries. To be planned separately.

## File Structure (Final)

```
packages/web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Landing page
│   ├── privacy/
│   │   └── page.tsx
│   ├── terms/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── api/
│   │   └── contact/
│   │       └── route.ts
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── Section.tsx
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Screenshots.tsx
│   └── Footer.tsx
├── e2e/
│   ├── landing.spec.ts
│   ├── legal.spec.ts
│   ├── contact.spec.ts
│   └── navigation.spec.ts
├── lib/
│   └── resend.ts
├── content/
│   ├── privacy.mdx
│   └── terms.mdx
├── public/
│   ├── screenshots/
│   └── app-store-badge.svg
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── playwright.config.ts
└── tsconfig.json
```

## Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "resend": "^4.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.50.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Verification Checklist

### Phase 1
- [ ] `cd packages/web && npm run dev` starts dev server
- [ ] Page loads at http://localhost:3000
- [ ] Tailwind styles apply correctly

### Phase 2
- [ ] Landing page renders all sections
- [ ] App Store badge links correctly
- [ ] Responsive on mobile/tablet/desktop
- [ ] Images optimized and loading

### Phase 3
- [ ] /privacy loads privacy policy
- [ ] /terms loads terms of service
- [ ] Footer links work
- [ ] Last updated date shows

### Phase 4
- [ ] Contact form submits successfully
- [ ] Email received at destination
- [ ] Validation errors display
- [ ] Honeypot blocks spam submissions

### Phase 5
- [ ] Playwright installed and configured
- [ ] All tests pass locally
- [ ] Tests run in headed mode for debugging
- [ ] Mobile viewport tests pass

### Phase 6
- [ ] Production site loads
- [ ] Custom domain works with SSL
- [ ] Contact form works in production
- [ ] All pages accessible
- [ ] Playwright tests pass against production URL

## Notes

- Keep design consistent with mobile app themes
- Use app screenshots from `packages/mobile/*.png`
- Legal pages need review before App Store submission
- Consider adding analytics (Vercel Analytics or Plausible)
