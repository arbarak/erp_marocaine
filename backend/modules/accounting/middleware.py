"""
Middleware for accounting integration.
"""
from django.utils.deprecation import MiddlewareMixin
from modules.invoicing.models import Invoice, Payment
from modules.inventory.models import StockMove


class AccountingMiddleware(MiddlewareMixin):
    """
    Middleware to track model state changes for automatic accounting journal entries.
    """
    
    def process_request(self, request):
        """Store original states of models that need accounting integration."""
        # This will be called before the view is executed
        request._accounting_original_states = {}
        return None
    
    def process_response(self, request, response):
        """Clean up stored states after request processing."""
        if hasattr(request, '_accounting_original_states'):
            delattr(request, '_accounting_original_states')
        return response


def track_model_state_changes():
    """
    Monkey patch model save methods to track state changes.
    This should be called in the app's ready() method.
    """
    
    # Track Invoice state changes
    original_invoice_save = Invoice.save
    
    def invoice_save_with_tracking(self, *args, **kwargs):
        # Store original state before saving
        if self.pk:
            try:
                original = Invoice.objects.get(pk=self.pk)
                self._original_state = original.state
            except Invoice.DoesNotExist:
                self._original_state = None
        else:
            self._original_state = None
        
        # Call original save method
        result = original_invoice_save(self, *args, **kwargs)
        return result
    
    Invoice.save = invoice_save_with_tracking
    
    # Track Payment state changes
    original_payment_save = Payment.save
    
    def payment_save_with_tracking(self, *args, **kwargs):
        # Store original state before saving
        if self.pk:
            try:
                original = Payment.objects.get(pk=self.pk)
                self._original_state = original.state
            except Payment.DoesNotExist:
                self._original_state = None
        else:
            self._original_state = None
        
        # Call original save method
        result = original_payment_save(self, *args, **kwargs)
        return result
    
    Payment.save = payment_save_with_tracking
    
    # Track StockMove state changes
    original_stock_move_save = StockMove.save
    
    def stock_move_save_with_tracking(self, *args, **kwargs):
        # Store original state before saving
        if self.pk:
            try:
                original = StockMove.objects.get(pk=self.pk)
                self._original_state = original.state
            except StockMove.DoesNotExist:
                self._original_state = None
        else:
            self._original_state = None
        
        # Call original save method
        result = original_stock_move_save(self, *args, **kwargs)
        return result
    
    StockMove.save = stock_move_save_with_tracking
