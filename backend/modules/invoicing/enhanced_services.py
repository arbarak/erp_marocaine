"""
Enhanced invoice services for advanced functionality.
"""
from django.db import transaction
from django.utils import timezone
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
from decimal import Decimal
from datetime import date, timedelta
from typing import List, Dict, Optional
import uuid
import json

from .models import Invoice, InvoiceLine, Payment, InvoicePayment
from modules.sales.models import Customer
from modules.purchasing.models import Supplier
from core.companies.models import Company
from core.accounts.models import User


class InvoiceEmailService:
    """Service for sending invoices via email."""
    
    @classmethod
    def send_invoice_email(
        cls,
        invoice: Invoice,
        to_emails: List[str],
        cc_emails: Optional[List[str]] = None,
        subject: Optional[str] = None,
        message: Optional[str] = None,
        include_pdf: bool = True,
        sent_by: Optional[User] = None
    ) -> Dict:
        """
        Send invoice via email.
        
        Args:
            invoice: Invoice to send
            to_emails: List of recipient email addresses
            cc_emails: List of CC email addresses
            subject: Email subject (auto-generated if not provided)
            message: Email message body
            include_pdf: Whether to include PDF attachment
            sent_by: User sending the email
            
        Returns:
            Dict with send status and details
        """
        try:
            # Generate subject if not provided
            if not subject:
                subject = f"Invoice {invoice.invoice_number} - {invoice.company.name}"
            
            # Generate message if not provided
            if not message:
                context = {
                    'invoice': invoice,
                    'company': invoice.company,
                    'party_name': invoice.get_party_name()
                }
                message = render_to_string('invoicing/email/invoice_email.txt', context)
            
            # Create email
            email = EmailMessage(
                subject=subject,
                body=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=to_emails,
                cc=cc_emails or []
            )
            
            # Add PDF attachment if requested
            if include_pdf:
                # For now, add placeholder since PDF generation is disabled
                email.attach(
                    f"invoice_{invoice.invoice_number}.pdf",
                    b"PDF generation temporarily disabled",
                    'application/pdf'
                )
            
            # Send email
            email.send()
            
            return {
                'success': True,
                'message': 'Email sent successfully',
                'recipients': to_emails + (cc_emails or []),
                'sent_at': timezone.now()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'recipients': to_emails + (cc_emails or [])
            }


class RecurringInvoiceService:
    """Service for managing recurring invoices."""
    
    @classmethod
    def create_recurring_schedule(
        cls,
        template_invoice: Invoice,
        frequency: str,
        start_date: date,
        end_date: Optional[date] = None,
        max_occurrences: Optional[int] = None,
        auto_send: bool = False,
        created_by: User = None
    ) -> Dict:
        """
        Create a recurring invoice schedule.
        
        Args:
            template_invoice: Invoice to use as template
            frequency: Billing frequency (WEEKLY, MONTHLY, QUARTERLY, YEARLY)
            start_date: Start date for recurring billing
            end_date: End date for recurring billing
            max_occurrences: Maximum number of invoices to generate
            auto_send: Whether to automatically send invoices
            created_by: User creating the schedule
            
        Returns:
            Dict with schedule details
        """
        # Calculate next invoice dates
        next_dates = cls._calculate_recurring_dates(
            frequency, start_date, end_date, max_occurrences
        )
        
        # For now, return the schedule configuration
        # In a full implementation, this would create database records
        return {
            'template_invoice_id': str(template_invoice.id),
            'frequency': frequency,
            'start_date': start_date,
            'end_date': end_date,
            'max_occurrences': max_occurrences,
            'auto_send': auto_send,
            'next_invoice_dates': next_dates[:5],  # Show next 5 dates
            'total_scheduled': len(next_dates),
            'created_by': created_by.email if created_by else None,
            'created_at': timezone.now()
        }
    
    @classmethod
    def _calculate_recurring_dates(
        cls,
        frequency: str,
        start_date: date,
        end_date: Optional[date] = None,
        max_occurrences: Optional[int] = None
    ) -> List[date]:
        """Calculate recurring invoice dates."""
        dates = []
        current_date = start_date
        count = 0
        
        # Determine increment based on frequency
        if frequency == 'WEEKLY':
            increment = timedelta(weeks=1)
        elif frequency == 'MONTHLY':
            increment = timedelta(days=30)  # Approximate
        elif frequency == 'QUARTERLY':
            increment = timedelta(days=90)  # Approximate
        elif frequency == 'YEARLY':
            increment = timedelta(days=365)  # Approximate
        else:
            raise ValueError(f"Invalid frequency: {frequency}")
        
        while True:
            # Check end conditions
            if end_date and current_date > end_date:
                break
            if max_occurrences and count >= max_occurrences:
                break
            if count >= 100:  # Safety limit
                break
            
            dates.append(current_date)
            current_date += increment
            count += 1
        
        return dates
    
    @classmethod
    def generate_next_invoice(
        cls,
        template_invoice: Invoice,
        invoice_date: date,
        created_by: User
    ) -> Invoice:
        """Generate next invoice from template."""
        with transaction.atomic():
            # Create new invoice
            new_invoice = Invoice.objects.create(
                company=template_invoice.company,
                invoice_type=template_invoice.invoice_type,
                customer=template_invoice.customer,
                supplier=template_invoice.supplier,
                invoice_date=invoice_date,
                due_date=invoice_date + timedelta(days=template_invoice.payment_terms_days),
                payment_terms_days=template_invoice.payment_terms_days,
                reference=f"Recurring from {template_invoice.invoice_number}",
                description=template_invoice.description,
                notes=template_invoice.notes,
                created_by=created_by
            )
            
            # Copy invoice lines
            for line in template_invoice.lines.all():
                InvoiceLine.objects.create(
                    invoice=new_invoice,
                    product=line.product,
                    description=line.description,
                    quantity=line.quantity,
                    unit_price=line.unit_price,
                    discount_percent=line.discount_percent,
                    discount_amount=line.discount_amount,
                    tax_rate=line.tax_rate
                )
            
            # Calculate totals
            new_invoice.calculate_totals()
            
            return new_invoice


