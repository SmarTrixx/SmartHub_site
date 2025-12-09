# SmartHub Backend API

A comprehensive backend API for the SmartHub portfolio website with dynamic content management.

## Features

- 🔐 **Admin Authentication** - JWT-based secure login
- 📁 **Project Management** - Create, read, update, delete portfolio projects
- 👤 **Profile Management** - Manage profile information and social links
- 🛠️ **Service Management** - Manage service offerings
- 🖼️ **Image Upload** - Support for multiple image uploads with Multer
- 📱 **REST API** - Clean and intuitive API endpoints
- ✅ **Input Validation** - Comprehensive validation for all inputs
- 🗄️ **MongoDB** - Flexible document-based database

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### 1. Clone and setup backend

```bash
cd backend
npm install
```

### 2. Create .env file

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

### 3. Configure MongoDB

Update `MONGODB_URI` in `.env`:
- **Local**: `mongodb://localhost:27017/smarthub`
- **Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/smarthub`

### 4. Initialize admin account

The first admin account should be created via the `/api/auth/register` endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smarthub.com",
    "password": "securepassword123",
    "name": "Admin User"
  }'
```

## Running the Server

### Development (with auto-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

Server will run at: `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new admin (first-time only)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token validity
- `POST /api/auth/logout` - Logout

### Projects

- `GET /api/projects` - Get all published projects
  - Query params: `tag`, `search`, `page`, `limit`
- `GET /api/projects/:projectId` - Get single project
- `POST /api/projects` - Create project (admin only)
- `PUT /api/projects/:projectId` - Update project (admin only)
- `DELETE /api/projects/:projectId` - Delete project (admin only)

### Profile

- `GET /api/profile` - Get profile information
- `PUT /api/profile` - Update profile (admin only)

### Services

- `GET /api/services` - Get all active services
- `GET /api/services/:serviceId` - Get single service
- `POST /api/services` - Create service (admin only)
- `PUT /api/services/:serviceId` - Update service (admin only)
- `DELETE /api/services/:serviceId` - Delete service (admin only)

## Request/Response Examples

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@smarthub.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@smarthub.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### Create Project

```bash
POST /api/projects
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "id": "tech-startup",
  "title": "Brand Identity for Tech Startup",
  "desc": "Complete branding and web design...",
  "fullDescription": "...",
  "challenge": "...",
  "solution": "...",
  "client": "TechFlow Solutions",
  "year": 2024,
  "tags": "Branding,Web Design,Logo",
  "tools": "Figma,React,Tailwind CSS",
  "images": [file1, file2, ...]
}
```

### Update Profile

```bash
PUT /api/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Your Name",
  "title": "Full Stack Developer",
  "bio": "...",
  "email": "your@email.com",
  "socialLinks": {
    "twitter": "https://twitter.com/...",
    "github": "https://github.com/...",
    "linkedin": "https://linkedin.com/...",
    "instagram": "https://instagram.com/...",
    "facebook": "https://facebook.com/..."
  },
  "stats": {
    "projectsCompleted": 25,
    "yearsExperience": 5,
    "clientsSatisfied": 50
  },
  "avatar": [file]
}
```

## Deployment

### Heroku

```bash
heroku create your-app-name
heroku config:set MONGODB_URI=your_mongodb_url
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

### Vercel (as Serverless Functions)

See `vercel.json` configuration in the root directory.

### AWS/DigitalOcean

Follow standard Node.js deployment procedures with environment variables.

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smarthub
JWT_SECRET=your_jwt_secret_key_here_change_in_production
ADMIN_EMAIL=admin@smarthub.com
ADMIN_PASSWORD=your_admin_password_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
```

## Project Structure

```
backend/
├── models/           # Database schemas
│   ├── Project.js
│   ├── Profile.js
│   ├── Service.js
│   └── Admin.js
├── routes/          # API routes
│   ├── auth.js
│   ├── projects.js
│   ├── profile.js
│   └── services.js
├── middleware/      # Custom middleware
│   ├── auth.js
│   └── upload.js
├── uploads/         # User uploaded files
├── server.js        # Main server file
├── .env.example     # Environment template
├── package.json
└── README.md
```

## Security Considerations

1. **JWT Secret**: Use a strong, unique secret in production
2. **CORS**: Configure CORS to only allow your frontend domain
3. **Rate Limiting**: Consider adding rate limiting in production
4. **Input Validation**: All inputs are validated using express-validator
5. **File Uploads**: Images are validated for type and size
6. **Password Hashing**: Passwords are hashed using bcryptjs

## Troubleshooting

### MongoDB Connection Error
- Verify MongoDB is running
- Check connection string in `.env`
- Ensure database credentials are correct

### Port Already in Use
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Image Upload Issues
- Ensure `uploads` folder exists
- Check file size limits
- Verify MIME type support

## Support

For issues, questions, or contributions, please create an issue on GitHub.

## License

ISC
