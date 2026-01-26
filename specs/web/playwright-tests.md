# Playwright Tests

E2E test suite for the marketing website.

## Configuration

`playwright.config.ts`:
- Test directory: `./e2e`
- Base URL: `http://localhost:3000`
- Web server: `npm run dev` on port 3000
- Projects: chromium (desktop), mobile (iPhone 14)

## Test Files

| File                  | Tests | Description                    |
|-----------------------|-------|--------------------------------|
| `smoke.spec.ts`       | 2     | Basic page load verification   |
| `landing.spec.ts`     | 18    | Landing page sections          |
| `navigation.spec.ts`  | 8     | Link hrefs and navigation      |
| `legal.spec.ts`       | 14    | Privacy and terms pages        |
| `contact.spec.ts`     | 18    | Contact form functionality     |

**Total: 60 tests × 2 browsers = 120 test runs**

## Test IDs

Components use `data-testid` attributes for reliable selection:

### Landing Page
- `hero-title`, `hero-tagline`, `hero-screenshot`
- `app-store-badge`
- `features-section`, `feature-card`
- `screenshots-section`, `screenshot-image`
- `cta-section`, `cta-app-store`, `cta-contact`
- `footer`, `footer-privacy-link`, `footer-terms-link`, `footer-contact-link`, `footer-copyright`

### Legal Pages
- `privacy-title`, `privacy-content`
- `terms-title`, `terms-content`
- `last-updated`
- `back-to-home`

### Contact Page
- `contact-title`, `contact-form`
- `name-input`, `email-input`, `message-input`
- `name-error`, `email-error`, `message-error`
- `honeypot-field`
- `submit-button`
- `success-message`, `error-message`
- `back-to-home`

## Running Tests

```bash
cd packages/web

# Run all tests
npm test

# Run specific file
npx playwright test e2e/contact.spec.ts

# Run with UI
npm run test:ui

# Run headed (see browser)
npm run test:headed

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=mobile
```

## Test Patterns

### API Mocking

Contact form tests mock the API to control timing:

```typescript
await page.route("/api/contact", async (route) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  await route.fulfill({ json: { success: true } });
});
```

### Viewport Testing

Landing page tests verify responsive behavior:

```typescript
await page.setViewportSize({ width: 390, height: 844 });  // Mobile
await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
await page.setViewportSize({ width: 1280, height: 720 }); // Desktop
```

### Navigation Testing

Tests verify both href attributes and actual navigation:

```typescript
// Check href
await expect(link).toHaveAttribute("href", "/privacy");

// Check navigation
await link.click();
await expect(page).toHaveURL("/privacy");
```
