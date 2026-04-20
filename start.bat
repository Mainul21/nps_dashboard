@echo off
REM Quick Start Script - Email-Based NPS Dashboard (Windows)

echo.
echo 🚀 Email-Based NPS Dashboard - Quick Start
echo ==========================================
echo.

echo Starting server on http://localhost:3000...
start cmd /k "node server.js"

timeout /t 2 /nobreak

echo.
echo ✅ Server started
echo.

echo 📚 Available URLs:
echo   - Dashboard (standard): http://localhost:3000
echo   - Email Generator: http://localhost:3000/email-generator.html
echo.

echo 🧪 Quick Test URLs:
echo   - John Doe: http://localhost:3000/?email=john.doe@company.com
echo   - Jane Smith: http://localhost:3000/?email=jane.smith@company.com
echo   - Bob Wilson: http://localhost:3000/?email=bob.wilson@company.com
echo.

echo 📊 Add Test Data:
echo   curl -X POST http://localhost:3000/api/nps ^
echo     -H "Content-Type: application/json" ^
echo     -d "{\"data\":{\"Account Name\":\"Global Tech\",\"Score\":\"9\",\"Response\":\"Great!\",\"Year\":\"2025\",\"Month\":\"Jan\",\"Status\":\"Active\"}}"
echo.

echo 🔍 Test API:
echo   curl "http://localhost:3000/api/businessunit?email=john.doe@company.com"
echo.

echo 📖 Documentation:
echo   - EMAIL_BUSINESS_UNIT_GUIDE.md - Full documentation
echo   - TESTING_GUIDE.md - Testing procedures
echo   - IMPLEMENTATION_SUMMARY.md - What was implemented
echo.

echo Open http://localhost:3000 in your browser
pause
