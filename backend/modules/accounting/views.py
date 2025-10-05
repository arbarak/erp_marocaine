"""
Views for accounting module.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from core.permissions import CompanyContextPermission
from .models import AccountType, Account, Journal, JournalEntry, JournalEntryLine
from .serializers import (
    AccountTypeSerializer, AccountSerializer, JournalSerializer,
    JournalEntrySerializer, JournalEntryLineSerializer,
    JournalEntryCreateSerializer, JournalEntryPostSerializer,
    JournalEntryReverseSerializer, TrialBalanceRequestSerializer,
    FinancialStatementRequestSerializer, BalanceSheetRequestSerializer,
    ChartOfAccountsSetupSerializer
)
from .services import JournalEntryService, JournalEntryLineData
from .financial_statements import FinancialStatementsService
from .chart_of_accounts import MoroccanChartOfAccountsService


class AccountTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for AccountType model."""
    
    serializer_class = AccountTypeSerializer
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'normal_balance', 'parent', 'is_active']
    search_fields = ['code', 'name', 'name_arabic']
    ordering_fields = ['code', 'name', 'level', 'created_at']
    ordering = ['code']
    
    def get_queryset(self):
        """Filter by company context."""
        return AccountType.objects.filter(
            company=self.request.company
        ).select_related('parent')
    
    def perform_create(self, serializer):
        """Set company and created_by on creation."""
        serializer.save(
            company=self.request.company,
            created_by=self.request.user
        )


class AccountViewSet(viewsets.ModelViewSet):
    """ViewSet for Account model."""
    
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['account_type', 'parent', 'currency', 'allow_posting', 'is_active']
    search_fields = ['code', 'name', 'name_arabic']
    ordering_fields = ['code', 'name', 'current_balance', 'created_at']
    ordering = ['code']
    
    def get_queryset(self):
        """Filter by company context."""
        return Account.objects.filter(
            company=self.request.company
        ).select_related('account_type', 'parent')
    
    def perform_create(self, serializer):
        """Set company and created_by on creation."""
        serializer.save(
            company=self.request.company,
            created_by=self.request.user
        )
    
    @action(detail=True, methods=['get'])
    def balance_history(self, request, pk=None):
        """Get account balance history."""
        account = self.get_object()
        
        # Get journal entry lines for this account
        lines = JournalEntryLine.objects.filter(
            account=account,
            journal_entry__state='POSTED'
        ).select_related('journal_entry').order_by('journal_entry__date', 'journal_entry__created_at')
        
        balance_history = []
        running_balance = account.opening_balance
        
        for line in lines:
            if account.normal_balance == 'DEBIT':
                running_balance += line.debit_amount - line.credit_amount
            else:
                running_balance += line.credit_amount - line.debit_amount
            
            balance_history.append({
                'date': line.journal_entry.date,
                'entry_number': line.journal_entry.entry_number,
                'description': line.description,
                'debit_amount': line.debit_amount,
                'credit_amount': line.credit_amount,
                'balance': running_balance,
                'reference': line.reference
            })
        
        return Response(balance_history)


class JournalViewSet(viewsets.ModelViewSet):
    """ViewSet for Journal model."""
    
    serializer_class = JournalSerializer
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['journal_type', 'is_active']
    search_fields = ['code', 'name']
    ordering_fields = ['code', 'name', 'created_at']
    ordering = ['code']
    
    def get_queryset(self):
        """Filter by company context."""
        return Journal.objects.filter(
            company=self.request.company
        ).select_related('default_debit_account', 'default_credit_account')
    
    def perform_create(self, serializer):
        """Set company and created_by on creation."""
        serializer.save(
            company=self.request.company,
            created_by=self.request.user
        )


