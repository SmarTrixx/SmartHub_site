# Smarthubz Studio - Complete Documentation

## Table of Contents
1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Email Configuration](#email-configuration)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Local Development
```bash
# Terminal 1: Backend
cd backend
npm install
npm start

# Terminal 2: Frontend
cd frontend
npm install
npm start
```

The frontend runs on `http://localhost:3000` and backend on `http://localhost:5000`.

### Production URLs
- **Frontend**: https://smarthubz.vercel.app
- **Backend**: https://smarthubzbackend.vercel.app

---

## Project Structure

```
project-root/
├── backend/
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth & upload middleware
│   ├── services/         # Business logic (email service)
│   ├── utils/            # Utilities (email templates)
│   └── server.js         # Express server
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client
│   │   └── routes/       # React Router config
│   └── public/           # Static files
├── README.md             # This file
└── package.json          # Root package config
```

---

## Backend Setup

### Environment Variables

Create `.env` file in `/backend`:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Email (Primary - for contact forms)
GMAIL_USER=contact.smarthubz@gmail.com
GMAIL_PASSWORD=your_app_specific_password

# Email (Secondary - optional, for studio emails)
GMAIL_USER_SECONDARY=studio.smarthubz@gmail.com
GMAIL_PASSWORD_SECONDARY=your_app_specific_password

# Admin
ADMIN_EMAIL=your.email@gmail.com
ADMIN_PASSWORD_HASH=hashed_password_here

# JWT
JWT_SECRET=your_jwt_secret_key

# CORS
FRONTEND_URL=https://smarthubz.vercel.app
```

### Database Models

- **Admin**: Credentials for admin panel login
- **Profile**: Portfolio owner information
- **Project**: Portfolio projects
- **Service**: Services offered
- **ServiceRequest**: Contact form submissions

### API Endpoints

#### Authentication (`/api/auth`)
- `POST /setup` - Initial admin setup
- `POST /login` - Admin login
- `GET /verify` - Verify token

#### Contact (`/api/contact`)
- `POST /` - Submit contact form (returns `emailSent` status)

#### Profile (`/api/profile`)
- `GET /` - Get portfolio profile
- `POST /` - Update profile (admin only)

#### Projects (`/api/projects`)
- `GET /` - List all projects
- `POST /` - Create project (admin only)
- `PUT /:id` - Update project (admin only)
- `DELETE /:id` - Delete project (admin only)

#### Services (`/api/services`)
- `GET /` - List all services
- `POST /` - Create service (admin only)
- `PUT /:id` - Update service (admin only)
- `DELETE /:id` - Delete service (admin only)

#### Service Requests (`/api/service-requests`)
- `GET /` - List requests (admin only)
- `POST /` - Submit service request (returns `emailSent` status)
- `PUT /:id/status` - Update status (admin only)

#### Admin Settings (`/api/admin/settings`)
- `GET /` - Get system settings (admin only)
- `GET /email-status` - Get email configuration status (admin only)

---

## Frontend Setup

### Environment Variables

Create `.env` in `/frontend`:

```env
REACT_APP_API_URL=https://smarthubzbackend.vercel.app/api
```

For local development, use:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Key Features

#### Public Pages
- **Home** - Landing page
- **Services** - Services listing
- **Portfolio** - Projects showcase
- **Project Detail** - Individual project view
- **Contact** - Contact form (with email confirmation)
- **About** - About page
- **Terms** - Terms of service
- **Privacy** - Privacy policy

#### Admin Dashboard (`/admin`)
- **Login** - Authentication
- **Dashboard** - Overview & statistics
- **Projects** - Manage portfolio projects
- **Services** - Manage services
- **Profile** - Edit portfolio information
- **Service Requests** - View & manage incoming requests
- **Settings** - System configuration & email status

### Session Management

Admin sessions are tracked with:
- JWT token in localStorage
- 24-hour session timeout
- Automatic cleanup on logout
- Token verification on app load

---

## Email Configuration

### Primary Email (Contact Forms)

- **Account**: `contact.smarthubz@gmail.com`
- **Environment Variables**: `GMAIL_USER`, `GMAIL_PASSWORD`
- **Purpose**: Contact form confirmations and admin notifications
- **Features**:
  - Automatic retry on failure (2 attempts)
  - Blocking sends (waits for completion)
  - Real email status feedback to frontend
  - Structured logging of all operations

### Secondary Email (Optional - Studio)

- **Account**: `studio.smarthubz@gmail.com`
- **Environment Variables**: `GMAIL_USER_SECONDARY`, `GMAIL_PASSWORD_SECONDARY`
- **Purpose**: Studio-specific communications (future use)
- **Status**: Can be monitored via Admin Settings page

### Email Service Architecture

**File**: `/backend/services/emailService.js`

Features:
- Dual transporter support (primary + secondary)
- Connection pooling (max 5 connections, rate-limited)
- Automatic retry mechanism (2 attempts with delays)
- Comprehensive error logging
- Status reporting via API

**Key Functions**:
- `sendEmail(mailOptions, emailType, retries)` - Blocking send with retry
- `sendEmailAsync(mailOptions, emailType)` - Fire-and-forget send
- `getEmailServiceStatus()` - Get connection status

### Email Response Flags

All email endpoints return:
```json
{
  "success": true,
  "emailSent": true,  // True if at least one email was sent
  "emailStatus": {
    "userConfirmation": "sent|failed",
    "adminNotification": "sent|failed",
    "overallStatus": "success|failed"
  }
}
```

Frontend displays:
- 🟢 **Green** - All emails sent successfully
- 🟡 **Yellow** - Message received but emails could not be sent
- 🔴 **Red** - Error processing request

---

## Deployment

### Frontend Deployment (Vercel)

1. Push to GitHub
2. Vercel auto-deploys from main branch
3. Environment variables set in Vercel dashboard
4. Build command: `npm run build`
5. Deploy to: https://smarthubz.vercel.app

### Backend Deployment (Vercel)

1. Configure `vercel.json` in backend directory
2. Deploy serverless functions
3. Environment variables set in Vercel dashboard
4. API base URL: https://smarthubzbackend.vercel.app

### Environment Setup for Production

In Vercel dashboard, set:
- `MONGODB_URI` - Production MongoDB connection
- `GMAIL_USER` & `GMAIL_PASSWORD` - Primary email credentials
- `GMAIL_USER_SECONDARY` & `GMAIL_PASSWORD_SECONDARY` - Secondary email (optional)
- `ADMIN_EMAIL` - Admin contact email
- `ADMIN_PASSWORD_HASH` - Hashed admin password
- `JWT_SECRET` - Secret for JWT signing
- `FRONTEND_URL` - Frontend URL for CORS

---

## Contact Form Email Flow

### Request
```bash
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I would like to discuss a project..."
}
```

### Process
1. Validate input
2. Send **user confirmation email** (blocking, with retry)
3. Send **admin notification email** (blocking, with retry)
4. Return status to frontend

### Response
```json
{
  "success": true,
  "message": "Message submitted successfully",
  "emailSent": true,
  "info": "We will contact you shortly. A confirmation email has been sent.",
  "emailStatus": {
    "userConfirmation": "sent",
    "adminNotification": "sent",
    "overallStatus": "success"
  }
}
```

### Frontend Display

If `emailSent === true`:
- ✅ Green success message: "Message received! We've sent you a confirmation email..."

If `emailSent === false`:
- ⚠️ Yellow warning message: "Message received with notification. Your message has been saved. Confirmation emails could not be sent..."

If error occurs:
- ❌ Red error message: "Failed to send message. Please try again later."

---

## Service Request Form Email Flow

### Request
```bash
POST /api/service-requests
Content-Type: multipart/form-data

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "service": "Web Development",
  "budget": "$5000-$10000",
  "timeline": "3-6 months",
  "description": "I need a custom website...",
  "attachments": [file1, file2]  // Optional
}
```

### Email Sending Rules

Emails are only sent when status changes to specific values:
- `approved` → Send service request status update
- `rejected` (with message) → Send rejection notification
- Other statuses → No email sent

### Response
```json
{
  "success": true,
  "emailSent": true,
  "emailStatus": {
    "requestConfirmation": "sent",
    "adminNotification": "sent"
  }
}
```

---

## Admin Settings Page

Access via: `/admin/settings` (after login)

### Features
- **Email Configuration Monitor**
  - Primary email account status
  - Secondary email account status
  - Connection status indicators (connected/disconnected/not configured)
  - Error messages if applicable

- **System Status**
  - Environment (development/production)
  - Last refresh timestamp

- **Refresh Button**
  - Real-time email status check
  - Detects connection issues

- **Configuration Instructions**
  - Environment variable names
  - Setup guidelines
  - Security best practices

---

## Troubleshooting

### Email Not Sending

**Symptoms**: Form submitted but no emails received, `emailSent: false` in response

**Solutions**:
1. Check Gmail credentials in `.env`
2. Verify App Passwords are used (not regular password)
3. Check backend logs for SMTP errors
4. Verify `GMAIL_USER` matches sending account
5. Admin Settings page shows connection status

### CORS Errors

**Symptoms**: Frontend requests blocked by CORS

**Solutions**:
1. Verify `FRONTEND_URL` in backend `.env`
2. Check server.js CORS configuration
3. Ensure backend is running
4. Clear browser cache

### Database Connection Issues

**Symptoms**: 503 errors, "Database connection not available"

**Solutions**:
1. Check `MONGODB_URI` in `.env`
2. Verify MongoDB connection string format
3. Ensure database is running
4. Check MongoDB network access settings

### Admin Login Issues

**Symptoms**: Cannot login to admin panel

**Solutions**:
1. Verify `ADMIN_PASSWORD_HASH` is set in `.env`
2. Check JWT_SECRET configuration
3. Clear localStorage and try again
4. Check browser console for errors

### Image Upload Issues

**Symptoms**: Images not appearing in portfolio

**Solutions**:
1. Check upload directory permissions
2. Verify file upload middleware configuration
3. Check browser console for 400/500 errors
4. Ensure image files are <5MB

---

## Development Workflow

### Making Changes

1. Create feature branch: `git checkout -b feature/name`
2. Make changes
3. Test locally
4. Commit: `git commit -m "feat: description"`
5. Push: `git push origin feature/name`
6. Create pull request
7. Merge to main

### Testing Email Locally

```bash
# Terminal 1: Backend with local MongoDB
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm start

# Visit http://localhost:3000/contact
# Fill and submit form
# Check backend console for email logs
```

### Building for Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
# Vercel auto-builds on push to GitHub
```

---

## Quick Commands

```bash
# Start development servers
./start-dev.sh          # Linux/Mac
./start-dev.bat         # Windows

# Install dependencies
npm install             # Root
cd backend && npm i     # Backend
cd frontend && npm i    # Frontend

# Run tests
npm test                # In respective directory

# View logs (backend)
tail -f backend/logs/*.log

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Support & Contact

For issues or questions:
- **Email**: contact.smarthubz@gmail.com
- **GitHub**: [Repository URL]
- **Live Site**: https://smarthubz.vercel.app

---

**Last Updated**: 2024
**Status**: Production Ready
