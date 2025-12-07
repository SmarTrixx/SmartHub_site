#!/bin/bash

# SmartHub Development Server Startup Script

echo "🚀 Starting SmartHub Development Environment..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if both directories exist
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${YELLOW}Error: This script must be run from the project root directory${NC}"
    exit 1
fi

# Check if node_modules exist
echo -e "${BLUE}Checking dependencies...${NC}"
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    cd ..
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend .env file...${NC}"
    cp backend/.env.example backend/.env
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}Creating frontend .env file...${NC}"
    cp frontend/.env.example frontend/.env
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}To start the development servers, run in separate terminals:${NC}"
echo ""
echo -e "${GREEN}Terminal 1 - Backend:${NC}"
echo "  cd backend && npm run dev"
echo ""
echo -e "${GREEN}Terminal 2 - Frontend:${NC}"
echo "  cd frontend && npm start"
echo ""
echo -e "${YELLOW}Or use these combined commands:${NC}"
echo ""
echo "  # Start backend"
echo "  cd backend && npm run dev &"
echo ""
echo "  # Start frontend (in new terminal)"
echo "  cd frontend && npm start"
echo ""
echo -e "${BLUE}Access points:${NC}"
echo "  🌐 Website: http://localhost:3000"
echo "  🔐 Admin Panel: http://localhost:3000/admin/login"
echo "  🔌 API: http://localhost:5000/api"
echo ""
echo -e "${YELLOW}Default Credentials:${NC}"
echo "  Email: admin@smarthub.com"
echo "  Password: demo123456"
echo ""
