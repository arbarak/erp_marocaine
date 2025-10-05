"""
Views for sales app.
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
    Customer, CustomerContact, CustomerPriceList,
    SalesQuotation, SalesQuotationLine,
    SalesOrder, SalesOrderLine,
    DeliveryNote, DeliveryNoteLine,
    ReturnNote, ReturnNoteLine
)
from .serializers import (
    CustomerListSerializer, CustomerDetailSerializer, CustomerCreateSerializer,
    CustomerContactSerializer, CustomerPriceListSerializer,
    SalesQuotationSerializer, SalesQuotationCreateSerializer,
    SalesOrderSerializer, SalesOrderCreateSerializer,
    DeliveryNoteSerializer, DeliveryNoteCreateSerializer,
    ReturnNoteSerializer, ReturnNoteCreateSerializer,
    SalesAnalyticsSerializer, CustomerPerformanceSerializer
)


class CustomerViewSet(viewsets.ModelViewSet):
    """ViewSet for Customer model."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    
    def get_queryset(self):
        """Get customers for current company."""
        return Customer.objects.filter(
            company=self.request.user.current_company
        ).select_related('created_by', 'approved_by', 'sales_person').prefetch_related('contacts')
    
    def get_serializer_class(self):
        """Get appropriate serializer class."""
        if self.action == 'list':
            return CustomerListSerializer
        elif self.action == 'create':
            return CustomerCreateSerializer
        else:
            return CustomerDetailSerializer
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a customer."""
        customer = self.get_object()
        
        if customer.is_approved:
            return Response(
                {'error': _('Customer is already approved')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        customer.is_approved = True
        customer.approved_by = request.user
        customer.approved_at = timezone.now()
        customer.save()
        
        return Response({'message': _('Customer approved successfully')})
    
    @action(detail=True, methods=['post'])
    def reject_approval(self, request, pk=None):
        """Reject customer approval."""
        customer = self.get_object()
        
        customer.is_approved = False
        customer.approved_by = None
        customer.approved_at = None
        customer.save()
        
        return Response({'message': _('Customer approval rejected')})
    
    @action(detail=True, methods=['get'])
    def contacts(self, request, pk=None):
        """Get customer contacts."""
        customer = self.get_object()
        contacts = customer.contacts.filter(is_active=True)
        serializer = CustomerContactSerializer(contacts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def price_lists(self, request, pk=None):
        """Get customer price lists."""
        customer = self.get_object()
        price_lists = customer.price_lists.filter(is_active=True)
        serializer = CustomerPriceListSerializer(price_lists, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def performance(self, request, pk=None):
        """Get customer performance metrics."""
        customer = self.get_object()
        
        # Get date range from query params
        days = int(request.query_params.get('days', 365))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Calculate performance metrics
        orders = customer.sales_orders.filter(
            order_date__range=[start_date, end_date],
            state__in=['CONFIRMED', 'IN_PROGRESS', 'PARTIALLY_DELIVERED', 'DELIVERED']
        )
        
        total_orders = orders.count()
        total_value = orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
        average_order_value = total_value / total_orders if total_orders > 0 else Decimal('0')
        
        # Payment performance (placeholder - would be calculated from invoice data)
        payment_performance = Decimal('95.0')  # Placeholder
        
        # Return rate calculation
        returns = customer.return_notes.filter(
            return_date__range=[start_date, end_date]
        )
        return_rate = (returns.count() / total_orders * 100) if total_orders > 0 else Decimal('0')
        
        performance_data = {
            'customer_id': customer.id,
            'customer_name': customer.name,
            'period_start': start_date,
            'period_end': end_date,
            'total_orders': total_orders,
            'total_value': total_value,
            'average_order_value': average_order_value,
            'payment_performance': payment_performance,
            'return_rate': return_rate,
            'customer_rating': customer.rating,
        }
        
        serializer = CustomerPerformanceSerializer(performance_data)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def orders(self, request, pk=None):
        """Get customer orders."""
        customer = self.get_object()
        orders = customer.sales_orders.all().order_by('-order_date')
        
        # Apply filters
        state = request.query_params.get('state')
        if state:
            orders = orders.filter(state=state)
        
        serializer = SalesOrderSerializer(orders, many=True)
        return Response(serializer.data)


class CustomerContactViewSet(viewsets.ModelViewSet):
    """ViewSet for CustomerContact model."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    serializer_class = CustomerContactSerializer
    
    def get_queryset(self):
        """Get contacts for customers of current company."""
        return CustomerContact.objects.filter(
            customer__company=self.request.user.current_company
        ).select_related('customer')


