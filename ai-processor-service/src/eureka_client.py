import py_eureka_client.eureka_client as eureka_client
from config import settings
import logging
import socket
import asyncio

logger = logging.getLogger(__name__)

class EurekaClient:
    def __init__(self):
        self.eureka_client = None
        
    async def start(self):
        try:
            self.eureka_client = await eureka_client.init_async(
                eureka_server=settings.EUREKA_SERVER_URL,
                app_name="ai-processor-service",
                instance_port=8082,
                instance_host="localhost",
                renewal_interval_in_secs=30,
                duration_in_secs=90,
                metadata={
                    "management.port": "8082"
                }
            )
            logger.info(f"Successfully registered with Eureka at {settings.EUREKA_SERVER_URL}")
        except Exception as e:
            logger.error(f"Failed to register with Eureka: {str(e)}")
            raise
            
    async def stop(self):
        if self.eureka_client:
            try:
                await self.eureka_client.stop()
                logger.info("Successfully deregistered from Eureka")
            except Exception as e:
                logger.error(f"Failed to deregister from Eureka: {str(e)}")
                raise