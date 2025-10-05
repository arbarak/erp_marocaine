"""
Advanced purchase analytics and reporting service.
"""
from django.db.models import (
    Q, Sum, Avg, Count, Max, Min, F, Case, When, 
    DecimalField, IntegerField, DateField, Value
)
from django.db.models.functions import (
    TruncMonth, TruncQuarter, TruncYear, Extract, Coalesce
)
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, List, Any, Optional
import calendar

from .models import (
    Supplier, PurchaseOrder, PurchaseOrderLine, 
    GoodsReceipt, SupplierQuotation, RequestForQuotation
)


class PurchaseAnalyticsService:
    """Service for generating comprehensive purchase analytics and reports."""
    
    def __init__(self, company):
        self.company = company
    
    def get_purchase_overview(self, start_date: datetime = None, end_date: datetime = None) -> Dict[str, Any]:
        """Get comprehensive purchase overview metrics."""
        if not start_date:
            start_date = timezone.now() - timedelta(days=365)
        if not end_date:
            end_date = timezone.now()
        
        orders = PurchaseOrder.objects.filter(
            company=self.company,
            order_date__range=[start_date, end_date]
        )
        
        # Basic metrics
        total_orders = orders.count()
        total_value = orders.aggregate(
            total=Coalesce(Sum('total_amount'), Decimal('0'))
        )['total']
        
        avg_order_value = orders.aggregate(
            avg=Coalesce(Avg('total_amount'), Decimal('0'))
        )['avg']
        
        # Status distribution
        status_distribution = orders.values('state').annotate(
            count=Count('id'),
            value=Sum('total_amount')
        ).order_by('state')
        
        # Monthly trends
        monthly_trends = orders.annotate(
            month=TruncMonth('order_date')
        ).values('month').annotate(
            orders_count=Count('id'),
            total_value=Sum('total_amount'),
            avg_value=Avg('total_amount')
        ).order_by('month')
        
        # Top suppliers by value
        top_suppliers = orders.values(
            'supplier__name', 'supplier__supplier_code'
        ).annotate(
            total_orders=Count('id'),
            total_value=Sum('total_amount'),
            avg_order_value=Avg('total_amount')
        ).order_by('-total_value')[:10]
        
        # Delivery performance
        delivered_orders = orders.filter(state='DELIVERED')
        on_time_deliveries = delivered_orders.filter(
            delivery_date__lte=F('expected_delivery_date')
        ).count()
        
        on_time_rate = (
            (on_time_deliveries / delivered_orders.count() * 100) 
            if delivered_orders.count() > 0 else 0
        )
        
        return {
            'period': {
                'start_date': start_date.date(),
                'end_date': end_date.date()
            },
            'overview': {
                'total_orders': total_orders,
                'total_value': float(total_value),
                'average_order_value': float(avg_order_value),
                'on_time_delivery_rate': round(on_time_rate, 2)
            },
            'status_distribution': list(status_distribution),
            'monthly_trends': [
                {
                    'month': item['month'].strftime('%Y-%m'),
                    'orders_count': item['orders_count'],
                    'total_value': float(item['total_value'] or 0),
                    'avg_value': float(item['avg_value'] or 0)
                }
                for item in monthly_trends
            ],
            'top_suppliers': [
                {
                    'supplier_name': item['supplier__name'],
                    'supplier_code': item['supplier__supplier_code'],
                    'total_orders': item['total_orders'],
                    'total_value': float(item['total_value'] or 0),
                    'avg_order_value': float(item['avg_order_value'] or 0)
                }
                for item in top_suppliers
            ]
        }
    
    def get_supplier_performance_analysis(self, supplier_id: str = None, 
                                        start_date: datetime = None, 
                                        end_date: datetime = None) -> Dict[str, Any]:
        """Get detailed supplier performance analysis."""
        if not start_date:
            start_date = timezone.now() - timedelta(days=365)
        if not end_date:
            end_date = timezone.now()
        
        orders_filter = Q(
            company=self.company,
            order_date__range=[start_date, end_date]
        )
        
        if supplier_id:
            orders_filter &= Q(supplier_id=supplier_id)
        
        orders = PurchaseOrder.objects.filter(orders_filter)
        
        # Performance by supplier
        supplier_performance = orders.values(
            'supplier__id', 'supplier__name', 'supplier__supplier_code'
        ).annotate(
            total_orders=Count('id'),
            total_value=Sum('total_amount'),
            avg_order_value=Avg('total_amount'),
            avg_lead_time=Avg(
                Extract('day', F('delivery_date') - F('order_date'))
            ),
            on_time_deliveries=Count(
                Case(
                    When(
                        Q(state='DELIVERED') & 
                        Q(delivery_date__lte=F('expected_delivery_date')),
                        then=1
                    ),
                    output_field=IntegerField()
                )
            ),
            late_deliveries=Count(
                Case(
                    When(
                        Q(state='DELIVERED') & 
                        Q(delivery_date__gt=F('expected_delivery_date')),
                        then=1
                    ),
                    output_field=IntegerField()
                )
            ),
            cancelled_orders=Count(
                Case(
                    When(state='CANCELLED', then=1),
                    output_field=IntegerField()
                )
            )
        ).annotate(
            on_time_rate=Case(
                When(
                    total_orders__gt=0,
                    then=F('on_time_deliveries') * 100.0 / F('total_orders')
                ),
                default=Value(0),
                output_field=DecimalField(max_digits=5, decimal_places=2)
            ),
            cancellation_rate=Case(
                When(
                    total_orders__gt=0,
                    then=F('cancelled_orders') * 100.0 / F('total_orders')
                ),
                default=Value(0),
                output_field=DecimalField(max_digits=5, decimal_places=2)
            )
        ).order_by('-total_value')
        
        return {
            'period': {
                'start_date': start_date.date(),
                'end_date': end_date.date()
            },
            'supplier_performance': [
                {
                    'supplier_id': str(item['supplier__id']),
                    'supplier_name': item['supplier__name'],
                    'supplier_code': item['supplier__supplier_code'],
                    'total_orders': item['total_orders'],
                    'total_value': float(item['total_value'] or 0),
                    'avg_order_value': float(item['avg_order_value'] or 0),
                    'avg_lead_time_days': float(item['avg_lead_time'] or 0),
                    'on_time_deliveries': item['on_time_deliveries'],
                    'late_deliveries': item['late_deliveries'],
                    'cancelled_orders': item['cancelled_orders'],
                    'on_time_rate': float(item['on_time_rate']),
                    'cancellation_rate': float(item['cancellation_rate'])
                }
                for item in supplier_performance
            ]
        }
    
    def get_category_analysis(self, start_date: datetime = None, 
                            end_date: datetime = None) -> Dict[str, Any]:
        """Get purchase analysis by product categories."""
        if not start_date:
            start_date = timezone.now() - timedelta(days=365)
        if not end_date:
            end_date = timezone.now()
        
        # Category analysis through order lines
        order_lines = PurchaseOrderLine.objects.filter(
            purchase_order__company=self.company,
            purchase_order__order_date__range=[start_date, end_date]
        ).select_related('product', 'product__category')
        
        category_analysis = order_lines.values(
            'product__category__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_value=Sum(F('quantity') * F('unit_price')),
            avg_unit_price=Avg('unit_price'),
            order_count=Count('purchase_order', distinct=True),
            supplier_count=Count('purchase_order__supplier', distinct=True)
        ).order_by('-total_value')
        
        return {
            'period': {
                'start_date': start_date.date(),
                'end_date': end_date.date()
            },
            'category_analysis': [
                {
                    'category_name': item['product__category__name'] or 'Uncategorized',
                    'total_quantity': float(item['total_quantity'] or 0),
                    'total_value': float(item['total_value'] or 0),
                    'avg_unit_price': float(item['avg_unit_price'] or 0),
                    'order_count': item['order_count'],
                    'supplier_count': item['supplier_count']
                }
                for item in category_analysis
            ]
        }
    
    def get_cost_savings_analysis(self, start_date: datetime = None, 
                                end_date: datetime = None) -> Dict[str, Any]:
        """Analyze cost savings from RFQ process and negotiations."""
        if not start_date:
            start_date = timezone.now() - timedelta(days=365)
        if not end_date:
            end_date = timezone.now()
        
        # RFQ analysis
        rfqs = RequestForQuotation.objects.filter(
            company=self.company,
            created_at__range=[start_date, end_date],
            state='COMPLETED'
        )
        
        savings_data = []
        total_potential_savings = Decimal('0')
        
        for rfq in rfqs:
            quotations = SupplierQuotation.objects.filter(rfq=rfq)
            if quotations.count() > 1:
                prices = [q.total_amount for q in quotations]
                min_price = min(prices)
                max_price = max(prices)
                potential_savings = max_price - min_price
                total_potential_savings += potential_savings
                
                savings_data.append({
                    'rfq_id': str(rfq.id),
                    'rfq_reference': rfq.reference_number,
                    'quotation_count': quotations.count(),
                    'min_price': float(min_price),
                    'max_price': float(max_price),
                    'potential_savings': float(potential_savings),
                    'savings_percentage': float((potential_savings / max_price) * 100) if max_price > 0 else 0
                })
        
        return {
            'period': {
                'start_date': start_date.date(),
                'end_date': end_date.date()
            },
            'cost_savings': {
                'total_rfqs_analyzed': len(savings_data),
                'total_potential_savings': float(total_potential_savings),
                'avg_savings_per_rfq': float(total_potential_savings / len(savings_data)) if savings_data else 0,
                'rfq_details': savings_data
            }
        }

    def get_purchase_forecasting(self, months_ahead: int = 6) -> Dict[str, Any]:
        """Generate purchase forecasting based on historical data."""
        # Get historical data for the last 12 months
        end_date = timezone.now()
        start_date = end_date - timedelta(days=365)

        # Monthly purchase patterns
        monthly_data = PurchaseOrder.objects.filter(
            company=self.company,
            order_date__range=[start_date, end_date]
        ).annotate(
            month=TruncMonth('order_date')
        ).values('month').annotate(
            orders_count=Count('id'),
            total_value=Sum('total_amount')
        ).order_by('month')

        # Calculate trends and forecast
        if len(monthly_data) >= 3:
            # Simple linear trend calculation
            values = [float(item['total_value'] or 0) for item in monthly_data]
            avg_monthly_value = sum(values) / len(values)

            # Calculate growth rate
            if len(values) > 1:
                recent_avg = sum(values[-3:]) / 3 if len(values) >= 3 else values[-1]
                early_avg = sum(values[:3]) / 3 if len(values) >= 3 else values[0]
                growth_rate = (recent_avg - early_avg) / early_avg if early_avg > 0 else 0
            else:
                growth_rate = 0

            # Generate forecast
            forecast_data = []
            current_month = end_date.replace(day=1)

            for i in range(months_ahead):
                forecast_month = current_month + timedelta(days=32 * i)
                forecast_month = forecast_month.replace(day=1)

                # Apply seasonal adjustment (simplified)
                seasonal_factor = 1.0
                if forecast_month.month in [11, 12]:  # Higher activity in Nov-Dec
                    seasonal_factor = 1.2
                elif forecast_month.month in [7, 8]:  # Lower activity in Jul-Aug
                    seasonal_factor = 0.8

                forecast_value = avg_monthly_value * (1 + growth_rate) * seasonal_factor

                forecast_data.append({
                    'month': forecast_month.strftime('%Y-%m'),
                    'forecasted_value': round(forecast_value, 2),
                    'confidence_level': max(0.5, 0.9 - (i * 0.1))  # Decreasing confidence
                })
        else:
            forecast_data = []

        return {
            'historical_data': [
                {
                    'month': item['month'].strftime('%Y-%m'),
                    'orders_count': item['orders_count'],
                    'total_value': float(item['total_value'] or 0)
                }
                for item in monthly_data
            ],
            'forecast': forecast_data,
            'insights': {
                'avg_monthly_value': round(avg_monthly_value, 2) if monthly_data else 0,
                'growth_rate': round(growth_rate * 100, 2) if monthly_data else 0,
                'trend': 'increasing' if growth_rate > 0.05 else 'decreasing' if growth_rate < -0.05 else 'stable'
            }
        }

    def get_compliance_report(self, start_date: datetime = None,
                            end_date: datetime = None) -> Dict[str, Any]:
        """Generate compliance and audit report for purchases."""
        if not start_date:
            start_date = timezone.now() - timedelta(days=90)
        if not end_date:
            end_date = timezone.now()

        orders = PurchaseOrder.objects.filter(
            company=self.company,
            order_date__range=[start_date, end_date]
        )

        # Compliance checks
        total_orders = orders.count()

        # Orders with proper approval workflow
        approved_orders = orders.exclude(approved_by__isnull=True).count()

        # Orders with complete documentation
        documented_orders = orders.exclude(
            Q(notes__isnull=True) | Q(notes='')
        ).count()

        # Orders with delivery confirmation
        delivered_orders = orders.filter(state='DELIVERED').count()

        # Large orders (>10000 MAD) requiring special approval
        large_orders = orders.filter(total_amount__gt=10000)
        large_orders_approved = large_orders.exclude(approved_by__isnull=True).count()

        # Supplier compliance
        suppliers_with_valid_info = Supplier.objects.filter(
            company=self.company,
            purchase_orders__in=orders
        ).exclude(
            Q(ice__isnull=True) | Q(ice='') |
            Q(if_number__isnull=True) | Q(if_number='')
        ).distinct().count()

        total_active_suppliers = Supplier.objects.filter(
            company=self.company,
            purchase_orders__in=orders
        ).distinct().count()

        return {
            'period': {
                'start_date': start_date.date(),
                'end_date': end_date.date()
            },
            'compliance_metrics': {
                'total_orders': total_orders,
                'approval_compliance': {
                    'approved_orders': approved_orders,
                    'approval_rate': round((approved_orders / total_orders * 100), 2) if total_orders > 0 else 0
                },
                'documentation_compliance': {
                    'documented_orders': documented_orders,
                    'documentation_rate': round((documented_orders / total_orders * 100), 2) if total_orders > 0 else 0
                },
                'delivery_tracking': {
                    'delivered_orders': delivered_orders,
                    'delivery_confirmation_rate': round((delivered_orders / total_orders * 100), 2) if total_orders > 0 else 0
                },
                'large_order_approval': {
                    'large_orders_count': large_orders.count(),
                    'large_orders_approved': large_orders_approved,
                    'large_order_approval_rate': round((large_orders_approved / large_orders.count() * 100), 2) if large_orders.count() > 0 else 0
                },
                'supplier_compliance': {
                    'total_active_suppliers': total_active_suppliers,
                    'compliant_suppliers': suppliers_with_valid_info,
                    'supplier_compliance_rate': round((suppliers_with_valid_info / total_active_suppliers * 100), 2) if total_active_suppliers > 0 else 0
                }
            },
            'recommendations': self._generate_compliance_recommendations(
                approved_orders / total_orders if total_orders > 0 else 0,
                documented_orders / total_orders if total_orders > 0 else 0,
                suppliers_with_valid_info / total_active_suppliers if total_active_suppliers > 0 else 0
            )
        }

    def _generate_compliance_recommendations(self, approval_rate: float,
                                           documentation_rate: float,
                                           supplier_compliance_rate: float) -> List[str]:
        """Generate compliance recommendations based on metrics."""
        recommendations = []

        if approval_rate < 0.9:
            recommendations.append("Improve approval workflow compliance - ensure all orders are properly approved")

        if documentation_rate < 0.8:
            recommendations.append("Enhance documentation practices - add detailed notes and justifications for purchases")

        if supplier_compliance_rate < 0.95:
            recommendations.append("Update supplier information - ensure all suppliers have valid ICE and IF numbers")

        if approval_rate > 0.95 and documentation_rate > 0.9 and supplier_compliance_rate > 0.95:
            recommendations.append("Excellent compliance performance - maintain current standards")

        return recommendations
