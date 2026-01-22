# SmartHub Complete Deployment Guide

## Overview
This guide covers deploying both frontend (React) and backend (Node.js/Express) to Vercel for FREE.

### Important Limitations & Considerations

#### ✅ What Works on Vercel Free Tier
- Frontend (React) deployment - fully supported
- Backend API - supported but with limitations
- Static assets and images - included
- HTTPS/SSL - free
- Custom domains - free

#### ⚠️ Backend Limitations on Free Tier
- **Function timeout**: 10 seconds (some operations may timeout)
- **Cold starts**: May be slow on first request
- **Email sending**: Works but may be slow
- **File uploads**: Size limited to 50MB (request body)
- **Database**: Must use external MongoDB (MongoDB Atlas free tier works great)
- **Memory**: Limited to 512MB per function

#### 💡 Why MongoDB Atlas?
Since Vercel doesn't include a database, use MongoDB Atlas:
- Free tier: 512MB storage (enough for most portfolios)
- Requires authentication, so account info is private
- Can easily scale if needed

---

## Part 1: Prepare for Deployment

### Step 1: Create MongoDB Atlas Account (Free)
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Create account and verify email
4. Create a free cluster:
   - Provider: AWS
   - Region: closest to you
   - Cluster name: "smarthub" (or any name)
5. Wait for cluster to be created (~10 minutes)

### Step 2: Set Up MongoDB Security
1. Click "SECURITY" → "Database Access"
2. Click "Add New Database User"
3. Create username: `smarthub-admin`
4. Create password: (strong password, save it!)
5. Click "Add User"

### Step 3: Allow Network Access
1. Go to "SECURITY" → "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ Not ideal for production, but okay for free tier
4. Confirm

### Step 4: Get Connection String
1. Go to "Deployments" → "Database"
2. Click "Connect" on your cluster
3. Select "Drivers"
4. Copy the connection string
5. Replace `<password>` with your password
6. Example: `mongodb+srv://smarthub-admin:yourpassword@cluster0.xxxxx.mongodb.net/smarthub?retryWrites=true&w=majority`

---

## Part 2: Frontend Deployment (React)

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### Step 2: Deploy Frontend
1. On Vercel dashboard, click "New Project"
2. Select your SmartHub_site repository
3. Configure project:
   - **Framework**: React
   - **Root Directory**: `./`
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `cd frontend && npm install`

### Step 3: Set Environment Variables
1. Go to "Settings" → "Environment Variables"
2. Add variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend-domain.vercel.app/api` (or your backend URL)
   - **Environments**: Production, Preview, Development
3. Click "Save"

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. You'll get a URL like: `https://smarthub-site-abc123.vercel.app`

### Step 5: Update Backend URL (if needed)
After backend is deployed, update frontend environment variable with backend URL.

---

## Part 3: Backend Deployment (Node.js)

### Option A: Deploy as Separate Vercel Project (Recommended)

#### Step 1: Create Backend-Only Repository (Optional but Recommended)
If you want to keep backend separate:
```bash
# In a new folder
git clone https://github.com/SmarTrixx/SmartHub_site.git backend-only
cd backend-only
git filter-branch --subdirectory-filter backend -- --all
git reset --hard
git gc --aggressive
git prune
```

#### Step 2: Deploy Backend to Vercel
1. On Vercel, click "New Project"
2. Select your backend repository (or SmartHub_site with filters)
3. Vercel will auto-detect the backend as Root Directory
4. Configuration:
   - **Root Directory**: `backend/` (auto-detected)
   - **Build Command**: Leave as default (will use `npm run build`)
   - **Install Command**: Leave as default (will use `npm install`)
   - Backend will deploy as serverless function

4. Add Environment Variables in Vercel:
   - Go to "Settings" → "Environment Variables"
   - Add these variables:

   | Name | Value |
   |------|-------|
   | `MONGODB_URI` | `mongodb+srv://smarthub-admin:yourpassword@cluster0.xxxxx.mongodb.net/smarthub` |
   | `JWT_SECRET` | Your secret key (use something long and random) |
   | `GMAIL_USER` | `contact.smarthubz@gmail.com` |
   | `GMAIL_PASSWORD` | Your 16-char app password (no spaces) |
   | `FRONTEND_URL` | `https://your-frontend-url.vercel.app` |
   | `NODE_ENV` | `production` |

5. Click "Deploy"

**Backend vercel.json Configuration Reference:**

The backend uses this `vercel.json` configuration for Vercel deployment:

```json
{
  "version": 2,
  "installCommand": "npm install",
  "buildCommand": "",
  "functions": {
    "server.js": {
      "memory": 512,
      "maxDuration": 30
    }
  },
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "JWT_SECRET": "@jwt_secret",
    "GMAIL_USER": "@gmail_user",
    "GMAIL_PASSWORD": "@gmail_password",
    "FRONTEND_URL": "@frontend_url",
    "NODE_ENV": "production"
  }
}
```

**Why This Configuration:**
- `buildCommand: ""` - Prevents `npm run build` errors (Node serverless runs directly)
- `functions` - Registers server.js as serverless function
- `memory: 512` - Maximum memory allocation
- `maxDuration: 30` - Timeout in seconds (can be increased later)
- Environment variables referenced with `@` are linked to Vercel project settings

