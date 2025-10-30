#!/bin/bash

# Start Python service in background
/opt/venv/bin/python rvc_service_hf.py &
PYTHON_PID=$!

# Wait for Python service to be ready
echo "Waiting for Python service..."
for i in {1..30}; do
  if curl -s http://localhost:5000/health > /dev/null; then
    echo "Python service is ready!"
    break
  fi
  sleep 2
done

# Start Node.js service
echo "Starting Node.js service..."
node server.js
