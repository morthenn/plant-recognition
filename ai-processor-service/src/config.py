from pydantic import BaseSettings

class Settings(BaseSettings):
    KAFKA_BOOTSTRAP_SERVERS: str = "kafka:9092"
    KAFKA_TOPIC: str = "plant-images"
    KAFKA_GROUP_ID: str = "plant-recognition-group"
    MODEL_CONFIDENCE_THRESHOLD: float = 0.7
    EUREKA_SERVER_URL: str = "http://discovery-service:8761/eureka"
    
    class Config:
        env_file = ".env"

settings = Settings() 