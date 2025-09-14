#!/bin/bash

# AI Infrastructure Platform Startup Script

echo "🚀 Starting AI Infrastructure Orchestration Platform..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Start backend
echo "🔧 Starting backend server..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend development server..."
cd ../frontend
npm install
npm start &
FRONTEND_PID=$!

echo "✅ Platform started successfully!"
echo "📊 Backend API: http://localhost:8000"
echo "🎨 Frontend UI: http://localhost:3000"
echo "📚 API Docs: http://localhost:8000/api/docs"

# Function to cleanup processes on exit
cleanup() {
    echo "🛑 Shutting down platform..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for processes
wait
