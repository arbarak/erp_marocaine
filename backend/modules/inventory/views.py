"""
Views for inventory app.
"""
from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.utils.translation import gettext_lazy as _
from django.db.models import Q, Sum, F
from django.utils import timezone
from decimal import Decimal
from .models import Warehouse, LocationType, Location, StockQuant, StockMove, StockMoveLine
from .serializers import (
    WarehouseSerializer, LocationTypeSerializer, LocationSerializer,
    StockQuantSerializer, StockMoveSerializer, StockMoveCreateSerializer,
    InventoryAdjustmentSerializer, StockTransferSerializer, InventoryReportSerializer
)


class WarehouseViewSet(ModelViewSet):
    """ViewSet for warehouse management."""
    
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return warehouses for current company."""
        if self.request.user.current_company:
            return Warehouse.objects.filter(
                company=self.request.user.current_company
            )
        return Warehouse.objects.none()
    
    def perform_create(self, serializer):
        """Set company when creating warehouse."""
        serializer.save(company=self.request.user.current_company)
    
    @action(detail=True, methods=['get'])
    def locations(self, request, pk=None):
        """Get locations in this warehouse."""
        warehouse = self.get_object()
        locations = warehouse.locations.filter(is_active=True)
        
        serializer = LocationSerializer(locations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stock_summary(self, request, pk=None):
        """Get stock summary for this warehouse."""
        warehouse = self.get_object()
        
        stock_summary = StockQuant.objects.filter(
            location__warehouse=warehouse,
            quantity__gt=0
        ).aggregate(
            total_products=Sum('quantity'),
            total_value=Sum(F('quantity') * F('cost_price'))
        )
        
        return Response({
            'warehouse_id': warehouse.id,
            'warehouse_name': warehouse.name,
            'total_products': stock_summary['total_products'] or 0,
            'total_value': stock_summary['total_value'] or Decimal('0'),
            'locations_count': warehouse.locations.filter(is_active=True).count()
        })


class LocationTypeViewSet(ModelViewSet):
    """ViewSet for location type management."""
    
    serializer_class = LocationTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return location types for current company."""
        if self.request.user.current_company:
            return LocationType.objects.filter(
                company=self.request.user.current_company
            )
        return LocationType.objects.none()
    
    def perform_create(self, serializer):
        """Set company when creating location type."""
        serializer.save(company=self.request.user.current_company)


