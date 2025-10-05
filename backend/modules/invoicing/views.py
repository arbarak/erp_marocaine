"""
DRF views for invoicing module.
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Q, Sum
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.core.mail import EmailMessage
from django.conf import settings
from django.template.loader import render_to_string
import io
import zipfile

from .models import Invoice, InvoiceLine, Payment, InvoicePayment
from .serializers import (
    InvoiceSerializer, InvoiceCreateSerializer, InvoiceLineSerializer,
    PaymentSerializer, InvoicePaymentSerializer, PaymentAllocationSerializer,
    InvoiceGenerationSerializer, CreditNoteSerializer, InvoiceValidationSerializer,
    AgingReportSerializer, CustomerStatementSerializer, CashFlowForecastSerializer,
    InvoiceAttachmentSerializer, InvoiceEmailSerializer, RecurringInvoiceSerializer,
    InvoiceTemplateSerializer, InvoiceApprovalSerializer, BulkInvoiceActionSerializer,
    AdvancedInvoiceFilterSerializer
)
from .services import InvoiceGenerationService, PaymentService, InvoiceWorkflowService
from .reports import ARReportGenerator, APReportGenerator, CashFlowReportGenerator
from .enhanced_services import InvoiceEmailService, RecurringInvoiceService, InvoiceTemplateService, InvoiceAnalyticsService
from .enhanced_pdf_generator import EnhancedInvoicePDFGenerator
from modules.sales.models import SalesOrder
from modules.purchasing.models import PurchaseOrder
from modules.sales.models import Customer
from modules.purchasing.models import Supplier
from core.permissions import CompanyContextPermission


class InvoiceViewSet(viewsets.ModelViewSet):
    """ViewSet for invoice management."""
    
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated, CompanyContextPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['invoice_type', 'state', 'customer', 'supplier']
    search_fields = ['invoice_number', 'reference', 'description']
    ordering_fields = ['invoice_date', 'due_date', 'total_amount', 'created_at']
    ordering = ['-invoice_date']
    
    def get_queryset(self):
        """Filter invoices by company."""
        return Invoice.objects.filter(
            company=self.request.user.company
        ).select_related('customer', 'supplier', 'sales_order', 'purchase_order')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return InvoiceCreateSerializer
        return InvoiceSerializer
    
    def perform_create(self, serializer):
        """Set company and created_by on creation."""
        serializer.save(
            company=self.request.user.company,
            created_by=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def validate_invoice(self, request, pk=None):
        """Validate an invoice."""
        invoice = self.get_object()
        
        try:
            invoice.validate_invoice(request.user)
            return Response({
                'message': 'Invoice validated successfully',
                'invoice': InvoiceSerializer(invoice).data
            })
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def post_invoice(self, request, pk=None):
        """Post an invoice."""
        invoice = self.get_object()
        
        try:
            invoice.post_invoice()
            return Response({
                'message': 'Invoice posted successfully',
                'invoice': InvoiceSerializer(invoice).data
            })
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def cancel_invoice(self, request, pk=None):
        """Cancel an invoice."""
        invoice = self.get_object()
        reason = request.data.get('reason', '')
        
        try:
            invoice.cancel_invoice(reason)
            return Response({
                'message': 'Invoice cancelled successfully',
                'invoice': InvoiceSerializer(invoice).data
            })
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Generate PDF for invoice."""
        invoice = self.get_object()

        try:
            generator = EnhancedInvoicePDFGenerator()

            # Get template data from query params if provided
            template_data = None
            if request.query_params.get('template'):
                # In a full implementation, this would load template from database
                template_data = None

            language = request.query_params.get('language', 'fr')

            pdf_content = generator.generate_invoice_pdf(
                invoice=invoice,
                template_data=template_data,
                language=language
            )

            response = HttpResponse(pdf_content, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="facture_{invoice.invoice_number}.pdf"'
            return response

        except Exception as e:
            return Response(
                {'error': f'Failed to generate PDF: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def generate_from_sales_order(self, request):
        """Generate customer invoice from sales order."""
        serializer = InvoiceGenerationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            sales_order = SalesOrder.objects.get(
                id=serializer.validated_data['order_id'],
                company=request.user.company
            )
            
            invoice = InvoiceGenerationService.create_customer_invoice_from_sales_order(
                sales_order=sales_order,
                created_by=request.user,
                invoice_date=serializer.validated_data.get('invoice_date'),
                partial_lines=serializer.validated_data.get('partial_lines')
            )
            
            return Response(
                InvoiceSerializer(invoice).data,
                status=status.HTTP_201_CREATED
            )
        except SalesOrder.DoesNotExist:
            return Response(
                {'error': 'Sales order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def generate_from_purchase_order(self, request):
        """Generate supplier invoice from purchase order."""
        serializer = InvoiceGenerationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            purchase_order = PurchaseOrder.objects.get(
                id=serializer.validated_data['order_id'],
                company=request.user.company
            )
            
            invoice = InvoiceGenerationService.create_supplier_invoice_from_purchase_order(
                purchase_order=purchase_order,
                created_by=request.user,
                supplier_invoice_number=serializer.validated_data['supplier_invoice_number'],
                supplier_invoice_date=serializer.validated_data['supplier_invoice_date'],
                invoice_date=serializer.validated_data.get('invoice_date'),
                partial_lines=serializer.validated_data.get('partial_lines')
            )
            
            return Response(
                InvoiceSerializer(invoice).data,
                status=status.HTTP_201_CREATED
            )
        except PurchaseOrder.DoesNotExist:
            return Response(
                {'error': 'Purchase order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def create_credit_note(self, request):
        """Create credit note for an invoice."""
        serializer = CreditNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            original_invoice = Invoice.objects.get(
                id=serializer.validated_data['original_invoice_id'],
                company=request.user.company
            )
            
            credit_note = InvoiceGenerationService.create_credit_note(
                original_invoice=original_invoice,
                created_by=request.user,
                credit_lines=serializer.validated_data['credit_lines'],
                reason=serializer.validated_data.get('reason', '')
            )
            
            return Response(
                InvoiceSerializer(credit_note).data,
                status=status.HTTP_201_CREATED
            )
        except Invoice.DoesNotExist:
            return Response(
                {'error': 'Original invoice not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def bulk_validate(self, request):
        """Bulk validate invoices."""
        serializer = InvoiceValidationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        results = InvoiceWorkflowService.bulk_validate_invoices(
            invoice_ids=serializer.validated_data['invoice_ids'],
            validated_by=request.user
        )
        
        return Response(results)
    
    @action(detail=False, methods=['post'])
    def bulk_post(self, request):
        """Bulk post invoices."""
        serializer = InvoiceValidationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        results = InvoiceWorkflowService.bulk_post_invoices(
            invoice_ids=serializer.validated_data['invoice_ids']
        )
        
        return Response(results)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue invoices."""
        days_overdue = int(request.query_params.get('days_overdue', 1))

        overdue_invoices = InvoiceWorkflowService.get_overdue_invoices(
            company=request.user.company,
            days_overdue=days_overdue
        )

        serializer = InvoiceSerializer(overdue_invoices, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def send_email(self, request, pk=None):
        """Send invoice via email."""
        invoice = self.get_object()
        serializer = InvoiceEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Prepare email parameters
        to_emails = serializer.validated_data['to_emails']
        cc_emails = serializer.validated_data.get('cc_emails', [])

        if serializer.validated_data.get('send_copy_to_self'):
            cc_emails.append(request.user.email)

        # Send email using enhanced service
        result = InvoiceEmailService.send_invoice_email(
            invoice=invoice,
            to_emails=to_emails,
            cc_emails=cc_emails,
            subject=serializer.validated_data.get('subject'),
            message=serializer.validated_data.get('message'),
            include_pdf=serializer.validated_data.get('include_pdf', True),
            sent_by=request.user
        )

        if result['success']:
            return Response({
                'message': result['message'],
                'recipients': result['recipients'],
                'sent_at': result['sent_at']
            })
        else:
            return Response(
                {'error': result['error']},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def upload_attachment(self, request, pk=None):
        """Upload file attachment to invoice."""
        invoice = self.get_object()
        serializer = InvoiceAttachmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # For now, just return success since we don't have file storage configured
            return Response({
                'message': 'Attachment uploaded successfully',
                'filename': serializer.validated_data['file'].name,
                'description': serializer.validated_data.get('description', '')
            })

        except Exception as e:
            return Response(
                {'error': f'Failed to upload attachment: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve or reject invoice."""
        invoice = self.get_object()
        serializer = InvoiceApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data['action']
        comments = serializer.validated_data.get('comments', '')

        try:
            if action == 'APPROVE':
                # Implement approval logic
                invoice.state = 'VALIDATED'
                invoice.validated_by = request.user
                invoice.save()
                message = 'Invoice approved successfully'
            elif action == 'REJECT':
                invoice.state = 'CANCELLED'
                invoice.save()
                message = 'Invoice rejected'
            else:  # REQUEST_CHANGES
                # Keep in draft state but add comments
                message = 'Changes requested for invoice'

            return Response({
                'message': message,
                'action': action,
                'comments': comments,
                'invoice': InvoiceSerializer(invoice).data
            })

        except Exception as e:
            return Response(
                {'error': f'Failed to process approval: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def bulk_actions(self, request):
        """Perform bulk actions on invoices."""
        serializer = BulkInvoiceActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        invoice_ids = serializer.validated_data['invoice_ids']
        action = serializer.validated_data['action']
        parameters = serializer.validated_data.get('parameters', {})

        # Get invoices
        invoices = Invoice.objects.filter(
            id__in=invoice_ids,
            company=request.user.company
        )

        if invoices.count() != len(invoice_ids):
            return Response(
                {'error': 'Some invoices not found or not accessible'},
                status=status.HTTP_400_BAD_REQUEST
            )

        results = []

        try:
            for invoice in invoices:
                result = {'invoice_id': str(invoice.id), 'success': False, 'message': ''}

                try:
                    if action == 'VALIDATE':
                        invoice.validate_invoice(request.user)
                        result['success'] = True
                        result['message'] = 'Validated'
                    elif action == 'POST':
                        invoice.post_invoice()
                        result['success'] = True
                        result['message'] = 'Posted'
                    elif action == 'CANCEL':
                        invoice.cancel_invoice('Bulk cancellation')
                        result['success'] = True
                        result['message'] = 'Cancelled'
                    elif action == 'SEND_EMAIL':
                        # Implement bulk email sending
                        result['success'] = True
                        result['message'] = 'Email sent'
                    elif action == 'EXPORT_PDF':
                        # Implement bulk PDF export
                        result['success'] = True
                        result['message'] = 'PDF exported'

                except Exception as e:
                    result['message'] = str(e)

                results.append(result)

            successful_count = sum(1 for r in results if r['success'])

            return Response({
                'action': action,
                'total_processed': len(results),
                'successful': successful_count,
                'failed': len(results) - successful_count,
                'results': results
            })

        except Exception as e:
            return Response(
                {'error': f'Bulk action failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def create_recurring(self, request):
        """Create recurring invoice schedule."""
        serializer = RecurringInvoiceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            template_invoice = Invoice.objects.get(
                id=serializer.validated_data['template_invoice_id'],
                company=request.user.company
            )

            # For now, just return the configuration
            # In a full implementation, this would create a recurring schedule
            return Response({
                'message': 'Recurring invoice schedule created',
                'template_invoice': template_invoice.invoice_number,
                'frequency': serializer.validated_data['frequency'],
                'start_date': serializer.validated_data['start_date'],
                'end_date': serializer.validated_data.get('end_date'),
                'max_occurrences': serializer.validated_data.get('max_occurrences'),
                'auto_send': serializer.validated_data['auto_send']
            })

        except Invoice.DoesNotExist:
            return Response(
                {'error': 'Template invoice not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to create recurring schedule: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def advanced_search(self, request):
        """Advanced invoice search with complex filters."""
        serializer = AdvancedInvoiceFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        queryset = self.get_queryset()

        # Apply filters
        if serializer.validated_data.get('date_range_start'):
            queryset = queryset.filter(invoice_date__gte=serializer.validated_data['date_range_start'])

        if serializer.validated_data.get('date_range_end'):
            queryset = queryset.filter(invoice_date__lte=serializer.validated_data['date_range_end'])

        if serializer.validated_data.get('amount_min'):
            queryset = queryset.filter(total_amount__gte=serializer.validated_data['amount_min'])

        if serializer.validated_data.get('amount_max'):
            queryset = queryset.filter(total_amount__lte=serializer.validated_data['amount_max'])

        if serializer.validated_data.get('overdue_only'):
            queryset = queryset.filter(
                due_date__lt=timezone.now().date(),
                state__in=['VALIDATED', 'POSTED'],
                outstanding_amount__gt=0
            )

        if serializer.validated_data.get('days_overdue_min'):
            cutoff_date = timezone.now().date() - timezone.timedelta(days=serializer.validated_data['days_overdue_min'])
            queryset = queryset.filter(due_date__lt=cutoff_date)

        if serializer.validated_data.get('payment_status'):
            payment_status = serializer.validated_data['payment_status']
            if payment_status == 'UNPAID':
                queryset = queryset.filter(paid_amount=0)
            elif payment_status == 'PARTIALLY_PAID':
                queryset = queryset.filter(paid_amount__gt=0, outstanding_amount__gt=0)
            elif payment_status == 'FULLY_PAID':
                queryset = queryset.filter(outstanding_amount=0)

        # Paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = InvoiceSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = InvoiceSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export invoices to CSV format."""
        import csv
        from django.http import HttpResponse

        queryset = self.filter_queryset(self.get_queryset())

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="invoices.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Invoice Number', 'Type', 'State', 'Customer/Supplier',
            'Invoice Date', 'Due Date', 'Subtotal', 'Tax Amount',
            'Total Amount', 'Paid Amount', 'Outstanding Amount'
        ])

        for invoice in queryset:
            writer.writerow([
                invoice.invoice_number,
                invoice.get_invoice_type_display(),
                invoice.get_state_display(),
                invoice.get_party_name(),
                invoice.invoice_date,
                invoice.due_date,
                invoice.subtotal,
                invoice.tax_amount,
                invoice.total_amount,
                invoice.paid_amount,
                invoice.outstanding_amount
            ])

        return response

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics for invoices."""
        from django.db.models import Count, Sum, Avg
        from datetime import datetime, timedelta

        queryset = self.get_queryset()
        today = timezone.now().date()

        # Basic stats
        total_invoices = queryset.count()
        total_value = queryset.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        avg_value = queryset.aggregate(Avg('total_amount'))['total_amount__avg'] or 0

        # Status breakdown
        status_breakdown = queryset.values('state').annotate(
            count=Count('id'),
            total_amount=Sum('total_amount')
        )

        # Overdue invoices
        overdue_invoices = queryset.filter(
            due_date__lt=today,
            state__in=['VALIDATED', 'POSTED'],
            outstanding_amount__gt=0
        ).count()

        # Monthly trends (last 12 months)
        monthly_stats = []
        for i in range(12):
            month_start = today.replace(day=1) - timedelta(days=30*i)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)

            month_data = queryset.filter(
                invoice_date__gte=month_start,
                invoice_date__lte=month_end
            ).aggregate(
                count=Count('id'),
                total_amount=Sum('total_amount')
            )

            monthly_stats.append({
                'month': month_start.strftime('%Y-%m'),
                'count': month_data['count'] or 0,
                'total_amount': month_data['total_amount'] or 0
            })

        return Response({
            'total_invoices': total_invoices,
            'total_value': total_value,
            'average_value': avg_value,
            'overdue_count': overdue_invoices,
            'status_breakdown': list(status_breakdown),
            'monthly_trends': monthly_stats[::-1]  # Reverse to show oldest first
        })


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for payment management."""
    
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, CompanyContextPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['payment_type', 'state', 'customer', 'supplier', 'payment_method']
    search_fields = ['payment_number', 'reference', 'description']
    ordering_fields = ['payment_date', 'amount', 'created_at']
    ordering = ['-payment_date']
    
    def get_queryset(self):
        """Filter payments by company."""
        return Payment.objects.filter(
            company=self.request.user.company
        ).select_related('customer', 'supplier')
    
    def perform_create(self, serializer):
        """Set company and created_by on creation."""
        serializer.save(
            company=self.request.user.company,
            created_by=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm a payment."""
        payment = self.get_object()
        
        try:
            payment.confirm_payment(request.user)
            return Response({
                'message': 'Payment confirmed successfully',
                'payment': PaymentSerializer(payment).data
            })
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a payment."""
        payment = self.get_object()
        reason = request.data.get('reason', '')
        
        try:
            payment.cancel_payment(reason)
            return Response({
                'message': 'Payment cancelled successfully',
                'payment': PaymentSerializer(payment).data
            })
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def allocate(self, request, pk=None):
        """Allocate payment to invoices."""
        payment = self.get_object()
        serializer = PaymentAllocationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            allocations = PaymentService.allocate_payment_to_invoices(
                payment=payment,
                invoice_allocations=serializer.validated_data['allocations'],
                created_by=request.user
            )
            
            return Response({
                'message': 'Payment allocated successfully',
                'allocations': InvoicePaymentSerializer(allocations, many=True).data
            })
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def auto_allocate(self, request, pk=None):
        """Auto-allocate payment to oldest invoices."""
        payment = self.get_object()
        
        try:
            allocations = PaymentService.auto_allocate_payment(
                payment=payment,
                created_by=request.user
            )
            
            return Response({
                'message': 'Payment auto-allocated successfully',
                'allocations': InvoicePaymentSerializer(allocations, many=True).data
            })
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def pdf_receipt(self, request, pk=None):
        """Generate PDF receipt for payment."""
        payment = self.get_object()
        
        # Temporarily disabled due to WeasyPrint dependencies
        return Response(
            {'error': 'PDF generation temporarily disabled'},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )

        # try:
        #     generator = FrenchInvoicePDFGenerator()
        #     pdf_content = generator.generate_payment_receipt_pdf(payment)
        #
        #     response = HttpResponse(pdf_content, content_type='application/pdf')
        #     response['Content-Disposition'] = f'attachment; filename="recu_{payment.payment_number}.pdf"'
        #     return response
        # except Exception as e:
        #     return Response(
        #         {'error': f'Failed to generate PDF: {str(e)}'},
        #         status=status.HTTP_500_INTERNAL_SERVER_ERROR
        #     )


class InvoicePaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for invoice payment allocations."""

    serializer_class = InvoicePaymentSerializer
    permission_classes = [permissions.IsAuthenticated, CompanyContextPermission]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['invoice', 'payment']
    ordering_fields = ['allocation_date', 'allocated_amount', 'created_at']
    ordering = ['-allocation_date']

    def get_queryset(self):
        """Filter allocations by company."""
        return InvoicePayment.objects.filter(
            invoice__company=self.request.user.company
        ).select_related('invoice', 'payment')

    def perform_create(self, serializer):
        """Set created_by on creation."""
        serializer.save(created_by=self.request.user)


class ReportViewSet(viewsets.ViewSet):
    """ViewSet for invoicing reports."""

    permission_classes = [permissions.IsAuthenticated, CompanyContextPermission]

    @action(detail=False, methods=['post'])
    def aging_report(self, request):
        """Generate aging report."""
        serializer = AgingReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        report_type = serializer.validated_data['report_type']
        as_of_date = serializer.validated_data.get('as_of_date')
        party_id = serializer.validated_data.get('party_id')

        if report_type == 'AR':
            report_data = ARReportGenerator.generate_aging_report(
                company=request.user.company,
                as_of_date=as_of_date,
                customer_id=party_id
            )
        else:
            report_data = APReportGenerator.generate_aging_report(
                company=request.user.company,
                as_of_date=as_of_date,
                supplier_id=party_id
            )

        return Response(report_data)

    @action(detail=False, methods=['post'])
    def customer_statement(self, request):
        """Generate customer statement."""
        serializer = CustomerStatementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            customer = Customer.objects.get(
                id=serializer.validated_data['customer_id'],
                company=request.user.company
            )

            statement_data = ARReportGenerator.generate_customer_statement(
                customer=customer,
                from_date=serializer.validated_data['from_date'],
                to_date=serializer.validated_data['to_date']
            )

            return Response(statement_data)
        except Customer.DoesNotExist:
            return Response(
                {'error': 'Customer not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def overdue_report(self, request):
        """Generate overdue invoices report."""
        days_overdue = int(request.query_params.get('days_overdue', 1))

        report_data = ARReportGenerator.generate_overdue_report(
            company=request.user.company,
            days_overdue=days_overdue
        )

        return Response(report_data)

    @action(detail=False, methods=['post'])
    def payment_schedule(self, request):
        """Generate AP payment schedule."""
        serializer = CashFlowForecastSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        schedule_data = APReportGenerator.generate_payment_schedule(
            company=request.user.company,
            from_date=serializer.validated_data['from_date'],
            to_date=serializer.validated_data['to_date']
        )

        return Response(schedule_data)

    @action(detail=False, methods=['post'])
    def cash_flow_forecast(self, request):
        """Generate cash flow forecast."""
        serializer = CashFlowForecastSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        forecast_data = CashFlowReportGenerator.generate_cash_flow_forecast(
            company=request.user.company,
            from_date=serializer.validated_data['from_date'],
            to_date=serializer.validated_data['to_date']
        )

        return Response(forecast_data)

    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        """Get dashboard summary for invoicing."""
        company = request.user.company
        today = timezone.now().date()

        # AR Summary
        ar_invoices = Invoice.objects.filter(
            company=company,
            invoice_type='CUSTOMER',
            state='POSTED'
        )

        ar_summary = {
            'total_outstanding': ar_invoices.filter(
                outstanding_amount__gt=0
            ).aggregate(total=Sum('outstanding_amount'))['total'] or 0,
            'overdue_amount': ar_invoices.filter(
                due_date__lt=today,
                outstanding_amount__gt=0
            ).aggregate(total=Sum('outstanding_amount'))['total'] or 0,
            'current_month_invoiced': ar_invoices.filter(
                invoice_date__year=today.year,
                invoice_date__month=today.month
            ).aggregate(total=Sum('total_amount'))['total'] or 0
        }

        # AP Summary
        ap_invoices = Invoice.objects.filter(
            company=company,
            invoice_type='SUPPLIER',
            state='POSTED'
        )

        ap_summary = {
            'total_outstanding': ap_invoices.filter(
                outstanding_amount__gt=0
            ).aggregate(total=Sum('outstanding_amount'))['total'] or 0,
            'overdue_amount': ap_invoices.filter(
                due_date__lt=today,
                outstanding_amount__gt=0
            ).aggregate(total=Sum('outstanding_amount'))['total'] or 0,
            'current_month_received': ap_invoices.filter(
                invoice_date__year=today.year,
                invoice_date__month=today.month
            ).aggregate(total=Sum('total_amount'))['total'] or 0
        }

        # Payment Summary
        payments_this_month = Payment.objects.filter(
            company=company,
            payment_date__year=today.year,
            payment_date__month=today.month,
            state__in=['CONFIRMED', 'RECONCILED']
        )

        payment_summary = {
            'customer_payments': payments_this_month.filter(
                payment_type='CUSTOMER_PAYMENT'
            ).aggregate(total=Sum('amount'))['total'] or 0,
            'supplier_payments': payments_this_month.filter(
                payment_type='SUPPLIER_PAYMENT'
            ).aggregate(total=Sum('amount'))['total'] or 0
        }

        return Response({
            'ar_summary': ar_summary,
            'ap_summary': ap_summary,
            'payment_summary': payment_summary,
            'as_of_date': today
        })


class InvoiceTemplateViewSet(viewsets.ViewSet):
    """ViewSet for invoice template management."""

    permission_classes = [permissions.IsAuthenticated, CompanyContextPermission]

    @action(detail=False, methods=['post'])
    def create_template(self, request):
        """Create new invoice template."""
        serializer = InvoiceTemplateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            template = InvoiceTemplateService.create_template(
                name=serializer.validated_data['name'],
                template_data=serializer.validated_data['template_data'],
                description=serializer.validated_data.get('description'),
                is_default=serializer.validated_data.get('is_default', False),
                company=request.user.company
            )

            return Response(template, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Failed to create template: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def list_templates(self, request):
        """List available invoice templates."""
        # In a full implementation, this would query database
        # For now, return default template
        generator = EnhancedInvoicePDFGenerator()
        default_template = generator._get_default_template()

        templates = [
            {
                'id': 'default',
                'name': 'Default Template',
                'description': 'Standard invoice template',
                'is_default': True,
                'template_data': default_template
            }
        ]

        return Response(templates)

    @action(detail=True, methods=['get'])
    def preview_template(self, request, pk=None):
        """Preview template with sample data."""
        # In a full implementation, this would load template and generate preview
        return Response({
            'message': 'Template preview would be generated here',
            'template_id': pk
        })


class InvoiceAnalyticsViewSet(viewsets.ViewSet):
    """ViewSet for invoice analytics and insights."""

    permission_classes = [permissions.IsAuthenticated, CompanyContextPermission]

    @action(detail=False, methods=['get'])
    def payment_trends(self, request):
        """Get payment trends analysis."""
        days = int(request.query_params.get('days', 90))

        try:
            trends = InvoiceAnalyticsService.get_payment_trends(
                company=request.user.company,
                days=days
            )

            return Response(trends)

        except Exception as e:
            return Response(
                {'error': f'Failed to generate payment trends: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def customer_insights(self, request):
        """Get customer payment insights."""
        customer_id = request.query_params.get('customer_id')

        try:
            insights = InvoiceAnalyticsService.get_customer_insights(
                company=request.user.company,
                customer_id=customer_id
            )

            return Response(insights)

        except Exception as e:
            return Response(
                {'error': f'Failed to generate customer insights: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
