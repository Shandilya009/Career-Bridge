#!/bin/bash

# Terraform Initialization Script for CareerBridge

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Terraform Initialization${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Error: Terraform is not installed${NC}"
    echo "Please install Terraform from: https://www.terraform.io/downloads"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Please install AWS CLI from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS credentials not configured${NC}"
    echo "Please run: aws configure"
    exit 1
fi
echo -e "${GREEN}AWS credentials verified${NC}"
echo ""

# Navigate to terraform directory
cd terraform

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo -e "${YELLOW}terraform.tfvars not found. Creating from example...${NC}"
    cp terraform.tfvars.example terraform.tfvars
    echo -e "${RED}IMPORTANT: Please edit terraform.tfvars and fill in your values${NC}"
    echo -e "${RED}Especially: db_master_password and jwt_secret${NC}"
    echo ""
    read -p "Press Enter after you've edited terraform.tfvars..."
fi

# Initialize Terraform
echo -e "${YELLOW}Initializing Terraform...${NC}"
terraform init
echo -e "${GREEN}Terraform initialized successfully${NC}"
echo ""

# Validate Terraform configuration
echo -e "${YELLOW}Validating Terraform configuration...${NC}"
terraform validate
echo -e "${GREEN}Terraform configuration is valid${NC}"
echo ""

# Format Terraform files
echo -e "${YELLOW}Formatting Terraform files...${NC}"
terraform fmt -recursive
echo -e "${GREEN}Terraform files formatted${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Initialization Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review your terraform.tfvars file"
echo "2. Run: terraform plan"
echo "3. Run: terraform apply"
