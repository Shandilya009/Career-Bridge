#!/bin/bash

EC2_IP="13.60.206.140"
KEY_FILE="/Users/shubham_shandilya/Documents/placementportal /careerbridge-key.pem"

echo "🚀 Deploying CareerBridge to AWS EC2..."
echo "Instance IP: $EC2_IP"
echo ""

# Wait for instance to be fully ready
echo "⏳ Waiting for instance to be ready..."
sleep 30

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf careerbridge-deploy.tar.gz \
  docker-compose.yml \
  Dockerfile \
  .env \
  CareerBridge.API \
  CareerBridge.Application \
  CareerBridge.Domain \
  CareerBridge.Infrastructure \
  CareerBridge.sln \
  frontend

# Upload to EC2
echo "📤 Uploading to EC2..."
scp -i "$KEY_FILE" -o StrictHostKeyChecking=no careerbridge-deploy.tar.gz ec2-user@$EC2_IP:/home/ec2-user/

# Deploy on EC2
echo "🔧 Deploying on EC2..."
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ec2-user@$EC2_IP << 'ENDSSH'
cd /home/ec2-user
tar -xzf careerbridge-deploy.tar.gz
sudo docker-compose down || true
sudo docker-compose up --build -d
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://13.60.206.140:3000"
echo "   Backend:  http://13.60.206.140:5001"
echo "   Swagger:  http://13.60.206.140:5001/swagger"
ENDSSH

# Cleanup
rm careerbridge-deploy.tar.gz

echo ""
echo "🎉 Deployment successful!"
echo ""
echo "Access your application at:"
echo "  Frontend: http://$EC2_IP:3000"
echo "  Backend:  http://$EC2_IP:5001"
echo "  Swagger:  http://$EC2_IP:5001/swagger"
