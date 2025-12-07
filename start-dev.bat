@echo off
REM SmartHub Development Server Startup Script for Windows

echo.
echo Starting SmartHub Development Environment...
echo.

REM Check if both directories exist
if not exist "backend" (
    echo Error: Backend directory not found. Run this script from project root.
    exit /b 1
)
if not exist "frontend" (
    echo Error: Frontend directory not found. Run this script from project root.
    exit /b 1
)

REM Check and install backend dependencies
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Check and install frontend dependencies
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

REM Create .env files if they don't exist
if not exist "backend\.env" (
    echo Creating backend .env file...
    copy backend\.env.example backend\.env
)

if not exist "frontend\.env" (
    echo Creating frontend .env file...
    copy frontend\.env.example frontend\.env
)

echo.
echo ======================================
echo Setup complete!
echo ======================================
echo.
echo To start the development servers, run in separate terminals:
echo.
echo Terminal 1 - Backend:
echo   cd backend ^&^& npm run dev
echo.
echo Terminal 2 - Frontend:
echo   cd frontend ^&^& npm start
echo.
echo Access points:
echo   Website: http://localhost:3000
echo   Admin Panel: http://localhost:3000/admin/login
echo   API: http://localhost:5000/api
echo.
echo Default Credentials:
echo   Email: admin@smarthub.com
echo   Password: demo123456
echo.
pause
