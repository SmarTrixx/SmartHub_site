# Vercel Environment Variables Setup Guide

## Quick Overview

Two email accounts can be configured in Vercel:
- **Primary**: contact.smarthubz@gmail.com (for contact forms)
- **Secondary**: studio.smarthubz@gmail.com (for studio/admin activities - optional)

Both are configured via **Vercel Environment Variables** (not in admin UI).

---

## Step-by-Step: Adding Secondary Email to Vercel

### Step 1: Get App Passwords from Both Gmail Accounts

For **each Gmail account** (primary and secondary):

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification (if not already enabled)
3. Go to "App passwords" section
4. Select "Mail" and "Windows Computer" (or your device)
5. Copy the 16-character password shown
6. **Keep this password safe** - you'll use it in Vercel

### Step 2: Access Vercel Dashboard

1. Go to https://vercel.com
2. Select your **SmartHub Backend** project
3. Go to **Settings** → **Environment Variables**

### Step 3: Set Primary Email Variables

These should already be set, but verify:

```
Name: GMAIL_USER
Value: contact.smarthubz@gmail.com
Environments: Production

Name: GMAIL_PASSWORD  
Value: [16-char app password from contact.smarthubz@gmail.com]
Environments: Production
```

### Step 4: Add Secondary Email Variables (NEW)

Click **"Add New"** to add these:

```
Name: GMAIL_USER_SECONDARY
Value: studio.smarthubz@gmail.com
Environments: Production

Name: GMAIL_PASSWORD_SECONDARY
Value: [16-char app password from studio.smarthubz@gmail.com]
Environments: Production
```

### Step 5: Redeploy Backend

After adding environment variables:

1. Go to **Deployments** in Vercel
2. Click the three dots on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (should say "Ready")

### Step 6: Verify in Admin Settings

1. Go to https://smarthubz.vercel.app/admin/login
2. Login with admin credentials
3. Click **Settings** in sidebar
4. You should now see **both email accounts**:
   - Primary: contact.smarthubz@gmail.com (Connected)
   - Secondary: studio.smarthubz@gmail.com (Connected)

---

## Environment Variables Summary

### Production Environment Variables (Vercel)

```
# Primary Email (REQUIRED)
GMAIL_USER=contact.smarthubz@gmail.com
GMAIL_PASSWORD=[app_password]

# Secondary Email (OPTIONAL)
GMAIL_USER_SECONDARY=studio.smarthubz@gmail.com
GMAIL_PASSWORD_SECONDARY=[app_password]

# Other required vars (should already be set)
MONGODB_URI=[your_mongodb_connection]
JWT_SECRET=[your_jwt_secret]
ADMIN_EMAIL=your.email@gmail.com
ADMIN_PASSWORD_HASH=[hashed_password]
FRONTEND_URL=https://smarthubz.vercel.app
```

---

## Getting App Passwords from Gmail

### For contact.smarthubz@gmail.com:
1. Sign in to contact.smarthubz@gmail.com
2. Go to https://myaccount.google.com/security
3. Scroll to "Your devices"
4. Click **"App passwords"**
5. Select App: **Mail** | Device: **Windows Computer** (or your OS)
6. Copy the 16-character password

### For studio.smarthubz@gmail.com:
1. Sign in to studio.smarthubz@gmail.com  
2. Repeat steps 2-6 above
3. Copy the 16-character password

---

## Troubleshooting

### "GMAIL_USER_SECONDARY not found" error
- ✅ Confirm both variables are added in Vercel
- ✅ Redeploy after adding
- ✅ Wait 2-3 minutes for environment vars to activate

### Secondary email shows "Disconnected"
- ✅ Verify app password is correct (16 characters)
- ✅ Check 2-Step Verification is enabled on studio account
- ✅ Ensure it's an app password, not regular Gmail password

### Settings page shows "Error fetching settings"
- ✅ Make sure you're logged in as admin
- ✅ Check backend logs in Vercel for connection errors
- ✅ Click "Refresh Status" button to retry

---

## Usage

### Primary Email (Automatic)
- Used for all contact form submissions
- Sends user confirmation + admin notification
- No manual configuration needed - just set variables

### Secondary Email (Future Use)
- Configured but not actively used yet
- Can be used for studio-specific notifications
- Monitor via Admin Settings page

---

## Testing

After setup, test by:

1. **In Admin Settings page**:
   - Navigate to `/admin/settings`
   - Both emails should show status
   - Click "Refresh Status" to verify connection

2. **In Contact Form**:
   - Primary email should still work for contact submissions
   - Secondary email status visible in admin panel

3. **Check Backend Logs**:
   - Vercel → Deployments → View Build Logs
   - Look for "✅ EMAIL SERVICE: Primary transporter verified"
   - Look for "✅ EMAIL SERVICE: Secondary transporter verified"

---

## Support

If you need help:
1. Check the Admin Settings page status indicators
2. Review Vercel environment variables are correctly set
3. Check backend logs for specific errors
4. Verify app passwords (not regular Gmail password)
5. Ensure 2-Step Verification is enabled on both Gmail accounts

---

**Status**: Ready for production
**Deployment**: Immediate - just add vars and redeploy
**Risk Level**: Low - non-breaking change
