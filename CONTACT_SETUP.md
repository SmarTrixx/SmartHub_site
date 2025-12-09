# Contact Form Email Setup Guide

## Overview
The contact form is now fully functional and sends messages to `contact.smarthubz@gmail.com` with automatic replies to users.

## Features Implemented

### Frontend (Contact.jsx)
✅ Form validation for name, email, and message
✅ Real-time error clearing as user types
✅ Email format validation
✅ Submit button shows loading state
✅ Success message display (auto-hides after 5 seconds)
✅ Error message display for submission failures
✅ Responsive glassmorphic design

### Backend (contact.js route)
✅ Express validator for input validation
✅ Nodemailer Gmail integration
✅ Two-way email system:
  - Admin email with full message details and reply-to address
  - Auto-reply to user confirming message receipt
✅ HTML formatted emails with professional styling
✅ Error handling and logging
✅ Environment variable configuration for security

## Configuration Required

### 1. Gmail Setup
To use Gmail for sending emails, you need to enable "App Passwords" in your Gmail account:

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Google will generate a 16-character password
4. Copy this password

### 2. Environment Variables
Update `/backend/.env` with:
```
GMAIL_USER=contact.smarthubz@gmail.com
GMAIL_PASSWORD=your_16_character_app_password_here
```

**Important:** Never commit `.env` file to version control. Keep passwords secure.

### 3. Restart Backend Server
After updating `.env`:
```bash
cd backend
npm run dev
```

Check console for: `✅ Email transporter ready`

## How It Works

### User Submits Contact Form
1. Frontend validates all required fields
2. Sends POST request to `/api/contact`
3. Shows loading spinner on button
4. Backend validates data again (server-side validation)

### Backend Processing
1. Validates inputs using express-validator
2. Creates HTML formatted emails
3. Sends two emails:
   - **To Admin:** Full message with user's reply-to address
   - **To User:** Confirmation message thanking them

### Response to User
- ✅ Success: Green success message shows for 5 seconds
- ❌ Error: Red error message displays with details

## API Endpoint

**POST** `/api/contact`

### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your message here"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Message sent successfully! We will contact you shortly."
}
```

### Error Response (400/500)
```json
{
  "success": false,
  "message": "Failed to send message. Please try again later.",
  "errors": [...]
}
```

## Testing

### Local Testing
1. Start backend: `npm run dev` (in backend folder)
2. Start frontend: `npm start` (in frontend folder)
3. Navigate to Contact page
4. Fill form and submit
5. Check console for success/error messages

### Troubleshooting

**Issue:** "Email transporter error" in console
- Solution: Check Gmail credentials in `.env`
- Verify app password is 16 characters
- Ensure GMAIL_USER email exists

**Issue:** Messages not sending
- Verify backend is running on port 5000
- Check network tab for API request errors
- Ensure `REACT_APP_API_URL` in frontend matches backend URL

**Issue:** Gmail blocking login attempts
- Solution: Use App Passwords instead of regular password
- Delete old app passwords if limit reached

## File Structure

```
backend/
├── routes/
│   └── contact.js          (NEW - Email handling route)
├── server.js               (UPDATED - Added contact route)
└── .env                    (UPDATED - Added Gmail credentials)

frontend/
└── src/pages/
    └── Contact.jsx         (UPDATED - Integrated email submission)
```

## Security Best Practices

1. ✅ Use environment variables for credentials
2. ✅ Never commit `.env` file
3. ✅ Server-side validation on backend
4. ✅ Email sanitization in HTML content
5. ✅ Rate limiting recommended for production (add in future)
6. ✅ Use App Passwords instead of account password

## Future Enhancements

- [ ] Rate limiting to prevent spam
- [ ] Database logging of contact submissions
- [ ] Admin dashboard to view messages
- [ ] Email template system for customization
- [ ] Attachment support
- [ ] Webhook notifications
- [ ] Integration with other email services (SendGrid, Mailgun)

## Support

For issues or questions, ensure:
1. Backend is running and shows email transporter ready
2. `.env` credentials are correct
3. Frontend can reach the backend API
4. No network/firewall issues blocking email
