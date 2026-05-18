#!/bin/bash
export PATH="/usr/local/share/dotnet:$PATH"
cd "/Users/shubham_shandilya/Documents/placementportal "
ASPNETCORE_ENVIRONMENT=Development dotnet run --project CareerBridge.API/CareerBridge.API.csproj --urls "http://localhost:5001" > /tmp/backend.log 2>&1 &
echo "Backend PID: $!"
echo $! > /tmp/backend.pid
