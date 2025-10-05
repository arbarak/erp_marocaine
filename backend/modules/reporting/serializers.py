"""
Serializers for reporting module.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import ReportTemplate, ReportExecution, Dashboard, AuditLog

User = get_user_model()


class ReportTemplateSerializer(serializers.ModelSerializer):
    """Serializer for ReportTemplate model."""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    allowed_users_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportTemplate
        fields = [
            'id', 'name', 'description', 'report_type', 'template_config',
            'default_format', 'is_public', 'allowed_users', 'is_active',
            'created_at', 'updated_at', 'created_by', 'created_by_name',
            'allowed_users_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def get_allowed_users_count(self, obj):
        """Get count of allowed users."""
        return obj.allowed_users.count()


class ReportTemplateCreateSerializer(ReportTemplateSerializer):
    """Serializer for creating report templates."""
    
    def create(self, validated_data):
        """Create report template with company context."""
        validated_data['company'] = self.context['request'].user.current_company
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ReportExecutionSerializer(serializers.ModelSerializer):
    """Serializer for ReportExecution model."""
    
    template_name = serializers.CharField(source='template.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    duration_seconds = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportExecution
        fields = [
            'id', 'template', 'template_name', 'name', 'parameters', 'format',
            'status', 'progress', 'file_path', 'file_size', 'started_at',
            'completed_at', 'error_message', 'created_at', 'updated_at',
            'created_by', 'created_by_name', 'duration_seconds'
        ]
        read_only_fields = [
            'id', 'status', 'progress', 'file_path', 'file_size',
            'started_at', 'completed_at', 'error_message',
            'created_at', 'updated_at', 'created_by'
        ]
    
    def get_duration_seconds(self, obj):
        """Get execution duration in seconds."""
        if obj.duration:
            return obj.duration.total_seconds()
        return None


class ReportExecutionCreateSerializer(ReportExecutionSerializer):
    """Serializer for creating report executions."""
    
    def create(self, validated_data):
        """Create report execution with company context."""
        validated_data['company'] = self.context['request'].user.current_company
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class DashboardSerializer(serializers.ModelSerializer):
    """Serializer for Dashboard model."""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    allowed_users_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Dashboard
        fields = [
            'id', 'name', 'description', 'layout_config', 'refresh_interval',
            'is_default', 'allowed_users', 'is_active', 'created_at',
            'updated_at', 'created_by', 'created_by_name', 'allowed_users_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def get_allowed_users_count(self, obj):
        """Get count of allowed users."""
        return obj.allowed_users.count()


class DashboardCreateSerializer(DashboardSerializer):
    """Serializer for creating dashboards."""
    
    def create(self, validated_data):
        """Create dashboard with company context."""
        validated_data['company'] = self.context['request'].user.current_company
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for AuditLog model."""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    content_type_name = serializers.CharField(source='content_type.name', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'action_type', 'description', 'content_type', 'content_type_name',
            'object_id', 'user', 'user_name', 'session_key', 'ip_address',
            'user_agent', 'old_values', 'new_values', 'severity', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


# Report parameter serializers
class ReportParametersSerializer(serializers.Serializer):
    """Base serializer for report parameters."""
    
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    format = serializers.ChoiceField(
        choices=['PDF', 'EXCEL', 'CSV', 'JSON'],
        default='PDF'
    )
    
    def validate(self, data):
        """Validate date range."""
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("Start date must be before end date")
        return data


class FinancialReportParametersSerializer(ReportParametersSerializer):
    """Serializer for financial report parameters."""
    
    include_comparison = serializers.BooleanField(default=False)
    comparison_start_date = serializers.DateField(required=False)
    comparison_end_date = serializers.DateField(required=False)
    include_budget = serializers.BooleanField(default=False)
    
    def validate(self, data):
        """Validate financial report parameters."""
        data = super().validate(data)
        
        if data.get('include_comparison'):
            if not data.get('comparison_start_date') or not data.get('comparison_end_date'):
                raise serializers.ValidationError(
                    "Comparison dates are required when include_comparison is True"
                )
            
            if data['comparison_start_date'] > data['comparison_end_date']:
                raise serializers.ValidationError(
                    "Comparison start date must be before comparison end date"
                )
        
        return data


class TaxComplianceReportParametersSerializer(ReportParametersSerializer):
    """Serializer for tax compliance report parameters."""
    
    declaration_type = serializers.ChoiceField(
        choices=['MONTHLY', 'QUARTERLY', 'ANNUAL'],
        default='MONTHLY'
    )
    include_ras_tva = serializers.BooleanField(default=True)
    include_corporate_tax = serializers.BooleanField(default=False)


class DashboardParametersSerializer(serializers.Serializer):
    """Serializer for dashboard parameters."""
    
    period_days = serializers.IntegerField(default=30, min_value=1, max_value=365)
    refresh_data = serializers.BooleanField(default=True)


class AuditReportParametersSerializer(ReportParametersSerializer):
    """Serializer for audit report parameters."""
    
    user_id = serializers.UUIDField(required=False)
    action_types = serializers.ListField(
        child=serializers.ChoiceField(choices=[
            'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT',
            'IMPORT', 'LOGIN', 'LOGOUT', 'SYSTEM'
        ]),
        required=False
    )
    severity_levels = serializers.ListField(
        child=serializers.ChoiceField(choices=[
            'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
        ]),
        required=False
    )


# Response serializers for API endpoints
class FinancialMetricsSerializer(serializers.Serializer):
    """Serializer for financial metrics response."""
    
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_income = serializers.DecimalField(max_digits=15, decimal_places=2)
    profit_margin = serializers.DecimalField(max_digits=5, decimal_places=2)
    outstanding_receivables = serializers.DecimalField(max_digits=15, decimal_places=2)
    outstanding_payables = serializers.DecimalField(max_digits=15, decimal_places=2)
    revenue_growth = serializers.DecimalField(max_digits=5, decimal_places=2)


class SalesMetricsSerializer(serializers.Serializer):
    """Serializer for sales metrics response."""
    
    total_orders = serializers.IntegerField()
    total_order_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    avg_order_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_invoices = serializers.IntegerField()
    total_invoice_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    conversion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    top_customers = serializers.ListField(child=serializers.DictField())


class CashFlowMetricsSerializer(serializers.Serializer):
    """Serializer for cash flow metrics response."""
    
    customer_payments = serializers.DecimalField(max_digits=15, decimal_places=2)
    supplier_payments = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_cash_flow = serializers.DecimalField(max_digits=15, decimal_places=2)
    current_cash_position = serializers.DecimalField(max_digits=15, decimal_places=2)


class ExecutiveDashboardSerializer(serializers.Serializer):
    """Serializer for executive dashboard response."""
    
    period = serializers.DictField()
    financial_metrics = FinancialMetricsSerializer()
    sales_metrics = SalesMetricsSerializer()
    purchasing_metrics = serializers.DictField()
    inventory_metrics = serializers.DictField()
    cash_flow_metrics = CashFlowMetricsSerializer()
    trends = serializers.DictField()
    generated_at = serializers.DateTimeField()


class KPIScorecardSerializer(serializers.Serializer):
    """Serializer for KPI scorecard response."""
    
    period = serializers.DictField()
    kpis = serializers.DictField()
    overall_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    generated_at = serializers.DateTimeField()


class TaxDeclarationSerializer(serializers.Serializer):
    """Serializer for tax declaration response."""
    
    declaration_info = serializers.DictField()
    tva_collected = serializers.DictField()
    tva_paid = serializers.DictField()
    net_tva_due = serializers.DecimalField(max_digits=15, decimal_places=2)
    previous_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    final_amount_due = serializers.DecimalField(max_digits=15, decimal_places=2)
    payment_due_date = serializers.DateField()


class ComplianceReportSerializer(serializers.Serializer):
    """Serializer for compliance report response."""
    
    company = serializers.DictField()
    compliance_items = serializers.ListField(child=serializers.DictField())
    summary = serializers.DictField()
    generated_at = serializers.DateTimeField()


class DataIntegrityReportSerializer(serializers.Serializer):
    """Serializer for data integrity report response."""
    
    company = serializers.CharField()
    checks = serializers.ListField(child=serializers.DictField())
    summary = serializers.DictField()
    checked_at = serializers.DateTimeField()


class AuditReportSerializer(serializers.Serializer):
    """Serializer for audit report response."""

    period = serializers.DictField()
    summary = serializers.DictField()
    daily_activity = serializers.ListField(child=serializers.DictField())
    high_severity_actions = serializers.ListField(child=serializers.DictField())
    generated_at = serializers.DateTimeField()
