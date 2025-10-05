"""
Stock valuation system for inventory management.
Supports multiple valuation methods: FIFO, LIFO, Weighted Average, Standard Cost.
"""
from django.db import models, transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import uuid

from .models import StockQuant, StockMove, StockMoveLine
from modules.catalog.models import Product


class StockValuationMethod(models.TextChoices):
    """Stock valuation methods."""
    FIFO = 'FIFO', 'First In, First Out'
    LIFO = 'LIFO', 'Last In, First Out'
    WEIGHTED_AVERAGE = 'WEIGHTED_AVG', 'Weighted Average'
    STANDARD_COST = 'STANDARD', 'Standard Cost'
    MOVING_AVERAGE = 'MOVING_AVG', 'Moving Average'


class StockValuation(models.Model):
    """
    Stock valuation record for tracking inventory values.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='inventory_stock_valuations'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='inventory_stock_valuations'
    )
    warehouse = models.ForeignKey(
        'Warehouse',
        on_delete=models.CASCADE,
        related_name='inventory_stock_valuations'
    )
    location = models.ForeignKey(
        'Location',
        on_delete=models.CASCADE,
        related_name='inventory_stock_valuations'
    )
    
    # Valuation details
    valuation_date = models.DateTimeField(default=timezone.now)
    valuation_method = models.CharField(
        max_length=20,
        choices=StockValuationMethod.choices,
        default=StockValuationMethod.WEIGHTED_AVERAGE
    )
    
    # Quantities and values
    quantity_on_hand = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        default=Decimal('0')
    )
    unit_cost = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        default=Decimal('0')
    )
    total_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0')
    )
    
    # Reference to triggering move
    stock_move = models.ForeignKey(
        StockMove,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='valuations'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'inventory_stock_valuation'
        ordering = ['-valuation_date', '-created_at']
        indexes = [
            models.Index(fields=['company', 'product', 'warehouse']),
            models.Index(fields=['valuation_date']),
            models.Index(fields=['valuation_method']),
        ]
    
    def __str__(self):
        return f"{self.product.name} - {self.warehouse.name} - {self.total_value}"


class StockValuationLayer(models.Model):
    """
    Stock valuation layer for FIFO/LIFO calculations.
    Tracks individual cost layers for inventory.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='stock_valuation_layers'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='valuation_layers'
    )
    warehouse = models.ForeignKey(
        'Warehouse',
        on_delete=models.CASCADE,
        related_name='valuation_layers'
    )
    location = models.ForeignKey(
        'Location',
        on_delete=models.CASCADE,
        related_name='valuation_layers'
    )
    
    # Layer details
    layer_date = models.DateTimeField(default=timezone.now)
    unit_cost = models.DecimalField(
        max_digits=15,
        decimal_places=4
    )
    
    # Quantities
    original_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3
    )
    remaining_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3
    )
    
    # Values
    original_value = models.DecimalField(
        max_digits=15,
        decimal_places=2
    )
    remaining_value = models.DecimalField(
        max_digits=15,
        decimal_places=2
    )
    
    # Reference to source move
    source_move = models.ForeignKey(
        StockMove,
        on_delete=models.CASCADE,
        related_name='valuation_layers'
    )
    
    # Status
    is_exhausted = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'inventory_stock_valuation_layer'
        ordering = ['layer_date', 'created_at']
        indexes = [
            models.Index(fields=['company', 'product', 'warehouse']),
            models.Index(fields=['layer_date']),
            models.Index(fields=['is_exhausted']),
        ]
    
    def save(self, *args, **kwargs):
        """Calculate values on save."""
        self.original_value = self.original_quantity * self.unit_cost
        self.remaining_value = self.remaining_quantity * self.unit_cost
        self.is_exhausted = self.remaining_quantity <= 0
        super().save(*args, **kwargs)
    
    def consume(self, quantity: Decimal) -> Decimal:
        """
        Consume quantity from this layer.
        Returns the value consumed.
        """
        if quantity <= 0:
            return Decimal('0')
        
        consumed_qty = min(quantity, self.remaining_quantity)
        consumed_value = consumed_qty * self.unit_cost
        
        self.remaining_quantity -= consumed_qty
        self.remaining_value -= consumed_value
        self.is_exhausted = self.remaining_quantity <= 0
        
        self.save()
        return consumed_value


