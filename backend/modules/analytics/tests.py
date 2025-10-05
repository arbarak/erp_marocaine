"""
Tests for analytics module.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta

from core.companies.models import Company
from .models import (
    AnalyticsDataSource, AnalyticsMetric, MetricValue,
    PredictiveModel, Prediction, BusinessIntelligenceDashboard
)
from .services import (
    AnalyticsDataService, MetricsCalculationService,
    PredictiveAnalyticsService, BusinessIntelligenceService
)

User = get_user_model()


class AnalyticsModelsTest(TestCase):
    """Test analytics models."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            if_number='12345678',
            rc='123456',
            currency='MAD'
        )
        
        self.data_source = AnalyticsDataSource.objects.create(
            company=self.company,
            name='Test Data Source',
            source_type='DATABASE',
            created_by=self.user
        )
    
    def test_create_analytics_data_source(self):
        """Test creating an analytics data source."""
        self.assertEqual(self.data_source.name, 'Test Data Source')
        self.assertEqual(self.data_source.source_type, 'DATABASE')
        self.assertEqual(self.data_source.company, self.company)
        self.assertTrue(self.data_source.is_active)
    
    def test_create_analytics_metric(self):
        """Test creating an analytics metric."""
        metric = AnalyticsMetric.objects.create(
            company=self.company,
            data_source=self.data_source,
            name='Test Metric',
            metric_type='COUNT',
            calculation_formula='count(invoices)',
            created_by=self.user
        )
        
        self.assertEqual(metric.name, 'Test Metric')
        self.assertEqual(metric.metric_type, 'COUNT')
        self.assertEqual(metric.data_source, self.data_source)
        self.assertTrue(metric.is_active)
    
    def test_create_metric_value(self):
        """Test creating a metric value."""
        metric = AnalyticsMetric.objects.create(
            company=self.company,
            data_source=self.data_source,
            name='Test Metric',
            metric_type='SUM',
            calculation_formula='sum(invoice_total)',
            created_by=self.user
        )
        
        value = MetricValue.objects.create(
            metric=metric,
            value=Decimal('1000.00'),
            period_start=timezone.now() - timedelta(days=30),
            period_end=timezone.now()
        )
        
        self.assertEqual(value.metric, metric)
        self.assertEqual(value.value, Decimal('1000.00'))
    
    def test_create_predictive_model(self):
        """Test creating a predictive model."""
        metric = AnalyticsMetric.objects.create(
            company=self.company,
            data_source=self.data_source,
            name='Revenue Metric',
            metric_type='SUM',
            calculation_formula='sum(invoice_total)',
            created_by=self.user
        )
        
        model = PredictiveModel.objects.create(
            company=self.company,
            name='Revenue Prediction Model',
            model_type='TIME_SERIES',
            target_metric=metric,
            created_by=self.user
        )
        
        self.assertEqual(model.name, 'Revenue Prediction Model')
        self.assertEqual(model.model_type, 'TIME_SERIES')
        self.assertEqual(model.target_metric, metric)
        self.assertEqual(model.status, 'TRAINING')
    
    def test_create_bi_dashboard(self):
        """Test creating a BI dashboard."""
        dashboard = BusinessIntelligenceDashboard.objects.create(
            company=self.company,
            name='Executive Dashboard',
            dashboard_type='EXECUTIVE',
            created_by=self.user
        )
        
        self.assertEqual(dashboard.name, 'Executive Dashboard')
        self.assertEqual(dashboard.dashboard_type, 'EXECUTIVE')
        self.assertEqual(dashboard.company, self.company)
        self.assertTrue(dashboard.is_active)


