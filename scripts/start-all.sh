#!/bin/bash
echo "Starting Event Planner - All Services"
echo "======================================"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

echo ""
echo "=== Step 1: Starting Spring Boot Backend (port 8080) ==="
cd backend-springboot
mvn spring-boot:run &
SPRING_PID=$!
cd ..

sleep 15

echo ""
echo "=== Step 2: Starting Node.js Backend (port 3001) ==="
cd backend-nodejs
npm install && npm start &
NODE_PID=$!
cd ..

sleep 5

echo ""
echo "=== Step 3: Starting FastAPI Gateway (port 8000) ==="
cd backend-fastapi
pip install -r requirements.txt && python main.py &
FASTAPI_PID=$!
cd ..

sleep 5

echo ""
echo "=== Step 4: Starting Frontend (port 5173) ==="
cd frontend
npm install && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "======================================"
echo "All services started!"
echo "Frontend: http://localhost:5173"
echo "FastAPI Gateway: http://localhost:8000"
echo "Spring Boot: http://localhost:8080"
echo "Node.js API: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"
echo "======================================"

trap "kill $SPRING_PID $NODE_PID $FASTAPI_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
