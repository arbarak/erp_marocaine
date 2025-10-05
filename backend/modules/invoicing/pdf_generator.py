"""
French PDF generation for invoices using WeasyPrint.
"""
import os
from io import BytesIO
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.translation import gettext as _
from django.utils import timezone
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
from decimal import Decimal
from typing import Dict, Any, Optional

from .models import Invoice, Payment
from core.companies.models import Company


class FrenchInvoicePDFGenerator:
    """Generator for French-formatted invoice PDFs."""
    
    def __init__(self):
        """Initialize PDF generator with French formatting."""
        self.font_config = FontConfiguration()
        
        # Define CSS for French invoice styling
        self.base_css = """
        @page {
            size: A4;
            margin: 2cm 1.5cm;
            @top-center {
                content: "Facture";
                font-family: Arial, sans-serif;
                font-size: 10pt;
                color: #666;
            }
            @bottom-center {
                content: "Page " counter(page) " sur " counter(pages);
                font-family: Arial, sans-serif;
                font-size: 9pt;
                color: #666;
            }
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #333;
        }
        
        .header {
            margin-bottom: 30px;
            border-bottom: 2px solid #2c5aa0;
            padding-bottom: 15px;
        }
        
        .company-info {
            float: left;
            width: 50%;
        }
        
        .invoice-info {
            float: right;
            width: 45%;
            text-align: right;
        }
        
        .invoice-title {
            font-size: 24pt;
            font-weight: bold;
            color: #2c5aa0;
            margin-bottom: 10px;
        }
        
        .invoice-number {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .parties {
            clear: both;
            margin: 30px 0;
        }
        
        .party-box {
            float: left;
            width: 48%;
            border: 1px solid #ddd;
            padding: 15px;
            margin-right: 4%;
        }
        
        .party-box:last-child {
            margin-right: 0;
        }
        
        .party-title {
            font-weight: bold;
            font-size: 11pt;
            color: #2c5aa0;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }
        
        .invoice-details {
            clear: both;
            margin: 30px 0;
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
        }
        
        .details-row {
            margin-bottom: 8px;
        }
        
        .details-label {
            font-weight: bold;
            display: inline-block;
            width: 150px;
        }
        
        .line-items {
            margin: 30px 0;
        }
        
        .line-items table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .line-items th {
            background-color: #2c5aa0;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 9pt;
        }
        
        .line-items td {
            padding: 10px 8px;
            border-bottom: 1px solid #eee;
            font-size: 9pt;
        }
        
        .line-items tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .totals {
            float: right;
            width: 300px;
            margin-top: 20px;
        }
        
        .totals table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .totals td {
            padding: 8px 12px;
            border-bottom: 1px solid #ddd;
        }
        
        .totals .total-label {
            font-weight: bold;
            text-align: right;
        }
        
        .totals .total-amount {
            text-align: right;
            font-weight: bold;
        }
        
        .totals .grand-total {
            background-color: #2c5aa0;
            color: white;
            font-size: 12pt;
        }
        
        .footer {
            clear: both;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 9pt;
            color: #666;
        }
        
        .payment-terms {
            margin-top: 30px;
            padding: 15px;
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
        }
        
        .payment-terms h4 {
            margin-top: 0;
            color: #856404;
        }
        
        .moroccan-compliance {
            margin-top: 20px;
            font-size: 8pt;
            color: #666;
            text-align: center;
        }
        
        .amount {
            font-family: 'Courier New', monospace;
        }
        """
    
    def generate_invoice_pdf(
        self, 
        invoice: Invoice, 
        template_name: str = 'invoice_french.html'
    ) -> bytes:
        """
        Generate PDF for an invoice.
        
        Args:
            invoice: Invoice to generate PDF for
            template_name: Template to use for PDF generation
            
        Returns:
            PDF content as bytes
        """
        context = self._prepare_invoice_context(invoice)
        
        # Render HTML template
        html_content = render_to_string(
            f'invoicing/pdf/{template_name}',
            context
        )
        
        # Generate PDF
        html = HTML(string=html_content, base_url=settings.STATIC_URL)
        css = CSS(string=self.base_css, font_config=self.font_config)
        
        pdf_buffer = BytesIO()
        html.write_pdf(pdf_buffer, stylesheets=[css], font_config=self.font_config)
        
        return pdf_buffer.getvalue()
    
    def generate_payment_receipt_pdf(
        self,
        payment: Payment,
        template_name: str = 'payment_receipt_french.html'
    ) -> bytes:
        """
        Generate PDF for a payment receipt.
        
        Args:
            payment: Payment to generate receipt for
            template_name: Template to use for PDF generation
            
        Returns:
            PDF content as bytes
        """
        context = self._prepare_payment_context(payment)
        
        # Render HTML template
        html_content = render_to_string(
            f'invoicing/pdf/{template_name}',
            context
        )
        
        # Generate PDF
        html = HTML(string=html_content, base_url=settings.STATIC_URL)
        css = CSS(string=self.base_css, font_config=self.font_config)
        
        pdf_buffer = BytesIO()
        html.write_pdf(pdf_buffer, stylesheets=[css], font_config=self.font_config)
        
        return pdf_buffer.getvalue()
    
    def _prepare_invoice_context(self, invoice: Invoice) -> Dict[str, Any]:
        """Prepare context data for invoice PDF."""
        company = invoice.company
        party = invoice.get_party()
        
        # Format amounts in French style
        def format_amount(amount: Decimal) -> str:
            """Format amount in French style with MAD currency."""
            return f"{amount:,.2f} MAD".replace(',', ' ').replace('.', ',')
        
        # Calculate tax details
        tax_details = []
        total_tax_base = Decimal('0.00')
        total_tax_amount = Decimal('0.00')
        
        for line in invoice.lines.all():
            tax_base = line.total_price
            tax_amount = line.tax_amount
            tax_rate = line.tax_rate
            
            total_tax_base += tax_base
            total_tax_amount += tax_amount
            
            # Group by tax rate
            existing_tax = next(
                (t for t in tax_details if t['rate'] == tax_rate), 
                None
            )
            if existing_tax:
                existing_tax['base'] += tax_base
                existing_tax['amount'] += tax_amount
            else:
                tax_details.append({
                    'rate': tax_rate,
                    'base': tax_base,
                    'amount': tax_amount
                })
        
        context = {
            'invoice': invoice,
            'company': company,
            'party': party,
            'lines': invoice.lines.all(),
            'tax_details': tax_details,
            'total_tax_base': total_tax_base,
            'total_tax_amount': total_tax_amount,
            'format_amount': format_amount,
            'today': timezone.now().date(),
            
            # French labels
            'labels': {
                'invoice': _('FACTURE'),
                'invoice_number': _('Numéro de facture'),
                'invoice_date': _('Date de facture'),
                'due_date': _('Date d\'échéance'),
                'customer': _('Client'),
                'supplier': _('Fournisseur'),
                'description': _('Désignation'),
                'quantity': _('Quantité'),
                'unit_price': _('Prix unitaire'),
                'discount': _('Remise'),
                'total': _('Total'),
                'subtotal': _('Sous-total'),
                'tax': _('TVA'),
                'total_amount': _('Total TTC'),
                'payment_terms': _('Conditions de paiement'),
                'notes': _('Observations'),
                'page': _('Page'),
                'of': _('sur'),
            },
            
            # Moroccan compliance info
            'compliance': {
                'ice': company.ice,
                'if_number': company.if_number,
                'rc': company.rc,
                'cnss': getattr(company, 'cnss', ''),
                'patente': getattr(company, 'patente', ''),
            }
        }
        
        return context
    
    def _prepare_payment_context(self, payment: Payment) -> Dict[str, Any]:
        """Prepare context data for payment receipt PDF."""
        company = payment.company
        party = payment.get_party()
        
        # Format amounts in French style
        def format_amount(amount: Decimal) -> str:
            """Format amount in French style with MAD currency."""
            return f"{amount:,.2f} MAD".replace(',', ' ').replace('.', ',')
        
        # Get allocated invoices
        allocations = payment.invoice_allocations.all()
        
        context = {
            'payment': payment,
            'company': company,
            'party': party,
            'allocations': allocations,
            'format_amount': format_amount,
            'today': timezone.now().date(),
            
            # French labels
            'labels': {
                'receipt': _('REÇU DE PAIEMENT'),
                'payment_number': _('Numéro de paiement'),
                'payment_date': _('Date de paiement'),
                'amount': _('Montant'),
                'method': _('Mode de paiement'),
                'customer': _('Client'),
                'supplier': _('Fournisseur'),
                'allocated_to': _('Affecté à'),
                'invoice_number': _('Numéro de facture'),
                'allocated_amount': _('Montant affecté'),
                'reference': _('Référence'),
                'description': _('Description'),
            }
        }
        
        return context


