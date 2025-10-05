"""
Stock valuation views and API endpoints.
"""
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import datetime, timedelta
from decimal import Decimal

from common.permissions import CompanyContextPermission
from modules.catalog.models import Product
from .models import Warehouse, Location, StockQuant
from .valuation import (
    StockValuation, StockValuationLayer, StockValuationService,
    StockValuationMethod
)
from .serializers import (
    StockValuationSerializer, StockValuationLayerSerializer
)


class StockValuationViewSet(viewsets.ModelViewSet):
    """ViewSet for stock valuation management."""
    
    serializer_class = StockValuationSerializer
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    
    def get_queryset(self):
        """Filter queryset by company."""
        return StockValuation.objects.filter(
            company=self.request.user.current_company
        ).select_related('product', 'warehouse', 'location', 'stock_move')
    
    @action(detail=False, methods=['get'])
    def current_valuation(self, request):
        """Get current stock valuation summary."""
        company = request.user.current_company
        valuation_service = StockValuationService(company)
        
        # Get query parameters
        product_id = request.query_params.get('product_id')
        warehouse_id = request.query_params.get('warehouse_id')
        location_id = request.query_params.get('location_id')
        method = request.query_params.get('method', StockValuationMethod.WEIGHTED_AVERAGE)
        
        # Build filters
        filters = {'company': company}
        if product_id:
            filters['product_id'] = product_id
        if warehouse_id:
            filters['warehouse_id'] = warehouse_id
        if location_id:
            filters['location_id'] = location_id
        
        # Get stock quants
        stock_quants = StockQuant.objects.filter(**filters).select_related(
            'product', 'warehouse', 'location'
        )
        
        valuations = []
        total_value = Decimal('0')
        
        for quant in stock_quants:
            if quant.quantity > 0:
                valuation_data = valuation_service.calculate_valuation(
                    quant.product, quant.warehouse, quant.location, method
                )
                
                valuations.append({
                    'product_id': str(quant.product.id),
                    'product_name': quant.product.name,
                    'product_sku': quant.product.internal_reference,
                    'warehouse_id': str(quant.warehouse.id),
                    'warehouse_name': quant.warehouse.name,
                    'location_id': str(quant.location.id),
                    'location_name': quant.location.name,
                    'quantity': valuation_data['quantity'],
                    'unit_cost': valuation_data['unit_cost'],
                    'total_value': valuation_data['total_value'],
                    'method': valuation_data['method']
                })
                
                total_value += valuation_data['total_value']
        
        return Response({
            'total_value': total_value,
            'total_items': len(valuations),
            'method': method,
            'valuations': valuations
        })
    
    @action(detail=False, methods=['post'])
    def revalue_inventory(self, request):
        """Revalue inventory using specified method."""
        company = request.user.current_company
        valuation_service = StockValuationService(company)
        
        # Get parameters
        product_id = request.data.get('product_id')
        warehouse_id = request.data.get('warehouse_id')
        method = request.data.get('method', StockValuationMethod.WEIGHTED_AVERAGE)
        
        # Validate method
        if method not in [choice[0] for choice in StockValuationMethod.choices]:
            return Response(
                {'error': f'Invalid valuation method: {method}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get objects if IDs provided
            product = None
            warehouse = None
            
            if product_id:
                try:
                    product = Product.objects.get(id=product_id, company=company)
                except Product.DoesNotExist:
                    return Response(
                        {'error': 'Product not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            if warehouse_id:
                try:
                    warehouse = Warehouse.objects.get(id=warehouse_id, company=company)
                except Warehouse.DoesNotExist:
                    return Response(
                        {'error': 'Warehouse not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Perform revaluation
            results = valuation_service.revalue_inventory(product, warehouse, method)
            
            return Response({
                'message': 'Inventory revaluation completed successfully',
                'results': results
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def valuation_history(self, request):
        """Get valuation history for analysis."""
        company = request.user.current_company
        
        # Get query parameters
        product_id = request.query_params.get('product_id')
        warehouse_id = request.query_params.get('warehouse_id')
        days = int(request.query_params.get('days', 30))
        method = request.query_params.get('method')
        
        # Calculate date range
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Build filters
        filters = {
            'company': company,
            'valuation_date__range': [start_date, end_date]
        }
        
        if product_id:
            filters['product_id'] = product_id
        if warehouse_id:
            filters['warehouse_id'] = warehouse_id
        if method:
            filters['valuation_method'] = method
        
        # Get valuations
        valuations = StockValuation.objects.filter(**filters).select_related(
            'product', 'warehouse', 'location'
        ).order_by('-valuation_date')
        
        # Group by product and calculate trends
        history_data = {}
        
        for valuation in valuations:
            key = f"{valuation.product.id}_{valuation.warehouse.id}_{valuation.location.id}"
            
            if key not in history_data:
                history_data[key] = {
                    'product_name': valuation.product.name,
                    'warehouse_name': valuation.warehouse.name,
                    'location_name': valuation.location.name,
                    'valuations': []
                }
            
            history_data[key]['valuations'].append({
                'date': valuation.valuation_date.isoformat(),
                'quantity': valuation.quantity_on_hand,
                'unit_cost': valuation.unit_cost,
                'total_value': valuation.total_value,
                'method': valuation.valuation_method
            })
        
        return Response({
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days
            },
            'history': list(history_data.values())
        })
    
    @action(detail=False, methods=['get'])
    def valuation_comparison(self, request):
        """Compare valuations using different methods."""
        company = request.user.current_company
        valuation_service = StockValuationService(company)
        
        # Get query parameters
        product_id = request.query_params.get('product_id')
        warehouse_id = request.query_params.get('warehouse_id')
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = Product.objects.get(id=product_id, company=company)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Build filters for stock quants
        filters = {'product': product, 'company': company}
        if warehouse_id:
            filters['warehouse_id'] = warehouse_id
        
        stock_quants = StockQuant.objects.filter(**filters).select_related(
            'warehouse', 'location'
        )
        
        comparisons = []
        
        for quant in stock_quants:
            if quant.quantity > 0:
                location_comparison = {
                    'warehouse_name': quant.warehouse.name,
                    'location_name': quant.location.name,
                    'quantity': quant.quantity,
                    'methods': {}
                }
                
                # Calculate valuation using different methods
                for method_code, method_name in StockValuationMethod.choices:
                    try:
                        valuation_data = valuation_service.calculate_valuation(
                            product, quant.warehouse, quant.location, method_code
                        )
                        location_comparison['methods'][method_code] = {
                            'method_name': method_name,
                            'unit_cost': valuation_data['unit_cost'],
                            'total_value': valuation_data['total_value']
                        }
                    except Exception as e:
                        location_comparison['methods'][method_code] = {
                            'method_name': method_name,
                            'error': str(e)
                        }
                
                comparisons.append(location_comparison)
        
        return Response({
            'product_name': product.name,
            'product_sku': product.internal_reference,
            'comparisons': comparisons
        })
    
    @action(detail=False, methods=['get'])
    def valuation_analytics(self, request):
        """Get valuation analytics and insights."""
        company = request.user.current_company
        
        # Get date range
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Get recent valuations
        recent_valuations = StockValuation.objects.filter(
            company=company,
            valuation_date__range=[start_date, end_date]
        )
        
        # Calculate analytics
        total_value = recent_valuations.aggregate(
            total=Sum('total_value')
        )['total'] or Decimal('0')
        
        # Method distribution
        method_distribution = recent_valuations.values('valuation_method').annotate(
            count=Count('id'),
            total_value=Sum('total_value')
        )
        
        # Top valued products
        top_products = recent_valuations.values(
            'product__name', 'product__internal_reference'
        ).annotate(
            total_value=Sum('total_value'),
            avg_unit_cost=Sum('unit_cost') / Count('id')
        ).order_by('-total_value')[:10]
        
        # Warehouse distribution
        warehouse_distribution = recent_valuations.values(
            'warehouse__name'
        ).annotate(
            total_value=Sum('total_value'),
            product_count=Count('product', distinct=True)
        ).order_by('-total_value')
        
        return Response({
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days
            },
            'summary': {
                'total_value': total_value,
                'total_records': recent_valuations.count(),
                'unique_products': recent_valuations.values('product').distinct().count(),
                'unique_warehouses': recent_valuations.values('warehouse').distinct().count()
            },
            'method_distribution': list(method_distribution),
            'top_products': list(top_products),
            'warehouse_distribution': list(warehouse_distribution)
        })


class StockValuationLayerViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for stock valuation layers (read-only)."""
    
    serializer_class = StockValuationLayerSerializer
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    
    def get_queryset(self):
        """Filter queryset by company."""
        return StockValuationLayer.objects.filter(
            company=self.request.user.current_company
        ).select_related('product', 'warehouse', 'location', 'source_move')
    
    @action(detail=False, methods=['get'])
    def active_layers(self, request):
        """Get active (non-exhausted) valuation layers."""
        company = request.user.current_company
        
        # Get query parameters
        product_id = request.query_params.get('product_id')
        warehouse_id = request.query_params.get('warehouse_id')
        
        # Build filters
        filters = {'company': company, 'is_exhausted': False}
        if product_id:
            filters['product_id'] = product_id
        if warehouse_id:
            filters['warehouse_id'] = warehouse_id
        
        layers = StockValuationLayer.objects.filter(**filters).select_related(
            'product', 'warehouse', 'location'
        ).order_by('layer_date')
        
        serializer = self.get_serializer(layers, many=True)
        return Response(serializer.data)
