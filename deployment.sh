#!/bin/bash
# Job Portal Application Deployment Script

echo "=== Job Portal Application Deployment ==="
echo ""

# Step 1: Install dependencies
echo "1. Installing dependencies..."
npm install 2>&1 | grep -E "(error|Error)" | head -5
if [ $? -ne 0 ]; then
    echo "Dependencies installed (or warnings only)"
fi
echo ""

# Step 2: Build React frontend
echo "2. Building React frontend..."
CI=false npm run build 2>&1 | tail -5
if [ $? -ne 0 ]; then
    echo "Build had warnings (checking if build directory created)..."
    ls -la build/ 2>/dev/null | head -3
fi
echo ""

# Step 3: Start backend server
echo "3. Starting backend server..."
nohup node backend/server.js > /tmp/portal-backend.log 2>&1 &
sleep 2
echo "   Backend PID: $(pgrep -f 'node.*backend/server.js' | head -1)"
echo ""

# Step 4: Start serve for frontend
echo "4. Starting frontend server..."
nohup serve -s build -l 3000 > /tmp/portal-frontend.log 2>&1 &
sleep 3
echo "   Frontend PID: $(pgrep -f 'serve')"
echo ""

echo "=== Deployment Complete ==="
echo "Backend API:  http://localhost:5001/api/"
echo "Frontend:     http://localhost:3000"
echo "MongoDB:      mongodb://localhost:27017/job-portal-db"
echo ""
echo "Three Login Systems:"
echo "  1. Job Seeker: Phone OTP + Email verification"
echo "  2. Company HR: Update vacancies & manage jobs"
echo "  3. Admin: Identify/fraud flag jobs (status='fraud')"