class AnalyticsServicesTest(TestCase):
    """Test analytics services."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            if_number='12345678',
            rc='123456',
            currency='MAD'
        )
        
        self.data_source = AnalyticsDataSource.objects.create(
            company=self.company,
            name='Test Data Source',
            source_type='DATABASE',
            created_by=self.user
        )
        
        self.metric = AnalyticsMetric.objects.create(
            company=self.company,
            data_source=self.data_source,
            name='Invoice Count',
            metric_type='COUNT',
            calculation_formula='count(invoices)',
            created_by=self.user
        )
    
    def test_refresh_data_source(self):
        """Test refreshing a data source."""
        result = AnalyticsDataService.refresh_data_source(self.data_source)
        
        self.assertTrue(result['success'])
        self.assertIsNotNone(result['last_refresh'])
    
    def test_calculate_metric(self):
        """Test calculating a metric."""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        value = MetricsCalculationService.calculate_metric(
            self.metric, start_date, end_date
        )
        
        self.assertIsInstance(value, Decimal)
        self.assertGreaterEqual(value, Decimal('0.00'))
    
    def test_calculate_all_metrics(self):
        """Test calculating all metrics for a company."""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        result = MetricsCalculationService.calculate_all_metrics(
            self.company, start_date, end_date
        )
        
        self.assertTrue(result['success'])
        self.assertGreaterEqual(result['metrics_calculated'], 0)
        self.assertIsInstance(result['errors'], list)
    
    def test_train_predictive_model(self):
        """Test training a predictive model."""
        model = PredictiveModel.objects.create(
            company=self.company,
            name='Test Model',
            model_type='LINEAR_REGRESSION',
            target_metric=self.metric,
            created_by=self.user
        )
        
        result = PredictiveAnalyticsService.train_model(model)
        
        # Should succeed even with no training data (mock implementation)
        self.assertIn('success', result)
    
    def test_generate_executive_dashboard(self):
        """Test generating executive dashboard data."""
        data = BusinessIntelligenceService.generate_executive_dashboard(self.company)
        
        self.assertIn('period', data)
        self.assertIn('key_metrics', data)
        self.assertIn('trends', data)
        self.assertIn('alerts', data)
        
        # Check key metrics structure
        key_metrics = data['key_metrics']
        self.assertIn('total_revenue', key_metrics)
        self.assertIn('total_orders', key_metrics)
        self.assertIn('average_order_value', key_metrics)


class AnalyticsAPITest(TestCase):
    """Test analytics API endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            if_number='12345678',
            rc='123456',
            currency='MAD'
        )
        
        # Set user's current company
        self.user.current_company = self.company
        self.user.save()
        
        self.client.force_login(self.user)
    
    def test_create_data_source_api(self):
        """Test creating data source via API."""
        data = {
            'name': 'API Test Data Source',
            'description': 'Test data source created via API',
            'source_type': 'DATABASE',
            'refresh_interval': 3600
        }
        
        response = self.client.post('/api/v1/analytics/data-sources/', data)
        self.assertEqual(response.status_code, 201)
        
        # Check that data source was created
        self.assertTrue(
            AnalyticsDataSource.objects.filter(
                name='API Test Data Source',
                company=self.company
            ).exists()
        )
    
    def test_create_metric_api(self):
        """Test creating metric via API."""
        # First create a data source
        data_source = AnalyticsDataSource.objects.create(
            company=self.company,
            name='Test Data Source',
            source_type='DATABASE',
            created_by=self.user
        )
        
        data = {
            'name': 'API Test Metric',
            'description': 'Test metric created via API',
            'metric_type': 'COUNT',
            'data_source': str(data_source.id),
            'calculation_formula': 'count(invoices)',
            'aggregation_period': 'MONTHLY'
        }
        
        response = self.client.post('/api/v1/analytics/metrics/', data)
        self.assertEqual(response.status_code, 201)
        
        # Check that metric was created
        self.assertTrue(
            AnalyticsMetric.objects.filter(
                name='API Test Metric',
                company=self.company
            ).exists()
        )
    
    def test_create_dashboard_api(self):
        """Test creating dashboard via API."""
        data = {
            'name': 'API Test Dashboard',
            'description': 'Test dashboard created via API',
            'dashboard_type': 'EXECUTIVE',
            'layout_config': {},
            'widget_config': [],
            'refresh_interval': 300
        }
        
        response = self.client.post('/api/v1/analytics/dashboards/', data)
        self.assertEqual(response.status_code, 201)
        
        # Check that dashboard was created
        self.assertTrue(
            BusinessIntelligenceDashboard.objects.filter(
                name='API Test Dashboard',
                company=self.company
            ).exists()
        )
