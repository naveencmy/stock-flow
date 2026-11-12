@echo off
echo =========================================================
echo   OpenWA Gateway Launcher (rmyndharis/OpenWA)
echo   Dashboard: http://localhost:2886
echo   REST API:  http://localhost:2785
echo =========================================================
echo.

if not exist "OpenWA" (
    echo [1/3] Cloning rmyndharis/OpenWA repository...
    git clone https://github.com/rmyndharis/OpenWA.git
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Git clone failed. Please verify your internet connection.
        pause
        exit /b %ERRORLEVEL%
    )
)

cd OpenWA

if not exist "node_modules" (
    echo.
    echo [2/3] Installing OpenWA dependencies (including dashboard)...
    call npm install
)

echo.
echo [3/3] Starting OpenWA API + Dashboard with hot reload...
echo.
echo =========================================================
echo   DASHBOARD READY AT: http://localhost:2886
echo.
echo   1. Open http://localhost:2886 in your browser
echo   2. Scan the WhatsApp QR code with your phone
echo   3. Any bill created in the POS will now automatically
echo      be sent to the customer's phone!
echo =========================================================
echo.
call npm run dev
pause
