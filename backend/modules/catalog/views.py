"""
Views for catalog app.
"""
from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.utils.translation import gettext_lazy as _
from django.db.models import Q, Sum, Avg
from .models import Category, UnitOfMeasure, Product
from .serializers import (
    CategorySerializer, CategoryTreeSerializer, UnitOfMeasureSerializer,
    ProductListSerializer, ProductDetailSerializer, ProductCreateSerializer,
    ProductStockSerializer, ProductValuationSerializer
)


class CategoryViewSet(ModelViewSet):
    """ViewSet for category management."""
    
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return categories for current company."""
        if self.request.user.current_company:
            return Category.objects.filter(
                company=self.request.user.current_company
            ).select_related('parent')
        return Category.objects.none()
    
    def perform_create(self, serializer):
        """Set company when creating category."""
        serializer.save(company=self.request.user.current_company)
    
    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Get category tree structure."""
        # Get root categories (no parent)
        root_categories = self.get_queryset().filter(
            parent=None,
            is_active=True
        ).order_by('sort_order', 'name')
        
        serializer = CategoryTreeSerializer(root_categories, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """Get products in this category."""
        category = self.get_object()
        
        # Get products in this category and all subcategories
        descendant_categories = [category] + category.get_descendants()
        products = Product.objects.filter(
            category__in=descendant_categories,
            is_active=True
        )
        
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class UnitOfMeasureViewSet(ModelViewSet):
    """ViewSet for unit of measure management."""
    
    serializer_class = UnitOfMeasureSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return UoMs for current company."""
        if self.request.user.current_company:
            return UnitOfMeasure.objects.filter(
                company=self.request.user.current_company
            ).select_related('base_unit')
        return UnitOfMeasure.objects.none()
    
    def perform_create(self, serializer):
        """Set company when creating UoM."""
        serializer.save(company=self.request.user.current_company)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get UoMs grouped by type."""
        uoms = self.get_queryset().filter(is_active=True)
        
        grouped = {}
        for uom in uoms:
            if uom.type not in grouped:
                grouped[uom.type] = []
            grouped[uom.type].append(UnitOfMeasureSerializer(uom).data)
        
        return Response(grouped)


class ProductViewSet(ModelViewSet):
    """ViewSet for product management."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return products for current company."""
        if self.request.user.current_company:
            return Product.objects.filter(
                company=self.request.user.current_company
            ).select_related('category', 'uom', 'purchase_uom', 'tax_profile')
        return Product.objects.none()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return ProductCreateSerializer
        elif self.action == 'list':
            return ProductListSerializer
        return ProductDetailSerializer
    
    def list(self, request, *args, **kwargs):
        """List products with filtering and search."""
        queryset = self.get_queryset()
        
        # Apply filters
        category_id = request.query_params.get('category')
        if category_id:
            try:
                category = Category.objects.get(id=category_id)
                descendant_categories = [category] + category.get_descendants()
                queryset = queryset.filter(category__in=descendant_categories)
            except Category.DoesNotExist:
                pass
        
        product_type = request.query_params.get('type')
        if product_type:
            queryset = queryset.filter(product_type=product_type)
        
        is_active = request.query_params.get('active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        can_be_sold = request.query_params.get('can_be_sold')
        if can_be_sold is not None:
            queryset = queryset.filter(can_be_sold=can_be_sold.lower() == 'true')
        
        can_be_purchased = request.query_params.get('can_be_purchased')
        if can_be_purchased is not None:
            queryset = queryset.filter(can_be_purchased=can_be_purchased.lower() == 'true')
        
        # Apply search
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(internal_reference__icontains=search) |
                Q(barcode__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Apply ordering
        ordering = request.query_params.get('ordering', 'name')
        if ordering:
            queryset = queryset.order_by(ordering)
        
        # Paginate and serialize
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stock(self, request, pk=None):
        """Get stock information for a product."""
        product = self.get_object()
        
        if not product.track_inventory:
            return Response({
                'message': _('This product does not track inventory')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        from modules.inventory.models import StockQuant
        
        stock_quants = StockQuant.objects.filter(
            product=product,
            location__warehouse__company=self.request.user.current_company
        ).select_related('location', 'location__warehouse')
        
        stock_data = []
        for quant in stock_quants:
            stock_data.append({
                'product_id': product.id,
                'product_name': product.name,
                'internal_reference': product.internal_reference,
                'location_id': quant.location.id,
                'location_name': str(quant.location),
                'quantity': quant.quantity,
                'reserved_quantity': quant.reserved_quantity,
                'available_quantity': quant.available_quantity,
                'cost_price': quant.cost_price,
                'total_value': quant.total_value,
                'lot_number': quant.lot_number,
                'serial_number': quant.serial_number,
            })
        
        serializer = ProductStockSerializer(stock_data, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def valuation(self, request, pk=None):
        """Get valuation information for a product."""
        product = self.get_object()
        
        if not product.track_inventory:
            return Response({
                'message': _('This product does not track inventory')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        from modules.inventory.models import StockQuant
        from libs.costing.models import StockValuation
        
        # Get current stock summary
        stock_summary = StockQuant.objects.filter(
            product=product,
            location__warehouse__company=self.request.user.current_company
        ).aggregate(
            total_quantity=Sum('quantity'),
            total_value=Sum('total_value')
        )
        
        total_quantity = stock_summary['total_quantity'] or 0
        total_value = stock_summary['total_value'] or 0
        average_cost = total_value / total_quantity if total_quantity > 0 else 0
        
        # Get latest valuation
        latest_valuation = StockValuation.objects.filter(
            product=product,
            company=self.request.user.current_company
        ).order_by('-valuation_date').first()
        
        valuation_data = {
            'product_id': product.id,
            'product_name': product.name,
            'internal_reference': product.internal_reference,
            'category_name': product.category.name if product.category else '',
            'total_quantity': total_quantity,
            'average_cost': average_cost,
            'total_value': total_value,
            'costing_method': latest_valuation.costing_method if latest_valuation else 'WAC',
            'last_updated': latest_valuation.valuation_date if latest_valuation else None,
        }
        
        serializer = ProductValuationSerializer(valuation_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get products with low stock levels."""
        # This is a placeholder - in a real implementation, you would
        # define minimum stock levels and compare against current stock
        products = self.get_queryset().filter(
            track_inventory=True,
            is_active=True
        )
        
        low_stock_products = []
        for product in products:
            current_stock = product.get_current_stock()
            # Placeholder logic - assume minimum stock is 10
            if current_stock < 10:
                low_stock_products.append(product)
        
        serializer = ProductListSerializer(low_stock_products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_update_prices(self, request):
        """Bulk update product prices."""
        product_ids = request.data.get('product_ids', [])
        price_adjustment = request.data.get('price_adjustment', {})
        
        if not product_ids or not price_adjustment:
            return Response({
                'error': _('Product IDs and price adjustment data required')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        products = self.get_queryset().filter(id__in=product_ids)
        updated_count = 0
        
        for product in products:
            if 'list_price' in price_adjustment:
                product.list_price = price_adjustment['list_price']
            if 'cost_price' in price_adjustment:
                product.cost_price = price_adjustment['cost_price']
            
            product.save()
            updated_count += 1
        
        return Response({
            'message': _('Updated {} products').format(updated_count),
            'updated_count': updated_count
        })
