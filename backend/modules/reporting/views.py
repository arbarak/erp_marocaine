"""
Views for reporting module.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.translation import gettext_lazy as _

from core.permissions import CompanyContextPermission
from .models import ReportTemplate, ReportExecution, Dashboard, AuditLog
from .serializers import (
    ReportTemplateSerializer, ReportTemplateCreateSerializer,
    ReportExecutionSerializer, ReportExecutionCreateSerializer,
    DashboardSerializer, DashboardCreateSerializer,
    AuditLogSerializer, FinancialReportParametersSerializer,
    TaxComplianceReportParametersSerializer, DashboardParametersSerializer,
    AuditReportParametersSerializer, ExecutiveDashboardSerializer,
    KPIScorecardSerializer, TaxDeclarationSerializer,
    ComplianceReportSerializer, DataIntegrityReportSerializer,
    AuditReportSerializer
)
from .financial_reports import (
    AdvancedFinancialReportService, KPIAnalyticsService,
    AgedReportsService, StockValuationReportService,
    VATReportService, ReportExportService
)
from .tax_compliance import MoroccanTaxComplianceService
from .dashboard_service import ManagementDashboardService
from .audit_service import AuditTrailService


class ReportTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing report templates."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['report_type', 'is_active', 'is_public']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter templates by company."""
        return ReportTemplate.objects.filter(
            company=self.request.user.current_company
        )
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'create':
            return ReportTemplateCreateSerializer
        return ReportTemplateSerializer


class ReportExecutionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing report executions."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['template', 'status', 'format']
    search_fields = ['name']
    ordering_fields = ['created_at', 'started_at', 'completed_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter executions by company."""
        return ReportExecution.objects.filter(
            company=self.request.user.current_company
        )
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'create':
            return ReportExecutionCreateSerializer
        return ReportExecutionSerializer
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a running report execution."""
        execution = self.get_object()
        
        if execution.status not in ['PENDING', 'RUNNING']:
            return Response(
                {'error': _('Can only cancel pending or running executions')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        execution.status = 'CANCELLED'
        execution.save()
        
        return Response({'message': _('Execution cancelled successfully')})


class DashboardViewSet(viewsets.ModelViewSet):
    """ViewSet for managing dashboards."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active', 'is_default']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter dashboards by company."""
        return Dashboard.objects.filter(
            company=self.request.user.current_company
        )
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'create':
            return DashboardCreateSerializer
        return DashboardSerializer
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """Set dashboard as default."""
        dashboard = self.get_object()
        
        # Remove default from other dashboards
        Dashboard.objects.filter(
            company=request.user.current_company,
            is_default=True
        ).update(is_default=False)
        
        # Set this dashboard as default
        dashboard.is_default = True
        dashboard.save()
        
        return Response({'message': _('Dashboard set as default')})


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing audit logs."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    serializer_class = AuditLogSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['action_type', 'severity', 'user']
    search_fields = ['description', 'user__email']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']
    
    def get_queryset(self):
        """Filter audit logs by company."""
        return AuditLog.objects.filter(
            company=self.request.user.current_company
        )


class FinancialReportsViewSet(viewsets.ViewSet):
    """ViewSet for financial reports."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    
    @action(detail=False, methods=['post'])
    def detailed_pnl(self, request):
        """Generate detailed P&L report."""
        serializer = FinancialReportParametersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        params = serializer.validated_data
        service = AdvancedFinancialReportService(request.user.current_company)
        
        comparison_period = None
        if params.get('include_comparison'):
            comparison_period = (
                params['comparison_start_date'],
                params['comparison_end_date']
            )
        
        report_data = service.generate_detailed_pnl(
            start_date=params['start_date'],
            end_date=params['end_date'],
            comparison_period=comparison_period,
            include_budget=params.get('include_budget', False)
        )
        
        return Response(report_data)
    
    @action(detail=False, methods=['post'])
    def cash_flow_analysis(self, request):
        """Generate cash flow analysis."""
        serializer = FinancialReportParametersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        params = serializer.validated_data
        service = AdvancedFinancialReportService(request.user.current_company)
        
        report_data = service.generate_cash_flow_analysis(
            start_date=params['start_date'],
            end_date=params['end_date'],
            forecast_days=30
        )
        
        return Response(report_data)
    
    @action(detail=False, methods=['post'])
    def balance_sheet_comparison(self, request):
        """Generate balance sheet comparison."""
        serializer = FinancialReportParametersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        params = serializer.validated_data
        service = AdvancedFinancialReportService(request.user.current_company)
        
        if not params.get('include_comparison'):
            return Response(
                {'error': _('Comparison period is required for balance sheet comparison')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        report_data = service.generate_balance_sheet_comparison(
            as_of_date=params['end_date'],
            comparison_date=params['comparison_end_date']
        )
        
        return Response(report_data)
    
    @action(detail=False, methods=['post'])
    def kpi_analytics(self, request):
        """Generate KPI analytics."""
        serializer = FinancialReportParametersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        params = serializer.validated_data
        service = KPIAnalyticsService(request.user.current_company)
        
        report_data = service.generate_financial_kpis(
            start_date=params['start_date'],
            end_date=params['end_date']
        )
        
        return Response(report_data)


class TaxComplianceViewSet(viewsets.ViewSet):
    """ViewSet for tax compliance reports."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    
    @action(detail=False, methods=['post'])
    def tva_declaration(self, request):
        """Generate TVA declaration."""
        serializer = TaxComplianceReportParametersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        params = serializer.validated_data
        service = MoroccanTaxComplianceService(request.user.current_company)
        
        report_data = service.generate_tva_declaration(
            start_date=params['start_date'],
            end_date=params['end_date'],
            declaration_type=params['declaration_type']
        )
        
        return Response(report_data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def ras_tva_report(self, request):
        """Generate RAS/TVA report."""
        serializer = TaxComplianceReportParametersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        params = serializer.validated_data
        service = MoroccanTaxComplianceService(request.user.current_company)
        
        report_data = service.generate_ras_tva_report(
            start_date=params['start_date'],
            end_date=params['end_date']
        )
        
        return Response(report_data)


class Phase8ComplianceReportsViewSet(viewsets.ViewSet):
    """ViewSet for Phase 8 compliance and business reports."""

    permission_classes = [IsAuthenticated, CompanyContextPermission]

    @action(detail=False, methods=['post'])
    def aged_ar_report(self, request):
        """Generate Aged Accounts Receivable report."""
        from datetime import date

        as_of_date = request.data.get('as_of_date')
        if as_of_date:
            as_of_date = date.fromisoformat(as_of_date)

        service = AgedReportsService(request.user.current_company)
        report_data = service.generate_aged_ar_report(as_of_date)

        return Response(report_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def aged_ap_report(self, request):
        """Generate Aged Accounts Payable report."""
        from datetime import date

        as_of_date = request.data.get('as_of_date')
        if as_of_date:
            as_of_date = date.fromisoformat(as_of_date)

        service = AgedReportsService(request.user.current_company)
        report_data = service.generate_aged_ap_report(as_of_date)

        return Response(report_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def stock_valuation_report(self, request):
        """Generate Stock Valuation report."""
        from datetime import date

        as_of_date = request.data.get('as_of_date')
        if as_of_date:
            as_of_date = date.fromisoformat(as_of_date)

        warehouse_id = request.data.get('warehouse_id')

        service = StockValuationReportService(request.user.current_company)
        report_data = service.generate_stock_valuation_report(as_of_date, warehouse_id)

        return Response(report_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def sales_by_vat_rate(self, request):
        """Generate Sales by VAT Rate report."""
        from datetime import date

        start_date = date.fromisoformat(request.data['start_date'])
        end_date = date.fromisoformat(request.data['end_date'])

        service = VATReportService(request.user.current_company)
        report_data = service.generate_sales_by_vat_rate_report(start_date, end_date)

        return Response(report_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def purchases_by_vat_rate(self, request):
        """Generate Purchases by VAT Rate report."""
        from datetime import date

        start_date = date.fromisoformat(request.data['start_date'])
        end_date = date.fromisoformat(request.data['end_date'])

        service = VATReportService(request.user.current_company)
        report_data = service.generate_purchases_by_vat_rate_report(start_date, end_date)

        return Response(report_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def export_aged_ar_csv(self, request):
        """Export Aged AR report to CSV."""
        from datetime import date
        from django.http import HttpResponse

        as_of_date = request.data.get('as_of_date')
        if as_of_date:
            as_of_date = date.fromisoformat(as_of_date)

        # Generate report data
        aged_service = AgedReportsService(request.user.current_company)
        report_data = aged_service.generate_aged_ar_report(as_of_date)

        # Export to CSV
        export_service = ReportExportService(request.user.current_company)
        csv_content = export_service.export_aged_ar_to_csv(report_data)

        # Return CSV response
        response = HttpResponse(csv_content, content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="comptes_clients_ages_{as_of_date or "today"}.csv"'

        return response

    @action(detail=False, methods=['post'])
    def export_aged_ap_csv(self, request):
        """Export Aged AP report to CSV."""
        from datetime import date
        from django.http import HttpResponse

        as_of_date = request.data.get('as_of_date')
        if as_of_date:
            as_of_date = date.fromisoformat(as_of_date)

        # Generate report data
        aged_service = AgedReportsService(request.user.current_company)
        report_data = aged_service.generate_aged_ap_report(as_of_date)

        # Export to CSV
        export_service = ReportExportService(request.user.current_company)
        csv_content = export_service.export_aged_ap_to_csv(report_data)

        # Return CSV response
        response = HttpResponse(csv_content, content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="comptes_fournisseurs_ages_{as_of_date or "today"}.csv"'

        return response

    @action(detail=False, methods=['post'])
    def export_stock_valuation_csv(self, request):
        """Export Stock Valuation report to CSV."""
        from datetime import date
        from django.http import HttpResponse

        as_of_date = request.data.get('as_of_date')
        if as_of_date:
            as_of_date = date.fromisoformat(as_of_date)

        warehouse_id = request.data.get('warehouse_id')

        # Generate report data
        valuation_service = StockValuationReportService(request.user.current_company)
        report_data = valuation_service.generate_stock_valuation_report(as_of_date, warehouse_id)

        # Export to CSV
        export_service = ReportExportService(request.user.current_company)
        csv_content = export_service.export_stock_valuation_to_csv(report_data)

        # Return CSV response
        response = HttpResponse(csv_content, content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="valorisation_stock_{as_of_date or "today"}.csv"'

        return response

    @action(detail=False, methods=['post'])
    def export_vat_sales_csv(self, request):
        """Export Sales by VAT Rate report to CSV."""
        from datetime import date
        from django.http import HttpResponse

        start_date = date.fromisoformat(request.data['start_date'])
        end_date = date.fromisoformat(request.data['end_date'])

        # Generate report data
        vat_service = VATReportService(request.user.current_company)
        report_data = vat_service.generate_sales_by_vat_rate_report(start_date, end_date)

        # Export to CSV
        export_service = ReportExportService(request.user.current_company)
        csv_content = export_service.export_vat_sales_to_csv(report_data)

        # Return CSV response
        response = HttpResponse(csv_content, content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="ventes_par_taux_tva_{start_date}_{end_date}.csv"'

        return response
    
    @action(detail=False, methods=['post'])
    def tax_summary(self, request):
        """Generate comprehensive tax summary."""
        serializer = TaxComplianceReportParametersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        params = serializer.validated_data
        service = MoroccanTaxComplianceService(request.user.current_company)
        
        report_data = service.generate_tax_summary_report(
            start_date=params['start_date'],
            end_date=params['end_date']
        )
        
        return Response(report_data)
    
    @action(detail=False, methods=['get'])
    def compliance_checklist(self, request):
        """Generate DGI compliance checklist."""
        service = MoroccanTaxComplianceService(request.user.current_company)
        report_data = service.generate_dgi_compliance_checklist()
        
        serializer = ComplianceReportSerializer(data=report_data)
        serializer.is_valid(raise_exception=True)
        
        return Response(serializer.validated_data)


class ManagementDashboardViewSet(viewsets.ViewSet):
    """ViewSet for management dashboards."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    
    @action(detail=False, methods=['post'])
    def executive_dashboard(self, request):
        """Generate executive dashboard."""
        serializer = DashboardParametersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        params = serializer.validated_data
        service = ManagementDashboardService(request.user.current_company)
        
        dashboard_data = service.generate_executive_dashboard(
            period_days=params['period_days']
        )
        
        response_serializer = ExecutiveDashboardSerializer(data=dashboard_data)
        response_serializer.is_valid(raise_exception=True)
        
        return Response(response_serializer.validated_data)
    
    @action(detail=False, methods=['get'])
    def kpi_scorecard(self, request):
        """Generate KPI scorecard."""
        service = ManagementDashboardService(request.user.current_company)
        scorecard_data = service.generate_kpi_scorecard()
        
        serializer = KPIScorecardSerializer(data=scorecard_data)
        serializer.is_valid(raise_exception=True)
        
        return Response(serializer.validated_data)


class AuditReportsViewSet(viewsets.ViewSet):
    """ViewSet for audit and compliance reports."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    
    @action(detail=False, methods=['post'])
    def audit_trail(self, request):
        """Generate audit trail report."""
        serializer = AuditReportParametersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        params = serializer.validated_data
        service = AuditTrailService(request.user.current_company)
        
        report_data = service.generate_audit_report(
            start_date=params['start_date'],
            end_date=params['end_date'],
            user_id=params.get('user_id'),
            action_types=params.get('action_types'),
            severity_levels=params.get('severity_levels')
        )
        
        response_serializer = AuditReportSerializer(data=report_data)
        response_serializer.is_valid(raise_exception=True)
        
        return Response(response_serializer.validated_data)
    
    @action(detail=False, methods=['get'])
    def data_integrity(self, request):
        """Generate data integrity report."""
        service = AuditTrailService(request.user.current_company)
        report_data = service.check_data_integrity()
        
        serializer = DataIntegrityReportSerializer(data=report_data)
        serializer.is_valid(raise_exception=True)
        
        return Response(serializer.validated_data)
    
    @action(detail=False, methods=['get'])
    def compliance_status(self, request):
        """Generate compliance status report."""
        service = AuditTrailService(request.user.current_company)
        report_data = service.generate_compliance_report()
        
        serializer = ComplianceReportSerializer(data=report_data)
        serializer.is_valid(raise_exception=True)
        
        return Response(serializer.validated_data)
