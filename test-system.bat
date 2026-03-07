@echo off
echo =============================================
echo TEST SCRIPT FOR KUBIC-IQ TESTING SYSTEM
echo =============================================
echo.
echo This script will help test components individually
echo.

cd c:\Users\SoftwareDev\Desktop\github-repos\kubic-iq

:MENU
echo.
echo Choose a test option:
echo 1. Test server connection only
echo 2. Test database and questions API
echo 3. Test sample questions seeding
echo 4. Create test user
echo 5. Run frontend only
echo 6. Run complete test system
echo 7. Exit
echo.

set /p option="Enter option (1-7): "

if "%option%"=="1" goto SERVER_TEST
if "%option%"=="2" goto API_TEST
if "%option%"=="3" goto SEED_TEST
if "%option%"=="4" goto CREATE_USER
if "%option%"=="5" goto FRONTEND_TEST
if "%option%"=="6" goto COMPLETE_TEST
if "%option%"=="7" goto END

echo Invalid option. Please try again.
goto MENU

:SERVER_TEST
echo.
echo Starting server only...
cd server
echo Testing server connection...
start cmd /k "node --trace-warnings index.js"
echo Server should now be running on http://localhost:3001
echo Press any key to return to menu...
pause >nul
cd ..
goto MENU

:API_TEST
echo.
echo Testing questions API...
cd server
echo Starting server for API test...
start cmd /k "node --trace-warnings index.js"
echo Waiting for server to start...
timeout /t 5 /nobreak >nul
echo.
echo Testing questions API with curl...
start cmd /k "curl -X POST -H \"Content-Type: application/json\" -d {\"testType\":\"quiz\",\"topics\":[\"Algebra\"],\"count\":5} http://localhost:3001/api/questions/fetch"
echo.
echo Check the newly opened cmd window for API response
echo Press any key to return to menu...
pause >nul
cd ..
goto MENU

:SEED_TEST
echo.
echo Testing sample questions seeding...
cd server
echo Running seed script directly...
node scripts/resetAndSeedQuestions.js
echo Done. Press any key to return to menu...
pause >nul
cd ..
goto MENU

:CREATE_USER
echo.
echo Creating test user...
cd server
node scripts/createTestUser.js
echo Press any key to return to menu...
pause >nul
cd ..
goto MENU

:FRONTEND_TEST
echo.
echo Starting frontend only...
start cmd /k "npm start"
echo Frontend should now be running on http://localhost:3000
echo Press any key to return to menu...
pause >nul
goto MENU

:COMPLETE_TEST
echo.
echo Starting complete test system...
echo 1. Starting server...
cd server
start cmd /k "node --trace-warnings index.js"
echo 2. Waiting for server to start...
timeout /t 5 /nobreak >nul
cd ..
echo 3. Starting frontend...
start cmd /k "npm start"
echo.
echo IMPORTANT TESTING INSTRUCTIONS:
echo -----------------------------
echo 1. Log in with test@example.com / password123
echo 2. Navigate to /test/debug to access the direct test interface
echo    (Manually enter http://localhost:3000/test/debug in the browser)
echo 3. Try starting each type of test to see if they work
echo.
echo Press any key to return to menu...
pause >nul
goto MENU

:END
echo.
echo Thank you for testing!
echo.
