import uvicorn
from fastapi import FastAPI, BackgroundTasks
from kafka_consumer import PlantImageConsumer
from models import PredictionResult
from eureka_client import EurekaClient
import logging
import asyncio
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Plant Recognition AI Service")
consumer = None
eureka_client = EurekaClient()

async def wait_for_kafka():
    global consumer
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            consumer = PlantImageConsumer()
            # Start consumer in background
            asyncio.create_task(consumer.start_consuming())
            logger.info("Successfully connected to Kafka")
            return
        except Exception as e:
            logger.warning(f"Failed to connect to Kafka (attempt {retry_count + 1}/{max_retries}): {str(e)}")
            retry_count += 1
            await asyncio.sleep(10)
    
    logger.error("Failed to connect to Kafka after maximum retries")
    raise Exception("Could not connect to Kafka")

@app.on_event("startup")
async def startup_event():
    try:
        # Register with Eureka first
        logger.info("Registering with Eureka...")
        await eureka_client.start()
        
        # Then wait for Kafka
        logger.info("Waiting for Kafka to be available...")
        await wait_for_kafka()
        
        logger.info("AI Processor Service startup complete")
    except Exception as e:
        logger.error(f"Failed to start AI Processor Service: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    try:
        # Deregister from Eureka
        logger.info("Deregistering from Eureka...")
        await eureka_client.stop()
        
        # Stop Kafka consumer
        if consumer:
            await consumer.stop()
            
        logger.info("AI Processor Service shutdown complete")
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")
        raise

@app.get("/health")
async def health_check():
    try:
        # Add basic health checks
        kafka_healthy = consumer is not None
        return {
            "status": "UP",
            "kafka": "UP" if kafka_healthy else "DOWN",
            "eureka": "UP"
        }
    except Exception:
        return {"status": "DOWN"}

@app.get("/info")
async def info():
    return {
        "app": "ai-processor-service",
        "version": "1.0.0",
        "description": "AI Service for Plant Recognition"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8082,
        reload=True,
        log_level="info"
    ) 