"""
Celery tasks for costing engine.
"""
from celery import shared_task
from django.utils import timezone
from django.db import transaction
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


@shared_task
def daily_inventory_valuation():
    """
    Daily task to create inventory valuation snapshots for all companies.
    """
    from core.companies.models import Company
    from .engine import CostingEngine
    
    logger.info("Starting daily inventory valuation task")
    
    companies = Company.objects.filter(is_active=True)
    total_companies = companies.count()
    processed_companies = 0
    
    for company in companies:
        try:
            with transaction.atomic():
                # Get company's costing method
                costing_method = company.settings.default_costing_method
                
                # Create costing engine
                engine = CostingEngine(company, costing_method)
                
                # Create valuation snapshot
                engine.create_valuation_snapshot()
                
                processed_companies += 1
                logger.info(f"Processed valuation for company {company.name}")
                
        except Exception as e:
            logger.error(f"Error processing valuation for company {company.name}: {str(e)}")
    
    logger.info(f"Daily inventory valuation completed. Processed {processed_companies}/{total_companies} companies")
    return {
        'total_companies': total_companies,
        'processed_companies': processed_companies,
        'timestamp': timezone.now().isoformat()
    }


@shared_task
def calculate_inventory_value(company_id, product_id=None, location_id=None):
    """
    Calculate inventory value for a specific company, optionally filtered by product/location.
    
    Args:
        company_id: Company ID
        product_id: Optional product ID filter
        location_id: Optional location ID filter
    """
    from core.companies.models import Company
    from modules.catalog.models import Product
    from modules.inventory.models import Location
    from .engine import CostingEngine
    
    try:
        company = Company.objects.get(id=company_id)
        costing_method = company.settings.default_costing_method
        
        # Create costing engine
        engine = CostingEngine(company, costing_method)
        
        # Get optional filters
        product = None
        if product_id:
            product = Product.objects.get(id=product_id, company=company)
        
        location = None
        if location_id:
            location = Location.objects.get(id=location_id, warehouse__company=company)
        
        # Calculate inventory value
        total_value = engine.calculate_inventory_value(
            product=product,
            location=location
        )
        
        logger.info(f"Calculated inventory value for company {company.name}: {total_value}")
        
        return {
            'company_id': company_id,
            'company_name': company.name,
            'product_id': product_id,
            'location_id': location_id,
            'total_value': str(total_value),
            'costing_method': costing_method,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error calculating inventory value: {str(e)}")
        raise


@shared_task
def revalue_product_inventory(company_id, product_id, location_id, new_unit_cost, reason='', user_id=None):
    """
    Revalue inventory for a specific product and location.
    
    Args:
        company_id: Company ID
        product_id: Product ID
        location_id: Location ID
        new_unit_cost: New unit cost (as string to preserve precision)
        reason: Reason for revaluation
        user_id: User performing the revaluation
    """
    from core.companies.models import Company
    from modules.catalog.models import Product
    from modules.inventory.models import Location
    from core.accounts.models import User
    from .engine import CostingEngine
    
    try:
        company = Company.objects.get(id=company_id)
        product = Product.objects.get(id=product_id, company=company)
        location = Location.objects.get(id=location_id, warehouse__company=company)
        
        # Convert string to Decimal
        new_unit_cost = Decimal(str(new_unit_cost))
        
        # Get costing method
        costing_method = company.settings.default_costing_method
        
        # Create costing engine
        engine = CostingEngine(company, costing_method)
        
        # Perform revaluation
        engine.revalue_inventory(
            product=product,
            location=location,
            new_unit_cost=new_unit_cost,
            reason=reason
        )
        
        logger.info(f"Revalued inventory for {product.name} at {location}: {new_unit_cost}")
        
        return {
            'company_id': company_id,
            'product_id': product_id,
            'location_id': location_id,
            'new_unit_cost': str(new_unit_cost),
            'reason': reason,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error revaluing inventory: {str(e)}")
        raise


@shared_task
def cleanup_old_valuations(days_to_keep=90):
    """
    Clean up old stock valuation records.
    
    Args:
        days_to_keep: Number of days of valuation history to keep
    """
    from .models import StockValuation
    from datetime import timedelta
    
    cutoff_date = timezone.now() - timedelta(days=days_to_keep)
    
    try:
        deleted_count, _ = StockValuation.objects.filter(
            valuation_date__lt=cutoff_date
        ).delete()
        
        logger.info(f"Cleaned up {deleted_count} old valuation records")
        
        return {
            'deleted_count': deleted_count,
            'cutoff_date': cutoff_date.isoformat(),
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error cleaning up old valuations: {str(e)}")
        raise


@shared_task
def process_cost_layers_cleanup():
    """
    Clean up fully consumed cost layers (remaining_quantity = 0).
    """
    from .models import CostLayer
    
    try:
        deleted_count, _ = CostLayer.objects.filter(
            remaining_quantity=0
        ).delete()
        
        logger.info(f"Cleaned up {deleted_count} consumed cost layers")
        
        return {
            'deleted_count': deleted_count,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error cleaning up cost layers: {str(e)}")
        raise


@shared_task
def recalculate_stock_values(company_id, costing_method=None):
    """
    Recalculate all stock values for a company using specified costing method.
    
    Args:
        company_id: Company ID
        costing_method: Costing method to use (FIFO, LIFO, WAC)
    """
    from core.companies.models import Company
    from modules.inventory.models import StockQuant
    from .engine import CostingEngine
    
    try:
        company = Company.objects.get(id=company_id)
        
        if not costing_method:
            costing_method = company.settings.default_costing_method
        
        # Create costing engine
        engine = CostingEngine(company, costing_method)
        
        # Get all stock quants for the company
        stock_quants = StockQuant.objects.filter(
            location__warehouse__company=company,
            quantity__gt=0
        ).select_related('product', 'location')
        
        updated_count = 0
        
        with transaction.atomic():
            for quant in stock_quants:
                if costing_method == 'WAC':
                    # For WAC, recalculate based on current cost layers or product cost
                    if quant.cost_price <= 0:
                        quant.cost_price = quant.product.cost_price
                        quant.save()
                        updated_count += 1
                else:
                    # For FIFO/LIFO, recalculate from cost layers
                    from .models import CostLayer
                    
                    layers = CostLayer.objects.filter(
                        product=quant.product,
                        location=quant.location,
                        remaining_quantity__gt=0
                    )
                    
                    if layers.exists():
                        total_value = sum(layer.remaining_value for layer in layers)
                        total_quantity = sum(layer.remaining_quantity for layer in layers)
                        
                        if total_quantity > 0:
                            new_cost = total_value / total_quantity
                            if new_cost != quant.cost_price:
                                quant.cost_price = new_cost
                                quant.save()
                                updated_count += 1
        
        logger.info(f"Recalculated {updated_count} stock values for company {company.name}")
        
        return {
            'company_id': company_id,
            'company_name': company.name,
            'costing_method': costing_method,
            'updated_count': updated_count,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error recalculating stock values: {str(e)}")
        raise
