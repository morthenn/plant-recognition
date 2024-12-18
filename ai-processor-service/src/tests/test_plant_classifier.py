import unittest
import base64
from PIL import Image
import io
from src.plant_classifier import PlantClassifier

class TestPlantClassifier(unittest.TestCase):
    def setUp(self):
        self.classifier = PlantClassifier()

    def test_predict_plant_image(self):
        # Create a test image
        img = Image.new('RGB', (224, 224), color='green')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        img_base64 = base64.b64encode(img_byte_arr).decode('utf-8')

        # Predict
        result = self.classifier.predict(img_base64)

        # Assert
        self.assertIsInstance(result, dict)
        self.assertIn('is_plant', result)
        self.assertIn('confidence', result)
        self.assertIn('plant_type', result)
        self.assertIsInstance(result['confidence'], float)
        self.assertGreaterEqual(result['confidence'], 0.0)
        self.assertLessEqual(result['confidence'], 1.0)

    def test_invalid_image_data(self):
        with self.assertRaises(Exception):
            self.classifier.predict("invalid_base64_data")

if __name__ == '__main__':
    unittest.main() 