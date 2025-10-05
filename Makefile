.PHONY: help up down restart logs clean build migrate seed test lint format

# Default target
help:
	@echo "Available commands:"
	@echo "  up              - Start all services with docker-compose"
	@echo "  down            - Stop all services"
	@echo "  restart         - Restart all services"
	@echo "  logs            - Show logs from all services"
	@echo "  logs-backend    - Show backend logs only"
	@echo "  logs-frontend   - Show frontend logs only"
	@echo "  build           - Build all Docker images"
	@echo "  clean           - Clean up containers, volumes, and images"
	@echo ""
	@echo "Backend commands:"
	@echo "  migrate         - Run Django migrations"
	@echo "  seed            - Load initial data (tax rates, chart of accounts)"
	@echo "  createsuperuser - Create Django superuser"
	@echo "  shell           - Open Django shell"
	@echo "  test-backend    - Run backend tests"
	@echo "  lint-backend    - Lint backend code"
	@echo "  format-backend  - Format backend code"
	@echo ""
	@echo "Frontend commands:"
	@echo "  install-frontend - Install frontend dependencies"
	@echo "  test-frontend   - Run frontend tests"
	@echo "  lint-frontend   - Lint frontend code"
	@echo "  format-frontend - Format frontend code"
	@echo "  build-frontend  - Build frontend for production"
	@echo ""
	@echo "Database commands:"
	@echo "  reset-db        - Reset database (WARNING: destroys all data)"
	@echo "  backup-db       - Create database backup"
	@echo "  restore-db      - Restore database from backup"

# Docker Compose commands
up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

build:
	docker-compose build

clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

# Backend commands
migrate:
	docker-compose exec backend python manage.py migrate

seed:
	docker-compose exec backend python manage.py loaddata seeds/morocco_tax_rates.json
	docker-compose exec backend python manage.py loaddata seeds/chart_of_accounts_morocco.json

createsuperuser:
	docker-compose exec backend python manage.py createsuperuser

shell:
	docker-compose exec backend python manage.py shell

test-backend:
	docker-compose exec backend python manage.py test

lint-backend:
	docker-compose exec backend flake8 .
	docker-compose exec backend black --check .
	docker-compose exec backend isort --check-only .

format-backend:
	docker-compose exec backend black .
	docker-compose exec backend isort .

# Frontend commands
install-frontend:
	cd frontend && npm install

test-frontend:
	cd frontend && npm run test

lint-frontend:
	cd frontend && npm run lint

format-frontend:
	cd frontend && npm run format

build-frontend:
	cd frontend && npm run build

# Database commands
reset-db:
	@echo "WARNING: This will destroy all data. Are you sure? [y/N]"
	@read -r REPLY; \
	if [ "$$REPLY" = "y" ] || [ "$$REPLY" = "Y" ]; then \
		docker-compose down; \
		docker volume rm erp_postgres_data || true; \
		docker-compose up -d postgres redis minio; \
		sleep 5; \
		make migrate; \
		make seed; \
	fi

backup-db:
	docker-compose exec postgres pg_dump -U erp_user erp_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore-db:
	@echo "Enter backup file name:"
	@read -r BACKUP_FILE; \
	docker-compose exec -T postgres psql -U erp_user -d erp_db < $$BACKUP_FILE

# Development setup
setup:
	@echo "Setting up development environment..."
	cp .env.example .env
	docker-compose up -d postgres redis minio
	@echo "Waiting for services to start..."
	sleep 10
	make migrate
	make seed
	@echo "Setup complete! Run 'make up' to start all services."
