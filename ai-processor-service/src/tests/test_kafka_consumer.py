import unittest
from unittest.mock import Mock, patch
from src.kafka_consumer import PlantImageConsumer
from src.models import ImageProcessingRequest, PredictionResult

class TestPlantImageConsumer(unittest.TestCase):
    def setUp(self):
        self.consumer = PlantImageConsumer()

    @patch('src.kafka_consumer.KafkaConsumer')
    def test_process_message(self, mock_kafka_consumer):
        # Create a mock message
        message = Mock()
        message.value = {
            'image_id': 'test_id',
            'image_data': 'base64_encoded_data',
            'user_id': 'test_user'
        }

        # Process message
        result = self.consumer.process_message(message)

        # Assert
        self.assertIsInstance(result, PredictionResult)
        self.assertEqual(result.image_id, 'test_id')
        self.assertIn('is_plant', vars(result))
        self.assertIn('confidence', vars(result))

    @patch('src.kafka_consumer.KafkaConsumer')
    def test_invalid_message(self, mock_kafka_consumer):
        # Create an invalid mock message
        message = Mock()
        message.value = {'invalid': 'data'}

        # Assert that processing raises an exception
        with self.assertRaises(Exception):
            self.consumer.process_message(message)

if __name__ == '__main__':
    unittest.main() 