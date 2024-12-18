FROM node:16-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY ./angular-app/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY ./angular-app/ ./

# Install Angular CLI and build
RUN npm install -g @angular/cli@16.2.0 && \
    npm install node-sass && \
    npm run build -- --configuration=production

# Stage 2: Serve with nginx
FROM nginx:alpine

# Install curl for health check
RUN apk add --no-cache curl

# Copy built files
COPY --from=builder /app/dist/plant-recognition-ui /usr/share/nginx/html

# Copy nginx configuration
COPY ./angular-app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy Eureka registration script
COPY ./register-eureka.sh /docker-entrypoint.d/30-register-eureka.sh
RUN chmod +x /docker-entrypoint.d/30-register-eureka.sh

EXPOSE 80

# Add environment variables for Eureka
ENV EUREKA_SERVER_URL=http://discovery-service:8761/eureka
ENV APP_NAME=web-ui
ENV APP_PORT=80

CMD ["nginx", "-g", "daemon off;"]