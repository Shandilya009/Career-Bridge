.PHONY: help build up down restart logs clean seed dev prod status rebuild deploy

# Default target
help:
	@echo "╔════════════════════════════════════════════════════════╗"
	@echo "║        CareerBridge Docker Management Commands        ║"
	@echo "╚════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Available commands:"
	@echo "  make dev            - Start development environment"
	@echo "  make prod           - Start production environment"
	@echo "  make build          - Build all containers"
	@echo "  make up             - Start all containers"
	@echo "  make down           - Stop all containers"
	@echo "  make restart        - Restart all containers"
	@echo "  make logs           - View logs from all containers"
	@echo "  make logs-backend   - View backend logs"
	@echo "  make logs-frontend  - View frontend logs"
	@echo "  make logs-db        - View database logs"
	@echo "  make seed           - Seed the database with dummy data"
	@echo "  make clean          - Remove all containers and volumes"
	@echo "  make ps             - Show running containers"
	@echo "  make status         - Show detailed container status"
	@echo "  make health         - Check container health"
	@echo "  make shell-backend  - Open shell in backend container"
	@echo "  make shell-frontend - Open shell in frontend container"
	@echo "  make shell-db       - Open MongoDB shell"
	@echo "  make rebuild        - Rebuild all containers from scratch"
	@echo "  make deploy         - Full deployment (build, start, seed)"
	@echo ""

# Development environment
dev:
	docker-compose up -d --build
	@echo "Development environment started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:5001"
	@echo "MongoDB: localhost:27017"

# Production environment
prod:
	docker-compose -f docker-compose.prod.yml up -d --build
	@echo "Production environment started!"

# Build containers
build:
	docker-compose build

# Start containers
up:
	docker-compose up -d

# Stop containers
down:
	docker-compose down

# Restart containers
restart:
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f mongodb

# Seed database
seed:
	@echo "Seeding database..."
	curl -X POST http://localhost:5001/api/seed-database
	@echo "\nDatabase seeded successfully!"

# Clean up
clean:
	docker-compose down -v
	docker system prune -f

# Show running containers
ps:
	docker-compose ps

# Show detailed status
status:
	@echo "📊 Container Status:"
	@docker-compose ps
	@echo ""
	@echo "💾 Volume Usage:"
	@docker volume ls | grep careerbridge

# Shell access
shell-backend:
	docker exec -it careerbridge-backend /bin/bash

shell-frontend:
	docker exec -it careerbridge-frontend /bin/sh

shell-db:
	docker exec -it careerbridge-mongo mongosh

# Health check
health:
	@echo "🏥 Checking container health..."
	@docker ps --filter "name=careerbridge" --format "table {{.Names}}\t{{.Status}}"
	@echo ""
	@echo "Backend API Health:"
	@curl -s http://localhost:5001/health || echo "❌ Backend not responding"
	@echo ""
	@echo "Frontend Health:"
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000 || echo "❌ Frontend not responding"

# Rebuild from scratch
rebuild:
	@echo "🔨 Rebuilding all containers from scratch..."
	docker-compose down -v
	docker-compose build --no-cache
	docker-compose up -d
	@echo "✅ Rebuild complete!"

# Full deployment
deploy: build up
	@echo "⏳ Waiting for services to be ready..."
	@sleep 30
	@make seed
	@echo ""
	@echo "🎉 Deployment complete!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:5001"
	@echo "Swagger: http://localhost:5001/swagger"