**Backend Build Script:**
The backend `package.json` includes an empty build script:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "build": "echo 'No build needed for serverless function'"
}
```
This allows Vercel to complete the build phase without errors since Node.js serverless functions don't require compilation.

### Option B: Deploy Backend + Frontend Together

Create a `vercel.json` at root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "frontend/build",
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    },
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/build/index.html"
    }
  ]
}
```

---

## Part 4: Environment Setup

### Backend .env File (Local Development)
```
PORT=5000
MONGODB_URI=mongodb+srv://smarthub-admin:yourpassword@cluster0.xxxxx.mongodb.net/smarthub
JWT_SECRET=your_super_secret_key_change_in_production
ADMIN_EMAIL=admin@smarthub.com
ADMIN_PASSWORD=demo123456
GMAIL_USER=contact.smarthubz@gmail.com
GMAIL_PASSWORD=gzqflltajrqhhioj
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Vercel Environment Variables (Production)
Set these in Vercel dashboard:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - Use a strong random string
- `GMAIL_USER` - Your Gmail address
- `GMAIL_PASSWORD` - Your Gmail app password
- `FRONTEND_URL` - Your Vercel frontend URL
- `NODE_ENV` - `production`

---

## Part 5: Testing Deployment

### Test Frontend
1. Go to your Vercel frontend URL
2. Check if pages load correctly
3. Open browser console for any errors

### Test Backend
1. Open browser console (in frontend)
2. Go to Contact page
3. Try sending a message
4. Should see success message and receive email

### Test API Directly
```bash
# Health check
curl https://your-backend.vercel.app/api/health

# Get profile
curl https://your-backend.vercel.app/api/profile

# Send contact message
curl -X POST https://your-backend.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message"
  }'
```

---

## Part 6: Troubleshooting

### Frontend Issues

**Images not loading**
- Check `REACT_APP_API_URL` is set correctly
- Make sure backend API URL is complete

**Pages not found (404)**
- Vercel should auto-redirect to index.html
- Check `vercel.json` rewrites are correct

**Slow loading**
- Normal on cold start
- Check frontend build size: `npm run build`

### Backend Issues

**API returning 500 errors**
- Check Vercel logs: Dashboard → Project → Deployments → Logs
- Verify environment variables are set
- Check MongoDB connection string

**Email not sending**
- Verify Gmail credentials in Vercel env vars
- Check if 2FA and app password are set up
- Look at error message in Vercel logs

**Timeout errors (10s+)**
- Some operations might exceed Vercel timeout
- Consider upgrading to paid tier if needed
- Optimize database queries

**"Cannot find module"**
- Run `npm install` in backend folder
- Check package.json dependencies
- Redeploy after fixing

### MongoDB Connection Issues

**"MongoError: connect ECONNREFUSED"**
- Check MongoDB Atlas cluster is running
- Verify IP whitelist includes 0.0.0.0/0
- Test connection string locally first

**"MongoError: authentication failed"**
- Check username and password in connection string
- Make sure special characters are URL-encoded
- Verify database user exists in Atlas

---

## Part 7: Update Frontend URL in Code

Once backend is deployed, update frontend:

### Option 1: Update Environment Variable
1. In Vercel dashboard, go to frontend project
2. Settings → Environment Variables
3. Update `REACT_APP_API_URL` to your backend URL
4. Trigger a redeploy

### Option 2: Update Frontend Code
Edit `/frontend/src/services/api.js`:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://your-backend.vercel.app/api';
```

---

## Part 8: Custom Domain (Optional)

### Add Custom Domain
1. In Vercel dashboard, go to "Settings" → "Domains"
2. Enter your domain (e.g., smarthub.com)
3. Update DNS records:
   - Add CNAME: `your-project.vercel.app`
   - Or use Vercel's nameservers

4. Wait for DNS to propagate (~24 hours)

---

## Part 9: Monitoring & Maintenance

### Check Deployment Status
- Go to Vercel dashboard
- Check "Deployments" tab
- Look for any failed builds

### View Logs
- Click on any deployment
- Click "Logs" to see build and runtime logs
- Useful for debugging

### Monitor Errors
- Set up error monitoring (optional)
- Use Sentry or similar services
- Track issues in production

### Backup Data
- Regularly export MongoDB data
- Or set up automated backups in MongoDB Atlas

---

## Summary Checklist

- [ ] MongoDB Atlas account created and cluster running
- [ ] MongoDB connection string saved
- [ ] GitHub repository updated with all code
- [ ] Frontend deployed to Vercel
- [ ] Frontend URL working (check homepage)
- [ ] Backend deployed to Vercel
- [ ] Environment variables set in Vercel (both frontend and backend)
- [ ] Backend API endpoint responding
- [ ] Contact form sending emails
- [ ] Team avatars displaying from backend
- [ ] All pages loading without errors
- [ ] Contact form working end-to-end

---

## Quick Reference URLs

After deployment, you'll have:
- **Frontend**: `https://your-frontend.vercel.app`
- **Backend**: `https://your-backend.vercel.app`
- **API Health**: `https://your-backend.vercel.app/api/health`
- **MongoDB**: `mongodb+srv://...mongodb.net`

---

## Need Help?

### Common Links
- Vercel Docs: https://vercel.com/docs
- Node.js on Vercel: https://vercel.com/docs/concepts/functions/serverless-functions
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables

### Upgrade to Paid (if needed)
- Vercel Pro: $20/month - removes cold start delays, increases timeout
- More reliable for production apps
