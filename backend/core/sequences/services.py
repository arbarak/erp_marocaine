"""
Services for document sequence management.
"""
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from datetime import date
from .models import DocumentSequence, DocumentNumber


class SequenceService:
    """Service class for managing document sequences."""
    
    @staticmethod
    def get_next_number(company, document_type, user, document_id=None, issue_date=None):
        """
        Get the next sequential number for a document.
        
        Args:
            company: Company instance
            document_type: Type of document (from DocumentSequence.DOCUMENT_TYPES)
            user: User generating the number
            document_id: Optional document ID for audit trail
            issue_date: Optional date to determine fiscal year
        
        Returns:
            tuple: (number, formatted_number)
        """
        if issue_date is None:
            issue_date = date.today()
        
        # Determine fiscal year based on company's fiscal year start
        fiscal_year = company.get_current_fiscal_year()
        if issue_date:
            if issue_date.month >= company.fiscal_year_start_month:
                fiscal_year = issue_date.year
            else:
                fiscal_year = issue_date.year - 1
        
        with transaction.atomic():
            # Get or create sequence for this company/type/year
            sequence, created = DocumentSequence.objects.get_or_create(
                company=company,
                document_type=document_type,
                fiscal_year=fiscal_year,
                defaults={
                    'pattern': SequenceService._get_default_pattern(document_type),
                    'prefix': SequenceService._get_default_prefix(company, document_type),
                }
            )
            
            # Get next number
            number = sequence.get_next_number()
            formatted_number = sequence.format_number(number)
            
            # Create audit record if document_id provided
            if document_id:
                DocumentNumber.objects.create(
                    sequence=sequence,
                    number=number,
                    formatted_number=formatted_number,
                    document_type=document_type,
                    document_id=document_id,
                    generated_by=user
                )
            
            return number, formatted_number
    
    @staticmethod
    def _get_default_pattern(document_type):
        """Get default pattern for document type."""
        patterns = {
            'INVOICE': '{PREFIX}-{YYYY}-{NNNN}',
            'CREDIT_NOTE': 'CN-{PREFIX}-{YYYY}-{NNNN}',
            'QUOTE': '{PREFIX}-{YYYY}-{NNNN}',
            'SALES_ORDER': '{PREFIX}-{YYYY}-{NNNN}',
            'PURCHASE_ORDER': '{PREFIX}-{YYYY}-{NNNN}',
            'GOODS_RECEIPT': 'GRN-{YYYY}-{NNNN}',
            'DELIVERY': 'DEL-{YYYY}-{NNNN}',
            'RETURN': 'RET-{YYYY}-{NNNN}',
            'ADJUSTMENT': 'ADJ-{YYYY}-{NNNN}',
            'TRANSFER': 'TRF-{YYYY}-{NNNN}',
        }
        return patterns.get(document_type, '{PREFIX}-{YYYY}-{NNNN}')
    
    @staticmethod
    def _get_default_prefix(company, document_type):
        """Get default prefix for document type from company settings."""
        if hasattr(company, 'settings'):
            prefix_map = {
                'INVOICE': company.settings.invoice_prefix,
                'QUOTE': company.settings.quote_prefix,
                'PURCHASE_ORDER': company.settings.po_prefix,
                'SALES_ORDER': company.settings.so_prefix,
            }
            return prefix_map.get(document_type, document_type[:3])
        
        # Fallback defaults
        defaults = {
            'INVOICE': 'INV',
            'CREDIT_NOTE': 'CN',
            'QUOTE': 'QUO',
            'SALES_ORDER': 'SO',
            'PURCHASE_ORDER': 'PO',
            'GOODS_RECEIPT': 'GRN',
            'DELIVERY': 'DEL',
            'RETURN': 'RET',
            'ADJUSTMENT': 'ADJ',
            'TRANSFER': 'TRF',
        }
        return defaults.get(document_type, document_type[:3])
    
    @staticmethod
    def preview_next_number(company, document_type, issue_date=None):
        """
        Preview what the next number would be without generating it.
        
        Args:
            company: Company instance
            document_type: Type of document
            issue_date: Optional date to determine fiscal year
        
        Returns:
            str: Formatted preview of next number
        """
        if issue_date is None:
            issue_date = date.today()
        
        # Determine fiscal year
        fiscal_year = company.get_current_fiscal_year()
        if issue_date:
            if issue_date.month >= company.fiscal_year_start_month:
                fiscal_year = issue_date.year
            else:
                fiscal_year = issue_date.year - 1
        
        try:
            sequence = DocumentSequence.objects.get(
                company=company,
                document_type=document_type,
                fiscal_year=fiscal_year
            )
            return sequence.preview_next_number()
        except DocumentSequence.DoesNotExist:
            # Create a temporary sequence to preview
            temp_sequence = DocumentSequence(
                company=company,
                document_type=document_type,
                fiscal_year=fiscal_year,
                pattern=SequenceService._get_default_pattern(document_type),
                prefix=SequenceService._get_default_prefix(company, document_type),
                last_number=0
            )
            return temp_sequence.preview_next_number()
    
    @staticmethod
    def reset_sequence(company, document_type, fiscal_year, user):
        """
        Reset a sequence (admin function - use with caution).
        
        Args:
            company: Company instance
            document_type: Type of document
            fiscal_year: Fiscal year to reset
            user: User performing the reset
        
        Returns:
            bool: Success status
        """
        try:
            with transaction.atomic():
                sequence = DocumentSequence.objects.get(
                    company=company,
                    document_type=document_type,
                    fiscal_year=fiscal_year
                )
                
                # Check if any numbers have been generated
                if sequence.generated_numbers.exists():
                    raise ValidationError(
                        _('Cannot reset sequence that has generated numbers')
                    )
                
                sequence.last_number = 0
                sequence.save(update_fields=['last_number', 'updated_at'])
                
                return True
        except DocumentSequence.DoesNotExist:
            raise ValidationError(_('Sequence does not exist'))
    
    @staticmethod
    def get_sequence_status(company, document_type=None, fiscal_year=None):
        """
        Get status of sequences for a company.
        
        Args:
            company: Company instance
            document_type: Optional filter by document type
            fiscal_year: Optional filter by fiscal year
        
        Returns:
            QuerySet: Sequence objects with status information
        """
        queryset = DocumentSequence.objects.filter(company=company)
        
        if document_type:
            queryset = queryset.filter(document_type=document_type)
        
        if fiscal_year:
            queryset = queryset.filter(fiscal_year=fiscal_year)
        
        return queryset.select_related('company').order_by(
            'fiscal_year', 'document_type'
        )
