"""
Moroccan Chart of Accounts template based on Plan Comptable Général Marocain (PCGM).
"""
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from decimal import Decimal

from .models import AccountType, Account, Journal
from core.companies.models import Company
from core.accounts.models import User


class MoroccanChartOfAccountsService:
    """Service for creating Moroccan standard chart of accounts."""
    
    # Moroccan Chart of Accounts structure (PCGM)
    ACCOUNT_TYPES_TEMPLATE = [
        # Class 1: Financing Accounts (Comptes de financement)
        {'code': '1', 'name': 'Comptes de financement', 'name_arabic': 'حسابات التمويل', 'category': 'EQUITY', 'normal_balance': 'CREDIT', 'parent': None},
        {'code': '11', 'name': 'Capitaux propres', 'name_arabic': 'الأموال الخاصة', 'category': 'EQUITY', 'normal_balance': 'CREDIT', 'parent': '1'},
        {'code': '111', 'name': 'Capital social', 'name_arabic': 'رأس المال الاجتماعي', 'category': 'EQUITY', 'normal_balance': 'CREDIT', 'parent': '11'},
        {'code': '112', 'name': 'Primes liées au capital social', 'name_arabic': 'علاوات مرتبطة برأس المال', 'category': 'EQUITY', 'normal_balance': 'CREDIT', 'parent': '11'},
        {'code': '113', 'name': 'Écarts de réévaluation', 'name_arabic': 'فروقات إعادة التقييم', 'category': 'EQUITY', 'normal_balance': 'CREDIT', 'parent': '11'},
        {'code': '114', 'name': 'Réserve légale', 'name_arabic': 'الاحتياطي القانوني', 'category': 'EQUITY', 'normal_balance': 'CREDIT', 'parent': '11'},
        {'code': '115', 'name': 'Autres réserves', 'name_arabic': 'احتياطيات أخرى', 'category': 'EQUITY', 'normal_balance': 'CREDIT', 'parent': '11'},
        {'code': '116', 'name': 'Report à nouveau', 'name_arabic': 'الأرباح المرحلة', 'category': 'EQUITY', 'normal_balance': 'CREDIT', 'parent': '11'},
        {'code': '118', 'name': 'Résultats nets en instance d\'affectation', 'name_arabic': 'النتائج الصافية في انتظار التخصيص', 'category': 'EQUITY', 'normal_balance': 'CREDIT', 'parent': '11'},
        {'code': '119', 'name': 'Résultat net de l\'exercice', 'name_arabic': 'النتيجة الصافية للسنة المالية', 'category': 'EQUITY', 'normal_balance': 'CREDIT', 'parent': '11'},
        
        {'code': '13', 'name': 'Capitaux propres assimilés', 'name_arabic': 'أموال خاصة مماثلة', 'category': 'EQUITY', 'normal_balance': 'CREDIT', 'parent': '1'},
        {'code': '14', 'name': 'Dettes de financement', 'name_arabic': 'ديون التمويل', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': '1'},
        {'code': '141', 'name': 'Emprunts obligataires', 'name_arabic': 'قروض السندات', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': '14'},
        {'code': '148', 'name': 'Autres dettes de financement', 'name_arabic': 'ديون تمويل أخرى', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': '14'},
        
        {'code': '15', 'name': 'Provisions durables pour risques et charges', 'name_arabic': 'مؤونات دائمة للمخاطر والأعباء', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': '1'},
        {'code': '16', 'name': 'Comptes de liaison des établissements', 'name_arabic': 'حسابات ربط المؤسسات', 'category': 'EQUITY', 'normal_balance': 'CREDIT', 'parent': '1'},
        {'code': '17', 'name': 'Écarts de conversion-Passif', 'name_arabic': 'فروقات التحويل - خصوم', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': '1'},
        
        # Class 2: Asset Accounts (Comptes d'actif immobilisé)
        {'code': '2', 'name': 'Comptes d\'actif immobilisé', 'name_arabic': 'حسابات الأصول الثابتة', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': None},
        {'code': '21', 'name': 'Immobilisations en non-valeurs', 'name_arabic': 'أصول ثابتة معنوية', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '2'},
        {'code': '22', 'name': 'Immobilisations incorporelles', 'name_arabic': 'أصول ثابتة غير ملموسة', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '2'},
        {'code': '23', 'name': 'Immobilisations corporelles', 'name_arabic': 'أصول ثابتة ملموسة', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '2'},
        {'code': '231', 'name': 'Terrains', 'name_arabic': 'أراضي', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '23'},
        {'code': '232', 'name': 'Constructions', 'name_arabic': 'مباني', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '23'},
        {'code': '233', 'name': 'Installations techniques, matériel et outillage', 'name_arabic': 'تجهيزات تقنية ومعدات', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '23'},
        {'code': '234', 'name': 'Matériel de transport', 'name_arabic': 'معدات النقل', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '23'},
        {'code': '235', 'name': 'Mobilier, matériel de bureau et aménagements', 'name_arabic': 'أثاث ومعدات مكتبية', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '23'},
        {'code': '238', 'name': 'Autres immobilisations corporelles', 'name_arabic': 'أصول ثابتة ملموسة أخرى', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '23'},
        {'code': '239', 'name': 'Immobilisations corporelles en cours', 'name_arabic': 'أصول ثابتة ملموسة قيد الإنجاز', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '23'},
        
        {'code': '24', 'name': 'Immobilisations financières', 'name_arabic': 'أصول ثابتة مالية', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '2'},
        {'code': '27', 'name': 'Écarts de conversion-Actif', 'name_arabic': 'فروقات التحويل - أصول', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '2'},
        {'code': '28', 'name': 'Amortissements des immobilisations', 'name_arabic': 'إهلاكات الأصول الثابتة', 'category': 'ASSET', 'normal_balance': 'CREDIT', 'parent': '2'},
        {'code': '29', 'name': 'Provisions pour dépréciation des immobilisations', 'name_arabic': 'مؤونات انخفاض قيمة الأصول', 'category': 'ASSET', 'normal_balance': 'CREDIT', 'parent': '2'},
        
        # Class 3: Inventory Accounts (Comptes d'actif circulant)
        {'code': '3', 'name': 'Comptes d\'actif circulant', 'name_arabic': 'حسابات الأصول المتداولة', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': None},
        {'code': '31', 'name': 'Stocks', 'name_arabic': 'مخزونات', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '3'},
        {'code': '311', 'name': 'Marchandises', 'name_arabic': 'بضائع', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '31'},
        {'code': '312', 'name': 'Matières et fournitures consommables', 'name_arabic': 'مواد ولوازم استهلاكية', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '31'},
        {'code': '313', 'name': 'Produits en cours', 'name_arabic': 'منتجات قيد الصنع', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '31'},
        {'code': '314', 'name': 'Produits intermédiaires et produits résiduels', 'name_arabic': 'منتجات وسطية ومتبقية', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '31'},
        {'code': '315', 'name': 'Produits finis', 'name_arabic': 'منتجات تامة الصنع', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '31'},
        
        {'code': '34', 'name': 'Créances de l\'actif circulant', 'name_arabic': 'ديون الأصول المتداولة', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '3'},
        {'code': '341', 'name': 'Fournisseurs débiteurs, avances et acomptes', 'name_arabic': 'موردون مدينون، سلف ودفعات مقدمة', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '34'},
        {'code': '342', 'name': 'Clients et comptes rattachés', 'name_arabic': 'زبائن وحسابات ملحقة', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '34'},
        {'code': '343', 'name': 'Personnel - débiteur', 'name_arabic': 'موظفون - مدينون', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '34'},
        {'code': '345', 'name': 'État - débiteur', 'name_arabic': 'الدولة - مدينة', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '34'},
        {'code': '346', 'name': 'Comptes d\'associés - débiteurs', 'name_arabic': 'حسابات الشركاء - مدينة', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '34'},
        {'code': '348', 'name': 'Autres débiteurs', 'name_arabic': 'مدينون آخرون', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '34'},
        
        {'code': '35', 'name': 'Titres et valeurs de placement', 'name_arabic': 'سندات وقيم توظيف', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '3'},
        {'code': '37', 'name': 'Écarts de conversion-Actif', 'name_arabic': 'فروقات التحويل - أصول', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '3'},
        {'code': '39', 'name': 'Provisions pour dépréciation des comptes de l\'actif circulant', 'name_arabic': 'مؤونات انخفاض قيمة الأصول المتداولة', 'category': 'ASSET', 'normal_balance': 'CREDIT', 'parent': '3'},
        
        # Class 4: Accounts Payable and Receivable (Comptes de passif circulant)
        {'code': '4', 'name': 'Comptes de passif circulant', 'name_arabic': 'حسابات الخصوم المتداولة', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': None},
        {'code': '44', 'name': 'Dettes du passif circulant', 'name_arabic': 'ديون الخصوم المتداولة', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': '4'},
        {'code': '441', 'name': 'Fournisseurs et comptes rattachés', 'name_arabic': 'موردون وحسابات ملحقة', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': '44'},
        {'code': '442', 'name': 'Clients créditeurs, avances et acomptes', 'name_arabic': 'زبائن دائنون، سلف ودفعات مقدمة', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': '44'},
        {'code': '443', 'name': 'Personnel - créditeur', 'name_arabic': 'موظفون - دائنون', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': '44'},
        {'code': '444', 'name': 'Organismes sociaux', 'name_arabic': 'هيئات اجتماعية', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': '44'},
        {'code': '445', 'name': 'État - créditeur', 'name_arabic': 'الدولة - دائنة', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': '44'},
        {'code': '446', 'name': 'Comptes d\'associés - créditeurs', 'name_arabic': 'حسابات الشركاء - دائنة', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': '44'},
        {'code': '448', 'name': 'Autres créanciers', 'name_arabic': 'دائنون آخرون', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': '44'},
        {'code': '449', 'name': 'Comptes de régularisation-Passif', 'name_arabic': 'حسابات تسوية - خصوم', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': '44'},
        
        {'code': '45', 'name': 'Autres provisions pour risques et charges', 'name_arabic': 'مؤونات أخرى للمخاطر والأعباء', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': '4'},
        {'code': '47', 'name': 'Écarts de conversion-Passif', 'name_arabic': 'فروقات التحويل - خصوم', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': '4'},
        
        # Class 5: Financial Accounts (Comptes de trésorerie)
        {'code': '5', 'name': 'Comptes de trésorerie', 'name_arabic': 'حسابات الخزينة', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': None},
        {'code': '51', 'name': 'Chèques et valeurs à encaisser', 'name_arabic': 'شيكات وقيم للتحصيل', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '5'},
        {'code': '514', 'name': 'Chèques à encaisser', 'name_arabic': 'شيكات للتحصيل', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '51'},
        {'code': '515', 'name': 'Effets à encaisser', 'name_arabic': 'كمبيالات للتحصيل', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '51'},
        
        {'code': '54', 'name': 'Banques, Trésorerie Générale et Chèques Postaux débiteurs', 'name_arabic': 'بنوك، خزينة عامة وشيكات بريدية مدينة', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '5'},
        {'code': '541', 'name': 'Banques (soldes débiteurs)', 'name_arabic': 'بنوك (أرصدة مدينة)', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '54'},
        {'code': '546', 'name': 'Trésorerie Générale', 'name_arabic': 'الخزينة العامة', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '54'},
        {'code': '548', 'name': 'Autres établissements financiers', 'name_arabic': 'مؤسسات مالية أخرى', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '54'},
        
        {'code': '55', 'name': 'Banques, Trésorerie Générale et Chèques Postaux créditeurs', 'name_arabic': 'بنوك، خزينة عامة وشيكات بريدية دائنة', 'category': 'LIABILITY', 'normal_balance': 'CREDIT', 'parent': '5'},
        {'code': '56', 'name': 'Caisses', 'name_arabic': 'صناديق', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '5'},
        {'code': '561', 'name': 'Caisses (siège social)', 'name_arabic': 'صناديق (المقر الرئيسي)', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '56'},
        {'code': '564', 'name': 'Régies d\'avances', 'name_arabic': 'صناديق السلف', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '56'},
        
        {'code': '57', 'name': 'Écarts de conversion-Actif', 'name_arabic': 'فروقات التحويل - أصول', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '5'},
        {'code': '58', 'name': 'Virements de fonds', 'name_arabic': 'تحويلات الأموال', 'category': 'ASSET', 'normal_balance': 'DEBIT', 'parent': '5'},
        {'code': '59', 'name': 'Provisions pour dépréciation des comptes de trésorerie', 'name_arabic': 'مؤونات انخفاض قيمة حسابات الخزينة', 'category': 'ASSET', 'normal_balance': 'CREDIT', 'parent': '5'},
        
        # Class 6: Expense Accounts (Comptes de charges)
        {'code': '6', 'name': 'Comptes de charges', 'name_arabic': 'حسابات الأعباء', 'category': 'EXPENSE', 'normal_balance': 'DEBIT', 'parent': None},
        {'code': '61', 'name': 'Charges d\'exploitation', 'name_arabic': 'أعباء الاستغلال', 'category': 'EXPENSE', 'normal_balance': 'DEBIT', 'parent': '6'},
        {'code': '611', 'name': 'Achats revendus de marchandises', 'name_arabic': 'مشتريات بضائع معاد بيعها', 'category': 'EXPENSE', 'normal_balance': 'DEBIT', 'parent': '61'},
        {'code': '612', 'name': 'Achats consommés de matières et fournitures', 'name_arabic': 'مشتريات مستهلكة من مواد ولوازم', 'category': 'EXPENSE', 'normal_balance': 'DEBIT', 'parent': '61'},
        {'code': '613', 'name': 'Autres charges externes', 'name_arabic': 'أعباء خارجية أخرى', 'category': 'EXPENSE', 'normal_balance': 'DEBIT', 'parent': '61'},
        {'code': '614', 'name': 'Charges de personnel', 'name_arabic': 'أعباء الموظفين', 'category': 'EXPENSE', 'normal_balance': 'DEBIT', 'parent': '61'},
        {'code': '615', 'name': 'Autres charges d\'exploitation', 'name_arabic': 'أعباء استغلال أخرى', 'category': 'EXPENSE', 'normal_balance': 'DEBIT', 'parent': '61'},
        {'code': '616', 'name': 'Impôts et taxes', 'name_arabic': 'ضرائب ورسوم', 'category': 'EXPENSE', 'normal_balance': 'DEBIT', 'parent': '61'},
        {'code': '618', 'name': 'Dotations d\'exploitation', 'name_arabic': 'مخصصات الاستغلال', 'category': 'EXPENSE', 'normal_balance': 'DEBIT', 'parent': '61'},
        
        {'code': '63', 'name': 'Charges financières', 'name_arabic': 'أعباء مالية', 'category': 'EXPENSE', 'normal_balance': 'DEBIT', 'parent': '6'},
        {'code': '65', 'name': 'Charges non courantes', 'name_arabic': 'أعباء غير جارية', 'category': 'EXPENSE', 'normal_balance': 'DEBIT', 'parent': '6'},
        {'code': '67', 'name': 'Impôts sur les résultats', 'name_arabic': 'ضرائب على النتائج', 'category': 'EXPENSE', 'normal_balance': 'DEBIT', 'parent': '6'},
        
        # Class 7: Revenue Accounts (Comptes de produits)
        {'code': '7', 'name': 'Comptes de produits', 'name_arabic': 'حسابات المنتجات', 'category': 'REVENUE', 'normal_balance': 'CREDIT', 'parent': None},
        {'code': '71', 'name': 'Produits d\'exploitation', 'name_arabic': 'منتجات الاستغلال', 'category': 'REVENUE', 'normal_balance': 'CREDIT', 'parent': '7'},
        {'code': '711', 'name': 'Ventes de marchandises', 'name_arabic': 'مبيعات البضائع', 'category': 'REVENUE', 'normal_balance': 'CREDIT', 'parent': '71'},
        {'code': '712', 'name': 'Ventes de biens et services produits', 'name_arabic': 'مبيعات السلع والخدمات المنتجة', 'category': 'REVENUE', 'normal_balance': 'CREDIT', 'parent': '71'},
        {'code': '713', 'name': 'Variation des stocks de produits', 'name_arabic': 'تغيير مخزونات المنتجات', 'category': 'REVENUE', 'normal_balance': 'CREDIT', 'parent': '71'},
        {'code': '714', 'name': 'Immobilisations produites par l\'entreprise pour elle-même', 'name_arabic': 'أصول ثابتة منتجة من طرف المؤسسة لنفسها', 'category': 'REVENUE', 'normal_balance': 'CREDIT', 'parent': '71'},
        {'code': '716', 'name': 'Subventions d\'exploitation', 'name_arabic': 'إعانات الاستغلال', 'category': 'REVENUE', 'normal_balance': 'CREDIT', 'parent': '71'},
        {'code': '718', 'name': 'Autres produits d\'exploitation', 'name_arabic': 'منتجات استغلال أخرى', 'category': 'REVENUE', 'normal_balance': 'CREDIT', 'parent': '71'},
        {'code': '719', 'name': 'Reprises d\'exploitation; transferts de charges', 'name_arabic': 'استردادات الاستغلال؛ تحويلات الأعباء', 'category': 'REVENUE', 'normal_balance': 'CREDIT', 'parent': '71'},
        
        {'code': '73', 'name': 'Produits financiers', 'name_arabic': 'منتجات مالية', 'category': 'REVENUE', 'normal_balance': 'CREDIT', 'parent': '7'},
        {'code': '75', 'name': 'Produits non courants', 'name_arabic': 'منتجات غير جارية', 'category': 'REVENUE', 'normal_balance': 'CREDIT', 'parent': '7'},
    ]
    
    STANDARD_JOURNALS = [
        {'code': 'GEN', 'name': 'Journal Général', 'type': 'GENERAL', 'prefix': 'JG'},
        {'code': 'VTE', 'name': 'Journal des Ventes', 'type': 'SALES', 'prefix': 'JV'},
        {'code': 'ACH', 'name': 'Journal des Achats', 'type': 'PURCHASES', 'prefix': 'JA'},
        {'code': 'CAI', 'name': 'Journal de Caisse', 'type': 'CASH_RECEIPTS', 'prefix': 'JC'},
        {'code': 'BAN', 'name': 'Journal de Banque', 'type': 'BANK', 'prefix': 'JB'},
        {'code': 'OD', 'name': 'Opérations Diverses', 'type': 'ADJUSTING', 'prefix': 'OD'},
    ]
    
    @classmethod
    def create_moroccan_chart_of_accounts(cls, company: Company, user: User):
        """
        Create the standard Moroccan chart of accounts for a company.
        
        Args:
            company: Company to create chart of accounts for
            user: User creating the chart of accounts
        """
        with transaction.atomic():
            # Create account types first
            account_types = {}
            
            for type_data in cls.ACCOUNT_TYPES_TEMPLATE:
                parent = None
                if type_data['parent']:
                    parent = account_types.get(type_data['parent'])
                
                account_type = AccountType.objects.create(
                    company=company,
                    code=type_data['code'],
                    name=type_data['name'],
                    name_arabic=type_data['name_arabic'],
                    category=type_data['category'],
                    normal_balance=type_data['normal_balance'],
                    parent=parent,
                    created_by=user
                )
                account_types[type_data['code']] = account_type
            
            # Create standard journals
            journals = {}
            for journal_data in cls.STANDARD_JOURNALS:
                journal = Journal.objects.create(
                    company=company,
                    code=journal_data['code'],
                    name=journal_data['name'],
                    journal_type=journal_data['type'],
                    sequence_prefix=journal_data['prefix'],
                    created_by=user
                )
                journals[journal_data['code']] = journal
            
            return {
                'account_types_created': len(account_types),
                'journals_created': len(journals),
                'account_types': account_types,
                'journals': journals
            }
    
    @classmethod
    def create_basic_accounts(cls, company: Company, user: User, account_types: dict):
        """
        Create basic accounts for immediate use.
        
        Args:
            company: Company to create accounts for
            user: User creating the accounts
            account_types: Dictionary of created account types
        """
        basic_accounts = [
            # Cash and Bank accounts
            {'code': '5611', 'name': 'Caisse Centrale', 'type_code': '561'},
            {'code': '5411', 'name': 'Banque Principale', 'type_code': '541'},
            
            # Customer and Supplier accounts
            {'code': '3421', 'name': 'Clients', 'type_code': '342'},
            {'code': '4411', 'name': 'Fournisseurs', 'type_code': '441'},
            
            # VAT accounts
            {'code': '34551', 'name': 'TVA Récupérable', 'type_code': '345'},
            {'code': '44551', 'name': 'TVA à Payer', 'type_code': '445'},
            
            # Sales and Purchase accounts
            {'code': '7111', 'name': 'Ventes de Marchandises', 'type_code': '711'},
            {'code': '6111', 'name': 'Achats de Marchandises', 'type_code': '611'},
            
            # Expense accounts
            {'code': '6131', 'name': 'Locations et Charges Locatives', 'type_code': '613'},
            {'code': '6141', 'name': 'Rémunérations du Personnel', 'type_code': '614'},
            {'code': '6161', 'name': 'Impôts et Taxes d\'Exploitation', 'type_code': '616'},
        ]
        
        accounts = {}
        for account_data in basic_accounts:
            account_type = account_types.get(account_data['type_code'])
            if account_type:
                account = Account.objects.create(
                    company=company,
                    code=account_data['code'],
                    name=account_data['name'],
                    account_type=account_type,
                    created_by=user
                )
                accounts[account_data['code']] = account
        
        return accounts

    @classmethod
    def setup_chart_of_accounts(cls, company: Company, user: User):
        """
        Set up complete Moroccan chart of accounts for a company.

        Args:
            company: Company to set up chart of accounts for
            user: User performing the setup

        Returns:
            Dictionary containing created account types and accounts
        """
        with transaction.atomic():
            # Create account types
            account_types = cls.create_account_types(company, user)

            # Create basic accounts
            accounts = cls.create_basic_accounts(company, user, account_types)

            # Create standard journals
            journals = cls.create_standard_journals(company, user)

            return {
                'account_types': account_types,
                'accounts': accounts,
                'journals': journals,
                'message': 'Moroccan chart of accounts setup completed successfully'
            }

    @classmethod
    def create_standard_journals(cls, company: Company, user: User):
        """
        Create standard journals for Moroccan accounting.

        Args:
            company: Company to create journals for
            user: User creating the journals

        Returns:
            Dictionary of created journals
        """
        standard_journals = [
            {
                'code': 'GEN',
                'name': 'Journal Général',
                'name_arabic': 'اليومية العامة',
                'journal_type': 'GENERAL',
                'description': 'Journal pour les écritures générales'
            },
            {
                'code': 'VTE',
                'name': 'Journal des Ventes',
                'name_arabic': 'يومية المبيعات',
                'journal_type': 'SALES',
                'description': 'Journal pour les ventes et factures clients'
            },
            {
                'code': 'ACH',
                'name': 'Journal des Achats',
                'name_arabic': 'يومية المشتريات',
                'journal_type': 'PURCHASES',
                'description': 'Journal pour les achats et factures fournisseurs'
            },
            {
                'code': 'BQ1',
                'name': 'Journal de Banque',
                'name_arabic': 'يومية البنك',
                'journal_type': 'BANK',
                'description': 'Journal pour les opérations bancaires'
            },
            {
                'code': 'CAI',
                'name': 'Journal de Caisse',
                'name_arabic': 'يومية الصندوق',
                'journal_type': 'CASH',
                'description': 'Journal pour les opérations de caisse'
            },
            {
                'code': 'OD',
                'name': 'Journal des Opérations Diverses',
                'name_arabic': 'يومية العمليات المتنوعة',
                'journal_type': 'MISCELLANEOUS',
                'description': 'Journal pour les opérations diverses'
            }
        ]

        journals = {}
        for journal_data in standard_journals:
            journal = Journal.objects.create(
                company=company,
                code=journal_data['code'],
                name=journal_data['name'],
                name_arabic=journal_data.get('name_arabic', ''),
                journal_type=journal_data['journal_type'],
                description=journal_data.get('description', ''),
                sequence_prefix=journal_data['code'],
                created_by=user
            )
            journals[journal_data['code']] = journal

        return journals
