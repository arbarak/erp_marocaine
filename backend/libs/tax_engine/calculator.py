"""
Tax calculation engine for Morocco compliance.
Handles TVA and RAS/TVA calculations with proper rounding for Morocco regulations.
"""
from decimal import Decimal, ROUND_HALF_UP, ROUND_HALF_DOWN, ROUND_UP, ROUND_DOWN
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from django.utils import timezone
from .models import TaxRate, TaxRateVersion


@dataclass
class TaxLineItem:
    """Represents a line item for tax calculation."""
    quantity: Decimal
    unit_price: Decimal
    discount_amount: Decimal = Decimal('0.00')
    discount_percent: Decimal = Decimal('0.00')
    tax_rates: List[TaxRate] = None
    
    def __post_init__(self):
        if self.tax_rates is None:
            self.tax_rates = []


@dataclass
class TaxCalculationResult:
    """Result of tax calculation."""
    base_amount: Decimal
    tax_amount: Decimal
    withheld_tax_amount: Decimal
    total_amount: Decimal
    tax_details: List[Dict[str, Any]]


class TaxCalculator:
    """
    Tax calculation engine for Moroccan compliance.
    """
    
    ROUNDING_METHODS = {
        'ROUND_HALF_UP': ROUND_HALF_UP,
        'ROUND_HALF_DOWN': ROUND_HALF_DOWN,
        'ROUND_UP': ROUND_UP,
        'ROUND_DOWN': ROUND_DOWN,
    }
    
    def __init__(self, company=None, calculation_date=None):
        """
        Initialize tax calculator.
        
        Args:
            company: Company instance for settings
            calculation_date: Date for tax rate versioning
        """
        self.company = company
        self.calculation_date = calculation_date or timezone.now().date()
        
        # Get rounding method from company settings
        if company and hasattr(company, 'tax_rounding_method'):
            self.rounding_method = self.ROUNDING_METHODS.get(
                company.tax_rounding_method, 
                ROUND_HALF_UP
            )
        else:
            self.rounding_method = ROUND_HALF_UP
        
        # Get inclusive tax setting
        self.inclusive_taxes = (
            company.inclusive_taxes if company else False
        )
    
    def calculate_line_taxes(self, line_item: TaxLineItem) -> TaxCalculationResult:
        """
        Calculate taxes for a single line item.
        
        Args:
            line_item: TaxLineItem instance
            
        Returns:
            TaxCalculationResult with calculated amounts
        """
        # Calculate base amount (quantity * unit_price - discounts)
        line_total = line_item.quantity * line_item.unit_price
        
        # Apply discount
        if line_item.discount_percent > 0:
            discount = line_total * (line_item.discount_percent / 100)
            line_total -= discount
        
        if line_item.discount_amount > 0:
            line_total -= line_item.discount_amount
        
        # Ensure non-negative
        line_total = max(line_total, Decimal('0.00'))
        
        if self.inclusive_taxes:
            return self._calculate_inclusive_taxes(line_total, line_item.tax_rates)
        else:
            return self._calculate_exclusive_taxes(line_total, line_item.tax_rates)
    
    def _calculate_exclusive_taxes(self, base_amount: Decimal, tax_rates: List[TaxRate]) -> TaxCalculationResult:
        """Calculate taxes when prices are exclusive of tax."""
        tax_details = []
        total_tax = Decimal('0.00')
        total_withheld = Decimal('0.00')
        
        for tax_rate in tax_rates:
            # Get the applicable rate version for the calculation date
            rate_version = self._get_rate_version(tax_rate, self.calculation_date)
            if not rate_version:
                continue
            
            # Calculate tax amount
            tax_amount = base_amount * tax_rate.rate_decimal
            tax_amount = self._round_amount(tax_amount)
            
            # Check if this is withheld tax
            if rate_version.withheld_flag:
                total_withheld += tax_amount
            else:
                total_tax += tax_amount
            
            tax_details.append({
                'tax_code': tax_rate.tax.code,
                'tax_name': tax_rate.tax.name,
                'rate_percent': tax_rate.rate_pct,
                'base_amount': base_amount,
                'tax_amount': tax_amount,
                'withheld': rate_version.withheld_flag,
            })
        
        total_amount = base_amount + total_tax - total_withheld
        
        return TaxCalculationResult(
            base_amount=base_amount,
            tax_amount=total_tax,
            withheld_tax_amount=total_withheld,
            total_amount=total_amount,
            tax_details=tax_details
        )
    
    def _calculate_inclusive_taxes(self, total_amount: Decimal, tax_rates: List[TaxRate]) -> TaxCalculationResult:
        """Calculate taxes when prices are inclusive of tax."""
        tax_details = []
        total_tax = Decimal('0.00')
        total_withheld = Decimal('0.00')
        
        # Calculate total tax rate
        total_rate = sum(rate.rate_decimal for rate in tax_rates)
        
        # Calculate base amount (amount excluding tax)
        base_amount = total_amount / (1 + total_rate)
        base_amount = self._round_amount(base_amount)
        
        for tax_rate in tax_rates:
            # Get the applicable rate version for the calculation date
            rate_version = self._get_rate_version(tax_rate, self.calculation_date)
            if not rate_version:
                continue
            
            # Calculate tax amount
            tax_amount = base_amount * tax_rate.rate_decimal
            tax_amount = self._round_amount(tax_amount)
            
            # Check if this is withheld tax
            if rate_version.withheld_flag:
                total_withheld += tax_amount
            else:
                total_tax += tax_amount
            
            tax_details.append({
                'tax_code': tax_rate.tax.code,
                'tax_name': tax_rate.tax.name,
                'rate_percent': tax_rate.rate_pct,
                'base_amount': base_amount,
                'tax_amount': tax_amount,
                'withheld': rate_version.withheld_flag,
            })
        
        return TaxCalculationResult(
            base_amount=base_amount,
            tax_amount=total_tax,
            withheld_tax_amount=total_withheld,
            total_amount=total_amount,
            tax_details=tax_details
        )
    
    def calculate_document_taxes(self, line_items: List[TaxLineItem]) -> TaxCalculationResult:
        """
        Calculate taxes for an entire document.
        
        Args:
            line_items: List of TaxLineItem instances
            
        Returns:
            TaxCalculationResult with aggregated amounts
        """
        total_base = Decimal('0.00')
        total_tax = Decimal('0.00')
        total_withheld = Decimal('0.00')
        all_tax_details = []
        
        # Calculate taxes for each line
        for line_item in line_items:
            line_result = self.calculate_line_taxes(line_item)
            
            total_base += line_result.base_amount
            total_tax += line_result.tax_amount
            total_withheld += line_result.withheld_tax_amount
            all_tax_details.extend(line_result.tax_details)
        
        # Aggregate tax details by tax code
        aggregated_details = self._aggregate_tax_details(all_tax_details)
        
        total_amount = total_base + total_tax - total_withheld
        
        return TaxCalculationResult(
            base_amount=total_base,
            tax_amount=total_tax,
            withheld_tax_amount=total_withheld,
            total_amount=total_amount,
            tax_details=aggregated_details
        )
    
    def _get_rate_version(self, tax_rate: TaxRate, date) -> Optional[TaxRateVersion]:
        """Get the applicable tax rate version for a given date."""
        try:
            return tax_rate.versions.filter(
                valid_from__lte=date,
                valid_to__gte=date,
                is_active=True
            ).first()
        except:
            return None
    
    def _round_amount(self, amount: Decimal) -> Decimal:
        """Round amount according to company rounding method."""
        return amount.quantize(Decimal('0.01'), rounding=self.rounding_method)
    
    def _aggregate_tax_details(self, tax_details: List[Dict]) -> List[Dict]:
        """Aggregate tax details by tax code."""
        aggregated = {}
        
        for detail in tax_details:
            tax_code = detail['tax_code']
            
            if tax_code in aggregated:
                aggregated[tax_code]['base_amount'] += detail['base_amount']
                aggregated[tax_code]['tax_amount'] += detail['tax_amount']
            else:
                aggregated[tax_code] = detail.copy()
        
        return list(aggregated.values())
    
    @staticmethod
    def get_moroccan_tax_rates(date=None):
        """
        Get current Moroccan tax rates for a given date.
        
        Args:
            date: Date to get rates for (defaults to today)
            
        Returns:
            Dict of tax rates by type
        """
        if date is None:
            date = timezone.now().date()
        
        from .models import Tax
        
        try:
            tva_tax = Tax.objects.get(code='TVA')
            rates = {}
            
            for rate in tva_tax.rates.all():
                version = rate.versions.filter(
                    valid_from__lte=date,
                    valid_to__gte=date,
                    is_active=True
                ).first()
                
                if version:
                    rates[f'TVA_{rate.rate_pct}'] = {
                        'rate': rate.rate_pct,
                        'decimal': rate.rate_decimal,
                        'withheld': version.withheld_flag,
                    }
            
            return rates
        except Tax.DoesNotExist:
            return {}

    def get_applicable_tax_rates(self, product=None, customer=None, supplier=None, transaction_type='SALE'):
        """
        Get applicable tax rates for a transaction based on product, customer, and transaction type.

        Args:
            product: Product instance (optional)
            customer: Customer instance (optional)
            supplier: Supplier instance (optional)
            transaction_type: 'SALE' or 'PURCHASE'

        Returns:
            List of applicable TaxRate instances
        """
        from .models import TaxRate, TaxRateVersion

        applicable_rates = []

        try:
            # Get all active tax rates
            tax_rates = TaxRate.objects.filter(
                tax__is_active=True,
                is_active=True
            )

            # Filter by transaction type
            if transaction_type == 'SALE':
                tax_rates = tax_rates.filter(
                    tax__scope__in=['SALE', 'BOTH']
                )
            elif transaction_type == 'PURCHASE':
                tax_rates = tax_rates.filter(
                    tax__scope__in=['PURCHASE', 'BOTH']
                )

            # Check each rate for date validity
            for rate in tax_rates:
                version = TaxRateVersion.objects.filter(
                    tax_rate=rate,
                    valid_from__lte=self.calculation_date,
                    valid_to__gte=self.calculation_date,
                    is_active=True
                ).first()

                if version:
                    applicable_rates.append(rate)

            return applicable_rates

        except Exception:
            return []

    def calculate_with_date_version(self, line_items, document_date=None):
        """
        Calculate taxes using date-versioned rates.

        Args:
            line_items: List of TaxLineItem instances
            document_date: Date for rate version selection

        Returns:
            TaxCalculationResult
        """
        if document_date:
            # Create new calculator with specific date
            calculator = TaxCalculator(
                company=self.company,
                calculation_date=document_date
            )
            return calculator.calculate_document_taxes(line_items)
        else:
            return self.calculate_document_taxes(line_items)
