# Backend Deployment on Vercel - Detailed Guide

## Why Vercel for Backend?

✅ **Pros:**
- Free serverless functions (Node.js)
- Auto-scales with traffic
- Zero maintenance
- Built-in logging and monitoring
- Easy environment variables
- Quick deployments
- Works great with MongoDB Atlas

⚠️ **Cons:**
- 10-second timeout on free tier (some operations may timeout)
- Cold starts (first request takes 1-2 seconds)
- Can't keep background jobs running
- Limited to serverless architecture

**Better Alternatives (if issues):**
- Railway.app - Similar to Vercel, great for Node.js
- Heroku (now paid, ~$7/month)
- Render - Free tier available
- Fly.io - Good for databases

---

## Backend Deployment Steps

### Option 1: Deploy from Existing SmartHub_site Repo (Easiest)

#### 1. Go to Vercel
- Visit https://vercel.com
- Sign in with GitHub

#### 2. Create New Project
- Click "Add New..." → "Project"
- Select "SmartHub_site" repository

#### 3. Configure Project
- **Project Name**: smarthub-backend (or similar)
- **Framework Preset**: Other
- **Root Directory**: `backend/`
- **Build Command**: `npm install`
- **Development Command**: `npm run dev`
- **Install Command**: `npm install`
- **Output Directory**: Leave empty (Node.js doesn't have a build output)

#### 4. Set Environment Variables
Before deploying, add these in the "Environment Variables" section:

```
MONGODB_URI = mongodb+srv://smarthub-admin:your_password@cluster0.xxxxx.mongodb.net/smarthub
JWT_SECRET = your_super_secret_random_string_here
GMAIL_USER = contact.smarthubz@gmail.com
GMAIL_PASSWORD = gzqflltajrqhhioj
FRONTEND_URL = https://your-frontend-url.vercel.app
NODE_ENV = production
ADMIN_EMAIL = admin@smarthub.com
ADMIN_PASSWORD = demo123456
```

**Important**: Click "Select Environment" and choose:
- ✅ Production
- ✅ Preview
- ✅ Development

#### 5. Deploy
- Click "Deploy"
- Wait for build to complete (usually 1-2 minutes)
- You'll get a URL like: `https://smarthub-backend-abc123.vercel.app`

#### 6. Copy Backend URL
Save this URL - you'll need it for frontend configuration.

---

### Option 2: Deploy Separate Backend Repository (Advanced)

If you want backend in its own repo:

#### 1. Create Backend-Only Repo
```bash
# Clone the repo
git clone https://github.com/SmarTrixx/SmartHub_site.git temp
cd temp

# Keep only backend folder
git filter-branch --subdirectory-filter backend -- --all
git reset --hard
git gc --aggressive
git prune

# Create new repo on GitHub called "smarthub-backend"
# Then push this:
git remote set-url origin https://github.com/YOUR_USERNAME/smarthub-backend.git
git push -u origin main
```

#### 2. Deploy to Vercel
- Import the `smarthub-backend` repository
- Same configuration as Option 1, but:
  - Root Directory: `./` (since backend is root now)
  - Build Command: `npm install`

---

## Testing Backend on Vercel

### 1. Test Health Endpoint
```bash
curl https://your-backend.vercel.app/api/health
# Should return: {"status":"API is running"}
```

### 2. Test Profile Endpoint
```bash
curl https://your-backend.vercel.app/api/profile
# Should return profile data from MongoDB
```

### 3. Test Contact Form
```bash
curl -X POST https://your-backend.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-email@gmail.com",
    "message": "Test message"
  }'
# Should send email and return success
```

### 4. Test Authentication
```bash
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smarthub.com",
    "password": "demo123456"
  }'
# Should return JWT token
```

---

## Viewing Logs

### Check Deployment Logs
1. Go to your backend Vercel project
2. Click "Deployments"
3. Click the latest deployment
4. Click "Logs" tab
5. See real-time build and runtime logs

### View Runtime Logs
1. Click on a deployment
2. Scroll down to see function logs
3. Useful for debugging errors

---

## Common Issues & Solutions

### Issue: "Cannot find module 'mongoose'"
**Solution**: 
- Make sure `backend/package.json` exists
- Run `npm install` locally first
- Commit `package-lock.json` to GitHub
- Redeploy

### Issue: MongoDB Connection Timeout
**Solution**:
- Verify MongoDB URI is correct
- Check username and password have no special characters
- Verify IP whitelist in MongoDB Atlas includes 0.0.0.0/0
- Test connection string locally first

### Issue: 10-Second Timeout Errors
**Solution**:
- This is Vercel free tier limit
- Heavy database queries may timeout
- Optimize database queries
- Consider upgrading to Pro ($20/month)

### Issue: "EAUTH" Error for Gmail
**Solution**:
- Gmail password must be 16-character app password
- No spaces in the password
- Must have 2FA enabled on Gmail account
- Check password in `.env` file locally first

### Issue: CORS Errors from Frontend
**Solution**:
- Check `FRONTEND_URL` is set correctly in backend env vars
- Make sure CORS middleware allows requests from frontend domain
- Verify frontend is making requests to correct backend URL

### Issue: File Upload Not Working
**Solution**:
- Vercel has 50MB request body limit
- Check file size isn't too large
- Verify uploads folder exists in backend

---

## Environment Variables Explained

| Variable | Example | Purpose |
|----------|---------|---------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/db` | Database connection |
| `JWT_SECRET` | `super_secret_key_123456789` | API authentication |
| `GMAIL_USER` | `contact.smarthubz@gmail.com` | Email sender address |
| `GMAIL_PASSWORD` | `gzqflltajrqhhioj` | Gmail app password (16 chars) |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | CORS allowed domain |
| `NODE_ENV` | `production` | Environment mode |
| `ADMIN_EMAIL` | `admin@smarthub.com` | Admin login email |
| `ADMIN_PASSWORD` | `demo123456` | Admin login password |

---

## Performance Optimization

### Reduce Cold Start Time
- Minimize dependencies in package.json
- Remove unused packages
- Use lightweight libraries

### Improve Function Speed
- Optimize database queries
- Add indexes to MongoDB
- Cache frequently accessed data

### Monitor Performance
- Check function duration in logs
- Look for slow operations
- Use MongoDB Atlas performance monitoring

---

## Scaling Beyond Free Tier

### When to Upgrade?
- Using > 512MB storage on MongoDB
- Functions timing out frequently
- Heavy traffic (> 1000 requests/day)
- Need better performance

### Upgrade Options
1. **Vercel Pro**: $20/month
   - Remove cold starts
   - 60-second timeout
   - Priority support
   
2. **MongoDB Atlas Paid**: $57+/month
   - Unlimited storage
   - Auto-backups
   - Production-grade features

3. **Alternative Platforms**:
   - Railway: Similar pricing to Vercel
   - Render: Free tier available
   - Fly.io: Great for Node.js apps

---

## Maintenance & Updates

### Deploy Updated Code
```bash
# Make changes locally
git add .
git commit -m "Update backend feature"
git push origin main

# Vercel auto-detects changes and redeploys
# Check Deployments tab to see progress
```

### Update Environment Variables
1. Go to Vercel project settings
2. Environment Variables
3. Edit variable value
4. Click "Save"
5. Redeploy latest from Deployments tab

### Monitor Uptime
- Vercel provides 99.95% uptime SLA
- Check status.vercel.com for incidents
- Enable email notifications for deployments

---

## Before Going Live

Checklist:
- [ ] MongoDB Atlas cluster running
- [ ] Environment variables set in Vercel
- [ ] Backend URL copied
- [ ] Frontend updated with backend URL
- [ ] Contact form tested
- [ ] Profile endpoints working
- [ ] Project/service CRUD working
- [ ] File uploads working
- [ ] Email notifications working
- [ ] Auth login/logout working

---

## Quick Reference

### Vercel Backend URL Format
```
https://your-project-name.vercel.app/api
```

### API Endpoint Examples
```
GET  https://your-backend.vercel.app/api/health
GET  https://your-backend.vercel.app/api/profile
GET  https://your-backend.vercel.app/api/projects
POST https://your-backend.vercel.app/api/contact
POST https://your-backend.vercel.app/api/auth/login
```

### Environment Variable Format for Frontend
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://your-backend.vercel.app/api';
```

---

## Support & Troubleshooting

- **Vercel Docs**: https://vercel.com/docs/functions/serverless-functions
- **Check Logs**: Deployments → Select Build → Logs
- **Restart Function**: Redeploy from Deployments tab
- **Check Status**: https://status.vercel.com

**Still having issues?** Check the `DEPLOYMENT_GUIDE.md` for more details!
