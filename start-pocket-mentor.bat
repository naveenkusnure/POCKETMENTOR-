@echo off
echo ========================================================
echo   Starting POCKET MENTOR - Smart Study Assistant
echo ========================================================

:: 1. Set JDK 21 Environment (bundled with IntelliJ)
set "JAVA_HOME=C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2025.1.3\jbr"
set "PATH=%JAVA_HOME%\bin;C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2025.1.3\plugins\maven\lib\maven3\bin;%PATH%"

:: 2. Start Backend in separate window
echo Starting Spring Boot Backend (Port 8080)...
start "Pocket Mentor Backend" cmd /k "cd /d "%~dp0backend" && mvn spring-boot:run"

:: 3. Start Frontend in separate window
echo Starting React Vite Frontend (Port 5173)...
start "Pocket Mentor Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: 4. Open in Browser
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo ========================================================
echo   Pocket Mentor is running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8080
echo ========================================================