class FrenchNumberFormatter:
    """Utility class for French number formatting."""
    
    @staticmethod
    def format_currency(amount: Decimal, currency: str = 'MAD') -> str:
        """Format currency amount in French style."""
        # French uses space as thousands separator and comma as decimal separator
        formatted = f"{amount:,.2f}".replace(',', ' ').replace('.', ',')
        return f"{formatted} {currency}"
    
    @staticmethod
    def format_percentage(percentage: Decimal) -> str:
        """Format percentage in French style."""
        formatted = f"{percentage:.2f}".replace('.', ',')
        return f"{formatted} %"
    
    @staticmethod
    def number_to_words_french(amount: Decimal) -> str:
        """Convert number to words in French (simplified)."""
        # This is a simplified implementation
        # In production, you might want to use a library like num2words
        
        units = [
            '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
            'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
            'dix-sept', 'dix-huit', 'dix-neuf'
        ]
        
        tens = [
            '', '', 'vingt', 'trente', 'quarante', 'cinquante',
            'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'
        ]
        
        # Simplified conversion for amounts up to 999
        amount_int = int(amount)
        
        if amount_int == 0:
            return "zéro"
        elif amount_int < 20:
            return units[amount_int]
        elif amount_int < 100:
            ten = amount_int // 10
            unit = amount_int % 10
            if unit == 0:
                return tens[ten]
            else:
                return f"{tens[ten]}-{units[unit]}"
        else:
            # For larger amounts, return simplified format
            return str(amount_int)


# Utility functions for template usage
def format_french_amount(amount):
    """Template filter for formatting amounts in French style."""
    return FrenchNumberFormatter.format_currency(amount)


def format_french_percentage(percentage):
    """Template filter for formatting percentages in French style."""
    return FrenchNumberFormatter.format_percentage(percentage)
