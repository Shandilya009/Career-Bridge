# Main Terraform Configuration for CareerBridge Deployment on AWS

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment to use S3 backend for state management
  # backend "s3" {
  #   bucket         = "careerbridge-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "CareerBridge"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  environment         = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  project_name       = var.project_name
}

# Security Groups Module
module "security" {
  source = "./modules/security"

  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
  project_name = var.project_name
}

# ECR Module
module "ecr" {
  source = "./modules/ecr"

  environment  = var.environment
  project_name = var.project_name
}

# Application Load Balancer Module
module "alb" {
  source = "./modules/alb"

  environment        = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  alb_security_group_id = module.security.alb_security_group_id
  project_name      = var.project_name
  certificate_arn   = var.certificate_arn
}

# DocumentDB (MongoDB-compatible) Module
module "documentdb" {
  source = "./modules/documentdb"

  environment           = var.environment
  vpc_id               = module.vpc.vpc_id
  private_subnet_ids   = module.vpc.private_subnet_ids
  db_security_group_id = module.security.documentdb_security_group_id
  project_name         = var.project_name
  master_username      = var.db_master_username
  master_password      = var.db_master_password
  instance_class       = var.db_instance_class
  instance_count       = var.db_instance_count
}

# ECS Cluster and Services Module
module "ecs" {
  source = "./modules/ecs"

  environment               = var.environment
  vpc_id                   = module.vpc.vpc_id
  private_subnet_ids       = module.vpc.private_subnet_ids
  ecs_security_group_id    = module.security.ecs_security_group_id
  project_name             = var.project_name
  
  # ECR Repository URLs
  backend_ecr_url          = module.ecr.backend_repository_url
  frontend_ecr_url         = module.ecr.frontend_repository_url
  
  # ALB Target Groups
  backend_target_group_arn = module.alb.backend_target_group_arn
  frontend_target_group_arn = module.alb.frontend_target_group_arn
  
  # DocumentDB Connection
  documentdb_endpoint      = module.documentdb.cluster_endpoint
  documentdb_port          = module.documentdb.cluster_port
  
  # Application Configuration
  jwt_secret               = var.jwt_secret
  backend_cpu              = var.backend_cpu
  backend_memory           = var.backend_memory
  backend_desired_count    = var.backend_desired_count
  frontend_cpu             = var.frontend_cpu
  frontend_memory          = var.frontend_memory
  frontend_desired_count   = var.frontend_desired_count
}
