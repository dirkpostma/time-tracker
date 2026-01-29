# App Store Submission Guide

Complete guide for submitting Time Tracker to the Apple App Store.

## Prerequisites

- Apple Developer account ($99/year)
- EAS CLI installed (`npm install -g eas-cli`)
- Logged in to EAS (`eas login`)
- App registered in App Store Connect

## 1. App Store Metadata

Metadata is configured in `store.config.json`. Key fields:

| Field | Value |
|-------|-------|
| Title | Time Tracker |
| Subtitle | Simple time tracking for freelancers |
| Category | Productivity (primary), Business (secondary) |
| Privacy Policy | https://web-phi-ruddy-48.vercel.app/privacy |
| Support URL | https://web-phi-ruddy-48.vercel.app/contact |

### Review Credentials

The app requires authentication. Provide these to Apple:
```
Email: test@example.com
Password: Test1234
```

**Important**: Update the `review` section in `store.config.json` with your contact details before submitting.

## 2. Screenshots

### Required Sizes

Apple requires screenshots for these device sizes:

| Device | Size (pixels) | Required |
|--------|---------------|----------|
| iPhone 6.9" (17 Pro Max) | 1320 × 2868 | Yes (primary) |
| iPhone 6.7" (12-14 Pro Max) | 1284 × 2778 | Alternative |
| iPhone 6.5" (XS Max/11 Pro Max) | 1242 × 2688 | Alternative |
| iPhone 5.5" (8 Plus) | 1242 × 2208 | If supporting older devices |
| iPad Pro 12.9" | 2048 × 2732 | Required if supporting iPad |

### Screenshots to Capture

Capture 5-10 screenshots showing the app's key features:

1. **Timer Screen (stopped)** - Shows clean timer at 00:00:00 with client/project selection
2. **Timer Screen (running)** - Timer actively counting with client/project selected
3. **History Screen** - Time entries grouped by day with totals
4. **Settings Screen** - Theme selection and account options
5. **Theme Variety** - Show 2-3 different themes to highlight customization

### How to Capture Screenshots

#### Option A: Simulator (Recommended)

```bash
# Build for simulator
cd packages/mobile
npx expo run:ios

# In Simulator: Cmd + S to take screenshot
# Screenshots save to Desktop
```

For pixel-perfect App Store screenshots:
1. Use iPhone 15 Pro Max simulator (6.9" display)
2. Hide status bar or use clean status bar time (9:41)
3. Fill in sample data that looks realistic

#### Option B: Physical Device

1. Build preview version: `eas build --profile preview --platform ios`
2. Install on device via TestFlight
3. Take screenshots using device buttons (Side + Volume Up)
4. Transfer via AirDrop or Photos

### Screenshot Best Practices

- Use realistic but professional-looking data:
  - Clients: "Acme Corp", "TechStart", "Design Co"
  - Projects: "Website Redesign", "Mobile App", "Branding"
  - Durations: Mix of short (45m) and long (2h 30m) entries
- Show the app with content, not empty states
- Use the same theme across main screenshots (suggest: Sunset Warmth or Midnight Aurora)
- Include 1-2 screenshots showing theme variety
- Clean status bar (full battery, WiFi, 9:41 time)

### Screenshot Folder Structure

```
packages/mobile/screenshots/
├── 6.9/
│   ├── 01_timer_stopped.png
│   ├── 02_timer_running.png
│   ├── 03_history.png
│   ├── 04_settings.png
│   └── 05_themes.png
├── 6.7/
│   └── ... (optional, same images)
└── ipad/
    └── ... (if supporting iPad)
```

## 3. Build & Submit

### Build for App Store

```bash
cd packages/mobile

# Create production build
eas build --profile production --platform ios
```

This will:
- Build with production environment
- Auto-increment build number
- Sign with App Store distribution certificate

### Submit to App Store

```bash
# Submit latest build
eas submit --platform ios

# Or submit specific build
eas submit --platform ios --id BUILD_ID
```

### EAS Metadata (Optional)

To push metadata via EAS:

```bash
# Initialize metadata (first time only)
eas metadata:pull

# Push metadata to App Store Connect
eas metadata:push
```

## 4. App Store Connect Checklist

Before submitting, verify in App Store Connect:

- [ ] App name and subtitle
- [ ] Description (from store.config.json)
- [ ] Keywords
- [ ] Screenshots uploaded for all required sizes
- [ ] App icon displays correctly
- [ ] Privacy Policy URL works
- [ ] Support URL works
- [ ] Age rating completed
- [ ] Pricing set (Free)
- [ ] Review contact information filled in
- [ ] Review notes include test credentials

## 5. Common Rejection Reasons

Avoid these common issues:

1. **Missing Privacy Policy** - ✅ We have one at /privacy
2. **Placeholder content** - Remove all lorem ipsum or test data
3. **Broken links** - Verify privacy/support URLs work
4. **Login issues** - Ensure test account works
5. **Crashes** - Test thoroughly on real device
6. **Incomplete features** - All visible features must work

## 6. What's New Text

For version 1.0.0 (initial release):

```
Initial release of Time Tracker!

• Start and stop timers with one tap
• Organize work by client, project, and task
• View time entry history grouped by day
• Choose from 5 beautiful themes
```

## Quick Commands Reference

```bash
# Build
eas build --profile production --platform ios

# Submit
eas submit --platform ios

# Check build status
eas build:list

# Pull current metadata
eas metadata:pull

# Push metadata
eas metadata:push
```

## Timeline

Typical App Store review takes 24-48 hours, but can take up to 7 days for first submissions.
