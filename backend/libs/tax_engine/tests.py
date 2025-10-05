"""
Tests for tax engine.
"""
from django.test import TestCase
from django.utils import timezone
from decimal import Decimal
from datetime import date, timedelta
from .models import Tax, TaxRate, TaxRateVersion, TaxProfile
from .calculator import TaxCalculator, TaxLineItem
from core.companies.models import Company


class TaxModelTest(TestCase):
    """Test Tax model functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.tva_tax = Tax.objects.create(
            code='TVA',
            name='Taxe sur la Valeur Ajoutée',
            type='VAT',
            recoverable=True,
            inclusive=False
        )
        
        self.ras_tax = Tax.objects.create(
            code='RAS_TVA',
            name='Retenue à la Source TVA',
            type='WHT',
            recoverable=False,
            inclusive=False
        )
    
    def test_create_tax(self):
        """Test creating a tax."""
        self.assertEqual(self.tva_tax.code, 'TVA')
        self.assertEqual(self.tva_tax.type, 'VAT')
        self.assertTrue(self.tva_tax.recoverable)
        self.assertTrue(self.tva_tax.is_active)
    
    def test_tax_string_representation(self):
        """Test tax string representation."""
        expected = 'TVA - Taxe sur la Valeur Ajoutée'
        self.assertEqual(str(self.tva_tax), expected)


class TaxRateTest(TestCase):
    """Test TaxRate model functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.tva_tax = Tax.objects.create(
            code='TVA',
            name='Taxe sur la Valeur Ajoutée',
            type='VAT'
        )
        
        self.rate_20 = TaxRate.objects.create(
            tax=self.tva_tax,
            rate_pct=Decimal('20.00'),
            description='Taux normal TVA'
        )
    
    def test_create_tax_rate(self):
        """Test creating a tax rate."""
        self.assertEqual(self.rate_20.rate_pct, Decimal('20.00'))
        self.assertEqual(self.rate_20.rate_decimal, Decimal('0.20'))
        self.assertTrue(self.rate_20.is_active)
    
    def test_tax_rate_string_representation(self):
        """Test tax rate string representation."""
        expected = 'TVA - 20.00%'
        self.assertEqual(str(self.rate_20), expected)


