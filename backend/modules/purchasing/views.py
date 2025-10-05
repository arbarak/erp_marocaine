"""
Views for purchasing app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.translation import gettext_lazy as _
from django.db.models import Q, Sum, Avg, Count
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal

from core.permissions import CompanyContextPermission
from .models import (
    Supplier, SupplierContact, SupplierPriceList, SupplierCategory,
    RequestForQuotation, RFQLine, RFQSupplierInvitation,
    SupplierQuotation, SupplierQuotationLine,
    PurchaseOrder, PurchaseOrderLine,
    GoodsReceipt, GoodsReceiptLine
)
from .analytics import PurchaseAnalyticsService
from .serializers import (
    SupplierListSerializer, SupplierDetailSerializer, SupplierCreateSerializer,
    SupplierContactSerializer, SupplierPriceListSerializer,
    RequestForQuotationSerializer, RFQCreateSerializer,
    SupplierQuotationSerializer,
    PurchaseOrderSerializer, PurchaseOrderCreateSerializer,
    GoodsReceiptSerializer, GoodsReceiptCreateSerializer,
    PurchaseAnalyticsSerializer, SupplierPerformanceSerializer
)


class SupplierViewSet(viewsets.ModelViewSet):
    """ViewSet for Supplier model."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    
    def get_queryset(self):
        """Get suppliers for current company."""
        return Supplier.objects.filter(
            company=self.request.user.current_company
        ).select_related('created_by', 'approved_by').prefetch_related('contacts')
    
    def get_serializer_class(self):
        """Get appropriate serializer class."""
        if self.action == 'list':
            return SupplierListSerializer
        elif self.action == 'create':
            return SupplierCreateSerializer
        else:
            return SupplierDetailSerializer
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a supplier."""
        supplier = self.get_object()
        
        if supplier.is_approved:
            return Response(
                {'error': _('Supplier is already approved')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        supplier.is_approved = True
        supplier.approved_by = request.user
        supplier.approved_at = timezone.now()
        supplier.save()
        
        return Response({'message': _('Supplier approved successfully')})
    
    @action(detail=True, methods=['post'])
    def reject_approval(self, request, pk=None):
        """Reject supplier approval."""
        supplier = self.get_object()
        
        supplier.is_approved = False
        supplier.approved_by = None
        supplier.approved_at = None
        supplier.save()
        
        return Response({'message': _('Supplier approval rejected')})
    
    @action(detail=True, methods=['get'])
    def contacts(self, request, pk=None):
        """Get supplier contacts."""
        supplier = self.get_object()
        contacts = supplier.contacts.filter(is_active=True)
        serializer = SupplierContactSerializer(contacts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def price_lists(self, request, pk=None):
        """Get supplier price lists."""
        supplier = self.get_object()
        price_lists = supplier.price_lists.filter(is_active=True)
        serializer = SupplierPriceListSerializer(price_lists, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def performance(self, request, pk=None):
        """Get supplier performance metrics."""
        supplier = self.get_object()
        
        # Get date range from query params
        days = int(request.query_params.get('days', 365))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Calculate performance metrics
        orders = supplier.purchase_orders.filter(
            order_date__range=[start_date, end_date],
            state__in=['CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED']
        )
        
        total_orders = orders.count()
        total_value = orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
        
        # On-time delivery calculation
        delivered_orders = orders.filter(state__in=['PARTIALLY_RECEIVED', 'RECEIVED'])
        on_time_orders = delivered_orders.filter(
            confirmed_delivery_date__lte=models.F('expected_delivery_date')
        ).count()
        
        on_time_percentage = Decimal('0')
        if delivered_orders.count() > 0:
            on_time_percentage = (on_time_orders / delivered_orders.count()) * 100
        
        # Quality metrics (placeholder - would be calculated from GRN data)
        quality_score = Decimal('85.0')  # Placeholder
        
        performance_data = {
            'supplier_id': supplier.id,
            'supplier_name': supplier.name,
            'period_start': start_date,
            'period_end': end_date,
            'total_orders': total_orders,
            'total_value': total_value,
            'orders_on_time': on_time_orders,
            'orders_late': delivered_orders.count() - on_time_orders,
            'on_time_percentage': on_time_percentage,
            'average_lead_time': Decimal('7.5'),  # Placeholder
            'quality_issues': 2,  # Placeholder
            'quality_score': quality_score,
        }
        
        serializer = SupplierPerformanceSerializer(performance_data)
        return Response(serializer.data)


class SupplierContactViewSet(viewsets.ModelViewSet):
    """ViewSet for SupplierContact model."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    serializer_class = SupplierContactSerializer
    
    def get_queryset(self):
        """Get contacts for suppliers of current company."""
        return SupplierContact.objects.filter(
            supplier__company=self.request.user.current_company
        ).select_related('supplier')


