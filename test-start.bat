@echo off
echo Starting Kubic IQ application with test-taking popup system...

REM Check if npm is installed
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH. Please install Node.js and npm.
    pause
    exit /b 1
)

REM Check and install dependencies for root project
echo Checking frontend dependencies...
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install --no-audit --no-fund
)

REM Check and install dependencies for server
echo Checking server dependencies...
if not exist server\node_modules (
    echo Installing server dependencies...
    cd /d %~dp0\server
    call npm install --no-audit --no-fund
    cd /d %~dp0
)

REM Kill any existing Node.js processes that might be running from previous starts
echo Stopping any existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

REM Check database status (SQLite)
echo Setting up SQLite database...

REM Automatically reset database for testing purposes
echo Deleting database files...
if exist server\db\database.sqlite (
    del /F server\db\database.sqlite
    echo Database deleted.
) else (
    echo No database file found, creating fresh database.
)

echo Installing server dependencies...
cd /d %~dp0\server
call npm install --no-audit --no-fund
echo Ensuring bcryptjs is properly installed...
call npm install bcryptjs --save
echo Running database initialization script...
node scripts/initializeDatabase.js
cd /d %~dp0
echo Database initialization complete.

REM Make sure we're in the project root directory
cd /d %~dp0

REM Start the server in debug mode for better troubleshooting
echo Starting backend server in debug mode...
set DEBUG=app:*
start cmd /k "cd %~dp0\server && node --trace-warnings index.js"

REM Wait for server to start
echo Waiting for server to start...
timeout /t 5 /nobreak >nul

REM Start the frontend app
echo Starting frontend...
start cmd /k "cd %~dp0 && npm start"

echo.
echo Kubic IQ development environment is now running.
echo - Backend: http://localhost:3001
echo - Frontend: http://localhost:3000
echo.