class TaxRateVersionTest(TestCase):
    """Test TaxRateVersion model functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.tva_tax = Tax.objects.create(
            code='TVA',
            name='Taxe sur la Valeur Ajoutée',
            type='VAT'
        )
        
        self.rate_20 = TaxRate.objects.create(
            tax=self.tva_tax,
            rate_pct=Decimal('20.00')
        )
        
        self.version = TaxRateVersion.objects.create(
            tax_rate=self.rate_20,
            valid_from=date(2020, 1, 1),
            valid_to=date(2030, 12, 31),
            withheld_flag=False
        )
    
    def test_create_tax_rate_version(self):
        """Test creating a tax rate version."""
        self.assertEqual(self.version.tax_rate, self.rate_20)
        self.assertFalse(self.version.withheld_flag)
        self.assertTrue(self.version.is_active)
    
    def test_is_valid_for_date(self):
        """Test date validation."""
        # Test valid date
        test_date = date(2025, 6, 15)
        self.assertTrue(self.version.is_valid_for_date(test_date))
        
        # Test invalid date (before)
        test_date = date(2019, 12, 31)
        self.assertFalse(self.version.is_valid_for_date(test_date))
        
        # Test invalid date (after)
        test_date = date(2031, 1, 1)
        self.assertFalse(self.version.is_valid_for_date(test_date))


class TaxCalculatorTest(TestCase):
    """Test TaxCalculator functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(
            name='Test Company',
            ice='123456789012345',
            if_number='12345678',
            email='test@company.ma',
            tax_rounding_method='ROUND_HALF_UP',
            inclusive_taxes=False
        )
        
        # Create TVA tax with 20% rate
        self.tva_tax = Tax.objects.create(
            code='TVA',
            name='Taxe sur la Valeur Ajoutée',
            type='VAT',
            recoverable=True
        )
        
        self.rate_20 = TaxRate.objects.create(
            tax=self.tva_tax,
            rate_pct=Decimal('20.00')
        )
        
        TaxRateVersion.objects.create(
            tax_rate=self.rate_20,
            valid_from=date(2020, 1, 1),
            valid_to=date(2030, 12, 31),
            withheld_flag=False
        )
        
        # Create RAS/TVA tax
        self.ras_tax = Tax.objects.create(
            code='RAS_TVA',
            name='Retenue à la Source TVA',
            type='WHT',
            recoverable=False
        )
        
        self.ras_rate = TaxRate.objects.create(
            tax=self.ras_tax,
            rate_pct=Decimal('10.00')
        )
        
        TaxRateVersion.objects.create(
            tax_rate=self.ras_rate,
            valid_from=date(2020, 1, 1),
            valid_to=date(2030, 12, 31),
            withheld_flag=True
        )
        
        self.calculator = TaxCalculator(
            company=self.company,
            calculation_date=date(2025, 1, 1)
        )
    
    def test_calculate_exclusive_taxes(self):
        """Test calculating taxes on exclusive prices."""
        line_item = TaxLineItem(
            quantity=Decimal('2'),
            unit_price=Decimal('100.00'),
            tax_rates=[self.rate_20]
        )
        
        result = self.calculator.calculate_line_taxes(line_item)
        
        # Base amount: 2 * 100 = 200
        # Tax amount: 200 * 0.20 = 40
        # Total: 200 + 40 = 240
        self.assertEqual(result.base_amount, Decimal('200.00'))
        self.assertEqual(result.tax_amount, Decimal('40.00'))
        self.assertEqual(result.withheld_tax_amount, Decimal('0.00'))
        self.assertEqual(result.total_amount, Decimal('240.00'))
    
    def test_calculate_with_discount(self):
        """Test calculating taxes with discount."""
        line_item = TaxLineItem(
            quantity=Decimal('1'),
            unit_price=Decimal('100.00'),
            discount_percent=Decimal('10.00'),
            tax_rates=[self.rate_20]
        )
        
        result = self.calculator.calculate_line_taxes(line_item)
        
        # Base amount: 100 - (100 * 0.10) = 90
        # Tax amount: 90 * 0.20 = 18
        # Total: 90 + 18 = 108
        self.assertEqual(result.base_amount, Decimal('90.00'))
        self.assertEqual(result.tax_amount, Decimal('18.00'))
        self.assertEqual(result.total_amount, Decimal('108.00'))
    
    def test_calculate_with_withheld_tax(self):
        """Test calculating with withheld tax (RAS/TVA)."""
        line_item = TaxLineItem(
            quantity=Decimal('1'),
            unit_price=Decimal('100.00'),
            tax_rates=[self.rate_20, self.ras_rate]
        )
        
        result = self.calculator.calculate_line_taxes(line_item)
        
        # Base amount: 100
        # TVA: 100 * 0.20 = 20
        # RAS/TVA: 100 * 0.10 = 10 (withheld)
        # Total: 100 + 20 - 10 = 110
        self.assertEqual(result.base_amount, Decimal('100.00'))
        self.assertEqual(result.tax_amount, Decimal('20.00'))
        self.assertEqual(result.withheld_tax_amount, Decimal('10.00'))
        self.assertEqual(result.total_amount, Decimal('110.00'))
    
    def test_calculate_inclusive_taxes(self):
        """Test calculating taxes on inclusive prices."""
        # Set calculator to inclusive mode
        self.calculator.inclusive_taxes = True
        
        line_item = TaxLineItem(
            quantity=Decimal('1'),
            unit_price=Decimal('120.00'),  # Price including 20% tax
            tax_rates=[self.rate_20]
        )
        
        result = self.calculator.calculate_line_taxes(line_item)
        
        # Total amount: 120
        # Base amount: 120 / 1.20 = 100
        # Tax amount: 100 * 0.20 = 20
        self.assertEqual(result.base_amount, Decimal('100.00'))
        self.assertEqual(result.tax_amount, Decimal('20.00'))
        self.assertEqual(result.total_amount, Decimal('120.00'))
    
    def test_calculate_document_taxes(self):
        """Test calculating taxes for multiple line items."""
        line_items = [
            TaxLineItem(
                quantity=Decimal('1'),
                unit_price=Decimal('100.00'),
                tax_rates=[self.rate_20]
            ),
            TaxLineItem(
                quantity=Decimal('2'),
                unit_price=Decimal('50.00'),
                tax_rates=[self.rate_20]
            )
        ]
        
        result = self.calculator.calculate_document_taxes(line_items)
        
        # Line 1: 100 base, 20 tax
        # Line 2: 100 base, 20 tax
        # Total: 200 base, 40 tax, 240 total
        self.assertEqual(result.base_amount, Decimal('200.00'))
        self.assertEqual(result.tax_amount, Decimal('40.00'))
        self.assertEqual(result.total_amount, Decimal('240.00'))
    
    def test_moroccan_tax_rates(self):
        """Test getting Moroccan tax rates."""
        # Create additional Moroccan rates
        rate_14 = TaxRate.objects.create(
            tax=self.tva_tax,
            rate_pct=Decimal('14.00')
        )
        
        TaxRateVersion.objects.create(
            tax_rate=rate_14,
            valid_from=date(2020, 1, 1),
            valid_to=date(2030, 12, 31),
            withheld_flag=False
        )
        
        rates = TaxCalculator.get_moroccan_tax_rates(date(2025, 1, 1))
        
        self.assertIn('TVA_20.00', rates)
        self.assertIn('TVA_14.00', rates)
        self.assertEqual(rates['TVA_20.00']['rate'], Decimal('20.00'))
        self.assertEqual(rates['TVA_14.00']['rate'], Decimal('14.00'))

    def test_tax_rate_versioning(self):
        """Test tax rate versioning functionality."""
        # Create a tax rate with multiple versions
        rate = TaxRate.objects.create(
            tax=self.tva_tax,
            rate_pct=Decimal('20.00'),
            is_active=True
        )

        # Create version 1 (old rate)
        version1 = TaxRateVersion.objects.create(
            tax_rate=rate,
            valid_from=date(2024, 1, 1),
            valid_to=date(2024, 12, 31),
            is_active=True,
            withheld_flag=False
        )

        # Create version 2 (new rate)
        version2 = TaxRateVersion.objects.create(
            tax_rate=rate,
            valid_from=date(2025, 1, 1),
            valid_to=date(2025, 12, 31),
            is_active=True,
            withheld_flag=False,
            override_rate_pct=Decimal('22.00')  # Rate change
        )

        # Test version selection by date
        self.assertTrue(version1.is_valid_for_date(date(2024, 6, 1)))
        self.assertFalse(version1.is_valid_for_date(date(2025, 6, 1)))
        self.assertTrue(version2.is_valid_for_date(date(2025, 6, 1)))

        # Test effective rate
        self.assertEqual(version1.effective_rate_pct, Decimal('20.00'))
        self.assertEqual(version2.effective_rate_pct, Decimal('22.00'))

    def test_calculate_tva(self):
        """Test TVA calculation."""
        calculator = TaxCalculator()

        # Create TVA rate
        rate = TaxRate.objects.create(
            tax=self.tva_tax,
            rate_pct=Decimal('20.00'),
            is_active=True
        )

        TaxRateVersion.objects.create(
            tax_rate=rate,
            valid_from=date(2024, 1, 1),
            valid_to=date(2025, 12, 31),
            is_active=True,
            withheld_flag=False
        )

        # Create line item
        line_item = TaxLineItem(
            quantity=Decimal('2'),
            unit_price=Decimal('100.00'),
            tax_rates=[rate]
        )

        # Calculate taxes
        result = calculator.calculate_line_taxes(line_item)

        # Base amount: 2 * 100 = 200
        # TVA: 200 * 0.20 = 40
        # Total: 200 + 40 = 240
        self.assertEqual(result.base_amount, Decimal('200.00'))
        self.assertEqual(result.tax_amount, Decimal('40.00'))
        self.assertEqual(result.total_amount, Decimal('240.00'))
        self.assertEqual(result.withheld_tax_amount, Decimal('0.00'))

    def test_calculate_ras_tva(self):
        """Test RAS/TVA (withheld tax) calculation."""
        calculator = TaxCalculator()

        # Create RAS/TVA rate
        rate = TaxRate.objects.create(
            tax=self.ras_tax,
            rate_pct=Decimal('10.00'),
            is_active=True
        )

        TaxRateVersion.objects.create(
            tax_rate=rate,
            valid_from=date(2024, 1, 1),
            valid_to=date(2025, 12, 31),
            is_active=True,
            withheld_flag=True,
            withholding_rate_pct=Decimal('10.00')
        )

        # Create line item
        line_item = TaxLineItem(
            quantity=Decimal('1'),
            unit_price=Decimal('1000.00'),
            tax_rates=[rate]
        )

        # Calculate taxes
        result = calculator.calculate_line_taxes(line_item)

        # Base amount: 1000
        # Withheld tax: 1000 * 0.10 = 100
        self.assertEqual(result.base_amount, Decimal('1000.00'))
        self.assertEqual(result.withheld_tax_amount, Decimal('100.00'))

    def test_mixed_taxes(self):
        """Test calculation with mixed tax types."""
        calculator = TaxCalculator()

        # Create TVA rate
        tva_rate = TaxRate.objects.create(
            tax=self.tva_tax,
            rate_pct=Decimal('20.00'),
            is_active=True
        )

        TaxRateVersion.objects.create(
            tax_rate=tva_rate,
            valid_from=date(2024, 1, 1),
            valid_to=date(2025, 12, 31),
            is_active=True,
            withheld_flag=False
        )

        # Create RAS rate
        ras_rate = TaxRate.objects.create(
            tax=self.ras_tax,
            rate_pct=Decimal('5.00'),
            is_active=True
        )

        TaxRateVersion.objects.create(
            tax_rate=ras_rate,
            valid_from=date(2024, 1, 1),
            valid_to=date(2025, 12, 31),
            is_active=True,
            withheld_flag=True,
            withholding_rate_pct=Decimal('5.00')
        )

        # Create line item with both taxes
        line_item = TaxLineItem(
            quantity=Decimal('1'),
            unit_price=Decimal('500.00'),
            tax_rates=[tva_rate, ras_rate]
        )

        # Calculate taxes
        result = calculator.calculate_line_taxes(line_item)

        # Base: 500
        # TVA: 500 * 0.20 = 100
        # RAS: 500 * 0.05 = 25 (withheld)
        # Total: 500 + 100 = 600 (RAS is withheld, not added)
        self.assertEqual(result.base_amount, Decimal('500.00'))
        self.assertEqual(result.tax_amount, Decimal('100.00'))
        self.assertEqual(result.withheld_tax_amount, Decimal('25.00'))
        self.assertEqual(result.total_amount, Decimal('600.00'))

    def test_rounding(self):
        """Test tax calculation rounding."""
        calculator = TaxCalculator()

        # Create rate that will produce fractional amounts
        rate = TaxRate.objects.create(
            tax=self.tva_tax,
            rate_pct=Decimal('19.60'),  # Will create fractional amounts
            is_active=True
        )

        TaxRateVersion.objects.create(
            tax_rate=rate,
            valid_from=date(2024, 1, 1),
            valid_to=date(2025, 12, 31),
            is_active=True,
            withheld_flag=False
        )

        # Create line item
        line_item = TaxLineItem(
            quantity=Decimal('3'),
            unit_price=Decimal('33.33'),  # Will create rounding scenarios
            tax_rates=[rate]
        )

        # Calculate taxes
        result = calculator.calculate_line_taxes(line_item)

        # Verify amounts are properly rounded to 2 decimal places
        self.assertEqual(result.base_amount.as_tuple().exponent, -2)
        self.assertEqual(result.tax_amount.as_tuple().exponent, -2)
        self.assertEqual(result.total_amount.as_tuple().exponent, -2)

    def test_date_versioning(self):
        """Test date-based version selection."""
        calculator = TaxCalculator(calculation_date=date(2025, 6, 1))

        # Create rate with date-specific versions
        rate = TaxRate.objects.create(
            tax=self.tva_tax,
            rate_pct=Decimal('20.00'),
            is_active=True
        )

        # Old version
        TaxRateVersion.objects.create(
            tax_rate=rate,
            valid_from=date(2024, 1, 1),
            valid_to=date(2024, 12, 31),
            is_active=True,
            withheld_flag=False
        )

        # New version with different rate
        TaxRateVersion.objects.create(
            tax_rate=rate,
            valid_from=date(2025, 1, 1),
            valid_to=date(2025, 12, 31),
            is_active=True,
            withheld_flag=False,
            override_rate_pct=Decimal('22.00')
        )

        # Test calculation uses correct version for date
        line_item = TaxLineItem(
            quantity=Decimal('1'),
            unit_price=Decimal('100.00'),
            tax_rates=[rate]
        )

        result = calculator.calculate_line_taxes(line_item)

        # Should use 22% rate for 2025 date
        expected_tax = Decimal('100.00') * Decimal('0.22')
        self.assertEqual(result.tax_amount, expected_tax)
