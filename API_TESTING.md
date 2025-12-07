# SmartHub API Testing Guide

Quick reference for testing the SmartHub API endpoints.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All admin endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. Authentication Endpoints

### Register Admin (First Time Only)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smarthub.com",
    "password": "demo123456",
    "name": "Admin User"
  }'
```

**Response:**
```json
{
  "message": "Admin registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@smarthub.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smarthub.com",
    "password": "demo123456"
  }'
```

**Save the token for subsequent requests:**
```bash
export TOKEN="your_jwt_token_here"
```

### Verify Token

```bash
curl -X GET http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

---

## 2. Projects Endpoints

### Get All Projects (Public)

```bash
curl http://localhost:5000/api/projects
```

**With Filters:**
```bash
# Filter by tag
curl "http://localhost:5000/api/projects?tag=Branding"

# Search by keyword
curl "http://localhost:5000/api/projects?search=tech"

# Pagination
curl "http://localhost:5000/api/projects?page=1&limit=5"

# Combined
curl "http://localhost:5000/api/projects?tag=Branding&search=tech&page=1&limit=10"
```

### Get Single Project (Public)

```bash
curl http://localhost:5000/api/projects/tech-startup
```

### Create Project (Admin)

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -F "id=my-project" \
  -F "title=My Project Title" \
  -F "desc=Short description of the project" \
  -F "fullDescription=Full detailed description here" \
  -F "challenge=The challenge we faced" \
  -F "solution=How we solved it" \
  -F "client=Client Name" \
  -F "year=2024" \
  -F "tags=Branding,Web Design,Logo" \
  -F "tools=Figma,React,Tailwind CSS" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

### Update Project (Admin)

```bash
curl -X PUT http://localhost:5000/api/projects/my-project \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Updated Title" \
  -F "desc=Updated description" \
  -F "images=@/path/to/new-image.jpg"
```

### Delete Project (Admin)

```bash
curl -X DELETE http://localhost:5000/api/projects/my-project \
  -H "Authorization: Bearer $TOKEN"
```

---

## 3. Profile Endpoints

### Get Profile (Public)

```bash
curl http://localhost:5000/api/profile
```

### Update Profile (Admin)

```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=John Doe" \
  -F "title=Full Stack Developer" \
  -F "bio=Passionate about creating digital solutions" \
  -F "email=john@example.com" \
  -F "phone=+1234567890" \
  -F "location=New York, USA" \
  -F "website=https://johnweb.com" \
  -F "mission=To create amazing digital experiences" \
  -F "stats={\"projectsCompleted\":25,\"yearsExperience\":5,\"clientsSatisfied\":50}" \
  -F "socialLinks={\"twitter\":\"https://twitter.com/john\",\"github\":\"https://github.com/john\",\"linkedin\":\"https://linkedin.com/in/john\"}" \
  -F "avatar=@/path/to/avatar.jpg"
```

---

## 4. Services Endpoints

### Get All Services (Public)

```bash
curl http://localhost:5000/api/services
```

### Get Single Service (Public)

```bash
curl http://localhost:5000/api/services/web-development
```

### Create Service (Admin)

```bash
curl -X POST http://localhost:5000/api/services \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "web-development",
    "title": "Web Development",
    "description": "Custom web development services for modern businesses",
    "icon": "FiCode",
    "features": "Responsive Design,Performance Optimization,SEO Friendly",
    "price": "Contact for pricing",
    "status": "active",
    "order": 0
  }'
```

### Update Service (Admin)

```bash
curl -X PUT http://localhost:5000/api/services/web-development \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Web Development Services",
    "description": "Updated description",
    "price": "$5000 - $25000"
  }'
```

### Delete Service (Admin)

```bash
curl -X DELETE http://localhost:5000/api/services/web-development \
  -H "Authorization: Bearer $TOKEN"
```

---

## Using Postman

### 1. Import Collection

- Open Postman
- Create new collection "SmartHub API"
- Add requests for each endpoint

### 2. Set Up Environment Variables

```json
{
  "baseUrl": "http://localhost:5000/api",
  "token": "YOUR_JWT_TOKEN_HERE"
}
```

### 3. Use in Requests

In Postman, use:
- Base URL: `{{baseUrl}}`
- Authorization: `Bearer {{token}}`

### 4. Example Request

**GET Projects:**
```
GET {{baseUrl}}/projects
Authorization: Bearer {{token}}
```

---

## Common Errors & Solutions

### 401 Unauthorized

**Error:** `"message": "Invalid token"`

**Solution:**
- Ensure token is correct and not expired
- Re-login to get new token
- Verify Authorization header format: `Bearer TOKEN`

### 400 Bad Request

**Error:** `"errors": [{"msg": "..."}]`

**Solution:**
- Check all required fields are provided
- Verify data types (year should be number, not string)
- Ensure image files are valid (JPEG, PNG, WebP)

### 404 Not Found

**Error:** `"message": "Project not found"`

**Solution:**
- Verify project ID exists
- Check spelling of project ID
- List all projects to find correct ID

### Image Upload Failed

**Error:** `"message": "Only image files are allowed"`

**Solution:**
- Use valid image formats: JPEG, PNG, WebP, GIF
- Check file size (max 10MB)
- Use `-F` flag with `@` for file uploads

---

## Testing Workflow

### 1. Register Admin Account

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test Admin"
  }'
```

Save the returned token.

### 2. Create Test Project

```bash
# Set token
export TOKEN="your_token_here"

# Create project
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -F "id=test-project" \
  -F "title=Test Project" \
  -F "desc=Test Description" \
  -F "fullDescription=Full test description" \
  -F "challenge=Test challenge" \
  -F "solution=Test solution" \
  -F "client=Test Client" \
  -F "year=2024" \
  -F "tags=Test,Project" \
  -F "images=@test-image.jpg"
```

### 3. Verify Project Created

```bash
curl http://localhost:5000/api/projects/test-project
```

### 4. Update Profile

```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Test Admin" \
  -F "email=test@example.com"
```

### 5. Create Service

```bash
curl -X POST http://localhost:5000/api/services \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-service",
    "title": "Test Service",
    "description": "A test service",
    "price": "Test Price"
  }'
```

---

## Troubleshooting

### Backend Not Running

```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process on port 5000
kill -9 <PID>

# Start backend
cd backend && npm run dev
```

### Database Connection Error

```bash
# Ensure MongoDB is running
mongod

# Check connection string in .env
cat backend/.env | grep MONGODB_URI
```

### CORS Errors

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Verify `FRONTEND_URL` in backend `.env`
- Ensure it matches your frontend URL
- Restart backend server

---

## API Response Format

All responses follow this format:

**Success:**
```json
{
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error:**
```json
{
  "message": "Error description",
  "status": 400
}
```

---

For more information, see `backend/README.md`
