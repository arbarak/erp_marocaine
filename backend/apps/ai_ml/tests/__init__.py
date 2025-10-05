# AI/ML Module Test Suite

"""
Comprehensive test suite for the AI/ML module.

Test Categories:
- Unit Tests (test_models.py): Test individual model functionality
- API Tests (test_api.py): Test REST API endpoints and integration
- Workflow Tests (test_workflows.py): Test end-to-end workflows
- Performance Tests (test_performance.py): Test performance and load handling

Test Coverage:
- Model creation, validation, and relationships
- API authentication and authorization
- CRUD operations for all models
- Custom actions (train, predict, detect_bias)
- Batch operations and exports
- Real-time streaming analytics
- Governance and compliance workflows
- Performance under load
- Memory usage optimization
- Database query performance
- Caching efficiency

Running Tests:
- All tests: python manage.py test apps.ai_ml.tests
- Unit tests only: python manage.py test apps.ai_ml.tests.test_models
- API tests only: python manage.py test apps.ai_ml.tests.test_api
- Workflow tests only: python manage.py test apps.ai_ml.tests.test_workflows
- Performance tests only: python manage.py test apps.ai_ml.tests.test_performance

Test Data:
- Uses Django's test database with automatic cleanup
- Creates minimal test data for each test case
- Uses mocking for external dependencies (Celery tasks)
- Includes performance benchmarks and assertions

Coverage Requirements:
- Minimum 90% code coverage
- All API endpoints tested
- All model methods tested
- All business logic tested
- Performance benchmarks met
"""

# Test configuration
TEST_SETTINGS = {
    'USE_TEST_DATABASE': True,
    'CELERY_TASK_ALWAYS_EAGER': True,
    'CELERY_TASK_EAGER_PROPAGATES': True,
    'CACHE_BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    'PASSWORD_HASHERS': [
        'django.contrib.auth.hashers.MD5PasswordHasher',  # Fast for testing
    ],
}

# Performance benchmarks
PERFORMANCE_BENCHMARKS = {
    'api_response_time': 1.0,  # seconds
    'bulk_create_time': 5.0,   # seconds for 1000 objects
    'query_time': 0.1,         # seconds for complex queries
    'cache_hit_time': 0.001,   # seconds
    'memory_increase': 100.0,  # MB for 5000 objects
    'requests_per_second': 10.0,
    'predictions_per_second': 5.0,
}

# Test data factories
def create_test_user(username='testuser', email='test@example.com'):
    """Create a test user"""
    from django.contrib.auth.models import User
    return User.objects.create_user(
        username=username,
        email=email,
        password='testpass123'
    )

def create_test_model(user, name='Test Model', model_type='neural_network'):
    """Create a test AI model"""
    from apps.ai_ml.models import AIModel
    return AIModel.objects.create(
        name=name,
        model_type=model_type,
        algorithm='test',
        created_by=user
    )

def create_test_training_job(model, epochs=10):
    """Create a test training job"""
    from apps.ai_ml.models import TrainingJob
    return TrainingJob.objects.create(
        model=model,
        epochs=epochs,
        batch_size=32
    )

def create_test_prediction(model, confidence=0.85):
    """Create a test prediction"""
    from apps.ai_ml.models import ModelPrediction
    return ModelPrediction.objects.create(
        model=model,
        input_data={'test': 'data'},
        prediction={'result': 'positive'},
        confidence=confidence,
        prediction_time=0.1
    )

# Test utilities
class TestMixin:
    """Mixin with common test utilities"""
    
    def assertResponseTime(self, start_time, end_time, max_time):
        """Assert that operation completed within time limit"""
        elapsed = end_time - start_time
        self.assertLess(elapsed, max_time, 
                       f"Operation took {elapsed:.4f}s, expected < {max_time}s")
    
    def assertMemoryUsage(self, initial_mb, final_mb, max_increase_mb):
        """Assert that memory usage increase is within limits"""
        increase = final_mb - initial_mb
        self.assertLess(increase, max_increase_mb,
                       f"Memory increased by {increase:.2f}MB, expected < {max_increase_mb}MB")
    
    def assertPerformanceBenchmark(self, metric_name, actual_value, benchmark_key=None):
        """Assert that performance metric meets benchmark"""
        benchmark_key = benchmark_key or metric_name
        benchmark = PERFORMANCE_BENCHMARKS.get(benchmark_key)
        if benchmark:
            self.assertLess(actual_value, benchmark,
                           f"{metric_name}: {actual_value} exceeds benchmark {benchmark}")

# Export test utilities
__all__ = [
    'TEST_SETTINGS',
    'PERFORMANCE_BENCHMARKS',
    'create_test_user',
    'create_test_model',
    'create_test_training_job',
    'create_test_prediction',
    'TestMixin',
]
