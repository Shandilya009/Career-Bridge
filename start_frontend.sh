#!/bin/bash
cd "/Users/shubham_shandilya/Documents/placementportal /frontend"
npm run dev > /tmp/frontend.log 2>&1 &
echo "Frontend PID: $!"
echo $! > /tmp/frontend.pid
