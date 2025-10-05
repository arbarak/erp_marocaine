"""
Advanced Analytics services for business intelligence and predictive analytics.
"""
import pandas as pd
import numpy as np
from decimal import Decimal
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from django.db.models import Sum, Avg, Count, Q
from django.utils import timezone
from django.db import transaction

from .models import (
    AnalyticsDataSource, AnalyticsMetric, MetricValue,
    PredictiveModel, Prediction, BusinessIntelligenceDashboard
)
from modules.invoicing.models import Invoice
from modules.sales.models import SalesOrder
from modules.purchasing.models import PurchaseOrder
from modules.inventory.models import StockMove
from core.companies.models import Company


class AnalyticsDataService:
    """Service for managing analytics data sources and metrics."""
    
    @classmethod
    def refresh_data_source(cls, data_source: AnalyticsDataSource) -> Dict[str, Any]:
        """
        Refresh data from a data source.
        
        Args:
            data_source: AnalyticsDataSource instance
            
        Returns:
            Dictionary with refresh results
        """
        try:
            if data_source.source_type == 'DATABASE':
                return cls._refresh_database_source(data_source)
            elif data_source.source_type == 'API':
                return cls._refresh_api_source(data_source)
            elif data_source.source_type == 'FILE':
                return cls._refresh_file_source(data_source)
            else:
                return {'success': False, 'error': 'Unsupported source type'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @classmethod
    def _refresh_database_source(cls, data_source: AnalyticsDataSource) -> Dict[str, Any]:
        """Refresh data from database source."""
        # Implementation would depend on specific database queries
        # For now, return success
        data_source.last_refresh = timezone.now()
        data_source.save()
        
        return {
            'success': True,
            'records_processed': 0,
            'last_refresh': data_source.last_refresh
        }
    
    @classmethod
    def _refresh_api_source(cls, data_source: AnalyticsDataSource) -> Dict[str, Any]:
        """Refresh data from API source."""
        # Implementation would make API calls
        data_source.last_refresh = timezone.now()
        data_source.save()
        
        return {
            'success': True,
            'records_processed': 0,
            'last_refresh': data_source.last_refresh
        }
    
    @classmethod
    def _refresh_file_source(cls, data_source: AnalyticsDataSource) -> Dict[str, Any]:
        """Refresh data from file source."""
        # Implementation would process uploaded files
        data_source.last_refresh = timezone.now()
        data_source.save()
        
        return {
            'success': True,
            'records_processed': 0,
            'last_refresh': data_source.last_refresh
        }


class MetricsCalculationService:
    """Service for calculating business metrics."""
    
    @classmethod
    def calculate_metric(cls, metric: AnalyticsMetric, period_start: datetime, period_end: datetime) -> Decimal:
        """
        Calculate a metric value for a specific period.
        
        Args:
            metric: AnalyticsMetric instance
            period_start: Start of calculation period
            period_end: End of calculation period
            
        Returns:
            Calculated metric value
        """
        try:
            if metric.metric_type == 'COUNT':
                return cls._calculate_count_metric(metric, period_start, period_end)
            elif metric.metric_type == 'SUM':
                return cls._calculate_sum_metric(metric, period_start, period_end)
            elif metric.metric_type == 'AVERAGE':
                return cls._calculate_average_metric(metric, period_start, period_end)
            elif metric.metric_type == 'PERCENTAGE':
                return cls._calculate_percentage_metric(metric, period_start, period_end)
            elif metric.metric_type == 'RATIO':
                return cls._calculate_ratio_metric(metric, period_start, period_end)
            elif metric.metric_type == 'TREND':
                return cls._calculate_trend_metric(metric, period_start, period_end)
            else:
                return Decimal('0.00')
                
        except Exception:
            return Decimal('0.00')
    
    @classmethod
    def _calculate_count_metric(cls, metric: AnalyticsMetric, period_start: datetime, period_end: datetime) -> Decimal:
        """Calculate count-based metrics."""
        company = metric.company
        
        # Example: Count of invoices
        if 'invoice' in metric.calculation_formula.lower():
            count = Invoice.objects.filter(
                company=company,
                created_at__range=[period_start, period_end]
            ).count()
            return Decimal(str(count))
        
        # Example: Count of sales orders
        if 'sales_order' in metric.calculation_formula.lower():
            count = SalesOrder.objects.filter(
                company=company,
                created_at__range=[period_start, period_end]
            ).count()
            return Decimal(str(count))
        
        return Decimal('0.00')
    
    @classmethod
    def _calculate_sum_metric(cls, metric: AnalyticsMetric, period_start: datetime, period_end: datetime) -> Decimal:
        """Calculate sum-based metrics."""
        company = metric.company
        
        # Example: Total invoice amount
        if 'invoice_total' in metric.calculation_formula.lower():
            total = Invoice.objects.filter(
                company=company,
                created_at__range=[period_start, period_end]
            ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
            return total
        
        # Example: Total sales amount
        if 'sales_total' in metric.calculation_formula.lower():
            total = SalesOrder.objects.filter(
                company=company,
                created_at__range=[period_start, period_end]
            ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
            return total
        
        return Decimal('0.00')
    
    @classmethod
    def _calculate_average_metric(cls, metric: AnalyticsMetric, period_start: datetime, period_end: datetime) -> Decimal:
        """Calculate average-based metrics."""
        company = metric.company
        
        # Example: Average invoice amount
        if 'invoice_average' in metric.calculation_formula.lower():
            avg = Invoice.objects.filter(
                company=company,
                created_at__range=[period_start, period_end]
            ).aggregate(avg=Avg('total_amount'))['avg'] or Decimal('0.00')
            return avg
        
        return Decimal('0.00')
    
    @classmethod
    def _calculate_percentage_metric(cls, metric: AnalyticsMetric, period_start: datetime, period_end: datetime) -> Decimal:
        """Calculate percentage-based metrics."""
        # Implementation for percentage calculations
        return Decimal('0.00')
    
    @classmethod
    def _calculate_ratio_metric(cls, metric: AnalyticsMetric, period_start: datetime, period_end: datetime) -> Decimal:
        """Calculate ratio-based metrics."""
        # Implementation for ratio calculations
        return Decimal('0.00')
    
    @classmethod
    def _calculate_trend_metric(cls, metric: AnalyticsMetric, period_start: datetime, period_end: datetime) -> Decimal:
        """Calculate trend-based metrics."""
        # Implementation for trend calculations
        return Decimal('0.00')
    
    @classmethod
    def calculate_all_metrics(cls, company: Company, period_start: datetime, period_end: datetime) -> Dict[str, Any]:
        """
        Calculate all active metrics for a company and period.
        
        Args:
            company: Company instance
            period_start: Start of calculation period
            period_end: End of calculation period
            
        Returns:
            Dictionary with calculation results
        """
        results = {
            'success': True,
            'metrics_calculated': 0,
            'errors': []
        }
        
        metrics = AnalyticsMetric.objects.filter(
            company=company,
            is_active=True
        )
        
        for metric in metrics:
            try:
                value = cls.calculate_metric(metric, period_start, period_end)
                
                # Store the calculated value
                MetricValue.objects.update_or_create(
                    metric=metric,
                    period_start=period_start,
                    period_end=period_end,
                    defaults={'value': value}
                )
                
                results['metrics_calculated'] += 1
                
            except Exception as e:
                results['errors'].append({
                    'metric': metric.name,
                    'error': str(e)
                })
        
        return results


class PredictiveAnalyticsService:
    """Service for predictive analytics and machine learning."""
    
    @classmethod
    def train_model(cls, model: PredictiveModel) -> Dict[str, Any]:
        """
        Train a predictive model.
        
        Args:
            model: PredictiveModel instance
            
        Returns:
            Training results
        """
        try:
            # Update model status
            model.status = 'TRAINING'
            model.save()
            
            # Get training data
            training_data = cls._prepare_training_data(model)
            
            if training_data.empty:
                model.status = 'FAILED'
                model.save()
                return {'success': False, 'error': 'No training data available'}
            
            # Train model based on type
            if model.model_type == 'LINEAR_REGRESSION':
                accuracy = cls._train_linear_regression(model, training_data)
            elif model.model_type == 'TIME_SERIES':
                accuracy = cls._train_time_series(model, training_data)
            else:
                accuracy = 0.0
            
            # Update model
            model.accuracy_score = Decimal(str(accuracy))
            model.training_data_size = len(training_data)
            model.status = 'TRAINED'
            model.trained_at = timezone.now()
            model.save()
            
            return {
                'success': True,
                'accuracy': accuracy,
                'training_size': len(training_data)
            }
            
        except Exception as e:
            model.status = 'FAILED'
            model.save()
            return {'success': False, 'error': str(e)}
    
    @classmethod
    def _prepare_training_data(cls, model: PredictiveModel) -> pd.DataFrame:
        """Prepare training data for the model."""
        # Get historical metric values
        values = MetricValue.objects.filter(
            metric=model.target_metric
        ).order_by('period_start')
        
        data = []
        for value in values:
            data.append({
                'date': value.period_start,
                'value': float(value.value),
                'period_start': value.period_start,
                'period_end': value.period_end
            })
        
        return pd.DataFrame(data)
    
    @classmethod
    def _train_linear_regression(cls, model: PredictiveModel, data: pd.DataFrame) -> float:
        """Train a linear regression model."""
        # Simplified implementation - would use scikit-learn in production
        return 0.85  # Mock accuracy score
    
    @classmethod
    def _train_time_series(cls, model: PredictiveModel, data: pd.DataFrame) -> float:
        """Train a time series forecasting model."""
        # Simplified implementation - would use statsmodels or similar
        return 0.78  # Mock accuracy score
    
    @classmethod
    def generate_prediction(cls, model: PredictiveModel, target_date: datetime) -> Dict[str, Any]:
        """
        Generate a prediction using a trained model.
        
        Args:
            model: PredictiveModel instance
            target_date: Date to predict for
            
        Returns:
            Prediction results
        """
        try:
            if model.status != 'TRAINED' and model.status != 'DEPLOYED':
                return {'success': False, 'error': 'Model not trained'}
            
            # Generate prediction based on model type
            if model.model_type == 'LINEAR_REGRESSION':
                predicted_value, confidence = cls._predict_linear_regression(model, target_date)
            elif model.model_type == 'TIME_SERIES':
                predicted_value, confidence = cls._predict_time_series(model, target_date)
            else:
                return {'success': False, 'error': 'Unsupported model type'}
            
            # Store prediction
            prediction = Prediction.objects.create(
                model=model,
                predicted_value=Decimal(str(predicted_value)),
                confidence_score=Decimal(str(confidence)),
                prediction_date=timezone.now(),
                target_period_start=target_date,
                target_period_end=target_date + timedelta(days=30),  # Default 30-day period
                input_features={}
            )
            
            return {
                'success': True,
                'predicted_value': predicted_value,
                'confidence': confidence,
                'prediction_id': str(prediction.id)
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @classmethod
    def _predict_linear_regression(cls, model: PredictiveModel, target_date: datetime) -> Tuple[float, float]:
        """Generate prediction using linear regression."""
        # Simplified implementation
        return 1000.0, 0.85  # Mock prediction and confidence
    
    @classmethod
    def _predict_time_series(cls, model: PredictiveModel, target_date: datetime) -> Tuple[float, float]:
        """Generate prediction using time series model."""
        # Simplified implementation
        return 1200.0, 0.78  # Mock prediction and confidence


class BusinessIntelligenceService:
    """Service for business intelligence dashboards and insights."""
    
    @classmethod
    def generate_executive_dashboard(cls, company: Company) -> Dict[str, Any]:
        """
        Generate executive dashboard data.
        
        Args:
            company: Company instance
            
        Returns:
            Dashboard data
        """
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        # Key metrics
        total_revenue = Invoice.objects.filter(
            company=company,
            created_at__range=[start_date, end_date],
            invoice_type='CUSTOMER'
        ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        
        total_orders = SalesOrder.objects.filter(
            company=company,
            created_at__range=[start_date, end_date]
        ).count()
        
        avg_order_value = total_revenue / max(total_orders, 1)
        
        return {
            'period': {
                'start': start_date,
                'end': end_date
            },
            'key_metrics': {
                'total_revenue': float(total_revenue),
                'total_orders': total_orders,
                'average_order_value': float(avg_order_value)
            },
            'trends': cls._calculate_trends(company, start_date, end_date),
            'alerts': cls._generate_alerts(company)
        }
    
    @classmethod
    def _calculate_trends(cls, company: Company, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Calculate trend data for dashboard."""
        # Implementation for trend calculations
        return {
            'revenue_trend': 'up',
            'order_trend': 'stable',
            'customer_trend': 'up'
        }
    
    @classmethod
    def _generate_alerts(cls, company: Company) -> List[Dict[str, Any]]:
        """Generate business alerts."""
        alerts = []
        
        # Example: Low stock alerts
        # Implementation would check inventory levels
        
        return alerts