class StockValuationService:
    """
    Service for calculating stock valuations using different methods.
    """
    
    def __init__(self, company):
        self.company = company
    
    def calculate_valuation(self, product: Product, warehouse, location, 
                          method: str = StockValuationMethod.WEIGHTED_AVERAGE) -> Dict:
        """
        Calculate current stock valuation for a product at a location.
        """
        current_stock = StockQuant.objects.filter(
            product=product,
            warehouse=warehouse,
            location=location
        ).first()
        
        if not current_stock or current_stock.quantity <= 0:
            return {
                'quantity': Decimal('0'),
                'unit_cost': Decimal('0'),
                'total_value': Decimal('0'),
                'method': method
            }
        
        if method == StockValuationMethod.FIFO:
            return self._calculate_fifo_valuation(product, warehouse, location)
        elif method == StockValuationMethod.LIFO:
            return self._calculate_lifo_valuation(product, warehouse, location)
        elif method == StockValuationMethod.WEIGHTED_AVERAGE:
            return self._calculate_weighted_average_valuation(product, warehouse, location)
        elif method == StockValuationMethod.STANDARD_COST:
            return self._calculate_standard_cost_valuation(product, warehouse, location)
        elif method == StockValuationMethod.MOVING_AVERAGE:
            return self._calculate_moving_average_valuation(product, warehouse, location)
        else:
            raise ValueError(f"Unsupported valuation method: {method}")
    
    def _calculate_fifo_valuation(self, product: Product, warehouse, location) -> Dict:
        """Calculate FIFO (First In, First Out) valuation."""
        layers = StockValuationLayer.objects.filter(
            company=self.company,
            product=product,
            warehouse=warehouse,
            location=location,
            is_exhausted=False
        ).order_by('layer_date', 'created_at')
        
        total_quantity = Decimal('0')
        total_value = Decimal('0')
        
        for layer in layers:
            total_quantity += layer.remaining_quantity
            total_value += layer.remaining_value
        
        unit_cost = total_value / total_quantity if total_quantity > 0 else Decimal('0')
        
        return {
            'quantity': total_quantity,
            'unit_cost': unit_cost.quantize(Decimal('0.0001'), rounding=ROUND_HALF_UP),
            'total_value': total_value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'method': StockValuationMethod.FIFO,
            'layers_count': layers.count()
        }
    
    def _calculate_lifo_valuation(self, product: Product, warehouse, location) -> Dict:
        """Calculate LIFO (Last In, First Out) valuation."""
        layers = StockValuationLayer.objects.filter(
            company=self.company,
            product=product,
            warehouse=warehouse,
            location=location,
            is_exhausted=False
        ).order_by('-layer_date', '-created_at')
        
        total_quantity = Decimal('0')
        total_value = Decimal('0')
        
        for layer in layers:
            total_quantity += layer.remaining_quantity
            total_value += layer.remaining_value
        
        unit_cost = total_value / total_quantity if total_quantity > 0 else Decimal('0')
        
        return {
            'quantity': total_quantity,
            'unit_cost': unit_cost.quantize(Decimal('0.0001'), rounding=ROUND_HALF_UP),
            'total_value': total_value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'method': StockValuationMethod.LIFO,
            'layers_count': layers.count()
        }
    
    def _calculate_weighted_average_valuation(self, product: Product, warehouse, location) -> Dict:
        """Calculate Weighted Average valuation."""
        # Get all incoming moves for this product/location
        incoming_moves = StockMoveLine.objects.filter(
            move__company=self.company,
            product=product,
            location_dest=location,
            state='DONE',
            move__move_type__in=['IN', 'INTERNAL']
        ).order_by('move__date')
        
        total_quantity = Decimal('0')
        total_value = Decimal('0')
        
        for move_line in incoming_moves:
            if move_line.quantity > 0 and move_line.unit_cost > 0:
                total_quantity += move_line.quantity
                total_value += move_line.quantity * move_line.unit_cost
        
        # Get current stock quantity
        current_stock = StockQuant.objects.filter(
            product=product,
            warehouse=warehouse,
            location=location
        ).first()
        
        current_quantity = current_stock.quantity if current_stock else Decimal('0')
        unit_cost = total_value / total_quantity if total_quantity > 0 else Decimal('0')
        current_value = current_quantity * unit_cost
        
        return {
            'quantity': current_quantity,
            'unit_cost': unit_cost.quantize(Decimal('0.0001'), rounding=ROUND_HALF_UP),
            'total_value': current_value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'method': StockValuationMethod.WEIGHTED_AVERAGE
        }

    def _calculate_standard_cost_valuation(self, product: Product, warehouse, location) -> Dict:
        """Calculate Standard Cost valuation."""
        # Use the product's standard cost
        standard_cost = getattr(product, 'standard_cost', product.cost_price)

        current_stock = StockQuant.objects.filter(
            product=product,
            warehouse=warehouse,
            location=location
        ).first()

        current_quantity = current_stock.quantity if current_stock else Decimal('0')
        total_value = current_quantity * standard_cost

        return {
            'quantity': current_quantity,
            'unit_cost': standard_cost.quantize(Decimal('0.0001'), rounding=ROUND_HALF_UP),
            'total_value': total_value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'method': StockValuationMethod.STANDARD_COST
        }

    def _calculate_moving_average_valuation(self, product: Product, warehouse, location) -> Dict:
        """Calculate Moving Average valuation."""
        # Get the latest valuation record
        latest_valuation = StockValuation.objects.filter(
            company=self.company,
            product=product,
            warehouse=warehouse,
            location=location,
            valuation_method=StockValuationMethod.MOVING_AVERAGE
        ).order_by('-valuation_date').first()

        if latest_valuation:
            unit_cost = latest_valuation.unit_cost
        else:
            # Fallback to weighted average for initial calculation
            return self._calculate_weighted_average_valuation(product, warehouse, location)

        current_stock = StockQuant.objects.filter(
            product=product,
            warehouse=warehouse,
            location=location
        ).first()

        current_quantity = current_stock.quantity if current_stock else Decimal('0')
        total_value = current_quantity * unit_cost

        return {
            'quantity': current_quantity,
            'unit_cost': unit_cost.quantize(Decimal('0.0001'), rounding=ROUND_HALF_UP),
            'total_value': total_value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'method': StockValuationMethod.MOVING_AVERAGE
        }

    def process_stock_move(self, stock_move: StockMove, method: str = StockValuationMethod.WEIGHTED_AVERAGE):
        """
        Process stock move and update valuations accordingly.
        """
        with transaction.atomic():
            for move_line in stock_move.lines.filter(state='DONE'):
                if stock_move.move_type == 'IN':
                    self._process_incoming_move(move_line, method)
                elif stock_move.move_type == 'OUT':
                    self._process_outgoing_move(move_line, method)
                elif stock_move.move_type == 'INTERNAL':
                    self._process_internal_move(move_line, method)

    def _process_incoming_move(self, move_line: StockMoveLine, method: str):
        """Process incoming stock move (purchases, production, etc.)."""
        # Create valuation layer for FIFO/LIFO
        if method in [StockValuationMethod.FIFO, StockValuationMethod.LIFO]:
            StockValuationLayer.objects.create(
                company=self.company,
                product=move_line.product,
                warehouse=move_line.location_dest.warehouse,
                location=move_line.location_dest,
                layer_date=move_line.move.date,
                unit_cost=move_line.unit_cost,
                original_quantity=move_line.quantity,
                remaining_quantity=move_line.quantity,
                source_move=move_line.move
            )

        # Update or create valuation record
        self._update_valuation_record(
            move_line.product,
            move_line.location_dest.warehouse,
            move_line.location_dest,
            method,
            move_line.move
        )

    def _process_outgoing_move(self, move_line: StockMoveLine, method: str):
        """Process outgoing stock move (sales, consumption, etc.)."""
        if method in [StockValuationMethod.FIFO, StockValuationMethod.LIFO]:
            self._consume_valuation_layers(move_line, method)

        # Update valuation record
        self._update_valuation_record(
            move_line.product,
            move_line.location_src.warehouse,
            move_line.location_src,
            method,
            move_line.move
        )

    def _process_internal_move(self, move_line: StockMoveLine, method: str):
        """Process internal stock move (transfers between locations)."""
        # Process as outgoing from source location
        self._process_outgoing_move(move_line, method)

        # Process as incoming to destination location
        self._process_incoming_move(move_line, method)

    def _consume_valuation_layers(self, move_line: StockMoveLine, method: str):
        """Consume valuation layers for FIFO/LIFO methods."""
        remaining_qty = move_line.quantity

        if method == StockValuationMethod.FIFO:
            layers = StockValuationLayer.objects.filter(
                company=self.company,
                product=move_line.product,
                warehouse=move_line.location_src.warehouse,
                location=move_line.location_src,
                is_exhausted=False
            ).order_by('layer_date', 'created_at')
        else:  # LIFO
            layers = StockValuationLayer.objects.filter(
                company=self.company,
                product=move_line.product,
                warehouse=move_line.location_src.warehouse,
                location=move_line.location_src,
                is_exhausted=False
            ).order_by('-layer_date', '-created_at')

        total_consumed_value = Decimal('0')

        for layer in layers:
            if remaining_qty <= 0:
                break

            consumed_qty = min(remaining_qty, layer.remaining_quantity)
            consumed_value = layer.consume(consumed_qty)
            total_consumed_value += consumed_value
            remaining_qty -= consumed_qty

        # Update move line with consumed cost
        if move_line.quantity > 0:
            move_line.unit_cost = total_consumed_value / move_line.quantity
            move_line.save()

    def _update_valuation_record(self, product: Product, warehouse, location, method: str, stock_move: StockMove):
        """Update or create valuation record."""
        valuation_data = self.calculate_valuation(product, warehouse, location, method)

        StockValuation.objects.create(
            company=self.company,
            product=product,
            warehouse=warehouse,
            location=location,
            valuation_date=stock_move.date,
            valuation_method=method,
            quantity_on_hand=valuation_data['quantity'],
            unit_cost=valuation_data['unit_cost'],
            total_value=valuation_data['total_value'],
            stock_move=stock_move
        )

    def revalue_inventory(self, product: Product = None, warehouse=None,
                         method: str = StockValuationMethod.WEIGHTED_AVERAGE) -> Dict:
        """
        Revalue entire inventory or specific product/warehouse.
        """
        results = {
            'total_products': 0,
            'total_value': Decimal('0'),
            'revalued_items': []
        }

        # Build filter criteria
        filters = {'company': self.company}
        if product:
            filters['product'] = product
        if warehouse:
            filters['warehouse'] = warehouse

        # Get all stock quants to revalue
        stock_quants = StockQuant.objects.filter(**filters).select_related(
            'product', 'warehouse', 'location'
        )

        for quant in stock_quants:
            if quant.quantity > 0:
                valuation_data = self.calculate_valuation(
                    quant.product, quant.warehouse, quant.location, method
                )

                # Create valuation record
                StockValuation.objects.create(
                    company=self.company,
                    product=quant.product,
                    warehouse=quant.warehouse,
                    location=quant.location,
                    valuation_date=timezone.now(),
                    valuation_method=method,
                    quantity_on_hand=valuation_data['quantity'],
                    unit_cost=valuation_data['unit_cost'],
                    total_value=valuation_data['total_value']
                )

                results['total_products'] += 1
                results['total_value'] += valuation_data['total_value']
                results['revalued_items'].append({
                    'product': quant.product.name,
                    'warehouse': quant.warehouse.name,
                    'location': quant.location.name,
                    'quantity': valuation_data['quantity'],
                    'unit_cost': valuation_data['unit_cost'],
                    'total_value': valuation_data['total_value']
                })

        return results