class LocationViewSet(ModelViewSet):
    """ViewSet for location management."""
    
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return locations for current company."""
        if self.request.user.current_company:
            return Location.objects.filter(
                warehouse__company=self.request.user.current_company
            ).select_related('warehouse', 'location_type', 'parent')
        return Location.objects.none()
    
    def list(self, request, *args, **kwargs):
        """List locations with filtering."""
        queryset = self.get_queryset()
        
        # Apply filters
        warehouse_id = request.query_params.get('warehouse')
        if warehouse_id:
            queryset = queryset.filter(warehouse_id=warehouse_id)
        
        location_type_id = request.query_params.get('location_type')
        if location_type_id:
            queryset = queryset.filter(location_type_id=location_type_id)
        
        is_active = request.query_params.get('active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Apply search
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(code__icontains=search) |
                Q(barcode__icontains=search)
            )
        
        # Paginate and serialize
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stock(self, request, pk=None):
        """Get stock in this location."""
        location = self.get_object()
        
        stock_quants = StockQuant.objects.filter(
            location=location,
            quantity__gt=0
        ).select_related('product')
        
        serializer = StockQuantSerializer(stock_quants, many=True)
        return Response(serializer.data)


class StockQuantViewSet(ModelViewSet):
    """ViewSet for stock quantity management."""
    
    serializer_class = StockQuantSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return stock quants for current company."""
        if self.request.user.current_company:
            return StockQuant.objects.filter(
                location__warehouse__company=self.request.user.current_company
            ).select_related('product', 'location', 'location__warehouse')
        return StockQuant.objects.none()
    
    def list(self, request, *args, **kwargs):
        """List stock quants with filtering."""
        queryset = self.get_queryset()
        
        # Apply filters
        product_id = request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        
        location_id = request.query_params.get('location')
        if location_id:
            queryset = queryset.filter(location_id=location_id)
        
        warehouse_id = request.query_params.get('warehouse')
        if warehouse_id:
            queryset = queryset.filter(location__warehouse_id=warehouse_id)
        
        # Filter by positive quantity
        positive_only = request.query_params.get('positive_only')
        if positive_only and positive_only.lower() == 'true':
            queryset = queryset.filter(quantity__gt=0)
        
        # Apply search
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(product__name__icontains=search) |
                Q(product__internal_reference__icontains=search) |
                Q(lot_number__icontains=search) |
                Q(serial_number__icontains=search)
            )
        
        # Apply ordering
        ordering = request.query_params.get('ordering', 'product__name')
        if ordering:
            queryset = queryset.order_by(ordering)
        
        # Paginate and serialize
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class StockMoveViewSet(ModelViewSet):
    """ViewSet for stock move management."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return stock moves for current company."""
        if self.request.user.current_company:
            return StockMove.objects.filter(
                company=self.request.user.current_company
            ).select_related(
                'source_location', 'destination_location',
                'created_by', 'confirmed_by'
            ).prefetch_related('lines__product')
        return StockMove.objects.none()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return StockMoveCreateSerializer
        return StockMoveSerializer
    
    def list(self, request, *args, **kwargs):
        """List stock moves with filtering."""
        queryset = self.get_queryset()
        
        # Apply filters
        move_type = request.query_params.get('type')
        if move_type:
            queryset = queryset.filter(move_type=move_type)
        
        state = request.query_params.get('state')
        if state:
            queryset = queryset.filter(state=state)
        
        source_location_id = request.query_params.get('source_location')
        if source_location_id:
            queryset = queryset.filter(source_location_id=source_location_id)
        
        destination_location_id = request.query_params.get('destination_location')
        if destination_location_id:
            queryset = queryset.filter(destination_location_id=destination_location_id)
        
        # Date range filtering
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(scheduled_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(scheduled_date__lte=date_to)
        
        # Apply search
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(origin_document__icontains=search) |
                Q(origin_reference__icontains=search)
            )
        
        # Apply ordering
        ordering = request.query_params.get('ordering', '-created_at')
        if ordering:
            queryset = queryset.order_by(ordering)
        
        # Paginate and serialize
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm a stock move."""
        stock_move = self.get_object()
        
        try:
            stock_move.confirm(request.user)
            return Response({
                'message': _('Stock move confirmed successfully'),
                'state': stock_move.state
            })
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def inventory_adjustment(self, request):
        """Create inventory adjustment."""
        serializer = InventoryAdjustmentSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            from modules.catalog.models import Product

            # Get validated data
            product_id = serializer.validated_data['product']
            location_id = serializer.validated_data['location']
            new_quantity = serializer.validated_data['new_quantity']
            reason = serializer.validated_data['reason']
            lot_number = serializer.validated_data.get('lot_number', '')
            serial_number = serializer.validated_data.get('serial_number', '')

            # Get product and location
            product = Product.objects.get(id=product_id)
            location = Location.objects.get(id=location_id)

            # Get current stock quant
            quant, created = StockQuant.objects.get_or_create(
                product=product,
                location=location,
                lot_number=lot_number,
                serial_number=serial_number,
                defaults={'quantity': Decimal('0'), 'cost_price': product.cost_price}
            )

            current_quantity = quant.quantity
            adjustment_quantity = new_quantity - current_quantity

            if adjustment_quantity == 0:
                return Response({
                    'message': _('No adjustment needed - quantities are the same')
                })

            # Create adjustment move
            move_type = 'IN' if adjustment_quantity > 0 else 'OUT'

            # Generate move name
            from core.sequences.services import SequenceService
            _, move_name = SequenceService.get_next_number(
                company=request.user.current_company,
                document_type='ADJUSTMENT',
                user=request.user
            )

            # Create stock move for adjustment
            if adjustment_quantity > 0:
                # Positive adjustment - incoming
                stock_move = StockMove.objects.create(
                    company=request.user.current_company,
                    name=move_name,
                    move_type='IN',
                    state='DRAFT',
                    scheduled_date=timezone.now(),
                    origin_document='ADJUSTMENT',
                    origin_reference=reason,
                    source_location=location,  # Dummy source for adjustment
                    destination_location=location,
                    created_by=request.user,
                    notes=f"Inventory adjustment: {reason}"
                )

                # Create move line
                StockMoveLine.objects.create(
                    move=stock_move,
                    product=product,
                    quantity_planned=abs(adjustment_quantity),
                    quantity_done=abs(adjustment_quantity),
                    unit_cost=product.cost_price,
                    lot_number=lot_number,
                    serial_number=serial_number
                )
            else:
                # Negative adjustment - outgoing
                stock_move = StockMove.objects.create(
                    company=request.user.current_company,
                    name=move_name,
                    move_type='OUT',
                    state='DRAFT',
                    scheduled_date=timezone.now(),
                    origin_document='ADJUSTMENT',
                    origin_reference=reason,
                    source_location=location,
                    destination_location=location,  # Dummy destination for adjustment
                    created_by=request.user,
                    notes=f"Inventory adjustment: {reason}"
                )

                # Create move line
                StockMoveLine.objects.create(
                    move=stock_move,
                    product=product,
                    quantity_planned=abs(adjustment_quantity),
                    quantity_done=abs(adjustment_quantity),
                    unit_cost=quant.cost_price,
                    lot_number=lot_number,
                    serial_number=serial_number
                )

            # Confirm and process the move
            stock_move.confirm(request.user)
            stock_move.process(request.user)

            # Update stock quant directly
            quant.quantity = new_quantity
            quant.save()

            return Response({
                'message': _('Inventory adjustment completed successfully'),
                'move_id': stock_move.id,
                'move_name': stock_move.name,
                'previous_quantity': current_quantity,
                'new_quantity': new_quantity,
                'adjustment_quantity': adjustment_quantity
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def stock_transfer(self, request):
        """Create stock transfer between locations."""
        serializer = StockTransferSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            from modules.catalog.models import Product

            # Get validated data
            product_id = serializer.validated_data['product']
            source_location_id = serializer.validated_data['source_location']
            destination_location_id = serializer.validated_data['destination_location']
            quantity = serializer.validated_data['quantity']
            reason = serializer.validated_data.get('reason', '')
            lot_number = serializer.validated_data.get('lot_number', '')
            serial_number = serializer.validated_data.get('serial_number', '')

            # Get objects
            product = Product.objects.get(id=product_id)
            source_location = Location.objects.get(id=source_location_id)
            destination_location = Location.objects.get(id=destination_location_id)

            # Generate move name
            from core.sequences.services import SequenceService
            _, move_name = SequenceService.get_next_number(
                company=request.user.current_company,
                document_type='TRANSFER',
                user=request.user
            )

            # Create internal transfer move
            stock_move = StockMove.objects.create(
                company=request.user.current_company,
                name=move_name,
                move_type='INTERNAL',
                state='DRAFT',
                scheduled_date=timezone.now(),
                origin_document='TRANSFER',
                origin_reference=reason,
                source_location=source_location,
                destination_location=destination_location,
                created_by=request.user,
                notes=f"Stock transfer: {reason}" if reason else "Stock transfer"
            )

            # Get cost from source location
            source_quant = StockQuant.objects.filter(
                product=product,
                location=source_location,
                lot_number=lot_number,
                serial_number=serial_number
            ).first()

            unit_cost = source_quant.cost_price if source_quant else product.cost_price

            # Create move line
            StockMoveLine.objects.create(
                move=stock_move,
                product=product,
                quantity_planned=quantity,
                quantity_done=quantity,
                unit_cost=unit_cost,
                lot_number=lot_number,
                serial_number=serial_number
            )

            # Confirm and process the move
            stock_move.confirm(request.user)
            stock_move.process(request.user)

            return Response({
                'message': _('Stock transfer completed successfully'),
                'move_id': stock_move.id,
                'move_name': stock_move.name,
                'quantity': quantity,
                'source_location': str(source_location),
                'destination_location': str(destination_location)
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def inventory_report(self, request):
        """Generate inventory report."""
        queryset = StockQuant.objects.filter(
            location__warehouse__company=request.user.current_company,
            quantity__gt=0
        ).select_related(
            'product', 'product__category', 'location', 'location__warehouse'
        )

        # Apply filters
        warehouse_id = request.query_params.get('warehouse')
        if warehouse_id:
            queryset = queryset.filter(location__warehouse_id=warehouse_id)

        category_id = request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(product__category_id=category_id)

        # Build report data
        report_data = []
        for quant in queryset:
            report_data.append({
                'product_id': quant.product.id,
                'product_name': quant.product.name,
                'internal_reference': quant.product.internal_reference,
                'category_name': quant.product.category.name if quant.product.category else '',
                'warehouse_name': quant.location.warehouse.name,
                'location_name': quant.location.full_path,
                'quantity': quant.quantity,
                'reserved_quantity': quant.reserved_quantity,
                'available_quantity': quant.available_quantity,
                'cost_price': quant.cost_price,
                'total_value': quant.total_value,
                'lot_number': quant.lot_number,
                'serial_number': quant.serial_number,
                'last_updated': quant.updated_at,
            })

        serializer = InventoryReportSerializer(report_data, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Process a stock move."""
        stock_move = self.get_object()
        
        try:
            stock_move.process(request.user)
            return Response({
                'message': _('Stock move processed successfully'),
                'state': stock_move.state,
                'effective_date': stock_move.effective_date
            })
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a stock move."""
        stock_move = self.get_object()
        
        try:
            stock_move.cancel()
            return Response({
                'message': _('Stock move cancelled successfully'),
                'state': stock_move.state
            })
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
