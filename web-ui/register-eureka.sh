#!/bin/sh

# Function to register with Eureka
register_with_eureka() {
    local instance_id="localhost:${APP_NAME}:${APP_PORT}"
    
    # Registration JSON
    local data='{
        "instance": {
            "instanceId": "'$instance_id'",
            "hostName": "localhost",
            "app": "'${APP_NAME}'",
            "ipAddr": "127.0.0.1",
            "status": "UP",
            "port": {"$": '$APP_PORT', "@enabled": "true"},
            "securePort": {"$": 443, "@enabled": "false"},
            "healthCheckUrl": "http://localhost:'$APP_PORT'/health",
            "statusPageUrl": "http://localhost:'$APP_PORT'/info",
            "homePageUrl": "http://localhost:'$APP_PORT'",
            "dataCenterInfo": {
                "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                "name": "MyOwn"
            },
            "vipAddress": "'${APP_NAME}'",
            "secureVipAddress": "'${APP_NAME}'",
            "metadata": {
                "@class": "java.util.Collections$EmptyMap"
            }
        }
    }'

    # Wait for Eureka to be available
    until curl -s "${EUREKA_SERVER_URL}/apps" > /dev/null; do
        echo "Waiting for Eureka server..."
        sleep 5
    done

    # Register with Eureka
    curl -X POST \
        -H "Content-Type: application/json" \
        -d "$data" \
        "${EUREKA_SERVER_URL}/apps/${APP_NAME}"

    # Start heartbeat in background
    while true; do
        sleep 30
        curl -X PUT "${EUREKA_SERVER_URL}/apps/${APP_NAME}/${instance_id}"
    done &
}

# Start registration process in background
register_with_eureka & 