class InvoiceTemplateService:
    """Service for managing invoice templates."""
    
    @classmethod
    def create_template(
        cls,
        name: str,
        template_data: Dict,
        description: Optional[str] = None,
        is_default: bool = False,
        company: Optional[Company] = None
    ) -> Dict:
        """
        Create an invoice template.
        
        Args:
            name: Template name
            template_data: Template configuration
            description: Template description
            is_default: Whether this is the default template
            company: Company owning the template
            
        Returns:
            Dict with template details
        """
        template_id = str(uuid.uuid4())
        
        # For now, return template configuration
        # In a full implementation, this would save to database
        return {
            'id': template_id,
            'name': name,
            'description': description,
            'template_data': template_data,
            'is_default': is_default,
            'company_id': str(company.id) if company else None,
            'created_at': timezone.now()
        }
    
    @classmethod
    def apply_template(
        cls,
        invoice: Invoice,
        template_data: Dict
    ) -> Dict:
        """Apply template to invoice for PDF generation."""
        # Extract template configuration
        header_config = template_data.get('header', {})
        footer_config = template_data.get('footer', {})
        styling_config = template_data.get('styling', {})
        
        # Build invoice context with template
        context = {
            'invoice': invoice,
            'company': invoice.company,
            'party': invoice.customer or invoice.supplier,
            'lines': invoice.lines.all(),
            'header': header_config,
            'footer': footer_config,
            'styling': styling_config
        }
        
        return context


class InvoiceAnalyticsService:
    """Service for invoice analytics and insights."""
    
    @classmethod
    def get_payment_trends(
        cls,
        company: Company,
        days: int = 90
    ) -> Dict:
        """Get payment trends analysis."""
        from django.db.models import Avg, Count, Sum
        
        cutoff_date = timezone.now().date() - timedelta(days=days)
        
        invoices = Invoice.objects.filter(
            company=company,
            invoice_date__gte=cutoff_date,
            invoice_type='CUSTOMER'
        )
        
        # Payment timing analysis
        paid_invoices = invoices.filter(outstanding_amount=0)
        avg_payment_days = 0
        
        if paid_invoices.exists():
            # Calculate average days to payment
            payment_days = []
            for invoice in paid_invoices:
                # This would need actual payment date tracking
                # For now, use a placeholder calculation
                days_to_pay = (invoice.due_date - invoice.invoice_date).days
                payment_days.append(days_to_pay)
            
            if payment_days:
                avg_payment_days = sum(payment_days) / len(payment_days)
        
        # Overdue analysis
        overdue_invoices = invoices.filter(
            due_date__lt=timezone.now().date(),
            outstanding_amount__gt=0
        )
        
        return {
            'period_days': days,
            'total_invoices': invoices.count(),
            'paid_invoices': paid_invoices.count(),
            'overdue_invoices': overdue_invoices.count(),
            'average_payment_days': round(avg_payment_days, 1),
            'payment_rate': round(paid_invoices.count() / max(invoices.count(), 1) * 100, 1),
            'total_value': invoices.aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
            'outstanding_value': invoices.aggregate(Sum('outstanding_amount'))['outstanding_amount__sum'] or 0
        }
    
    @classmethod
    def get_customer_insights(
        cls,
        company: Company,
        customer_id: Optional[str] = None
    ) -> Dict:
        """Get customer payment insights."""
        from django.db.models import Avg, Count, Sum
        
        invoices = Invoice.objects.filter(
            company=company,
            invoice_type='CUSTOMER'
        )
        
        if customer_id:
            invoices = invoices.filter(customer_id=customer_id)
        
        # Customer analysis
        customer_stats = invoices.values('customer__name').annotate(
            total_invoices=Count('id'),
            total_amount=Sum('total_amount'),
            outstanding_amount=Sum('outstanding_amount'),
            avg_amount=Avg('total_amount')
        ).order_by('-total_amount')[:10]
        
        return {
            'top_customers': list(customer_stats),
            'analysis_date': timezone.now().date()
        }