class CustomerPriceListViewSet(viewsets.ModelViewSet):
    """ViewSet for CustomerPriceList model."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    serializer_class = CustomerPriceListSerializer
    
    def get_queryset(self):
        """Get price lists for customers of current company."""
        return CustomerPriceList.objects.filter(
            customer__company=self.request.user.current_company
        ).select_related('customer', 'product', 'created_by')
    
    def perform_create(self, serializer):
        """Set created_by on create."""
        serializer.save(created_by=self.request.user)


class SalesQuotationViewSet(viewsets.ModelViewSet):
    """ViewSet for SalesQuotation model."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    
    def get_queryset(self):
        """Get quotations for current company."""
        return SalesQuotation.objects.filter(
            company=self.request.user.current_company
        ).select_related(
            'customer', 'delivery_location', 'sales_person', 'created_by'
        ).prefetch_related('lines')
    
    def get_serializer_class(self):
        """Get appropriate serializer class."""
        if self.action == 'create':
            return SalesQuotationCreateSerializer
        else:
            return SalesQuotationSerializer
    
    @action(detail=True, methods=['post'])
    def send_to_customer(self, request, pk=None):
        """Send quotation to customer."""
        quotation = self.get_object()
        
        try:
            quotation.send_to_customer()
            return Response({'message': _('Quotation sent to customer successfully')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def confirm_by_customer(self, request, pk=None):
        """Confirm quotation by customer."""
        quotation = self.get_object()
        customer_reference = request.data.get('customer_reference', '')
        
        try:
            quotation.confirm_by_customer(customer_reference)
            return Response({'message': _('Quotation confirmed by customer')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel the quotation."""
        quotation = self.get_object()
        reason = request.data.get('reason', '')
        
        try:
            quotation.cancel(reason)
            return Response({'message': _('Quotation cancelled successfully')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def convert_to_order(self, request, pk=None):
        """Convert quotation to sales order."""
        quotation = self.get_object()
        
        if quotation.state != 'CONFIRMED':
            return Response(
                {'error': _('Only confirmed quotations can be converted to orders')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create sales order from quotation
        from core.sequences.services import SequenceService
        
        _, order_number = SequenceService.get_next_number(
            company=quotation.company,
            document_type='SO',
            user=request.user
        )
        
        sales_order = SalesOrder.objects.create(
            company=quotation.company,
            order_number=order_number,
            customer=quotation.customer,
            quotation=quotation,
            customer_reference=quotation.customer_reference,
            order_date=timezone.now().date(),
            requested_delivery_date=quotation.expected_delivery_date,
            delivery_location=quotation.delivery_location,
            delivery_address=quotation.delivery_address,
            payment_terms=quotation.payment_terms,
            delivery_terms=quotation.delivery_terms,
            currency=quotation.currency,
            discount_amount=quotation.discount_amount,
            sales_person=quotation.sales_person,
            created_by=request.user,
            notes=quotation.notes,
            terms_and_conditions=quotation.terms_and_conditions
        )
        
        # Create order lines from quotation lines
        for quote_line in quotation.lines.all():
            SalesOrderLine.objects.create(
                sales_order=sales_order,
                product=quote_line.product,
                description=quote_line.description,
                quantity=quote_line.quantity,
                uom=quote_line.uom,
                unit_price=quote_line.unit_price,
                discount_percent=quote_line.discount_percent,
                discount_amount=quote_line.discount_amount,
                requested_delivery_date=quote_line.expected_delivery_date,
                tax_rate=quote_line.tax_rate,
                notes=quote_line.notes
            )
        
        # Calculate totals
        sales_order.calculate_totals()
        
        # Update quotation state
        quotation.state = 'CONVERTED'
        quotation.save()
        
        serializer = SalesOrderSerializer(sales_order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SalesOrderViewSet(viewsets.ModelViewSet):
    """ViewSet for SalesOrder model."""

    permission_classes = [IsAuthenticated, CompanyContextPermission]

    def get_queryset(self):
        """Get sales orders for current company."""
        return SalesOrder.objects.filter(
            company=self.request.user.current_company
        ).select_related(
            'customer', 'quotation', 'delivery_location', 'sales_person', 'created_by'
        ).prefetch_related('lines')

    def get_serializer_class(self):
        """Get appropriate serializer class."""
        if self.action == 'create':
            return SalesOrderCreateSerializer
        else:
            return SalesOrderSerializer

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm the sales order."""
        sales_order = self.get_object()

        try:
            sales_order.confirm()
            return Response({'message': _('Sales order confirmed successfully')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def start_processing(self, request, pk=None):
        """Start processing the order."""
        sales_order = self.get_object()

        try:
            sales_order.start_processing()
            return Response({'message': _('Sales order processing started')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel the sales order."""
        sales_order = self.get_object()
        reason = request.data.get('reason', '')

        try:
            sales_order.cancel(reason)
            return Response({'message': _('Sales order cancelled successfully')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def deliveries(self, request, pk=None):
        """Get delivery notes for this sales order."""
        sales_order = self.get_object()
        deliveries = sales_order.delivery_notes.all()
        serializer = DeliveryNoteSerializer(deliveries, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def returns(self, request, pk=None):
        """Get return notes for this sales order."""
        sales_order = self.get_object()
        returns = sales_order.return_notes.all()
        serializer = ReturnNoteSerializer(returns, many=True)
        return Response(serializer.data)


class DeliveryNoteViewSet(viewsets.ModelViewSet):
    """ViewSet for DeliveryNote model."""

    permission_classes = [IsAuthenticated, CompanyContextPermission]

    def get_queryset(self):
        """Get delivery notes for current company."""
        return DeliveryNote.objects.filter(
            company=self.request.user.current_company
        ).select_related(
            'sales_order', 'customer', 'source_location',
            'prepared_by', 'delivered_by'
        ).prefetch_related('lines')

    def get_serializer_class(self):
        """Get appropriate serializer class."""
        if self.action == 'create':
            return DeliveryNoteCreateSerializer
        else:
            return DeliveryNoteSerializer

    @action(detail=True, methods=['post'])
    def prepare_for_delivery(self, request, pk=None):
        """Prepare delivery and create stock moves."""
        delivery_note = self.get_object()

        try:
            delivery_note.prepare_for_delivery(request.user)
            return Response({'message': _('Delivery prepared successfully')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def mark_in_transit(self, request, pk=None):
        """Mark delivery as in transit."""
        delivery_note = self.get_object()

        try:
            delivery_note.mark_in_transit()
            return Response({'message': _('Delivery marked as in transit')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def confirm_delivery(self, request, pk=None):
        """Confirm delivery by customer."""
        delivery_note = self.get_object()
        received_by = request.data.get('received_by', '')
        signature = request.data.get('signature', '')

        try:
            delivery_note.confirm_delivery(received_by, signature)
            return Response({'message': _('Delivery confirmed successfully')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ReturnNoteViewSet(viewsets.ModelViewSet):
    """ViewSet for ReturnNote model."""

    permission_classes = [IsAuthenticated, CompanyContextPermission]

    def get_queryset(self):
        """Get return notes for current company."""
        return ReturnNote.objects.filter(
            company=self.request.user.current_company
        ).select_related(
            'sales_order', 'delivery_note', 'customer', 'return_location',
            'received_by', 'quality_check_by', 'posted_by'
        ).prefetch_related('lines')

    def get_serializer_class(self):
        """Get appropriate serializer class."""
        if self.action == 'create':
            return ReturnNoteCreateSerializer
        else:
            return ReturnNoteSerializer

    @action(detail=True, methods=['post'])
    def quality_check(self, request, pk=None):
        """Perform quality check on the return."""
        return_note = self.get_object()
        passed = request.data.get('passed', True)
        notes = request.data.get('notes', '')

        try:
            return_note.perform_quality_check(request.user, passed, notes)
            return Response({'message': _('Quality check completed successfully')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def post_to_inventory(self, request, pk=None):
        """Post the return to inventory."""
        return_note = self.get_object()

        try:
            return_note.post_to_inventory(request.user)
            return Response({'message': _('Return posted to inventory successfully')})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class SalesAnalyticsViewSet(viewsets.ViewSet):
    """ViewSet for sales analytics."""

    permission_classes = [IsAuthenticated, CompanyContextPermission]

    @action(detail=False, methods=['get'])
    def customer_performance(self, request):
        """Get customer performance analytics."""
        company = request.user.current_company

        # Get date range from query params
        days = int(request.query_params.get('days', 365))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)

        # Get customer analytics
        customers = Customer.objects.filter(
            company=company,
            is_active=True
        ).annotate(
            total_orders=Count('sales_orders'),
            total_amount=Sum('sales_orders__total_amount')
        ).filter(total_orders__gt=0)

        analytics_data = []
        for customer in customers:
            # Calculate metrics
            orders = customer.sales_orders.filter(
                order_date__range=[start_date, end_date]
            )

            total_orders = orders.count()
            total_amount = orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
            average_order_value = total_amount / total_orders if total_orders > 0 else Decimal('0')

            analytics_data.append({
                'customer_id': customer.id,
                'customer_name': customer.name,
                'customer_code': customer.customer_code,
                'total_orders': total_orders,
                'total_amount': total_amount,
                'average_order_value': average_order_value,
                'last_order_date': orders.order_by('-order_date').first().order_date if orders.exists() else None,
                'outstanding_balance': customer.get_outstanding_balance()
            })

        serializer = SalesAnalyticsSerializer(analytics_data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def sales_summary(self, request):
        """Get sales summary by period."""
        company = request.user.current_company

        # Get date range from query params
        days = int(request.query_params.get('days', 365))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)

        # Sales by customer
        customer_sales = SalesOrder.objects.filter(
            company=company,
            order_date__range=[start_date, end_date],
            state__in=['CONFIRMED', 'IN_PROGRESS', 'PARTIALLY_DELIVERED', 'DELIVERED']
        ).values(
            'customer__name', 'customer__customer_code'
        ).annotate(
            total_sales=Sum('total_amount'),
            order_count=Count('id')
        ).order_by('-total_sales')

        # Sales by month
        monthly_sales = SalesOrder.objects.filter(
            company=company,
            order_date__range=[start_date, end_date],
            state__in=['CONFIRMED', 'IN_PROGRESS', 'PARTIALLY_DELIVERED', 'DELIVERED']
        ).extra(
            select={'month': "DATE_TRUNC('month', order_date)"}
        ).values('month').annotate(
            total_sales=Sum('total_amount'),
            order_count=Count('id')
        ).order_by('month')

        # Sales by sales person
        salesperson_sales = SalesOrder.objects.filter(
            company=company,
            order_date__range=[start_date, end_date],
            state__in=['CONFIRMED', 'IN_PROGRESS', 'PARTIALLY_DELIVERED', 'DELIVERED']
        ).values(
            'sales_person__first_name', 'sales_person__last_name'
        ).annotate(
            total_sales=Sum('total_amount'),
            order_count=Count('id')
        ).order_by('-total_sales')

        return Response({
            'period': {'start': start_date, 'end': end_date},
            'customer_sales': list(customer_sales),
            'monthly_sales': list(monthly_sales),
            'salesperson_sales': list(salesperson_sales),
            'total_sales': sum(item['total_sales'] for item in customer_sales),
            'total_orders': sum(item['order_count'] for item in customer_sales)
        })

    @action(detail=False, methods=['get'])
    def pending_orders(self, request):
        """Get pending sales orders."""
        company = request.user.current_company

        pending_orders = SalesOrder.objects.filter(
            company=company,
            state__in=['DRAFT', 'CONFIRMED', 'IN_PROGRESS']
        ).select_related('customer', 'sales_person')

        serializer = SalesOrderSerializer(pending_orders, many=True)
        return Response(serializer.data)
