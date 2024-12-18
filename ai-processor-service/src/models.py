from pydantic import BaseModel
from typing import List, Optional

class PredictionResult(BaseModel):
    image_id: str
    is_plant: bool
    confidence: float
    plant_type: Optional[str] = None
    
class ImageProcessingRequest(BaseModel):
    image_id: str
    image_data: str  # Base64 encoded image
    user_id: str 