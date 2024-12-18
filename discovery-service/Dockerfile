FROM openjdk:11-jre-slim
RUN apt-get update && \
    apt-get install -y wget && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"] 