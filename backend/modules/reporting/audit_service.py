"""
Audit trail and compliance tracking services.
"""
from decimal import Decimal
from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional
from django.db.models import Q, Sum, Count, F
from django.db.models.functions import TruncDate
from django.utils.translation import gettext_lazy as _

from modules.accounting.models import JournalEntry
from modules.invoicing.models import Invoice
from core.companies.models import Company


class AuditTrailService:
    """Service for audit trail and compliance tracking."""
    
    def __init__(self, company: Company):
        self.company = company
    
    def log_user_action(
        self,
        user,
        action_type: str,
        description: str,
        content_object=None,
        old_values: Dict = None,
        new_values: Dict = None,
        severity: str = 'LOW',
        request=None
    ):
        """Log a user action to the audit trail."""
        
        from .models import AuditLog
        
        # Extract request information
        ip_address = None
        user_agent = ''
        session_key = ''
        
        if request:
            # Get IP address
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            
            # Get user agent
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Get session key
            session_key = request.session.session_key or ''
        
        # Create audit log entry
        audit_log = AuditLog.objects.create(
            company=self.company,
            action_type=action_type,
            description=description,
            content_object=content_object,
            user=user,
            session_key=session_key,
            ip_address=ip_address,
            user_agent=user_agent,
            old_values=old_values,
            new_values=new_values,
            severity=severity
        )
        
        return audit_log
    
    def generate_audit_report(
        self,
        start_date: date,
        end_date: date,
        user_id: Optional[str] = None,
        action_types: Optional[List[str]] = None,
        severity_levels: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Generate audit trail report."""
        
        from .models import AuditLog
        
        # Build query
        query = Q(
            company=self.company,
            timestamp__date__range=[start_date, end_date]
        )
        
        if user_id:
            query &= Q(user_id=user_id)
        
        if action_types:
            query &= Q(action_type__in=action_types)
        
        if severity_levels:
            query &= Q(severity__in=severity_levels)
        
        # Get audit logs
        audit_logs = AuditLog.objects.filter(query).order_by('-timestamp')
        
        # Summary statistics
        total_actions = audit_logs.count()
        
        actions_by_type = audit_logs.values('action_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        actions_by_user = audit_logs.values(
            'user__first_name',
            'user__last_name',
            'user__email'
        ).annotate(
            count=Count('id')
        ).order_by('-count')
        
        actions_by_severity = audit_logs.values('severity').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Daily activity
        daily_activity = audit_logs.annotate(
            day=TruncDate('timestamp')
        ).values('day').annotate(
            count=Count('id')
        ).order_by('day')
        
        # Recent high-severity actions
        high_severity_actions = audit_logs.filter(
            severity__in=['HIGH', 'CRITICAL']
        )[:20]
        
        return {
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'summary': {
                'total_actions': total_actions,
                'actions_by_type': list(actions_by_type),
                'actions_by_user': list(actions_by_user),
                'actions_by_severity': list(actions_by_severity)
            },
            'daily_activity': list(daily_activity),
            'high_severity_actions': [
                {
                    'id': str(log.id),
                    'timestamp': log.timestamp,
                    'user': log.user.get_full_name() if log.user else 'System',
                    'action_type': log.action_type,
                    'description': log.description,
                    'severity': log.severity,
                    'ip_address': log.ip_address
                }
                for log in high_severity_actions
            ],
            'generated_at': datetime.now()
        }
    
    def check_data_integrity(self) -> Dict[str, Any]:
        """Perform data integrity checks."""
        
        integrity_checks = []
        
        # Check for orphaned invoices
        orphaned_invoices = Invoice.objects.filter(
            company=self.company
        ).exclude(
            customer__isnull=False
        ).exclude(
            supplier__isnull=False
        ).count()
        
        integrity_checks.append({
            'check': 'Orphaned Invoices',
            'description': 'Invoices without customer or supplier',
            'count': orphaned_invoices,
            'status': 'PASS' if orphaned_invoices == 0 else 'FAIL'
        })
        
        # Check for unbalanced journal entries
        unbalanced_entries = JournalEntry.objects.filter(
            company=self.company,
            state='POSTED'
        ).exclude(
            total_debit=F('total_credit')
        ).count()
        
        integrity_checks.append({
            'check': 'Unbalanced Journal Entries',
            'description': 'Posted journal entries where debits ≠ credits',
            'count': unbalanced_entries,
            'status': 'PASS' if unbalanced_entries == 0 else 'FAIL'
        })
        
        # Check for negative inventory
        # TODO: Implement when inventory tracking is available
        
        # Check for duplicate invoice numbers
        duplicate_invoices = Invoice.objects.filter(
            company=self.company
        ).values('invoice_number').annotate(
            count=Count('id')
        ).filter(count__gt=1).count()
        
        integrity_checks.append({
            'check': 'Duplicate Invoice Numbers',
            'description': 'Multiple invoices with same number',
            'count': duplicate_invoices,
            'status': 'PASS' if duplicate_invoices == 0 else 'FAIL'
        })
        
        # Check for missing tax configurations
        from libs.tax_engine.models import Tax
        active_taxes = Tax.objects.filter(
            company=self.company,
            is_active=True
        ).count()
        
        integrity_checks.append({
            'check': 'Tax Configuration',
            'description': 'Active tax configurations available',
            'count': active_taxes,
            'status': 'PASS' if active_taxes > 0 else 'FAIL'
        })
        
        # Check for account balance consistency
        from modules.accounting.models import Account, JournalEntryLine
        
        inconsistent_accounts = 0
        for account in Account.objects.filter(company=self.company, is_active=True):
            # Calculate balance from journal entry lines
            lines = JournalEntryLine.objects.filter(
                account=account,
                journal_entry__state='POSTED'
            )
            
            total_debits = lines.aggregate(
                total=Sum('debit_amount')
            )['total'] or Decimal('0')
            
            total_credits = lines.aggregate(
                total=Sum('credit_amount')
            )['total'] or Decimal('0')
            
            if account.account_type.normal_balance == 'DEBIT':
                calculated_balance = total_debits - total_credits
            else:
                calculated_balance = total_credits - total_debits
            
            # Check if calculated balance matches stored balance
            if abs(calculated_balance - account.current_balance) > Decimal('0.01'):
                inconsistent_accounts += 1
        
        integrity_checks.append({
            'check': 'Account Balance Consistency',
            'description': 'Accounts with inconsistent balances',
            'count': inconsistent_accounts,
            'status': 'PASS' if inconsistent_accounts == 0 else 'FAIL'
        })
        
        # Overall status
        failed_checks = sum(1 for check in integrity_checks if check['status'] == 'FAIL')
        overall_status = 'PASS' if failed_checks == 0 else 'FAIL'
        
        return {
            'company': self.company.name,
            'checks': integrity_checks,
            'summary': {
                'total_checks': len(integrity_checks),
                'passed_checks': len(integrity_checks) - failed_checks,
                'failed_checks': failed_checks,
                'overall_status': overall_status
            },
            'checked_at': datetime.now()
        }
    
    def generate_compliance_report(self) -> Dict[str, Any]:
        """Generate compliance status report."""
        
        compliance_items = []
        
        # Company information completeness
        company_info_score = 0
        total_company_fields = 5
        
        if self.company.name:
            company_info_score += 1
        if self.company.ice:
            company_info_score += 1
        if self.company.if_number:
            company_info_score += 1
        if self.company.rc:
            company_info_score += 1
        if self.company.address:
            company_info_score += 1
        
        compliance_items.append({
            'category': 'Company Information',
            'score': (company_info_score / total_company_fields) * 100,
            'status': 'COMPLIANT' if company_info_score == total_company_fields else 'NON_COMPLIANT',
            'details': f'{company_info_score}/{total_company_fields} required fields completed'
        })
        
        # Chart of accounts setup
        from modules.accounting.models import Account
        
        required_accounts = [
            '3421',  # Clients
            '4411',  # Fournisseurs
            '44551', # TVA à Payer
            '34552', # TVA Récupérable
            '5111',  # Caisse
            '5141',  # Banque
        ]
        
        existing_accounts = Account.objects.filter(
            company=self.company,
            code__in=required_accounts,
            is_active=True
        ).count()
        
        compliance_items.append({
            'category': 'Chart of Accounts',
            'score': (existing_accounts / len(required_accounts)) * 100,
            'status': 'COMPLIANT' if existing_accounts == len(required_accounts) else 'NON_COMPLIANT',
            'details': f'{existing_accounts}/{len(required_accounts)} required accounts configured'
        })
        
        # Tax configuration
        from libs.tax_engine.models import Tax
        
        required_tax_types = ['TVA_20', 'TVA_14', 'TVA_10', 'TVA_7', 'TVA_0']
        existing_taxes = Tax.objects.filter(
            company=self.company,
            code__in=required_tax_types,
            is_active=True
        ).count()
        
        compliance_items.append({
            'category': 'Tax Configuration',
            'score': (existing_taxes / len(required_tax_types)) * 100,
            'status': 'COMPLIANT' if existing_taxes >= 3 else 'NON_COMPLIANT',  # At least 3 tax rates
            'details': f'{existing_taxes}/{len(required_tax_types)} tax rates configured'
        })
        
        # Recent activity (indicates system usage)
        recent_invoices = Invoice.objects.filter(
            company=self.company,
            created_at__gte=datetime.now() - timedelta(days=30)
        ).count()
        
        compliance_items.append({
            'category': 'System Activity',
            'score': 100 if recent_invoices > 0 else 0,
            'status': 'COMPLIANT' if recent_invoices > 0 else 'NON_COMPLIANT',
            'details': f'{recent_invoices} invoices created in last 30 days'
        })
        
        # Calculate overall compliance score
        total_score = sum(item['score'] for item in compliance_items)
        overall_score = total_score / len(compliance_items)
        
        # Determine overall status
        if overall_score >= 90:
            overall_status = 'FULLY_COMPLIANT'
        elif overall_score >= 70:
            overall_status = 'MOSTLY_COMPLIANT'
        elif overall_score >= 50:
            overall_status = 'PARTIALLY_COMPLIANT'
        else:
            overall_status = 'NON_COMPLIANT'
        
        return {
            'company': {
                'name': self.company.name,
                'ice': self.company.ice,
                'if_number': self.company.if_number
            },
            'compliance_items': compliance_items,
            'summary': {
                'overall_score': overall_score,
                'overall_status': overall_status,
                'compliant_categories': sum(1 for item in compliance_items if item['status'] == 'COMPLIANT'),
                'total_categories': len(compliance_items)
            },
            'generated_at': datetime.now()
        }
