#!/bin/bash

echo "Building all modules..."

# Build parent project
mvn clean package -DskipTests

echo "Build completed. Starting Docker Compose..."
docker-compose up --build 