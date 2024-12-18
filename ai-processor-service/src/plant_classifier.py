import tensorflow as tf
import numpy as np
from PIL import Image
import io
import base64

class PlantClassifier:
    def __init__(self):
        # Load pre-trained MobileNetV2 model
        self.model = tf.keras.applications.MobileNetV2(
            weights='imagenet',
            include_top=True
        )
        # Load ImageNet class names
        self.labels = self._load_imagenet_labels()
        
        # Plant-related ImageNet categories
        self.plant_categories = {
            'houseplant', 'flower', 'tree', 'herb', 'vegetable',
            'fruit', 'leaf', 'grass', 'mushroom', 'seaweed'
        }
    
    def _load_imagenet_labels(self):
        labels_path = tf.keras.utils.get_file(
            'ImageNetLabels.txt',
            'https://storage.googleapis.com/download.tensorflow.org/data/ImageNetLabels.txt'
        )
        with open(labels_path) as f:
            labels = f.readlines()
        return [l.strip() for l in labels]
    
    def preprocess_image(self, image_data: str) -> np.ndarray:
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Resize and preprocess
        image = image.resize((224, 224))
        image = tf.keras.preprocessing.image.img_to_array(image)
        image = tf.keras.applications.mobilenet_v2.preprocess_input(image)
        return np.expand_dims(image, axis=0)
    
    def predict(self, image_data: str) -> dict:
        # Preprocess image
        processed_image = self.preprocess_image(image_data)
        
        # Make prediction
        predictions = self.model.predict(processed_image)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx])
        predicted_class = self.labels[predicted_class_idx]
        
        # Check if the prediction is plant-related
        is_plant = any(category in predicted_class.lower() 
                      for category in self.plant_categories)
        
        return {
            "is_plant": is_plant,
            "confidence": confidence,
            "plant_type": predicted_class if is_plant else None
        } 