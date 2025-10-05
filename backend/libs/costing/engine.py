"""
Costing engine for inventory valuation using FIFO, LIFO, and WAC methods.
"""
from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from typing import List, Tuple, Optional
from .models import CostLayer, StockValuation


class CostingEngine:
    """
    Main costing engine for inventory valuation.
    """
    
    def __init__(self, company, costing_method='FIFO'):
        """
        Initialize costing engine.
        
        Args:
            company: Company instance
            costing_method: 'FIFO', 'LIFO', or 'WAC'
        """
        self.company = company
        self.costing_method = costing_method
    
    def process_incoming_stock(self, move_line):
        """
        Process incoming stock and create cost layers.
        
        Args:
            move_line: StockMoveLine instance for incoming stock
        """
        if self.costing_method in ['FIFO', 'LIFO']:
            self._create_cost_layer(move_line)
        elif self.costing_method == 'WAC':
            self._update_weighted_average_cost(move_line)
    
    def process_outgoing_stock(self, move_line):
        """
        Process outgoing stock and calculate cost of goods sold.
        
        Args:
            move_line: StockMoveLine instance for outgoing stock
            
        Returns:
            Decimal: Total cost of goods sold
        """
        if self.costing_method == 'FIFO':
            return self._consume_fifo(move_line)
        elif self.costing_method == 'LIFO':
            return self._consume_lifo(move_line)
        elif self.costing_method == 'WAC':
            return self._consume_weighted_average(move_line)
        
        return Decimal('0')
    
    def _create_cost_layer(self, move_line):
        """Create a new cost layer for FIFO/LIFO methods."""
        CostLayer.objects.create(
            product=move_line.product,
            location=move_line.move.destination_location,
            layer_date=move_line.move.effective_date or timezone.now(),
            unit_cost=move_line.unit_cost,
            original_quantity=move_line.quantity_done,
            remaining_quantity=move_line.quantity_done,
            lot_number=move_line.lot_number,
            serial_number=move_line.serial_number,
            source_move_line=move_line
        )
    
    def _consume_fifo(self, move_line):
        """Consume stock using FIFO method."""
        remaining_qty = move_line.quantity_done
        total_cost = Decimal('0')
        
        # Get cost layers ordered by date (oldest first)
        layers = CostLayer.objects.filter(
            product=move_line.product,
            location=move_line.move.source_location,
            remaining_quantity__gt=0
        ).order_by('layer_date')
        
        for layer in layers:
            if remaining_qty <= 0:
                break
            
            # Consume from this layer
            consume_qty = min(remaining_qty, layer.remaining_quantity)
            cost = layer.consume(consume_qty)
            total_cost += cost
            remaining_qty -= consume_qty
        
        if remaining_qty > 0:
            # Not enough stock - use product cost price
            total_cost += remaining_qty * move_line.product.cost_price
        
        return total_cost
    
    def _consume_lifo(self, move_line):
        """Consume stock using LIFO method."""
        remaining_qty = move_line.quantity_done
        total_cost = Decimal('0')
        
        # Get cost layers ordered by date (newest first)
        layers = CostLayer.objects.filter(
            product=move_line.product,
            location=move_line.move.source_location,
            remaining_quantity__gt=0
        ).order_by('-layer_date')
        
        for layer in layers:
            if remaining_qty <= 0:
                break
            
            # Consume from this layer
            consume_qty = min(remaining_qty, layer.remaining_quantity)
            cost = layer.consume(consume_qty)
            total_cost += cost
            remaining_qty -= consume_qty
        
        if remaining_qty > 0:
            # Not enough stock - use product cost price
            total_cost += remaining_qty * move_line.product.cost_price
        
        return total_cost
    
    def _update_weighted_average_cost(self, move_line):
        """Update weighted average cost for incoming stock."""
        from modules.inventory.models import StockQuant
        
        # Get current stock quant
        quant = StockQuant.objects.filter(
            product=move_line.product,
            location=move_line.move.destination_location,
            lot_number=move_line.lot_number,
            serial_number=move_line.serial_number
        ).first()
        
        if quant:
            # Calculate new weighted average cost
            current_value = quant.quantity * quant.cost_price
            incoming_value = move_line.quantity_done * move_line.unit_cost
            total_quantity = quant.quantity + move_line.quantity_done
            
            if total_quantity > 0:
                new_cost = (current_value + incoming_value) / total_quantity
                quant.cost_price = new_cost
                quant.save()
    
    def _consume_weighted_average(self, move_line):
        """Consume stock using weighted average cost."""
        from modules.inventory.models import StockQuant
        
        # Get current stock quant
        quant = StockQuant.objects.filter(
            product=move_line.product,
            location=move_line.move.source_location,
            lot_number=move_line.lot_number,
            serial_number=move_line.serial_number
        ).first()
        
        if quant and quant.cost_price > 0:
            return move_line.quantity_done * quant.cost_price
        else:
            # Use product cost price as fallback
            return move_line.quantity_done * move_line.product.cost_price
    
    def calculate_inventory_value(self, product=None, location=None, date=None):
        """
        Calculate total inventory value.
        
        Args:
            product: Optional product filter
            location: Optional location filter
            date: Optional date filter (defaults to now)
            
        Returns:
            Decimal: Total inventory value
        """
        from modules.inventory.models import StockQuant
        
        if date is None:
            date = timezone.now()
        
        queryset = StockQuant.objects.filter(
            location__warehouse__company=self.company,
            quantity__gt=0
        )
        
        if product:
            queryset = queryset.filter(product=product)
        
        if location:
            queryset = queryset.filter(location=location)
        
        total_value = Decimal('0')
        
        for quant in queryset:
            if self.costing_method in ['FIFO', 'LIFO']:
                # Sum up cost layers
                layers = CostLayer.objects.filter(
                    product=quant.product,
                    location=quant.location,
                    remaining_quantity__gt=0
                )
                value = sum(layer.remaining_value for layer in layers)
            else:
                # Use weighted average cost
                value = quant.quantity * quant.cost_price
            
            total_value += value
        
        return total_value
    
    def create_valuation_snapshot(self, date=None):
        """
        Create a valuation snapshot for all products.
        
        Args:
            date: Date for the snapshot (defaults to now)
        """
        from modules.inventory.models import StockQuant
        
        if date is None:
            date = timezone.now()
        
        with transaction.atomic():
            # Get all stock quants with positive quantity
            quants = StockQuant.objects.filter(
                location__warehouse__company=self.company,
                quantity__gt=0
            ).select_related('product', 'location')
            
            for quant in quants:
                if self.costing_method in ['FIFO', 'LIFO']:
                    # Calculate value from cost layers
                    layers = CostLayer.objects.filter(
                        product=quant.product,
                        location=quant.location,
                        remaining_quantity__gt=0
                    )
                    total_value = sum(layer.remaining_value for layer in layers)
                    unit_cost = total_value / quant.quantity if quant.quantity > 0 else Decimal('0')
                else:
                    # Use weighted average cost
                    unit_cost = quant.cost_price
                    total_value = quant.quantity * unit_cost
                
                # Create or update valuation record
                StockValuation.objects.update_or_create(
                    product=quant.product,
                    location=quant.location,
                    valuation_date=date,
                    defaults={
                        'company': self.company,
                        'quantity': quant.quantity,
                        'unit_cost': unit_cost,
                        'total_value': total_value,
                        'costing_method': self.costing_method,
                    }
                )
    
    def revalue_inventory(self, product, location, new_unit_cost, reason=''):
        """
        Revalue inventory for a specific product and location.
        
        Args:
            product: Product instance
            location: Location instance
            new_unit_cost: New unit cost
            reason: Reason for revaluation
        """
        from modules.inventory.models import StockQuant
        from .models import CostAdjustment, CostAdjustmentLine
        
        # Get current stock quant
        quant = StockQuant.objects.filter(
            product=product,
            location=location
        ).first()
        
        if not quant or quant.quantity <= 0:
            return
        
        old_unit_cost = quant.cost_price
        adjustment_amount = (new_unit_cost - old_unit_cost) * quant.quantity
        
        if adjustment_amount == 0:
            return
        
        with transaction.atomic():
            # Create cost adjustment document
            adjustment = CostAdjustment.objects.create(
                company=self.company,
                reference=f"REVAL-{timezone.now().strftime('%Y%m%d-%H%M%S')}",
                adjustment_type='REVALUATION',
                adjustment_date=timezone.now(),
                description=f"Inventory revaluation for {product.display_name}",
                reason=reason,
                created_by_id=1,  # System user - should be passed as parameter
            )
            
            # Create adjustment line
            CostAdjustmentLine.objects.create(
                adjustment=adjustment,
                product=product,
                location=location,
                quantity=quant.quantity,
                old_unit_cost=old_unit_cost,
                new_unit_cost=new_unit_cost,
            )
            
            # Update stock quant cost
            quant.cost_price = new_unit_cost
            quant.save()
            
            # Update cost layers if using FIFO/LIFO
            if self.costing_method in ['FIFO', 'LIFO']:
                CostLayer.objects.filter(
                    product=product,
                    location=location,
                    remaining_quantity__gt=0
                ).update(unit_cost=new_unit_cost)