class SupplierPriceListViewSet(viewsets.ModelViewSet):
    """ViewSet for SupplierPriceList model."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    serializer_class = SupplierPriceListSerializer
    
    def get_queryset(self):
        """Get price lists for suppliers of current company."""
        return SupplierPriceList.objects.filter(
            supplier__company=self.request.user.current_company
        ).select_related('supplier', 'product', 'created_by')
    
    def perform_create(self, serializer):
        """Set created_by on create."""
        serializer.save(created_by=self.request.user)


class RequestForQuotationViewSet(viewsets.ModelViewSet):
    """ViewSet for RequestForQuotation model."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    
    def get_queryset(self):
        """Get RFQs for current company."""
        return RequestForQuotation.objects.filter(
            company=self.request.user.current_company
        ).select_related(
            'delivery_location', 'created_by', 'approved_by'
        ).prefetch_related('lines', 'supplier_invitations')
    
    def get_serializer_class(self):
        """Get appropriate serializer class."""
        if self.action == 'create':
            return RFQCreateSerializer
        else:
            return RequestForQuotationSerializer
    
    @action(detail=True, methods=['post'])
    def send_to_suppliers(self, request, pk=None):
        """Send RFQ to selected suppliers."""
        rfq = self.get_object()
        supplier_ids = request.data.get('supplier_ids', [])
        
        if not supplier_ids:
            return Response(
                {'error': _('At least one supplier must be selected')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            rfq.send_to_suppliers(supplier_ids, request.user)
            return Response({'message': _('RFQ sent to suppliers successfully')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def quotations(self, request, pk=None):
        """Get quotations for this RFQ."""
        rfq = self.get_object()
        quotations = SupplierQuotation.objects.filter(
            rfq_invitation__rfq=rfq
        ).select_related('rfq_invitation__supplier')
        
        serializer = SupplierQuotationSerializer(quotations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def comparison(self, request, pk=None):
        """Get quotation comparison for this RFQ."""
        rfq = self.get_object()
        
        # Get all quotations with their lines
        quotations = SupplierQuotation.objects.filter(
            rfq_invitation__rfq=rfq,
            state='SUBMITTED'
        ).prefetch_related('lines__rfq_line__product')
        
        comparison_data = []
        for quotation in quotations:
            supplier_data = {
                'supplier_id': quotation.rfq_invitation.supplier.id,
                'supplier_name': quotation.rfq_invitation.supplier.name,
                'quotation_id': quotation.id,
                'total_amount': quotation.total_amount,
                'payment_terms': quotation.payment_terms,
                'delivery_terms': quotation.delivery_terms,
                'lines': []
            }
            
            for line in quotation.lines.all():
                line_data = {
                    'product_id': line.rfq_line.product.id,
                    'product_name': line.rfq_line.product.name,
                    'quantity': line.quantity,
                    'unit_price': line.unit_price,
                    'total_price': line.total_price,
                    'lead_time_days': line.lead_time_days,
                    'delivery_date': line.delivery_date
                }
                supplier_data['lines'].append(line_data)
            
            comparison_data.append(supplier_data)
        
        return Response(comparison_data)


class SupplierQuotationViewSet(viewsets.ModelViewSet):
    """ViewSet for SupplierQuotation model."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    serializer_class = SupplierQuotationSerializer
    
    def get_queryset(self):
        """Get quotations for current company."""
        return SupplierQuotation.objects.filter(
            rfq_invitation__rfq__company=self.request.user.current_company
        ).select_related(
            'rfq_invitation__supplier', 'rfq_invitation__rfq', 'reviewed_by'
        ).prefetch_related('lines')
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit the quotation."""
        quotation = self.get_object()
        
        try:
            quotation.submit()
            return Response({'message': _('Quotation submitted successfully')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept the quotation."""
        quotation = self.get_object()
        
        quotation.state = 'ACCEPTED'
        quotation.reviewed_by = request.user
        quotation.reviewed_at = timezone.now()
        quotation.review_notes = request.data.get('notes', '')
        quotation.save()
        
        return Response({'message': _('Quotation accepted successfully')})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject the quotation."""
        quotation = self.get_object()
        
        quotation.state = 'REJECTED'
        quotation.reviewed_by = request.user
        quotation.reviewed_at = timezone.now()
        quotation.review_notes = request.data.get('notes', '')
        quotation.save()
        
        return Response({'message': _('Quotation rejected successfully')})


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """ViewSet for PurchaseOrder model."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    
    def get_queryset(self):
        """Get purchase orders for current company."""
        return PurchaseOrder.objects.filter(
            company=self.request.user.current_company
        ).select_related(
            'supplier', 'delivery_location', 'created_by', 'approved_by'
        ).prefetch_related('lines')
    
    def get_serializer_class(self):
        """Get appropriate serializer class."""
        if self.action == 'create':
            return PurchaseOrderCreateSerializer
        else:
            return PurchaseOrderSerializer

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve the purchase order."""
        purchase_order = self.get_object()

        try:
            purchase_order.approve(request.user)
            return Response({'message': _('Purchase order approved successfully')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject the purchase order."""
        purchase_order = self.get_object()
        reason = request.data.get('reason', '')

        try:
            purchase_order.reject(request.user, reason)
            return Response({'message': _('Purchase order rejected successfully')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def send_to_supplier(self, request, pk=None):
        """Send purchase order to supplier."""
        purchase_order = self.get_object()

        try:
            purchase_order.send_to_supplier()
            return Response({'message': _('Purchase order sent to supplier successfully')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def confirm_by_supplier(self, request, pk=None):
        """Confirm purchase order by supplier."""
        purchase_order = self.get_object()
        confirmed_delivery_date = request.data.get('confirmed_delivery_date')

        try:
            purchase_order.confirm_by_supplier(confirmed_delivery_date)
            return Response({'message': _('Purchase order confirmed by supplier')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel the purchase order."""
        purchase_order = self.get_object()
        reason = request.data.get('reason', '')

        try:
            purchase_order.cancel(reason)
            return Response({'message': _('Purchase order cancelled successfully')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def receipts(self, request, pk=None):
        """Get goods receipts for this purchase order."""
        purchase_order = self.get_object()
        receipts = purchase_order.goods_receipts.all()
        serializer = GoodsReceiptSerializer(receipts, many=True)
        return Response(serializer.data)


class GoodsReceiptViewSet(viewsets.ModelViewSet):
    """ViewSet for GoodsReceipt model."""

    permission_classes = [IsAuthenticated, CompanyContextPermission]

    def get_queryset(self):
        """Get goods receipts for current company."""
        return GoodsReceipt.objects.filter(
            company=self.request.user.current_company
        ).select_related(
            'purchase_order', 'supplier', 'receiving_location',
            'received_by', 'quality_check_by', 'posted_by'
        ).prefetch_related('lines')

    def get_serializer_class(self):
        """Get appropriate serializer class."""
        if self.action == 'create':
            return GoodsReceiptCreateSerializer
        else:
            return GoodsReceiptSerializer

    @action(detail=True, methods=['post'])
    def quality_check(self, request, pk=None):
        """Perform quality check on the receipt."""
        goods_receipt = self.get_object()
        passed = request.data.get('passed', True)
        notes = request.data.get('notes', '')

        try:
            goods_receipt.perform_quality_check(request.user, passed, notes)
            return Response({'message': _('Quality check completed successfully')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def post_to_inventory(self, request, pk=None):
        """Post the receipt to inventory."""
        goods_receipt = self.get_object()

        try:
            goods_receipt.post_to_inventory(request.user)
            return Response({'message': _('Receipt posted to inventory successfully')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject the entire receipt."""
        goods_receipt = self.get_object()
        reason = request.data.get('reason', '')

        try:
            goods_receipt.reject_receipt(request.user, reason)
            return Response({'message': _('Receipt rejected successfully')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class PurchaseAnalyticsViewSet(viewsets.ViewSet):
    """Enhanced ViewSet for comprehensive purchase analytics."""

    permission_classes = [IsAuthenticated, CompanyContextPermission]

    @action(detail=False, methods=['get'])
    def spend_analysis(self, request):
        """Get spend analysis by category, supplier, period."""
        company = request.user.current_company

        # Get date range from query params
        days = int(request.query_params.get('days', 365))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)

        # Spend by supplier
        supplier_spend = PurchaseOrder.objects.filter(
            company=company,
            order_date__range=[start_date, end_date],
            state__in=['CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED']
        ).values(
            'supplier__name', 'supplier__supplier_code'
        ).annotate(
            total_spend=Sum('total_amount'),
            order_count=Count('id')
        ).order_by('-total_spend')

        # Spend by month
        monthly_spend = PurchaseOrder.objects.filter(
            company=company,
            order_date__range=[start_date, end_date],
            state__in=['CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED']
        ).extra(
            select={'month': "DATE_TRUNC('month', order_date)"}
        ).values('month').annotate(
            total_spend=Sum('total_amount'),
            order_count=Count('id')
        ).order_by('month')

        return Response({
            'period': {'start': start_date, 'end': end_date},
            'supplier_spend': list(supplier_spend),
            'monthly_spend': list(monthly_spend),
            'total_spend': sum(item['total_spend'] for item in supplier_spend),
            'total_orders': sum(item['order_count'] for item in supplier_spend)
        })

    @action(detail=False, methods=['get'])
    def pending_approvals(self, request):
        """Get pending purchase order approvals."""
        company = request.user.current_company

        pending_pos = PurchaseOrder.objects.filter(
            company=company,
            approval_state='PENDING'
        ).select_related('supplier', 'created_by')

        serializer = PurchaseOrderSerializer(pending_pos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def analytics_overview(self, request):
        """Get comprehensive purchase analytics overview."""
        company = request.user.current_company
        analytics_service = PurchaseAnalyticsService(company)

        # Parse date parameters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')

        overview_data = analytics_service.get_purchase_overview(start_date, end_date)
        return Response(overview_data)

    @action(detail=False, methods=['get'])
    def supplier_performance(self, request):
        """Get detailed supplier performance analysis."""
        company = request.user.current_company
        analytics_service = PurchaseAnalyticsService(company)

        # Parse parameters
        supplier_id = request.query_params.get('supplier_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')

        performance_data = analytics_service.get_supplier_performance_analysis(
            supplier_id, start_date, end_date
        )
        return Response(performance_data)

    @action(detail=False, methods=['get'])
    def category_analysis(self, request):
        """Get purchase analysis by product categories."""
        company = request.user.current_company
        analytics_service = PurchaseAnalyticsService(company)

        # Parse date parameters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')

        category_data = analytics_service.get_category_analysis(start_date, end_date)
        return Response(category_data)

    @action(detail=False, methods=['get'])
    def cost_savings(self, request):
        """Get cost savings analysis from RFQ process."""
        company = request.user.current_company
        analytics_service = PurchaseAnalyticsService(company)

        # Parse date parameters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')

        savings_data = analytics_service.get_cost_savings_analysis(start_date, end_date)
        return Response(savings_data)

    @action(detail=False, methods=['get'])
    def purchase_forecast(self, request):
        """Get purchase forecasting based on historical data."""
        company = request.user.current_company
        analytics_service = PurchaseAnalyticsService(company)

        # Parse parameters
        months_ahead = int(request.query_params.get('months_ahead', 6))

        forecast_data = analytics_service.get_purchase_forecasting(months_ahead)
        return Response(forecast_data)

    @action(detail=False, methods=['get'])
    def compliance_report(self, request):
        """Get compliance and audit report for purchases."""
        company = request.user.current_company
        analytics_service = PurchaseAnalyticsService(company)

        # Parse date parameters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')

        compliance_data = analytics_service.get_compliance_report(start_date, end_date)
        return Response(compliance_data)
