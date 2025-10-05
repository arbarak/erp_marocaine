"""
Enhanced PDF generator for invoices with template support.
"""
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
import io
import base64
from typing import Dict, Optional

from .models import Invoice
from .enhanced_services import InvoiceTemplateService


class EnhancedInvoicePDFGenerator:
    """Enhanced PDF generator with template support."""
    
    def __init__(self):
        self.default_template = self._get_default_template()
    
    def generate_invoice_pdf(
        self,
        invoice: Invoice,
        template_data: Optional[Dict] = None,
        language: str = 'fr'
    ) -> bytes:
        """
        Generate PDF for invoice with template support.
        
        Args:
            invoice: Invoice to generate PDF for
            template_data: Custom template configuration
            language: Language for PDF generation
            
        Returns:
            PDF content as bytes
        """
        try:
            # Use provided template or default
            template = template_data or self.default_template
            
            # Apply template to invoice
            context = InvoiceTemplateService.apply_template(invoice, template)
            context.update({
                'language': language,
                'generation_date': timezone.now(),
                'currency_symbol': self._get_currency_symbol(invoice.company.default_currency or 'MAD')
            })
            
            # Generate HTML content
            html_content = render_to_string('invoicing/pdf/invoice_template.html', context)
            
            # For now, return placeholder since WeasyPrint is disabled
            # In production, this would use WeasyPrint or similar to generate PDF
            pdf_placeholder = f"""
PDF Generation Placeholder
==========================

Invoice: {invoice.invoice_number}
Date: {invoice.invoice_date}
Customer/Supplier: {invoice.get_party_name()}
Total: {invoice.total_amount} {invoice.company.default_currency or 'MAD'}

This is a placeholder for PDF generation.
In production, this would generate a proper PDF using WeasyPrint or similar library.

Generated at: {timezone.now()}
            """.strip()
            
            return pdf_placeholder.encode('utf-8')
            
        except Exception as e:
            raise Exception(f"Failed to generate PDF: {str(e)}")
    
    def generate_bulk_pdf(
        self,
        invoices: list,
        template_data: Optional[Dict] = None,
        language: str = 'fr'
    ) -> bytes:
        """
        Generate bulk PDF for multiple invoices.
        
        Args:
            invoices: List of invoices to include
            template_data: Custom template configuration
            language: Language for PDF generation
            
        Returns:
            Combined PDF content as bytes
        """
        try:
            # Generate individual PDFs
            pdf_contents = []
            for invoice in invoices:
                pdf_content = self.generate_invoice_pdf(invoice, template_data, language)
                pdf_contents.append(pdf_content)
            
            # Combine PDFs (placeholder implementation)
            combined_content = f"""
Bulk PDF Generation Placeholder
===============================

Generated {len(invoices)} invoice PDFs:

""".encode('utf-8')
            
            for i, content in enumerate(pdf_contents, 1):
                combined_content += f"\n--- Invoice {i} ---\n".encode('utf-8')
                combined_content += content
                combined_content += f"\n--- End Invoice {i} ---\n\n".encode('utf-8')
            
            return combined_content
            
        except Exception as e:
            raise Exception(f"Failed to generate bulk PDF: {str(e)}")
    
    def _get_default_template(self) -> Dict:
        """Get default invoice template configuration."""
        return {
            'header': {
                'show_logo': True,
                'show_company_info': True,
                'title': 'FACTURE',
                'title_color': '#2c3e50',
                'background_color': '#ffffff'
            },
            'footer': {
                'show_page_numbers': True,
                'show_generation_date': True,
                'footer_text': 'Merci pour votre confiance',
                'contact_info': True
            },
            'styling': {
                'font_family': 'Arial, sans-serif',
                'font_size': '12px',
                'primary_color': '#2c3e50',
                'secondary_color': '#3498db',
                'border_color': '#bdc3c7',
                'table_header_bg': '#ecf0f1',
                'table_row_alt_bg': '#f8f9fa'
            },
            'layout': {
                'margin_top': '20mm',
                'margin_bottom': '20mm',
                'margin_left': '15mm',
                'margin_right': '15mm',
                'show_grid': False,
                'two_column_layout': True
            },
            'content': {
                'show_description': True,
                'show_quantity': True,
                'show_unit_price': True,
                'show_discount': True,
                'show_tax_details': True,
                'show_payment_terms': True,
                'show_notes': True
            }
        }
    
    def _get_currency_symbol(self, currency_code: str) -> str:
        """Get currency symbol for display."""
        currency_symbols = {
            'MAD': 'DH',
            'EUR': '€',
            'USD': '$',
            'GBP': '£',
            'JPY': '¥',
            'CHF': 'CHF',
            'CAD': 'C$',
            'AUD': 'A$'
        }
        return currency_symbols.get(currency_code, currency_code)
    
    def generate_payment_receipt_pdf(
        self,
        payment,
        template_data: Optional[Dict] = None,
        language: str = 'fr'
    ) -> bytes:
        """
        Generate PDF receipt for payment.
        
        Args:
            payment: Payment to generate receipt for
            template_data: Custom template configuration
            language: Language for PDF generation
            
        Returns:
            PDF content as bytes
        """
        try:
            # Use provided template or default
            template = template_data or self.default_template
            
            context = {
                'payment': payment,
                'company': payment.company,
                'party': payment.customer or payment.supplier,
                'template': template,
                'language': language,
                'generation_date': timezone.now(),
                'currency_symbol': self._get_currency_symbol(payment.company.default_currency or 'MAD')
            }
            
            # Generate HTML content for receipt
            html_content = render_to_string('invoicing/pdf/payment_receipt_template.html', context)
            
            # Placeholder for PDF generation
            pdf_placeholder = f"""
Payment Receipt PDF Placeholder
===============================

Payment: {payment.payment_number}
Date: {payment.payment_date}
Amount: {payment.amount} {payment.company.default_currency or 'MAD'}
Method: {payment.get_payment_method_display()}
Party: {payment.get_party_name()}

This is a placeholder for payment receipt PDF generation.

Generated at: {timezone.now()}
            """.strip()
            
            return pdf_placeholder.encode('utf-8')
            
        except Exception as e:
            raise Exception(f"Failed to generate payment receipt PDF: {str(e)}")
    
    def generate_statement_pdf(
        self,
        customer,
        invoices,
        payments,
        from_date,
        to_date,
        template_data: Optional[Dict] = None,
        language: str = 'fr'
    ) -> bytes:
        """
        Generate customer statement PDF.
        
        Args:
            customer: Customer for statement
            invoices: List of invoices in period
            payments: List of payments in period
            from_date: Statement start date
            to_date: Statement end date
            template_data: Custom template configuration
            language: Language for PDF generation
            
        Returns:
            PDF content as bytes
        """
        try:
            # Calculate statement totals
            total_invoiced = sum(inv.total_amount for inv in invoices)
            total_paid = sum(pay.amount for pay in payments)
            balance = total_invoiced - total_paid
            
            context = {
                'customer': customer,
                'invoices': invoices,
                'payments': payments,
                'from_date': from_date,
                'to_date': to_date,
                'total_invoiced': total_invoiced,
                'total_paid': total_paid,
                'balance': balance,
                'template': template_data or self.default_template,
                'language': language,
                'generation_date': timezone.now()
            }
            
            # Placeholder for PDF generation
            pdf_placeholder = f"""
Customer Statement PDF Placeholder
==================================

Customer: {customer.name}
Period: {from_date} to {to_date}
Total Invoiced: {total_invoiced}
Total Paid: {total_paid}
Balance: {balance}

Invoices: {len(invoices)}
Payments: {len(payments)}

This is a placeholder for customer statement PDF generation.

Generated at: {timezone.now()}
            """.strip()
            
            return pdf_placeholder.encode('utf-8')
            
        except Exception as e:
            raise Exception(f"Failed to generate statement PDF: {str(e)}")
