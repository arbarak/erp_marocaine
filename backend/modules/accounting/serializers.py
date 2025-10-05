"""
Serializers for accounting module.
"""
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from decimal import Decimal

from .models import AccountType, Account, Journal, JournalEntry, JournalEntryLine
from .services import JournalEntryLineData


class AccountTypeSerializer(serializers.ModelSerializer):
    """Serializer for AccountType model."""
    
    children = serializers.SerializerMethodField()
    accounts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AccountType
        fields = [
            'id', 'code', 'name', 'name_arabic', 'category', 'normal_balance',
            'parent', 'level', 'allow_posting', 'require_reconciliation',
            'description', 'is_active', 'children', 'accounts_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'level', 'children', 'accounts_count', 'created_at', 'updated_at']
    
    def get_children(self, obj):
        """Get child account types."""
        children = obj.children.filter(is_active=True)
        return AccountTypeSerializer(children, many=True, context=self.context).data
    
    def get_accounts_count(self, obj):
        """Get count of accounts under this type."""
        return obj.accounts.filter(is_active=True).count()


class AccountSerializer(serializers.ModelSerializer):
    """Serializer for Account model."""
    
    account_type_name = serializers.CharField(source='account_type.name', read_only=True)
    normal_balance = serializers.CharField(source='account_type.normal_balance', read_only=True)
    current_balance_display = serializers.SerializerMethodField()
    full_path = serializers.CharField(read_only=True)
    
    class Meta:
        model = Account
        fields = [
            'id', 'code', 'name', 'name_arabic', 'account_type', 'account_type_name',
            'parent', 'level', 'currency', 'opening_balance', 'current_balance',
            'current_balance_display', 'allow_posting', 'require_reconciliation',
            'normal_balance', 'full_path', 'description', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'level', 'current_balance', 'current_balance_display',
            'normal_balance', 'full_path', 'created_at', 'updated_at'
        ]
    
    def get_current_balance_display(self, obj):
        """Get formatted current balance."""
        balance = obj.current_balance
        if obj.normal_balance == 'DEBIT':
            return f"{balance:,.2f} DR" if balance >= 0 else f"{abs(balance):,.2f} CR"
        else:
            return f"{balance:,.2f} CR" if balance >= 0 else f"{abs(balance):,.2f} DR"


class JournalSerializer(serializers.ModelSerializer):
    """Serializer for Journal model."""
    
    entries_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Journal
        fields = [
            'id', 'code', 'name', 'journal_type', 'is_active', 'auto_sequence',
            'sequence_prefix', 'default_debit_account', 'default_credit_account',
            'description', 'entries_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'entries_count', 'created_at', 'updated_at']
    
    def get_entries_count(self, obj):
        """Get count of journal entries."""
        return obj.journalentry_set.count()


class JournalEntryLineSerializer(serializers.ModelSerializer):
    """Serializer for JournalEntryLine model."""
    
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)
    amount_display = serializers.SerializerMethodField()
    
    class Meta:
        model = JournalEntryLine
        fields = [
            'id', 'sequence', 'account', 'account_code', 'account_name',
            'description', 'debit_amount', 'credit_amount', 'amount_display',
            'reference', 'reconciled', 'reconciled_at', 'reconciled_by'
        ]
        read_only_fields = [
            'id', 'account_code', 'account_name', 'amount_display',
            'reconciled_at', 'reconciled_by'
        ]
    
    def get_amount_display(self, obj):
        """Get formatted amount display."""
        if obj.debit_amount > 0:
            return f"{obj.debit_amount:,.2f} DR"
        else:
            return f"{obj.credit_amount:,.2f} CR"


class JournalEntrySerializer(serializers.ModelSerializer):
    """Serializer for JournalEntry model."""
    
    lines = JournalEntryLineSerializer(many=True, read_only=True)
    journal_name = serializers.CharField(source='journal.name', read_only=True)
    is_balanced = serializers.SerializerMethodField()
    can_post = serializers.SerializerMethodField()
    can_reverse = serializers.SerializerMethodField()
    
    class Meta:
        model = JournalEntry
        fields = [
            'id', 'entry_number', 'journal', 'journal_name', 'date', 'entry_type',
            'state', 'total_debit', 'total_credit', 'reference', 'description',
            'source_document_type', 'source_document_id', 'reversed_entry',
            'reversal_reason', 'posted_at', 'posted_by', 'lines', 'is_balanced',
            'can_post', 'can_reverse', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'entry_number', 'total_debit', 'total_credit', 'reversed_entry',
            'posted_at', 'posted_by', 'lines', 'is_balanced', 'can_post',
            'can_reverse', 'created_at', 'updated_at'
        ]
    
    def get_is_balanced(self, obj):
        """Check if journal entry is balanced."""
        return obj.is_balanced()
    
    def get_can_post(self, obj):
        """Check if journal entry can be posted."""
        return obj.state == 'DRAFT' and obj.is_balanced() and obj.lines.exists()
    
    def get_can_reverse(self, obj):
        """Check if journal entry can be reversed."""
        return obj.state == 'POSTED'


class JournalEntryCreateSerializer(serializers.Serializer):
    """Serializer for creating journal entries."""
    
    journal = serializers.UUIDField()
    date = serializers.DateField()
    description = serializers.CharField(max_length=500)
    reference = serializers.CharField(max_length=100, required=False, allow_blank=True)
    lines = serializers.ListField(
        child=serializers.DictField(),
        min_length=2
    )
    
    def validate_lines(self, value):
        """Validate journal entry lines."""
        total_debits = Decimal('0.00')
        total_credits = Decimal('0.00')
        
        for line_data in value:
            # Validate required fields
            if 'account_code' not in line_data:
                raise serializers.ValidationError(_('Account code is required for each line'))
            if 'description' not in line_data:
                raise serializers.ValidationError(_('Description is required for each line'))
            
            # Validate amounts
            debit_amount = Decimal(str(line_data.get('debit_amount', '0.00')))
            credit_amount = Decimal(str(line_data.get('credit_amount', '0.00')))
            
            if debit_amount < 0 or credit_amount < 0:
                raise serializers.ValidationError(_('Amounts cannot be negative'))
            
            if debit_amount > 0 and credit_amount > 0:
                raise serializers.ValidationError(_('A line cannot have both debit and credit amounts'))
            
            if debit_amount == 0 and credit_amount == 0:
                raise serializers.ValidationError(_('A line must have either a debit or credit amount'))
            
            total_debits += debit_amount
            total_credits += credit_amount
        
        # Check if entry is balanced
        if total_debits != total_credits:
            raise serializers.ValidationError(
                _('Total debits (%(debits)s) must equal total credits (%(credits)s)') % {
                    'debits': total_debits,
                    'credits': total_credits
                }
            )
        
        return value


class JournalEntryPostSerializer(serializers.Serializer):
    """Serializer for posting journal entries."""
    
    entry_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1
    )


class JournalEntryReverseSerializer(serializers.Serializer):
    """Serializer for reversing journal entries."""
    
    reason = serializers.CharField(max_length=500, required=False, allow_blank=True)


class TrialBalanceRequestSerializer(serializers.Serializer):
    """Serializer for trial balance request."""
    
    as_of_date = serializers.DateField()
    include_zero_balances = serializers.BooleanField(default=False)


class FinancialStatementRequestSerializer(serializers.Serializer):
    """Serializer for financial statement request."""
    
    from_date = serializers.DateField()
    to_date = serializers.DateField()
    
    def validate(self, data):
        """Validate date range."""
        if data['from_date'] > data['to_date']:
            raise serializers.ValidationError(_('From date must be before to date'))
        return data


class BalanceSheetRequestSerializer(serializers.Serializer):
    """Serializer for balance sheet request."""
    
    as_of_date = serializers.DateField()


class ChartOfAccountsSetupSerializer(serializers.Serializer):
    """Serializer for chart of accounts setup."""
    
    create_moroccan_template = serializers.BooleanField(default=True)
    create_basic_accounts = serializers.BooleanField(default=True)
