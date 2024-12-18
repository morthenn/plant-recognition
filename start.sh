#!/bin/bash

# Build Java services
echo "Building Java services..."
cd plant-recognition
mvn clean package -DskipTests

# Build and start all services
echo "Starting all services..."
docker-compose up --build -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 30

# Check services health
echo "Checking services..."
curl -f http://localhost:8080/actuator/health || echo "Auth service not healthy"
curl -f http://localhost:8081/actuator/health || echo "Image service not healthy"
curl -f http://localhost:8082/health || echo "AI processor not healthy"
curl -f http://localhost || echo "Web UI not healthy"

echo "All services started. Access the application at http://localhost" 