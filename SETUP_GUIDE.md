# SmartHub Dynamic Content Management System Setup Guide

## Overview

Your SmartHub website now has a complete backend API with dynamic content management. This guide will help you set up and use the system.

## What's New

✅ **Backend API** - Express.js server with MongoDB  
✅ **Admin Dashboard** - Secure admin panel to manage content  
✅ **Project Management** - Create, edit, delete portfolio projects  
✅ **Profile Management** - Update your profile and social links  
✅ **Service Management** - Manage service offerings  
✅ **Image Uploads** - Support for multiple image uploads  
✅ **Authentication** - JWT-based secure login  

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smarthub
JWT_SECRET=your_secure_secret_key_here
FRONTEND_URL=http://localhost:3000
```

Start backend:
```bash
npm run dev    # Development with auto-reload
npm start      # Production
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm start
```

### 3. Create Admin Account

First, create your admin account. You can do this via the register endpoint or through the login page (you'll be redirected to register if no admin exists).

Via API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "securepassword123",
    "name": "Your Name"
  }'
```

### 4. Access Admin Dashboard

- Navigate to: `http://localhost:3000/admin/login`
- Login with your credentials
- You'll be redirected to the dashboard

## Admin Dashboard Features

### 📁 Projects Management
- **Add Projects**: Click "Add Project" to create new portfolio items
- **Upload Images**: Drag and drop or click to upload multiple images
- **Edit Projects**: Click the edit icon to modify existing projects
- **Delete Projects**: Remove projects you no longer want to showcase

**Fields:**
- Project ID (unique identifier)
- Title
- Short Description
- Full Description
- Challenge faced
- Solution provided
- Client name
- Year completed
- Tags (for filtering)
- Tools & Technologies used
- Project images

### 👤 Profile Management
- **Update Information**: Edit your name, title, bio
- **Avatar**: Upload your profile picture
- **Social Links**: Add links to Twitter, GitHub, LinkedIn, Instagram, Facebook
- **Stats**: Update projects completed, years of experience, clients satisfied
- **Mission**: Add your mission statement

### 🛠️ Services Management
- **Add Services**: Create service offerings
- **Edit Services**: Modify existing services
- **Delete Services**: Remove services as needed

**Fields:**
- Service ID
- Title
- Description
- Icon (React Icon class name, e.g., FiCode, FiPalette)
- Features (comma-separated list)
- Price
- Status (Active/Inactive)
- Display Order

## API Endpoints Reference

### Authentication
```
POST   /api/auth/login      - Login admin
POST   /api/auth/register   - Register admin (first-time)
GET    /api/auth/verify     - Verify token
POST   /api/auth/logout     - Logout
```

### Projects
```
GET    /api/projects                - Get all projects
GET    /api/projects/:projectId     - Get single project
POST   /api/projects                - Create project (admin)
PUT    /api/projects/:projectId     - Update project (admin)
DELETE /api/projects/:projectId     - Delete project (admin)
```

### Profile
```
GET    /api/profile         - Get profile
PUT    /api/profile         - Update profile (admin)
```

### Services
```
GET    /api/services                - Get all services
GET    /api/services/:serviceId     - Get single service
POST   /api/services                - Create service (admin)
PUT    /api/services/:serviceId     - Update service (admin)
DELETE /api/services/:serviceId     - Delete service (admin)
```

## Database Models

### Project
```javascript
{
  id: String (unique),
  title: String,
  desc: String (short),
  fullDescription: String,
  challenge: String,
  solution: String,
  image: String (featured image URL),
  images: [String] (all image URLs),
  tags: [String],
  tools: [String],
  client: String,
  year: Number,
  link: String (optional),
  status: String (draft/published/archived),
  viewCount: Number,
  featured: Boolean,
  timestamps: {createdAt, updatedAt}
}
```

### Profile
```javascript
{
  name: String,
  title: String,
  bio: String,
  avatar: String (URL),
  email: String,
  phone: String,
  location: String,
  website: String,
  socialLinks: {
    twitter: String,
    github: String,
    linkedin: String,
    instagram: String,
    facebook: String
  },
  mission: String,
  stats: {
    projectsCompleted: Number,
    yearsExperience: Number,
    clientsSatisfied: Number
  },
  timestamps: {createdAt, updatedAt}
}
```

### Service
```javascript
{
  id: String (unique),
  title: String,
  description: String,
  icon: String,
  features: [String],
  price: String,
  status: String (active/inactive),
  order: Number,
  timestamps: {createdAt, updatedAt}
}
```

## Deployment

### Frontend (Vercel)
```bash
# Already configured in vercel.json
git push origin main
# Vercel auto-deploys
```

Update environment variable:
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

### Backend Options

#### Heroku
```bash
heroku create your-app-name
heroku config:set MONGODB_URI=your_mongodb_url
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

#### Railway / Render
1. Connect GitHub repo
2. Set environment variables
3. Deploy

#### DigitalOcean / AWS
1. Create a Linux server
2. Install Node.js and MongoDB
3. Clone repository
4. Set environment variables
5. Run with PM2: `pm2 start server.js --name smarthub-api`

## Common Tasks

### Update a Project
1. Go to Admin Dashboard → Projects
2. Find the project and click the edit icon
3. Modify the fields
4. Upload new images if needed
5. Click "Update Project"

### Add Social Media Links
1. Go to Admin Dashboard → Profile
2. Scroll to "Social Links" section
3. Paste your profile URLs
4. Click "Save Changes"

### Add New Service
1. Go to Admin Dashboard → Services
2. Click "Add Service"
3. Fill in the form
4. Click "Create Service"

## Troubleshooting

### Admin Login Not Working
- Verify backend is running: `http://localhost:5000/api/health`
- Check MongoDB connection
- Verify `.env` settings

### Images Not Uploading
- Ensure `uploads/` folder exists in backend
- Check file size (max 10MB)
- Verify MIME type (jpg, png, webp, gif)

### API Errors
- Check browser console for error messages
- Check backend logs
- Verify CORS is configured correctly

## Security Tips

1. **Change JWT Secret**: Update `JWT_SECRET` in `.env`
2. **Use Strong Password**: Create a strong admin password
3. **HTTPS**: Use HTTPS in production
4. **Backup Database**: Regular MongoDB backups
5. **Environment Variables**: Never commit `.env` file

## File Structure

```
project/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminDashboardHome.jsx
│   │   │   ├── AdminProjects.jsx
│   │   │   ├── AdminProfile.jsx
│   │   │   └── AdminServices.jsx
│   │   ├── components/
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── routes/
│   │       └── AppRoutes.jsx
│   └── .env.example
│
├── backend/
│   ├── models/
│   │   ├── Project.js
│   │   ├── Profile.js
│   │   ├── Service.js
│   │   └── Admin.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── profile.js
│   │   └── services.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── uploads/
│   ├── server.js
│   ├── .env.example
│   └── README.md
```

## Next Steps

1. Set up MongoDB (local or Atlas)
2. Install dependencies
3. Create admin account
4. Start adding your projects
5. Update your profile
6. Configure services
7. Deploy frontend and backend
8. Update homepage to fetch data from API

## Support

For issues or questions:
- Check the README files in `backend/` and `frontend/`
- Review the API endpoints documentation
- Check browser console and backend logs

## Additional Features to Implement

- [ ] Testimonials/Reviews management
- [ ] Blog/Articles section
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Project views tracking
- [ ] Admin activity logs
- [ ] Two-factor authentication
- [ ] Image optimization/CDN integration

---

**Happy managing your portfolio!** 🚀