class JournalEntryViewSet(viewsets.ModelViewSet):
    """ViewSet for JournalEntry model."""
    
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['journal', 'state', 'entry_type', 'date']
    search_fields = ['entry_number', 'description', 'reference']
    ordering_fields = ['entry_number', 'date', 'created_at']
    ordering = ['-date', '-created_at']
    
    def get_queryset(self):
        """Filter by company context."""
        return JournalEntry.objects.filter(
            company=self.request.company
        ).select_related('journal', 'posted_by', 'created_by').prefetch_related('lines__account')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return JournalEntryCreateSerializer
        elif self.action == 'post_entries':
            return JournalEntryPostSerializer
        elif self.action == 'reverse':
            return JournalEntryReverseSerializer
        return super().get_serializer_class()
    
    def create(self, request, *args, **kwargs):
        """Create journal entry with lines."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            # Get journal
            journal = Journal.objects.get(
                id=serializer.validated_data['journal'],
                company=request.company
            )
            
            # Prepare lines data
            lines_data = []
            for line_data in serializer.validated_data['lines']:
                lines_data.append(
                    JournalEntryLineData(
                        account_code=line_data['account_code'],
                        description=line_data['description'],
                        debit_amount=line_data.get('debit_amount', 0),
                        credit_amount=line_data.get('credit_amount', 0),
                        reference=line_data.get('reference', '')
                    )
                )
            
            # Create journal entry
            entry = JournalEntryService.create_journal_entry(
                company=request.company,
                journal=journal,
                date=serializer.validated_data['date'],
                description=serializer.validated_data['description'],
                lines_data=lines_data,
                user=request.user,
                reference=serializer.validated_data.get('reference', '')
            )
        
        # Return created entry
        response_serializer = JournalEntrySerializer(entry, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def post(self, request, pk=None):
        """Post a journal entry."""
        entry = self.get_object()
        
        if entry.state != 'DRAFT':
            return Response(
                {'error': _('Only draft entries can be posted')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not entry.is_balanced():
            return Response(
                {'error': _('Journal entry must be balanced before posting')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            JournalEntryService.post_journal_entry(entry, request.user)
            serializer = self.get_serializer(entry)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def post_entries(self, request):
        """Post multiple journal entries."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        entry_ids = serializer.validated_data['entry_ids']
        entries = JournalEntry.objects.filter(
            id__in=entry_ids,
            company=request.company,
            state='DRAFT'
        )
        
        posted_entries = []
        errors = []
        
        for entry in entries:
            try:
                if entry.is_balanced():
                    JournalEntryService.post_journal_entry(entry, request.user)
                    posted_entries.append(entry.id)
                else:
                    errors.append(f"Entry {entry.entry_number} is not balanced")
            except Exception as e:
                errors.append(f"Entry {entry.entry_number}: {str(e)}")
        
        return Response({
            'posted_entries': posted_entries,
            'errors': errors
        })
    
    @action(detail=True, methods=['post'])
    def reverse(self, request, pk=None):
        """Reverse a journal entry."""
        entry = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if entry.state != 'POSTED':
            return Response(
                {'error': _('Only posted entries can be reversed')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            reversal_entry = JournalEntryService.reverse_journal_entry(
                entry,
                request.user,
                serializer.validated_data.get('reason', '')
            )
            
            response_serializer = JournalEntrySerializer(reversal_entry, context={'request': request})
            return Response(response_serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class FinancialReportsViewSet(viewsets.ViewSet):
    """ViewSet for financial reports."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    
    @action(detail=False, methods=['post'])
    def trial_balance(self, request):
        """Generate trial balance."""
        serializer = TrialBalanceRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        trial_balance = FinancialStatementsService.generate_trial_balance(
            company=request.company,
            as_of_date=serializer.validated_data['as_of_date'],
            include_zero_balances=serializer.validated_data['include_zero_balances']
        )
        
        return Response(trial_balance)
    
    @action(detail=False, methods=['post'])
    def balance_sheet(self, request):
        """Generate balance sheet."""
        serializer = BalanceSheetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        balance_sheet = FinancialStatementsService.generate_balance_sheet(
            company=request.company,
            as_of_date=serializer.validated_data['as_of_date']
        )
        
        return Response(balance_sheet)
    
    @action(detail=False, methods=['post'])
    def income_statement(self, request):
        """Generate income statement."""
        serializer = FinancialStatementRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        income_statement = FinancialStatementsService.generate_income_statement(
            company=request.company,
            from_date=serializer.validated_data['from_date'],
            to_date=serializer.validated_data['to_date']
        )
        
        return Response(income_statement)
    
    @action(detail=False, methods=['post'])
    def cash_flow_statement(self, request):
        """Generate cash flow statement."""
        serializer = FinancialStatementRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        cash_flow = FinancialStatementsService.generate_cash_flow_statement(
            company=request.company,
            from_date=serializer.validated_data['from_date'],
            to_date=serializer.validated_data['to_date']
        )
        
        return Response(cash_flow)


class ChartOfAccountsViewSet(viewsets.ViewSet):
    """ViewSet for chart of accounts management."""
    
    permission_classes = [IsAuthenticated, CompanyContextPermission]
    
    @action(detail=False, methods=['post'])
    def setup_moroccan_chart(self, request):
        """Setup Moroccan chart of accounts."""
        serializer = ChartOfAccountsSetupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            with transaction.atomic():
                result = MoroccanChartOfAccountsService.create_moroccan_chart_of_accounts(
                    company=request.company,
                    user=request.user
                )
                
                if serializer.validated_data['create_basic_accounts']:
                    basic_accounts = MoroccanChartOfAccountsService.create_basic_accounts(
                        company=request.company,
                        user=request.user,
                        account_types=result['account_types']
                    )
                    result['basic_accounts_created'] = len(basic_accounts)
                
                return Response({
                    'success': True,
                    'message': _('Moroccan chart of accounts created successfully'),
                    'details': result
                })
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
