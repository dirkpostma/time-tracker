# Legal Pages

Privacy Policy and Terms of Service pages required for App Store compliance.

## Routes

| Page           | Route      | File                    |
|----------------|------------|-------------------------|
| Privacy Policy | `/privacy` | `app/privacy/page.tsx`  |
| Terms of Service | `/terms` | `app/terms/page.tsx`    |

## Privacy Policy

### Sections

1. **Introduction** - Commitment to privacy
2. **Information We Collect**
   - Account information (email, encrypted password)
   - Time entries (start, end, duration, descriptions)
   - Client and project data
   - Device information for auth/sync
3. **How We Store Your Data** - Supabase with encryption
4. **Third-Party Services** - Supabase link
5. **Your Rights** - Access, correction, deletion, export
6. **Data Retention** - Data kept while account active, deleted within 30 days of account deletion
7. **Contact Us** - Link to contact form
8. **Changes to This Policy** - Last updated date notice

## Terms of Service

### Sections

1. **Acceptance of Terms** - Agreement to be bound
2. **Description of Service** - What the app does
3. **User Responsibilities**
   - Accurate account info
   - Secure credentials
   - Lawful use only
   - No unauthorized access
   - No reverse engineering
4. **Intellectual Property** - App ownership
5. **User Data** - User retains rights, limited license granted
6. **Limitation of Liability** - Standard liability limitations
7. **Disclaimer of Warranties** - "As is" provision
8. **Termination** - Account termination conditions
9. **Governing Law** - US law jurisdiction
10. **Changes to Terms** - Update notice
11. **Contact Us** - Link to contact form

## Common Elements

Both pages include:
- Page title with metadata
- "Last updated" date
- Back to home navigation link
- Link to contact page

## Test Coverage

See `e2e/legal.spec.ts`:
- Title and content visible
- Last updated date displayed
- All key sections present
- Back to home link works
- Navigation from footer works
