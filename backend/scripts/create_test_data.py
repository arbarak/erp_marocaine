#!/usr/bin/env python
"""
Test Data Creation Script for ERP System
Creates comprehensive sample data for testing all modules.

Usage: python manage.py shell < scripts/create_test_data.py
"""

from decimal import Decimal
from datetime import datetime, timedelta
from django.utils import timezone

from django.contrib.auth import get_user_model
from django.db import transaction
from core.companies.models import Company, CompanySettings
from modules.catalog.models import Category, Product, UnitOfMeasure
from modules.inventory.models import Warehouse, Location, LocationType
from modules.purchasing.models import Supplier, SupplierContact
from modules.sales.models import Customer, CustomerContact

User = get_user_model()

class TestDataCreator:
    """Creates comprehensive test data for the ERP system."""
    
    def __init__(self):
        self.users = {}
        self.companies = {}
        self.categories = {}
        self.products = {}
        self.warehouses = {}
        self.locations = {}
        self.suppliers = {}
        self.customers = {}
        
    def create_users(self):
        """Create test users with different roles."""
        print("🔐 Creating test users...")
        
        users_data = [
            {
                'email': 'admin@erpmaroc.com',
                'first_name': 'Ahmed',
                'last_name': 'Benali',
                'is_staff': True,
                'is_superuser': True,
                'password': 'admin123'
            },
            {
                'email': 'manager@erpmaroc.com',
                'first_name': 'Fatima',
                'last_name': 'Alaoui',
                'is_staff': True,
                'is_superuser': False,
                'password': 'manager123'
            },
            {
                'email': 'accountant@erpmaroc.com',
                'first_name': 'Omar',
                'last_name': 'Tazi',
                'is_staff': False,
                'is_superuser': False,
                'password': 'accountant123'
            },
            {
                'email': 'sales@erpmaroc.com',
                'first_name': 'Aicha',
                'last_name': 'Benjelloun',
                'is_staff': False,
                'is_superuser': False,
                'password': 'sales123'
            },
            {
                'email': 'warehouse@erpmaroc.com',
                'first_name': 'Youssef',
                'last_name': 'Chraibi',
                'is_staff': False,
                'is_superuser': False,
                'password': 'warehouse123'
            }
        ]
        
        for user_data in users_data:
            password = user_data.pop('password')
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults=user_data
            )
            if created:
                user.set_password(password)
                user.save()
                print(f"  ✅ Created user: {user.email}")
            else:
                print(f"  ⚠️ User already exists: {user.email}")
            
            self.users[user_data['email'].split('@')[0]] = user
            
    def create_companies(self):
        """Create test companies."""
        print("🏢 Creating test companies...")
        
        companies_data = [
            {
                'name': 'TechnoMaroc SARL',
                'legal_name': 'TechnoMaroc Société à Responsabilité Limitée',
                'ice': '001234567890123',
                'rc': 'RC123456',
                'if_number': 'IF789012',
                'cnss': 'CNSS345678',
                'address': '123 Avenue Mohammed V',
                'city': 'Casablanca',
                'postal_code': '20000',
                'country': 'MA',
                'phone': '+212522123456',
                'email': 'contact@technomaroc.ma',
                'website': 'https://technomaroc.ma',
                'currency': 'MAD',
                'tax_id': 'TVA123456789'
            },
            {
                'name': 'Atlas Trading SA',
                'legal_name': 'Atlas Trading Société Anonyme',
                'ice': '001234567890124',
                'rc': 'RC123457',
                'if_number': 'IF789013',
                'cnss': 'CNSS345679',
                'address': '456 Boulevard Hassan II',
                'city': 'Rabat',
                'postal_code': '10000',
                'country': 'MA',
                'phone': '+212537123456',
                'email': 'info@atlastrading.ma',
                'website': 'https://atlastrading.ma',
                'currency': 'MAD',
                'tax_id': 'TVA123456790'
            }
        ]
        
        for company_data in companies_data:
            company, created = Company.objects.get_or_create(
                ice=company_data['ice'],
                defaults=company_data
            )
            if created:
                print(f"  ✅ Created company: {company.name}")
                
                # Create company settings
                CompanySettings.objects.get_or_create(
                    company=company,
                    defaults={
                        'default_currency': company_data['currency'],
                        'tax_rate': Decimal('20.00'),  # 20% TVA
                        'fiscal_year_start': 1,  # January
                        'invoice_prefix': 'INV',
                        'quote_prefix': 'QUO',
                        'po_prefix': 'PO'
                    }
                )
            else:
                print(f"  ⚠️ Company already exists: {company.name}")
                
            self.companies[company.name.split()[0].lower()] = company
            
    def create_units_of_measure(self):
        """Create units of measure."""
        print("📏 Creating units of measure...")
        
        units_data = [
            {'name': 'Pièce', 'symbol': 'pc', 'category': 'quantity'},
            {'name': 'Kilogramme', 'symbol': 'kg', 'category': 'weight'},
            {'name': 'Litre', 'symbol': 'L', 'category': 'volume'},
            {'name': 'Mètre', 'symbol': 'm', 'category': 'length'},
            {'name': 'Boîte', 'symbol': 'box', 'category': 'packaging'},
            {'name': 'Carton', 'symbol': 'ctn', 'category': 'packaging'},
            {'name': 'Palette', 'symbol': 'plt', 'category': 'packaging'}
        ]
        
        for unit_data in units_data:
            unit, created = UnitOfMeasure.objects.get_or_create(
                symbol=unit_data['symbol'],
                defaults=unit_data
            )
            if created:
                print(f"  ✅ Created unit: {unit.name} ({unit.symbol})")
                
    def create_categories(self):
        """Create product categories."""
        print("📂 Creating product categories...")
        
        # Get first company for categories
        company = list(self.companies.values())[0]
        
        categories_data = [
            {'name': 'Électronique', 'description': 'Produits électroniques et informatiques'},
            {'name': 'Mobilier', 'description': 'Mobilier de bureau et équipements'},
            {'name': 'Fournitures', 'description': 'Fournitures de bureau et consommables'},
            {'name': 'Services', 'description': 'Services et prestations'},
            {'name': 'Matières Premières', 'description': 'Matières premières et composants'}
        ]
        
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                company=company,
                defaults=cat_data
            )
            if created:
                print(f"  ✅ Created category: {category.name}")
            
            self.categories[cat_data['name'].lower()] = category
            
    def create_products(self):
        """Create sample products."""
        print("📦 Creating sample products...")
        
        # Get first company and units
        company = list(self.companies.values())[0]
        unit_pc = UnitOfMeasure.objects.get(symbol='pc')
        unit_kg = UnitOfMeasure.objects.get(symbol='kg')
        unit_box = UnitOfMeasure.objects.get(symbol='box')
        
        products_data = [
            {
                'name': 'Ordinateur Portable HP EliteBook',
                'sku': 'HP-ELITE-001',
                'description': 'Ordinateur portable professionnel HP EliteBook 15"',
                'category': self.categories['électronique'],
                'unit_of_measure': unit_pc,
                'cost_price': Decimal('8500.00'),
                'sale_price': Decimal('12000.00'),
                'weight': Decimal('2.5'),
                'is_active': True,
                'track_inventory': True
            },
            {
                'name': 'Bureau Exécutif en Bois',
                'sku': 'DESK-EXEC-001',
                'description': 'Bureau exécutif en bois massif avec tiroirs',
                'category': self.categories['mobilier'],
                'unit_of_measure': unit_pc,
                'cost_price': Decimal('3500.00'),
                'sale_price': Decimal('5200.00'),
                'weight': Decimal('45.0'),
                'is_active': True,
                'track_inventory': True
            },
            {
                'name': 'Papier A4 80g',
                'sku': 'PAPER-A4-80',
                'description': 'Ramette papier A4 80g/m² - 500 feuilles',
                'category': self.categories['fournitures'],
                'unit_of_measure': unit_box,
                'cost_price': Decimal('35.00'),
                'sale_price': Decimal('50.00'),
                'weight': Decimal('2.5'),
                'is_active': True,
                'track_inventory': True
            },
            {
                'name': 'Service Installation Réseau',
                'sku': 'SRV-NET-INST',
                'description': 'Service d\'installation et configuration réseau',
                'category': self.categories['services'],
                'unit_of_measure': unit_pc,
                'cost_price': Decimal('800.00'),
                'sale_price': Decimal('1200.00'),
                'weight': Decimal('0.0'),
                'is_active': True,
                'track_inventory': False
            },
            {
                'name': 'Câble Ethernet Cat6',
                'sku': 'CABLE-ETH-CAT6',
                'description': 'Câble Ethernet Cat6 - Rouleau 100m',
                'category': self.categories['matières premières'],
                'unit_of_measure': unit_kg,
                'cost_price': Decimal('450.00'),
                'sale_price': Decimal('650.00'),
                'weight': Decimal('8.5'),
                'is_active': True,
                'track_inventory': True
            }
        ]
        
        for prod_data in products_data:
            prod_data['company'] = company
            product, created = Product.objects.get_or_create(
                sku=prod_data['sku'],
                company=company,
                defaults=prod_data
            )
            if created:
                print(f"  ✅ Created product: {product.name} ({product.sku})")
            
            self.products[prod_data['sku']] = product

    def create_warehouses_and_locations(self):
        """Create warehouses and storage locations."""
        print("🏭 Creating warehouses and locations...")

        # Get first company
        company = list(self.companies.values())[0]

        # Create location types
        location_types_data = [
            {'name': 'Zone de Stockage', 'code': 'STOCK'},
            {'name': 'Zone de Réception', 'code': 'RECV'},
            {'name': 'Zone d\'Expédition', 'code': 'SHIP'},
            {'name': 'Zone de Contrôle Qualité', 'code': 'QC'}
        ]

        location_types = {}
        for lt_data in location_types_data:
            lt, created = LocationType.objects.get_or_create(
                code=lt_data['code'],
                company=company,
                defaults=lt_data
            )
            if created:
                print(f"  ✅ Created location type: {lt.name}")
            location_types[lt_data['code']] = lt

        # Create warehouses
        warehouses_data = [
            {
                'name': 'Entrepôt Principal Casablanca',
                'code': 'WH-CASA-01',
                'address': '123 Zone Industrielle Ain Sebaa',
                'city': 'Casablanca',
                'postal_code': '20250',
                'country': 'MA',
                'is_active': True
            },
            {
                'name': 'Entrepôt Rabat',
                'code': 'WH-RABAT-01',
                'address': '456 Zone Industrielle Salé',
                'city': 'Rabat',
                'postal_code': '11000',
                'country': 'MA',
                'is_active': True
            }
        ]

        for wh_data in warehouses_data:
            wh_data['company'] = company
            warehouse, created = Warehouse.objects.get_or_create(
                code=wh_data['code'],
                company=company,
                defaults=wh_data
            )
            if created:
                print(f"  ✅ Created warehouse: {warehouse.name}")

            self.warehouses[wh_data['code']] = warehouse

            # Create locations for each warehouse
            locations_data = [
                {'name': f'A-01-01', 'location_type': location_types['STOCK']},
                {'name': f'A-01-02', 'location_type': location_types['STOCK']},
                {'name': f'A-02-01', 'location_type': location_types['STOCK']},
                {'name': f'B-01-01', 'location_type': location_types['STOCK']},
                {'name': f'RECV-01', 'location_type': location_types['RECV']},
                {'name': f'SHIP-01', 'location_type': location_types['SHIP']},
                {'name': f'QC-01', 'location_type': location_types['QC']}
            ]

            for loc_data in locations_data:
                loc_data.update({
                    'warehouse': warehouse,
                    'company': company,
                    'is_active': True
                })
                location, created = Location.objects.get_or_create(
                    name=loc_data['name'],
                    warehouse=warehouse,
                    defaults=loc_data
                )
                if created:
                    print(f"    ✅ Created location: {warehouse.code}/{location.name}")

                self.locations[f"{wh_data['code']}/{loc_data['name']}"] = location

    def create_suppliers(self):
        """Create sample suppliers."""
        print("🚚 Creating suppliers...")

        # Get first company
        company = list(self.companies.values())[0]

        suppliers_data = [
            {
                'name': 'TechDistrib Maroc',
                'supplier_code': 'TECH-001',
                'email': 'contact@techdistrib.ma',
                'phone': '+212522334455',
                'address': '789 Boulevard Zerktouni',
                'city': 'Casablanca',
                'postal_code': '20100',
                'country': 'MA',
                'tax_id': 'TVA987654321',
                'payment_terms': 30,
                'is_active': True
            },
            {
                'name': 'Mobilier Pro SARL',
                'supplier_code': 'MOB-001',
                'email': 'ventes@mobilierpro.ma',
                'phone': '+212537445566',
                'address': '321 Avenue Allal Ben Abdellah',
                'city': 'Rabat',
                'postal_code': '10090',
                'country': 'MA',
                'tax_id': 'TVA987654322',
                'payment_terms': 45,
                'is_active': True
            },
            {
                'name': 'Papeterie Atlas',
                'supplier_code': 'PAP-001',
                'email': 'commandes@papeterieatlas.ma',
                'phone': '+212522556677',
                'address': '654 Rue Ibn Batouta',
                'city': 'Casablanca',
                'postal_code': '20300',
                'country': 'MA',
                'tax_id': 'TVA987654323',
                'payment_terms': 15,
                'is_active': True
            }
        ]

        for sup_data in suppliers_data:
            sup_data['company'] = company
            supplier, created = Supplier.objects.get_or_create(
                supplier_code=sup_data['supplier_code'],
                company=company,
                defaults=sup_data
            )
            if created:
                print(f"  ✅ Created supplier: {supplier.name}")

                # Create supplier contacts
                contacts_data = [
                    {
                        'first_name': 'Mohammed',
                        'last_name': 'Alami',
                        'email': f'mohammed@{supplier.email.split("@")[1]}',
                        'phone': supplier.phone,
                        'position': 'Responsable Commercial',
                        'is_primary': True
                    },
                    {
                        'first_name': 'Khadija',
                        'last_name': 'Benali',
                        'email': f'khadija@{supplier.email.split("@")[1]}',
                        'phone': '+212661123456',
                        'position': 'Assistante Commerciale',
                        'is_primary': False
                    }
                ]

                for contact_data in contacts_data:
                    contact_data.update({
                        'supplier': supplier,
                        'company': company
                    })
                    contact, created = SupplierContact.objects.get_or_create(
                        email=contact_data['email'],
                        supplier=supplier,
                        defaults=contact_data
                    )
                    if created:
                        print(f"    ✅ Created contact: {contact.first_name} {contact.last_name}")

            self.suppliers[sup_data['supplier_code']] = supplier

    def create_customers(self):
        """Create sample customers."""
        print("👥 Creating customers...")

        # Get first company
        company = list(self.companies.values())[0]

        customers_data = [
            {
                'name': 'Société Générale Maroc',
                'customer_code': 'SGMA-001',
                'email': 'achats@sgmaroc.com',
                'phone': '+212522778899',
                'address': '55 Boulevard Mohammed V',
                'city': 'Casablanca',
                'postal_code': '20000',
                'country': 'MA',
                'tax_id': 'TVA123987456',
                'payment_terms': 30,
                'credit_limit': Decimal('500000.00'),
                'is_active': True
            },
            {
                'name': 'Ministère de l\'Éducation',
                'customer_code': 'MEN-001',
                'email': 'equipement@men.gov.ma',
                'phone': '+212537889900',
                'address': 'Avenue Ibn Sina, Agdal',
                'city': 'Rabat',
                'postal_code': '10000',
                'country': 'MA',
                'tax_id': 'TVA123987457',
                'payment_terms': 60,
                'credit_limit': Decimal('1000000.00'),
                'is_active': True
            },
            {
                'name': 'StartUp Tech Casablanca',
                'customer_code': 'STC-001',
                'email': 'admin@startuptech.ma',
                'phone': '+212661445566',
                'address': '123 Technopark Casablanca',
                'city': 'Casablanca',
                'postal_code': '20150',
                'country': 'MA',
                'tax_id': 'TVA123987458',
                'payment_terms': 15,
                'credit_limit': Decimal('100000.00'),
                'is_active': True
            }
        ]

        for cust_data in customers_data:
            cust_data['company'] = company
            customer, created = Customer.objects.get_or_create(
                customer_code=cust_data['customer_code'],
                company=company,
                defaults=cust_data
            )
            if created:
                print(f"  ✅ Created customer: {customer.name}")

                # Create customer contacts
                contacts_data = [
                    {
                        'first_name': 'Rachid',
                        'last_name': 'Bennani',
                        'email': f'rachid@{customer.email.split("@")[1]}',
                        'phone': customer.phone,
                        'position': 'Responsable Achats',
                        'is_primary': True
                    },
                    {
                        'first_name': 'Samira',
                        'last_name': 'Tazi',
                        'email': f'samira@{customer.email.split("@")[1]}',
                        'phone': '+212661789012',
                        'position': 'Assistante Achats',
                        'is_primary': False
                    }
                ]

                for contact_data in contacts_data:
                    contact_data.update({
                        'customer': customer,
                        'company': company
                    })
                    contact, created = CustomerContact.objects.get_or_create(
                        email=contact_data['email'],
                        customer=customer,
                        defaults=contact_data
                    )
                    if created:
                        print(f"    ✅ Created contact: {contact.first_name} {contact.last_name}")

            self.customers[cust_data['customer_code']] = customer

    def run_all(self):
        """Run all test data creation methods."""
        print("🚀 Starting ERP Test Data Creation")
        print("=" * 60)

        try:
            with transaction.atomic():
                self.create_users()
                self.create_companies()
                self.create_units_of_measure()
                self.create_categories()
                self.create_products()
                self.create_warehouses_and_locations()
                self.create_suppliers()
                self.create_customers()

                print("")
                print("✅ Test data creation completed successfully!")
                print("=" * 60)
                print("")
                print("📊 SUMMARY:")
                print(f"  👤 Users: {len(self.users)}")
                print(f"  🏢 Companies: {len(self.companies)}")
                print(f"  📂 Categories: {len(self.categories)}")
                print(f"  📦 Products: {len(self.products)}")
                print(f"  🏭 Warehouses: {len(self.warehouses)}")
                print(f"  📍 Locations: {len(self.locations)}")
                print(f"  🚚 Suppliers: {len(self.suppliers)}")
                print(f"  👥 Customers: {len(self.customers)}")
                print("")
                print("🔐 LOGIN CREDENTIALS:")
                print("  Admin: admin@erpmaroc.com / admin123")
                print("  Manager: manager@erpmaroc.com / manager123")
                print("  Accountant: accountant@erpmaroc.com / accountant123")
                print("  Sales: sales@erpmaroc.com / sales123")
                print("  Warehouse: warehouse@erpmaroc.com / warehouse123")
                print("")
                print("🎯 Ready for testing!")

        except Exception as e:
            print(f"❌ Error creating test data: {e}")
            import traceback
            traceback.print_exc()
            raise


# Execute the test data creation
print("🚀 Executing ERP Test Data Creation...")
creator = TestDataCreator()
creator.run_all()
