# SmartHub Quick Start Card

## 🚀 Start the System

```bash
# Option 1: Automatic (recommended)
./start-dev.sh                    # macOS/Linux
start-dev.bat                     # Windows

# Option 2: Manual
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm start
```

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Public website |
| Admin Login | http://localhost:3000/admin/login | Admin panel |
| API Docs | http://localhost:5000/api | API reference |
| Database | localhost:27017 | MongoDB |

## 🔐 Login Credentials

```
Email: admin@smarthub.com
Password: demo123456
```

## 📋 What to Test

### 1. Admin Dashboard
- [ ] Login at http://localhost:3000/admin/login
- [ ] View dashboard home
- [ ] Create test project
- [ ] Upload image
- [ ] Edit profile
- [ ] Manage services

### 2. Public Pages
- [ ] Visit http://localhost:3000 (Home)
- [ ] Check services load from API
- [ ] Check portfolio carousel works
- [ ] Check stats are dynamic
- [ ] Go to /portfolio page
- [ ] Go to /services page

### 3. API Testing
```bash
# Get all projects
curl http://localhost:5000/api/projects | jq .

# Get profile
curl http://localhost:5000/api/profile | jq .

# Get services
curl http://localhost:5000/api/services | jq .
```

## 📁 Important Files

| File | Purpose | Status |
|------|---------|--------|
| API_TESTING.md | API reference with examples | ✅ Complete |
| TROUBLESHOOTING.md | Debug guide | ✅ Complete |
| SETUP_GUIDE.md | Setup instructions | ✅ Complete |
| IMPLEMENTATION_COMPLETE.md | Full overview | ✅ Complete |
| PROJECT_STATUS.md | Status dashboard | ✅ Complete |
| SESSION_SUMMARY.md | Today's work summary | ✅ Complete |

## 🛠️ Common Tasks

### Create New Admin Account
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com",
    "password": "newpass123",
    "name": "New Admin"
  }'
```

### Check MongoDB
```bash
mongosh
use smarthub
db.projects.find()
db.admins.find()
db.services.find()
```

### View Logs
```bash
# Backend logs appear in terminal 1
# Frontend logs appear in terminal 2
# Check browser console (F12) for frontend errors
```

### Reset Everything
```bash
# Stop servers (Ctrl+C)
# Delete data
cd backend
node -e "require('./models/Project').deleteMany({}).then(() => process.exit())"

# Clear uploads
rm -rf uploads/*

# Restart servers
npm run dev
```

## 🎯 Next Steps

1. **Test admin login** (5 min)
2. **Create sample project** (10 min)
3. **Complete page integrations** (1-2 hours)
4. **Add loading spinners** (30 min)
5. **Deploy to production** (2-3 hours)

## ⚠️ If Something Goes Wrong

### Port Already in Use
```bash
# Check what's using port 5000
lsof -i :5000

# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### MongoDB Won't Connect
```bash
# Check if running
sudo systemctl status mongodb

# Start it
sudo systemctl start mongodb
```

### CORS Errors
```bash
# Verify .env files are correct
cat frontend/.env
cat backend/.env

# Restart backend
npm run dev
```

### Admin Login Not Working
```bash
# Check admin exists in database
mongosh
use smarthub
db.admins.find()

# If empty, register new admin via curl command above
```

## 📞 Get Help

1. Check **TROUBLESHOOTING.md** for common issues
2. Check **API_TESTING.md** for endpoint details
3. Check browser console (F12) for frontend errors
4. Check backend terminal for server logs
5. Review git history: `git log --oneline`

## 🎉 Current Status

✅ MongoDB running on 27017  
✅ Backend running on 5000  
✅ Frontend running on 3000  
✅ All API endpoints working  
✅ Home page API integrated  
✅ Admin dashboard ready  
✅ 6 documentation files created  
✅ All changes pushed to GitHub  

**Ready to test!** 🚀

---

**Last Updated**: December 7, 2025  
**Keep this handy for quick reference**

