#!/bin/bash

# CareerBridge Docker Startup Script
# This script helps you start the complete application stack with Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        CareerBridge Docker Deployment Script          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created. Please review and update it with your settings.${NC}"
    else
        echo -e "${RED}❌ .env.example not found. Please create a .env file manually.${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}📋 Starting CareerBridge with Docker Compose...${NC}"
echo ""

# Stop any existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true

# Build and start containers
echo -e "${GREEN}🔨 Building and starting containers...${NC}"
docker-compose up --build -d || docker compose up --build -d

echo ""
echo -e "${GREEN}✅ Containers started successfully!${NC}"
echo ""

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
sleep 5

# Check container status
echo ""
echo -e "${BLUE}📊 Container Status:${NC}"
docker-compose ps || docker compose ps

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              🎉 Deployment Complete! 🎉                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📍 Access your application:${NC}"
echo -e "   ${GREEN}Frontend:${NC}  http://localhost:3000"
echo -e "   ${GREEN}Backend:${NC}   http://localhost:5001"
echo -e "   ${GREEN}Swagger:${NC}   http://localhost:5001/swagger"
echo -e "   ${GREEN}MongoDB:${NC}   mongodb://localhost:27017"
echo ""
echo -e "${BLUE}📝 Useful commands:${NC}"
echo -e "   ${YELLOW}View logs:${NC}         docker-compose logs -f"
echo -e "   ${YELLOW}Stop services:${NC}     docker-compose down"
echo -e "   ${YELLOW}Restart services:${NC}  docker-compose restart"
echo -e "   ${YELLOW}View status:${NC}       docker-compose ps"
echo ""
echo -e "${BLUE}🔧 Seed the database (optional):${NC}"
echo -e "   ${YELLOW}curl -X POST http://localhost:5001/api/seed-database${NC}"
echo ""
