# Smarthubz Studio - Portfolio & Service Management

A modern, full-stack portfolio and service management system built with React and Node.js.

## ⚡ Quick Start

```bash
# Start development servers
./start-dev.sh          # Linux/Mac
./start-dev.bat         # Windows
```

Frontend: http://localhost:3000  
Backend: http://localhost:5000

## 📚 Documentation

Complete documentation available in **[DOCUMENTATION.md](./DOCUMENTATION.md)** including:

- ✅ Project structure
- ✅ Environment setup
- ✅ API endpoints
- ✅ Email configuration
- ✅ Deployment guide
- ✅ Troubleshooting

## 🌐 Production URLs

- **Frontend**: https://smarthubz.vercel.app
- **Backend**: https://smarthubzbackend.vercel.app

## 📋 Features

### Public
- Landing page with portfolio showcase
- Services listing
- Contact form with email confirmation
- Project detail pages
- About, terms, and privacy pages

### Admin Dashboard
- Project management
- Service management
- Portfolio profile editor
- Service request management
- Email configuration monitoring
- Session management

## 🔧 Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion, React Router
- **Backend**: Node.js, Express, MongoDB
- **Email**: Nodemailer with Gmail SMTP
- **Deployment**: Vercel
- **Database**: MongoDB Atlas

## 📧 Email Features

- Dual email account support (primary + secondary)
- Automatic retry mechanism
- Real-time email status feedback
- Structured logging
- Admin monitoring dashboard

## 🚀 Deployment

Both frontend and backend are deployed on Vercel with automatic CI/CD from GitHub.

### Environment Variables Required
```
MONGODB_URI
GMAIL_USER
GMAIL_PASSWORD
GMAIL_USER_SECONDARY (optional)
GMAIL_PASSWORD_SECONDARY (optional)
ADMIN_EMAIL
ADMIN_PASSWORD_HASH
JWT_SECRET
```

## 🤝 Contributing

1. Create feature branch
2. Make changes and test locally
3. Commit with clear messages
4. Push and create pull request
5. Merge to main for auto-deployment

## 📞 Support

For issues or questions, contact: contact.smarthubz@gmail.com

---

**Status**: Production Ready ✅
