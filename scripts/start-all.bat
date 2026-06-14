@echo off
echo Starting Event Planner - All Services
echo ======================================
cd /d "%~dp0.."

echo.
echo Make sure PostgreSQL and MongoDB are running first.
echo.

echo === Step 1: Starting Spring Boot Backend (port 8080) ===
start "SpringBoot" cmd /c "cd backend-springboot && mvn spring-boot:run"
timeout /t 15 /nobreak >nul

echo === Step 2: Starting Node.js Backend (port 3001) ===
start "NodeJS" cmd /c "cd backend-nodejs && npm install && npm start"
timeout /t 5 /nobreak >nul

echo === Step 3: Starting FastAPI Gateway (port 8000) ===
start "FastAPI" cmd /c "cd backend-fastapi && pip install -r requirements.txt && python main.py"
timeout /t 5 /nobreak >nul

echo === Step 4: Starting Frontend (port 5173) ===
start "Frontend" cmd /c "cd frontend && npm install && npm run dev"

echo.
echo ======================================
echo All services started!
echo Frontend: http://localhost:5173
echo FastAPI Gateway: http://localhost:8000
echo Spring Boot: http://localhost:8080
echo Node.js API: http://localhost:3001
echo ======================================
echo.
echo Close the terminal windows to stop services.
pause
