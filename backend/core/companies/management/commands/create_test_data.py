from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model
from decimal import Decimal

from core.companies.models import Company, CompanySettings
from modules.catalog.models import Category, Product, UnitOfMeasure
from modules.inventory.models import Warehouse, Location, LocationType
from modules.purchasing.models import Supplier
from modules.sales.models import Customer

User = get_user_model()


class Command(BaseCommand):
    help = 'Create test data for ERP system'

    def handle(self, *args, **options):
        self.stdout.write('Creating ERP Test Data...')
        
        with transaction.atomic():
            # Create admin user
            admin_user, created = User.objects.get_or_create(
                email='admin@erpmaroc.com',
                defaults={
                    'first_name': 'Ahmed',
                    'last_name': 'Admin',
                    'is_staff': True,
                    'is_superuser': True
                }
            )
            if created:
                admin_user.set_password('admin123')
                admin_user.save()
                self.stdout.write(f"✅ Created admin user: {admin_user.email}")
            else:
                self.stdout.write(f"⚠️ Admin user already exists: {admin_user.email}")
            
            # Create test company
            company, created = Company.objects.get_or_create(
                ice='001234567890123',
                defaults={
                    'name': 'TechnoMaroc SARL',
                    'legal_name': 'TechnoMaroc Societe a Responsabilite Limitee',
                    'rc': 'RC123456',
                    'if_number': '12345678',
                    'address_line1': '123 Avenue Mohammed V',
                    'city': 'Casablanca',
                    'postal_code': '20000',
                    'country': 'Maroc',
                    'phone': '+212522123456',
                    'email': 'contact@technomaroc.ma',
                    'currency': 'MAD'
                }
            )
            if created:
                self.stdout.write(f"✅ Created company: {company.name}")
                
                # Create company settings
                CompanySettings.objects.get_or_create(
                    company=company,
                    defaults={
                        'invoice_prefix': 'INV',
                        'quote_prefix': 'QUO',
                        'po_prefix': 'PO',
                        'so_prefix': 'SO',
                        'default_payment_terms': 30,
                        'default_quote_validity': 30,
                        'default_costing_method': 'FIFO'
                    }
                )
            else:
                self.stdout.write(f"⚠️ Company already exists: {company.name}")
            
            # Create units of measure
            unit_pc, created = UnitOfMeasure.objects.get_or_create(
                symbol='pc',
                company=company,
                defaults={'name': 'Piece', 'type': 'UNIT'}
            )
            if created:
                self.stdout.write(f"✅ Created unit: {unit_pc.name}")
            
            # Create category
            category, created = Category.objects.get_or_create(
                name='Electronics',
                company=company,
                defaults={'description': 'Electronic products'}
            )
            if created:
                self.stdout.write(f"✅ Created category: {category.name}")
            
            # Create product
            product, created = Product.objects.get_or_create(
                internal_reference='LAPTOP-001',
                company=company,
                defaults={
                    'name': 'Laptop HP EliteBook',
                    'description': 'Professional laptop HP EliteBook 15 inch',
                    'category': category,
                    'uom': unit_pc,
                    'cost_price': Decimal('8500.00'),
                    'list_price': Decimal('12000.00'),
                    'is_active': True,
                    'track_inventory': True,
                    'product_type': 'PRODUCT'
                }
            )
            if created:
                self.stdout.write(f"✅ Created product: {product.name}")
            
            # Create location type
            location_type, created = LocationType.objects.get_or_create(
                code='STOCK',
                company=company,
                defaults={'name': 'Storage Zone'}
            )
            if created:
                self.stdout.write(f"✅ Created location type: {location_type.name}")
            
            # Create warehouse
            warehouse, created = Warehouse.objects.get_or_create(
                code='WH-CASA-01',
                company=company,
                defaults={
                    'name': 'Main Warehouse Casablanca',
                    'address_line1': '123 Industrial Zone Ain Sebaa',
                    'city': 'Casablanca',
                    'postal_code': '20250',
                    'country': 'Maroc',
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f"✅ Created warehouse: {warehouse.name}")
            
            # Create location
            location, created = Location.objects.get_or_create(
                name='A-01-01',
                warehouse=warehouse,
                defaults={
                    'location_type': location_type,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f"✅ Created location: {location.name}")
            
            # Create supplier
            supplier, created = Supplier.objects.get_or_create(
                supplier_code='TECH-001',
                company=company,
                defaults={
                    'name': 'TechDistrib Maroc',
                    'email': 'contact@techdistrib.ma',
                    'phone': '+212522334455',
                    'address_line1': '789 Boulevard Zerktouni',
                    'city': 'Casablanca',
                    'postal_code': '20100',
                    'country': 'Maroc',
                    'payment_terms': 30,
                    'is_active': True,
                    'created_by': admin_user
                }
            )
            if created:
                self.stdout.write(f"✅ Created supplier: {supplier.name}")
            
            # Create customer
            customer, created = Customer.objects.get_or_create(
                customer_code='SGMA-001',
                company=company,
                defaults={
                    'name': 'Societe Generale Maroc',
                    'email': 'achats@sgmaroc.com',
                    'phone': '+212522778899',
                    'address_line1': '55 Boulevard Mohammed V',
                    'city': 'Casablanca',
                    'postal_code': '20000',
                    'country': 'Maroc',
                    'payment_terms': 30,
                    'credit_limit': Decimal('500000.00'),
                    'is_active': True,
                    'created_by': admin_user
                }
            )
            if created:
                self.stdout.write(f"✅ Created customer: {customer.name}")
            
            self.stdout.write("")
            self.stdout.write(self.style.SUCCESS("✅ Test data creation completed successfully!"))
            self.stdout.write("")
            self.stdout.write("🔐 LOGIN CREDENTIALS:")
            self.stdout.write("  Admin: admin@erpmaroc.com / admin123")
            self.stdout.write("")
            self.stdout.write("🎯 Ready for testing!")
