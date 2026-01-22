# SmartHub Development Troubleshooting Guide

Common issues and their solutions during development.

## Database Issues

### MongoDB Won't Connect

**Error:** `MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions:**

1. **Check if MongoDB is running:**
   ```bash
   # macOS with Homebrew
   brew services list | grep mongodb
   
   # Linux with systemd
   systemctl status mongod
   
   # Windows
   net start MongoDB
   ```

2. **Start MongoDB:**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   
   # Or run mongod directly
   mongod
   ```

3. **Verify connection string in `backend/.env`:**
   ```bash
   # Should look like:
   MONGODB_URI=mongodb://localhost:27017/smarthub
   # or for MongoDB Atlas:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smarthub
   ```

### Database Reset Needed

```bash
# Access MongoDB shell
mongosh

# Switch to database
use smarthub

# Drop entire database
db.dropDatabase()

# Exit
exit
```

---

## Port Already in Use

### Port 5000 (Backend) in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use alternative port
# In backend/.env:
PORT=5001
```

### Port 3000 (Frontend) in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use alternative port
PORT=3001 npm start
```

---

## Authentication Issues

### JWT Token Expired

**Error:** `"message": "Token has expired"`

**Solution:**
1. Re-login to get new token
2. Check token expiration in `backend/.env`: `JWT_EXPIRES_IN=7d`
3. Use new token in Authorization header

### "Invalid Token" Error

**Error:** `"message": "Invalid token"`

**Solutions:**
1. Verify token format in header: `Authorization: Bearer TOKEN`
2. Ensure token is complete (no missing characters)
3. Check token wasn't modified
4. Re-login to get new token

### Admin Account Not Working

**Error:** `"message": "Invalid email or password"`

**Solutions:**

1. **Reset admin account:**
   ```bash
   cd backend
   node
   
   // In Node REPL:
   const Admin = require('./models/Admin');
   const bcrypt = require('bcryptjs');
   
   Admin.deleteMany({}).then(() => {
     console.log('All admins deleted');
     process.exit();
   });
   ```

2. **Register new admin account:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@smarthub.com",
       "password": "demo123456",
       "name": "Admin User"
     }'
   ```

---

## CORS Errors

### Error: CORS Policy Blocked

```
Access to XMLHttpRequest from origin 'http://localhost:3000' 
blocked by CORS policy
```

**Solutions:**

1. **Verify `FRONTEND_URL` in `backend/.env`:**
   ```bash
   FRONTEND_URL=http://localhost:3000
   ```

2. **Restart backend server:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Check CORS configuration in `backend/server.js`:**
   ```javascript
   const corsOptions = {
     origin: process.env.FRONTEND_URL,
     credentials: true
   };
   
   app.use(cors(corsOptions));
   ```

---

## File Upload Issues

### "Only image files are allowed"

**Error:** Upload rejected with message about file type

**Solutions:**
1. Verify file is actual image (JPEG, PNG, WebP, GIF)
2. Check file size < 10MB
3. Ensure using `-F` flag in curl: `-F "images=@/path/to/file.jpg"`

### Images Not Saving

**Error:** Upload succeeds but images aren't stored

**Solutions:**
1. Check `uploads/` directory exists:
   ```bash
   cd backend
   mkdir -p uploads
   chmod 755 uploads
   ```

2. Verify write permissions:
   ```bash
   touch uploads/test.txt
   rm uploads/test.txt
   ```

3. Check Multer configuration in `backend/middleware/upload.js`

---

## Frontend Issues

### Admin Dashboard Won't Load

**Error:** Blank page or redirect loop

**Solutions:**
1. **Check token in localStorage:**
   ```javascript
   // In browser console
   localStorage.getItem('adminToken')
   ```

2. **Clear cache and login again:**
   ```bash
   # In browser console
   localStorage.clear()
   sessionStorage.clear()
   ```

3. **Verify backend is running:**
   ```bash
   curl http://localhost:5000/api/projects
   ```

### API Calls Failing

**Error:** 404 or 500 errors from API

**Solutions:**
1. **Verify backend running:**
   ```bash
   ps aux | grep "node server.js"
   ```

2. **Check API URL in `frontend/.env`:**
   ```bash
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Restart frontend:**
   ```bash
   cd frontend
   npm start
   ```

### Images Not Loading

**Error:** 404 on image URLs

**Solutions:**
1. **Check uploads directory:**
   ```bash
   ls -la backend/uploads/
   ```

2. **Verify static files served in `backend/server.js`:**
   ```javascript
   app.use(express.static(path.join(__dirname, 'uploads')));
   ```

3. **Try full URL in browser:**
   ```
   http://localhost:5000/uploads/image-name.jpg
   ```

---

## Git Issues

### Uncommitted Changes Lost

**Error:** Files changed without commit

**Solutions:**
1. **Check status:**
   ```bash
   git status
   ```

2. **Stash changes if needed:**
   ```bash
   git stash
   ```

