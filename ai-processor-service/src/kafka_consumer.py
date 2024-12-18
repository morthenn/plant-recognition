from kafka import KafkaConsumer
import json
from config import settings
from plant_classifier import PlantClassifier
from models import ImageProcessingRequest, PredictionResult
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class PlantImageConsumer:
    def __init__(self):
        self.consumer = KafkaConsumer(
            settings.KAFKA_TOPIC,
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            group_id=settings.KAFKA_GROUP_ID,
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            auto_offset_reset='earliest',
            enable_auto_commit=True
        )
        self.classifier = PlantClassifier()
        self._running = False
        self._executor = ThreadPoolExecutor(max_workers=1)
    
    def process_message(self, message) -> PredictionResult:
        try:
            # Parse message
            request = ImageProcessingRequest(**message.value)
            
            # Classify image
            prediction = self.classifier.predict(request.image_data)
            
            # Create result
            result = PredictionResult(
                image_id=request.image_id,
                is_plant=prediction["is_plant"],
                confidence=prediction["confidence"],
                plant_type=prediction["plant_type"]
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            raise

    async def start_consuming(self):
        self._running = True
        logger.info("Starting to consume messages...")
        
        try:
            while self._running:
                # Use ThreadPoolExecutor for blocking Kafka operations
                messages = await asyncio.get_event_loop().run_in_executor(
                    self._executor, 
                    lambda: next(self.consumer)
                )
                
                try:
                    result = self.process_message(messages)
                    logger.info(f"Processed image {result.image_id}: {result.plant_type}")
                except Exception as e:
                    logger.error(f"Error processing message: {str(e)}")
                
                # Add small delay to prevent CPU overload
                await asyncio.sleep(0.1)
                
        except Exception as e:
            logger.error(f"Error in consumer loop: {str(e)}")
        finally:
            self.consumer.close()
            
    async def stop(self):
        self._running = False
        self._executor.shutdown(wait=True)
        self.consumer.close()
        logger.info("Kafka consumer stopped")