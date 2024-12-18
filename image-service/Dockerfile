FROM openjdk:11-jre-slim

# Install MongoDB client tools and other dependencies
RUN apt-get update && \
    apt-get install -y wget gnupg curl && \
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add - && \
    echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/6.0 main" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list && \
    apt-get update && \
    apt-get install -y mongodb-org-tools mongodb-org-shell && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8081

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8081/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"] 