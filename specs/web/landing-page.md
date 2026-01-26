# Landing Page

The homepage serves as the marketing landing page for the Time Tracker app.

## Route

`/` - `app/page.tsx`

## Sections

### Hero Section

- App name: "Time Tracker"
- Tagline: "Simple time tracking for freelancers"
- App Store download badge (links to App Store listing)
- Hero screenshot showing the app

### Features Section

Five feature cards highlighting key capabilities:

| Feature           | Description                                              |
|-------------------|----------------------------------------------------------|
| One-Tap Tracking  | Start and stop time entries with a single tap            |
| Clients & Projects| Organize work by client and project                      |
| History & Reports | View time entries by day, week, or month                 |
| Offline Support   | Track time without internet, syncs when back online      |
| Beautiful Themes  | Multiple themes to match your style                      |

### Screenshots Section

Gallery showing app screenshots:
- Timer screen in 5 different themes (Midnight Aurora, Soft Blossom, Brutalist, Ocean Depth, Sunset Warmth)
- History screen
- Settings screen

Mobile: Horizontal scrollable carousel
Desktop: Grid layout showing all screenshots

### CTA Section

- Headline: "Ready to track your time?"
- App Store download badge
- Contact link

### Footer

- Links to Privacy Policy, Terms, Contact
- Copyright notice

## Responsive Design

| Viewport | Behavior                                    |
|----------|---------------------------------------------|
| Mobile   | Single column, horizontal scroll for images |
| Tablet   | Two-column features grid                    |
| Desktop  | Three-column features, full image grid      |

## Test Coverage

See `e2e/landing.spec.ts`:
- Hero displays title, tagline, badge, screenshot
- Features section shows 5 cards with titles
- Screenshots gallery loads images
- CTA section content visible
- Footer links present
- Responsive tests for mobile/tablet/desktop
