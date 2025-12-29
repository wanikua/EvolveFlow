#!/bin/bash
# Start all EvolveFlow services including Bridge

echo "=================================="
echo "  EvolveFlow + Bridge Startup"
echo "=================================="
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.9+"
    exit 1
fi

# Check if Node is available
if ! command -v npm &> /dev/null; then
    echo "❌ Node/npm not found. Please install Node.js 18+"
    exit 1
fi

echo "Starting services..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Start Backend (Port 8000)
echo "1️⃣  Starting EvolveFlow Backend (Port 8000)..."
cd backend
python3 main.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 2

# Check if backend started
if ps -p $BACKEND_PID > /dev/null; then
    echo "   ✅ Backend running (PID: $BACKEND_PID)"
else
    echo "   ❌ Backend failed to start. Check logs/backend.log"
    exit 1
fi

# Start Bridge (Port 8001)
echo "2️⃣  Starting Bridge Server (Port 8001)..."
cd bridge
python3 realtime_streamer.py > ../logs/bridge.log 2>&1 &
BRIDGE_PID=$!
cd ..
sleep 2

# Check if bridge started
if ps -p $BRIDGE_PID > /dev/null; then
    echo "   ✅ Bridge running (PID: $BRIDGE_PID)"
else
    echo "   ❌ Bridge failed to start. Check logs/bridge.log"
    kill $BACKEND_PID
    exit 1
fi

# Start Frontend (Port 3000)
echo "3️⃣  Starting Frontend (Port 3000)..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 3

# Check if frontend started
if ps -p $FRONTEND_PID > /dev/null; then
    echo "   ✅ Frontend running (PID: $FRONTEND_PID)"
else
    echo "   ❌ Frontend failed to start. Check logs/frontend.log"
    kill $BACKEND_PID $BRIDGE_PID
    exit 1
fi

echo ""
echo "=================================="
echo "  🚀 All Services Running!"
echo "=================================="
echo ""
echo "Access URLs:"
echo "  Frontend:      http://localhost:3000"
echo "  Backend API:   http://localhost:8000/docs"
echo "  Bridge API:    http://localhost:8001/health"
echo ""
echo "Logs:"
echo "  Backend:       logs/backend.log"
echo "  Bridge:        logs/bridge.log"
echo "  Frontend:      logs/frontend.log"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all processes
wait
