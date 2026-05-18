#!/bin/bash

# CareerBridge AWS Deployment Script
# This script builds Docker images, pushes them to ECR, and deploys to ECS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-prod}"
PROJECT_NAME="careerbridge"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}CareerBridge AWS Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Error: Terraform is not installed${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Getting AWS Account ID${NC}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"
echo ""

# ECR Repository URLs
BACKEND_ECR_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}-${ENVIRONMENT}-backend"
FRONTEND_ECR_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}-${ENVIRONMENT}-frontend"

echo -e "${YELLOW}Step 2: Logging into ECR${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
echo -e "${GREEN}Successfully logged into ECR${NC}"
echo ""

echo -e "${YELLOW}Step 3: Building Backend Docker Image${NC}"
docker build -t ${PROJECT_NAME}-backend:latest -f backend/Dockerfile ./backend
docker tag ${PROJECT_NAME}-backend:latest ${BACKEND_ECR_REPO}:latest
docker tag ${PROJECT_NAME}-backend:latest ${BACKEND_ECR_REPO}:${TIMESTAMP}
echo -e "${GREEN}Backend image built successfully${NC}"
echo ""

echo -e "${YELLOW}Step 4: Building Frontend Docker Image${NC}"
cd frontend
docker build -t ${PROJECT_NAME}-frontend:latest -f Dockerfile .
docker tag ${PROJECT_NAME}-frontend:latest ${FRONTEND_ECR_REPO}:latest
docker tag ${PROJECT_NAME}-frontend:latest ${FRONTEND_ECR_REPO}:${TIMESTAMP}
cd ..
echo -e "${GREEN}Frontend image built successfully${NC}"
echo ""

echo -e "${YELLOW}Step 5: Pushing Backend Image to ECR${NC}"
docker push ${BACKEND_ECR_REPO}:latest
docker push ${BACKEND_ECR_REPO}:${TIMESTAMP}
echo -e "${GREEN}Backend image pushed successfully${NC}"
echo ""

echo -e "${YELLOW}Step 6: Pushing Frontend Image to ECR${NC}"
docker push ${FRONTEND_ECR_REPO}:latest
docker push ${FRONTEND_ECR_REPO}:${TIMESTAMP}
echo -e "${GREEN}Frontend image pushed successfully${NC}"
echo ""

echo -e "${YELLOW}Step 7: Updating ECS Services${NC}"
aws ecs update-service \
    --cluster ${PROJECT_NAME}-${ENVIRONMENT}-cluster \
    --service ${PROJECT_NAME}-${ENVIRONMENT}-backend-service \
    --force-new-deployment \
    --region ${AWS_REGION} > /dev/null

aws ecs update-service \
    --cluster ${PROJECT_NAME}-${ENVIRONMENT}-cluster \
    --service ${PROJECT_NAME}-${ENVIRONMENT}-frontend-service \
    --force-new-deployment \
    --region ${AWS_REGION} > /dev/null

echo -e "${GREEN}ECS services updated successfully${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}To check deployment status:${NC}"
echo "aws ecs describe-services --cluster ${PROJECT_NAME}-${ENVIRONMENT}-cluster --services ${PROJECT_NAME}-${ENVIRONMENT}-backend-service ${PROJECT_NAME}-${ENVIRONMENT}-frontend-service --region ${AWS_REGION}"
echo ""
echo -e "${YELLOW}To get the application URL:${NC}"
echo "cd terraform && terraform output application_url"
