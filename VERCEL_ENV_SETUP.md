# Vercel Environment Variables Setup

## How to Fix "Secret Does Not Exist" Error

The error occurs because `backend/vercel.json` was trying to reference secrets that don't exist. We removed those references, and now you need to set the environment variables directly in Vercel.

## Steps to Set Environment Variables in Vercel

### For Backend Project:

1. Go to **Vercel Dashboard** → Select **Backend Project**
2. Click **Settings** → **Environment Variables**
3. Add each variable by clicking "Add"

**Add these environment variables:**

| Name | Value |
|------|-------|
| `MONGODB_URI` | `mongodb+srv://smarthub-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smarthub?retryWrites=true&w=majority` |
| `JWT_SECRET` | Use a strong random string (minimum 32 characters) |
| `GMAIL_USER` | `contact.smarthubz@gmail.com` |
| `GMAIL_PASSWORD` | Your Gmail app password (16 characters, no spaces) |
| `FRONTEND_URL` | Your frontend Vercel URL (e.g., `https://your-frontend.vercel.app`) |
| `NODE_ENV` | `production` |

### Getting Your MongoDB Connection String:

1. Go to **MongoDB Atlas** → Your Cluster
2. Click **Connect** → **Drivers**
3. Copy the connection string
4. Replace `<password>` with your actual database password
5. Paste into `MONGODB_URI`

### For Each Environment Variable:

1. **Name**: Exactly as shown in table above
2. **Value**: Your actual secret/password
3. **Environments**: Select "Production" (or all)
4. Click "Save"

## After Adding All Variables:

1. Go back to **Deployments**
2. Click **Redeploy** on latest deployment
3. Backend should now deploy successfully ✅

## Important Notes:

- ✅ Never commit `.env` files with actual secrets to GitHub
- ✅ Always use Vercel's environment variable settings for production
- ✅ Gmail app password should be 16 characters without spaces
- ✅ MongoDB password must be URL-encoded (special chars like `@` become `%40`)

## Troubleshooting:

**Still seeing "Secret does not exist" error?**
- Clear browser cache
- Wait 5 minutes for Vercel to update
- Try redeploying again

**MongoDB connection fails after setting variables?**
- Verify password is URL-encoded
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Test connection string locally first

**Gmail not sending emails?**
- Verify Gmail 2FA is enabled
- Regenerate app password if needed
- Check Gmail app password format (16 chars, no spaces)