3. **Restore from stash:**
   ```bash
   git stash pop
   ```

### Push Rejected

**Error:** `Updates were rejected`

**Solutions:**
1. **Pull latest changes first:**
   ```bash
   git pull origin main
   ```

2. **Resolve conflicts if any, then push:**
   ```bash
   git push origin main
   ```

---

## Performance Issues

### Backend Slow to Respond

**Solutions:**
1. **Check MongoDB indexes:**
   ```bash
   # In MongoDB shell
   db.projects.getIndexes()
   ```

2. **Monitor logs:**
   ```bash
   # In backend, enable debug logging
   DEBUG=* npm run dev
   ```

3. **Check database size:**
   ```bash
   mongosh
   use smarthub
   db.stats()
   ```

### Frontend Slow Loading

**Solutions:**
1. **Clear node_modules and reinstall:**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check network tab in DevTools for slow requests**

3. **Build for production to test:**
   ```bash
   npm run build
   npm install -g serve
   serve -s build
   ```

---

## Environment Variable Issues

### Variables Not Loading

**Error:** `undefined` values from `process.env`

**Solutions:**
1. **Verify `.env` file exists:**
   ```bash
   ls -la backend/.env
   ls -la frontend/.env
   ```

2. **Check format (no spaces):**
   ```bash
   # Correct:
   MONGODB_URI=mongodb://localhost:27017/smarthub
   
   # Wrong:
   MONGODB_URI = mongodb://localhost:27017/smarthub
   MONGODB_URI="mongodb://localhost:27017/smarthub"
   ```

3. **Restart server after changing `.env`:**
   ```bash
   # Kill current process
   Ctrl+C
   
   # Start again
   npm run dev
   ```

4. **For React, variables must start with `REACT_APP_`:**
   ```bash
   # Correct:
   REACT_APP_API_URL=http://localhost:5000/api
   
   # Wrong:
   API_URL=http://localhost:5000/api
   ```

---

## Dependencies Issues

### Package Not Found

**Error:** `Cannot find module 'package-name'`

**Solutions:**
1. **Reinstall dependencies:**
   ```bash
   cd backend
   npm install
   
   cd ../frontend
   npm install
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

3. **Check `package.json` has the package:**
   ```bash
   cat package.json | grep "package-name"
   ```

### Version Conflicts

**Error:** Dependency conflicts warning

**Solutions:**
1. **Install with legacy peer deps:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Update packages:**
   ```bash
   npm update
   ```

---

## Deployment Issues

### Vercel Deployment Failing

**Error:** Build fails on Vercel

**Solutions:**
1. **Check `vercel.json` configuration:**
   ```bash
   cat frontend/vercel.json
   ```

2. **Ensure build script works locally:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Check environment variables in Vercel dashboard:**
   - Add all variables from `frontend/.env`

### Heroku Deployment Failing

**Error:** Build fails on Heroku

**Solutions:**
1. **Check `Procfile` exists:**
   ```bash
   cat backend/Procfile
   # Should contain: web: node server.js
   ```

2. **Test locally first:**
   ```bash
   npm run dev
   ```

3. **Add environment variables:**
   ```bash
   heroku config:set MONGODB_URI=your_uri
   heroku config:set JWT_SECRET=your_secret
   ```

---

## Getting Help

### Debug Mode

```bash
# Enable detailed logging
DEBUG=* npm run dev

# For specific module
DEBUG=express:* npm run dev
```

### Check Logs

**Backend logs:**
```bash
# In development, logs print to console
# In production, check:
pm2 logs app-name
```

**Frontend logs:**
- Open browser DevTools
- Check Console tab for errors

### Common Log Messages

| Message | Meaning | Fix |
|---------|---------|-----|
| `ECONNREFUSED` | Can't connect to service | Start MongoDB/backend |
| `EADDRINUSE` | Port already in use | Kill process using port |
| `ENOENT` | File not found | Check file path |
| `401 Unauthorized` | Invalid token | Re-login |
| `403 Forbidden` | Not enough permissions | Check user role |
| `CORS error` | Frontend can't call API | Fix CORS config |

---

## Quick Reset

To start fresh (careful - this deletes data):

```bash
# Delete database
cd backend && node
> const Admin = require('./models/Admin'); const Project = require('./models/Project'); 
> Admin.deleteMany({}); Project.deleteMany({}); process.exit();

# Clear uploads
rm -rf backend/uploads/*

# Clear node_modules
rm -rf frontend/node_modules backend/node_modules

# Reinstall
cd backend && npm install && cd ../frontend && npm install

# Start fresh
cd ../..
./start-dev.sh  # or start-dev.bat on Windows
```

---

## Still Having Issues?

1. Check backend logs: `npm run dev` shows real-time errors
2. Check frontend console: DevTools > Console tab
3. Check MongoDB: `mongosh` to verify data
4. Try network tab: DevTools > Network to see API calls
5. Enable debug logging: `DEBUG=* npm run dev`

Good luck! 🚀
