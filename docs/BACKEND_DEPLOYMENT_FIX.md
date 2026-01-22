# Backend Deployment Fix - npm run build Error

## Problem
The backend deployment on Vercel was failing with:
```
npm error Missing script: "build"
npm error Command "npm run build" exited with 1
```

## Root Cause
Vercel was trying to run `npm run build` as the default build step for Node.js projects, but the backend doesn't have a build script since it runs ES6 modules directly.

## Solution
Updated `backend/vercel.json` with serverless function configuration:

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
  "env": { ... }
}
```

### Key Configuration Points:

1. **`buildCommand: ""`** (empty string)
   - Tells Vercel NOT to run a build step
   - Backend runs directly as serverless function
   - Critical for preventing `npm run build` error

2. **`functions` configuration**
   - Registers `server.js` as serverless function
   - Sets memory to 512MB (free tier default)
   - Sets timeout to 30 seconds (up to 60s available)

3. **`installCommand: "npm install"`**
   - Still needed to install dependencies
   - But no build step after installation

## Testing the Fix

1. **Go to Vercel Dashboard**
   - Select backend project
   - Click "Redeploy" (or wait for auto-redeploy from new commits)
   - Check build logs - should NOT see `npm run build` error

2. **Verify Backend Deployment**
   ```bash
   curl https://your-backend.vercel.app/api/profile
   ```
   Should return profile data (or empty if no data)

3. **Test Complete Flow**
   - Frontend accessible
   - Frontend can reach backend API
   - Contact form works end-to-end

## Changes Made

**Commits:**
- `9fadc17` - Fix: Configure backend serverless function for Vercel
- `4896e39` - docs: Update backend vercel.json configuration in deployment guide

**Files Modified:**
- `backend/vercel.json` - Added `buildCommand: ""` and `functions` config
- `DEPLOYMENT_GUIDE.md` - Added vercel.json reference and explanation

## Status
✅ Backend deployment error fixed
✅ Frontend deployed successfully  
✅ Ready for redeployment on Vercel

## Next Action
**Redeploy backend on Vercel dashboard to test the fix**
