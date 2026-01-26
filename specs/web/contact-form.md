# Contact Form

Contact page for user inquiries and feedback.

## Routes

| Route       | File                       | Description        |
|-------------|----------------------------|--------------------|
| `/contact`  | `app/contact/page.tsx`     | Contact form UI    |
| `/api/contact` | `app/api/contact/route.ts` | Form submission API |

## Form Fields

| Field    | Type     | Validation                          | Required |
|----------|----------|-------------------------------------|----------|
| Name     | text     | Not empty                           | Yes      |
| Email    | email    | Not empty, valid email format       | Yes      |
| Message  | textarea | Not empty, minimum 10 characters    | Yes      |
| Website  | text     | Honeypot - hidden, must be empty    | No       |

## Client-Side Validation

Validation runs on form submit before API call:

| Error Condition           | Error Message                          |
|---------------------------|----------------------------------------|
| Name empty                | "Name is required"                     |
| Email empty               | "Email is required"                    |
| Email invalid format      | "Please enter a valid email address"   |
| Message empty             | "Message is required"                  |
| Message < 10 chars        | "Message must be at least 10 characters" |

Errors display below each field with red styling.

## Form States

| State      | UI Behavior                                    |
|------------|------------------------------------------------|
| Idle       | Form editable, "Send Message" button           |
| Submitting | Button shows "Sending...", disabled            |
| Success    | Form replaced with success message + home link |
| Error      | Error banner shown above form                  |

## API Route

`POST /api/contact`

### Request Body

```json
{
  "name": "string",
  "email": "string",
  "message": "string",
  "website": "string (honeypot)"
}
```

### Validation

1. Check honeypot - if filled, return success silently (bot trap)
2. Validate name not empty
3. Validate email not empty and valid format
4. Validate message not empty and >= 10 chars

### Response

Success: `{ "success": true }` (200)
Error: `{ "error": "message" }` (400 or 500)

### Email Sending

If `RESEND_API_KEY` and `CONTACT_EMAIL` environment variables are set:
- Send email via Resend API
- From: `Time Tracker <onboarding@resend.dev>`
- To: `CONTACT_EMAIL` (currently `dirkpostma@gmail.com`)
- Subject: `Contact Form: {name}`
- Reply-To: submitter's email

Email failures are logged but don't fail the request.

## Spam Protection

Honeypot field implementation:
- Hidden `<input name="website">` field
- CSS `display: none` and `aria-hidden="true"`
- `tabIndex={-1}` to prevent tab navigation
- If bot fills it, form silently succeeds but doesn't process

## Test Coverage

See `e2e/contact.spec.ts`:
- Form renders with all fields
- Honeypot field hidden but present
- All validation errors display correctly
- Multiple errors show simultaneously
- Successful submission shows success message
- Loading state during submission
- Navigation to/from contact page works
