"""
Management dashboard and KPI tracking services.
"""
from decimal import Decimal
from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional
from django.db.models import Q, Sum, Count, Avg, F, Case, When, Value
from django.db.models.functions import Coalesce, Extract, TruncMonth, TruncQuarter, TruncYear, TruncDate
from django.utils.translation import gettext_lazy as _

from modules.accounting.models import Account, JournalEntry, JournalEntryLine
from modules.invoicing.models import Invoice, Payment
from modules.sales.models import SalesOrder, Customer
from modules.purchasing.models import PurchaseOrder, Supplier
from modules.inventory.models import StockMove
from core.companies.models import Company


class ManagementDashboardService:
    """Service for generating management dashboard data and KPIs."""
    
    def __init__(self, company: Company):
        self.company = company
    
    def generate_executive_dashboard(
        self,
        period_days: int = 30
    ) -> Dict[str, Any]:
        """Generate executive dashboard with key metrics."""
        
        end_date = date.today()
        start_date = end_date - timedelta(days=period_days)
        
        # Financial metrics
        financial_metrics = self._get_financial_metrics(start_date, end_date)
        
        # Sales metrics
        sales_metrics = self._get_sales_metrics(start_date, end_date)
        
        # Purchasing metrics
        purchasing_metrics = self._get_purchasing_metrics(start_date, end_date)
        
        # Inventory metrics
        inventory_metrics = self._get_inventory_metrics()
        
        # Cash flow metrics
        cash_flow_metrics = self._get_cash_flow_metrics(start_date, end_date)
        
        # Trends and charts data
        trends = self._get_trend_data(start_date, end_date)
        
        return {
            'period': {
                'start_date': start_date,
                'end_date': end_date,
                'days': period_days
            },
            'financial_metrics': financial_metrics,
            'sales_metrics': sales_metrics,
            'purchasing_metrics': purchasing_metrics,
            'inventory_metrics': inventory_metrics,
            'cash_flow_metrics': cash_flow_metrics,
            'trends': trends,
            'generated_at': datetime.now()
        }
    
    def _get_financial_metrics(self, start_date: date, end_date: date) -> Dict[str, Any]:
        """Get key financial metrics."""
        
        # Revenue
        total_revenue = Invoice.objects.filter(
            company=self.company,
            invoice_type='CUSTOMER',
            state='POSTED',
            invoice_date__range=[start_date, end_date]
        ).aggregate(
            total=Coalesce(Sum('total_amount'), Decimal('0'))
        )['total']
        
        # Expenses
        total_expenses = Invoice.objects.filter(
            company=self.company,
            invoice_type='SUPPLIER',
            state='POSTED',
            invoice_date__range=[start_date, end_date]
        ).aggregate(
            total=Coalesce(Sum('total_amount'), Decimal('0'))
        )['total']
        
        # Net income
        net_income = total_revenue - total_expenses
        
        # Profit margin
        profit_margin = (net_income / total_revenue * 100) if total_revenue > 0 else 0
        
        # Outstanding receivables
        outstanding_receivables = Invoice.objects.filter(
            company=self.company,
            invoice_type='CUSTOMER',
            state='POSTED',
            outstanding_amount__gt=0
        ).aggregate(
            total=Coalesce(Sum('outstanding_amount'), Decimal('0'))
        )['total']
        
        # Outstanding payables
        outstanding_payables = Invoice.objects.filter(
            company=self.company,
            invoice_type='SUPPLIER',
            state='POSTED',
            outstanding_amount__gt=0
        ).aggregate(
            total=Coalesce(Sum('outstanding_amount'), Decimal('0'))
        )['total']
        
        # Previous period comparison
        prev_start = start_date - timedelta(days=(end_date - start_date).days)
        prev_end = start_date - timedelta(days=1)
        
        prev_revenue = Invoice.objects.filter(
            company=self.company,
            invoice_type='CUSTOMER',
            state='POSTED',
            invoice_date__range=[prev_start, prev_end]
        ).aggregate(
            total=Coalesce(Sum('total_amount'), Decimal('0'))
        )['total']
        
        revenue_growth = ((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue > 0 else 0
        
        return {
            'total_revenue': total_revenue,
            'total_expenses': total_expenses,
            'net_income': net_income,
            'profit_margin': profit_margin,
            'outstanding_receivables': outstanding_receivables,
            'outstanding_payables': outstanding_payables,
            'revenue_growth': revenue_growth
        }
    
    def _get_sales_metrics(self, start_date: date, end_date: date) -> Dict[str, Any]:
        """Get sales performance metrics."""
        
        # Sales orders
        sales_orders = SalesOrder.objects.filter(
            company=self.company,
            order_date__range=[start_date, end_date]
        )
        
        total_orders = sales_orders.count()
        total_order_value = sales_orders.aggregate(
            total=Coalesce(Sum('total_amount'), Decimal('0'))
        )['total']
        
        avg_order_value = total_order_value / total_orders if total_orders > 0 else Decimal('0')
        
        # Customer invoices
        customer_invoices = Invoice.objects.filter(
            company=self.company,
            invoice_type='CUSTOMER',
            state='POSTED',
            invoice_date__range=[start_date, end_date]
        )
        
        total_invoices = customer_invoices.count()
        total_invoice_value = customer_invoices.aggregate(
            total=Coalesce(Sum('total_amount'), Decimal('0'))
        )['total']
        
        # Top customers
        top_customers = customer_invoices.values(
            'customer__name'
        ).annotate(
            total_amount=Sum('total_amount'),
            invoice_count=Count('id')
        ).order_by('-total_amount')[:5]
        
        # Conversion rate (orders to invoices)
        conversion_rate = (total_invoices / total_orders * 100) if total_orders > 0 else 0
        
        return {
            'total_orders': total_orders,
            'total_order_value': total_order_value,
            'avg_order_value': avg_order_value,
            'total_invoices': total_invoices,
            'total_invoice_value': total_invoice_value,
            'conversion_rate': conversion_rate,
            'top_customers': list(top_customers)
        }
    
    def _get_purchasing_metrics(self, start_date: date, end_date: date) -> Dict[str, Any]:
        """Get purchasing performance metrics."""
        
        # Purchase orders
        purchase_orders = PurchaseOrder.objects.filter(
            company=self.company,
            order_date__range=[start_date, end_date]
        )
        
        total_pos = purchase_orders.count()
        total_po_value = purchase_orders.aggregate(
            total=Coalesce(Sum('total_amount'), Decimal('0'))
        )['total']
        
        avg_po_value = total_po_value / total_pos if total_pos > 0 else Decimal('0')
        
        # Supplier invoices
        supplier_invoices = Invoice.objects.filter(
            company=self.company,
            invoice_type='SUPPLIER',
            state='POSTED',
            invoice_date__range=[start_date, end_date]
        )
        
        total_supplier_invoices = supplier_invoices.count()
        total_supplier_value = supplier_invoices.aggregate(
            total=Coalesce(Sum('total_amount'), Decimal('0'))
        )['total']
        
        # Top suppliers
        top_suppliers = supplier_invoices.values(
            'supplier__name'
        ).annotate(
            total_amount=Sum('total_amount'),
            invoice_count=Count('id')
        ).order_by('-total_amount')[:5]
        
        return {
            'total_purchase_orders': total_pos,
            'total_po_value': total_po_value,
            'avg_po_value': avg_po_value,
            'total_supplier_invoices': total_supplier_invoices,
            'total_supplier_value': total_supplier_value,
            'top_suppliers': list(top_suppliers)
        }
    
    def _get_inventory_metrics(self) -> Dict[str, Any]:
        """Get inventory performance metrics."""
        
        # Get recent stock movements
        recent_movements = StockMovement.objects.filter(
            company=self.company,
            movement_date__gte=date.today() - timedelta(days=30)
        )
        
        total_movements = recent_movements.count()
        
        # Stock in movements
        stock_in = recent_movements.filter(
            movement_type__in=['RECEIPT', 'ADJUSTMENT_IN', 'RETURN_IN']
        ).aggregate(
            total=Coalesce(Sum('quantity'), Decimal('0'))
        )['total']
        
        # Stock out movements
        stock_out = recent_movements.filter(
            movement_type__in=['DELIVERY', 'ADJUSTMENT_OUT', 'RETURN_OUT']
        ).aggregate(
            total=Coalesce(Sum('quantity'), Decimal('0'))
        )['total']
        
        # Net stock movement
        net_movement = stock_in - stock_out
        
        # TODO: Add inventory value and turnover calculations when product costing is available
        
        return {
            'total_movements': total_movements,
            'stock_in': stock_in,
            'stock_out': stock_out,
            'net_movement': net_movement
        }
    
    def _get_cash_flow_metrics(self, start_date: date, end_date: date) -> Dict[str, Any]:
        """Get cash flow metrics."""
        
        # Customer payments received
        customer_payments = Payment.objects.filter(
            company=self.company,
            payment_type='CUSTOMER',
            state='CONFIRMED',
            payment_date__range=[start_date, end_date]
        ).aggregate(
            total=Coalesce(Sum('amount'), Decimal('0'))
        )['total']
        
        # Supplier payments made
        supplier_payments = Payment.objects.filter(
            company=self.company,
            payment_type='SUPPLIER',
            state='CONFIRMED',
            payment_date__range=[start_date, end_date]
        ).aggregate(
            total=Coalesce(Sum('amount'), Decimal('0'))
        )['total']
        
        # Net cash flow
        net_cash_flow = customer_payments - supplier_payments
        
        # Current cash position (from cash accounts)
        cash_accounts = Account.objects.filter(
            company=self.company,
            code__startswith='511',  # Cash and bank accounts
            is_active=True
        )
        
        current_cash = cash_accounts.aggregate(
            total=Coalesce(Sum('current_balance'), Decimal('0'))
        )['total']
        
        return {
            'customer_payments': customer_payments,
            'supplier_payments': supplier_payments,
            'net_cash_flow': net_cash_flow,
            'current_cash_position': current_cash
        }
    
    def _get_trend_data(self, start_date: date, end_date: date) -> Dict[str, Any]:
        """Get trend data for charts."""
        
        # Daily revenue trend
        daily_revenue = Invoice.objects.filter(
            company=self.company,
            invoice_type='CUSTOMER',
            state='POSTED',
            invoice_date__range=[start_date, end_date]
        ).annotate(
            day=TruncDate('invoice_date')
        ).values('day').annotate(
            revenue=Sum('total_amount')
        ).order_by('day')
        
        # Monthly comparison (last 12 months)
        twelve_months_ago = end_date - timedelta(days=365)
        monthly_revenue = Invoice.objects.filter(
            company=self.company,
            invoice_type='CUSTOMER',
            state='POSTED',
            invoice_date__range=[twelve_months_ago, end_date]
        ).annotate(
            month=TruncMonth('invoice_date')
        ).values('month').annotate(
            revenue=Sum('total_amount'),
            invoice_count=Count('id')
        ).order_by('month')
        
        # Cash flow trend
        daily_cash_flow = []
        current_date = start_date
        while current_date <= end_date:
            day_payments_in = Payment.objects.filter(
                company=self.company,
                payment_type='CUSTOMER',
                state='CONFIRMED',
                payment_date=current_date
            ).aggregate(
                total=Coalesce(Sum('amount'), Decimal('0'))
            )['total']
            
            day_payments_out = Payment.objects.filter(
                company=self.company,
                payment_type='SUPPLIER',
                state='CONFIRMED',
                payment_date=current_date
            ).aggregate(
                total=Coalesce(Sum('amount'), Decimal('0'))
            )['total']
            
            daily_cash_flow.append({
                'date': current_date,
                'cash_in': day_payments_in,
                'cash_out': day_payments_out,
                'net_flow': day_payments_in - day_payments_out
            })
            
            current_date += timedelta(days=1)
        
        return {
            'daily_revenue': list(daily_revenue),
            'monthly_revenue': list(monthly_revenue),
            'daily_cash_flow': daily_cash_flow
        }
    
    def generate_kpi_scorecard(self) -> Dict[str, Any]:
        """Generate KPI scorecard with targets and performance."""
        
        # Define KPI targets (these could be configurable)
        kpi_targets = {
            'revenue_growth': 10.0,  # 10% monthly growth
            'profit_margin': 15.0,   # 15% profit margin
            'cash_conversion': 30,    # 30 days cash conversion cycle
            'customer_satisfaction': 90.0,  # 90% satisfaction
            'inventory_turnover': 12.0,     # 12 times per year
        }
        
        # Calculate actual KPIs
        end_date = date.today()
        start_date = end_date - timedelta(days=30)
        
        financial_metrics = self._get_financial_metrics(start_date, end_date)
        
        # Revenue growth (already calculated)
        revenue_growth = financial_metrics['revenue_growth']
        
        # Profit margin (already calculated)
        profit_margin = financial_metrics['profit_margin']
        
        # Cash conversion cycle (simplified)
        # TODO: Implement proper cash conversion cycle calculation
        cash_conversion = 30  # Placeholder
        
        # Customer satisfaction (placeholder - would need customer feedback system)
        customer_satisfaction = 85.0  # Placeholder
        
        # Inventory turnover (placeholder - would need COGS and average inventory)
        inventory_turnover = 10.0  # Placeholder
        
        # Calculate performance scores
        kpis = {}
        actual_values = {
            'revenue_growth': revenue_growth,
            'profit_margin': profit_margin,
            'cash_conversion': cash_conversion,
            'customer_satisfaction': customer_satisfaction,
            'inventory_turnover': inventory_turnover,
        }
        
        for kpi_name, target in kpi_targets.items():
            actual = actual_values[kpi_name]
            
            # Calculate performance score (0-100%)
            if kpi_name == 'cash_conversion':
                # Lower is better for cash conversion
                performance = min(100, (target / actual * 100)) if actual > 0 else 0
            else:
                # Higher is better for other KPIs
                performance = min(100, (actual / target * 100)) if target > 0 else 0
            
            # Determine status
            if performance >= 90:
                status = 'excellent'
            elif performance >= 75:
                status = 'good'
            elif performance >= 60:
                status = 'fair'
            else:
                status = 'poor'
            
            kpis[kpi_name] = {
                'name': kpi_name.replace('_', ' ').title(),
                'actual': actual,
                'target': target,
                'performance': performance,
                'status': status
            }
        
        # Overall score
        overall_score = sum(kpi['performance'] for kpi in kpis.values()) / len(kpis)
        
        return {
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'kpis': kpis,
            'overall_score': overall_score,
            'generated_at': datetime.now()
        }
