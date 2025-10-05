# ERP Marocaine - Système ERP Complet

Un système ERP moderne et complet conçu spécifiquement pour les entreprises marocaines, avec conformité aux réglementations locales et interface utilisateur professionnelle.

## 🚀 Fonctionnalités Principales

### 📦 Gestion des Stocks
- Suivi en temps réel des niveaux de stock
- Gestion des mouvements de stock avec historique complet
- Alertes de stock minimum et maximum
- Valorisation des stocks (FIFO, LIFO, Coût moyen)
- Gestion multi-entrepôts

### 💰 Facturation et Ventes
- Création de devis, commandes et factures
- Gestion des paiements et échéances
- Conformité TVA marocaine (0%, 7%, 10%, 14%, 20%)
- Génération automatique de documents PDF
- Envoi par email avec templates personnalisés

### 🏢 Gestion Commerciale
- Gestion complète des clients et fournisseurs
- Suivi des commandes d'achat et de vente
- Historique des transactions et communications
- Rapports de vente et d'achat détaillés

### 📊 Comptabilité
- Plan comptable marocain (PCGM) intégré
- Écritures comptables automatiques
- Grand livre et balance générale
- Rapports financiers et déclarations TVA

### 📈 Analytics & Reporting
- Tableaux de bord interactifs en temps réel
- Analyses des ventes et achats
- Indicateurs de performance (KPI)
- Rapports personnalisables et exportables

## 🛠️ Technologies Utilisées

### Backend
- **Django 5.0.1** - Framework web Python robuste
- **Django REST Framework** - API REST complète
- **PostgreSQL** - Base de données relationnelle
- **Redis** - Cache et gestion des sessions
- **Celery** - Tâches asynchrones

### Frontend
- **React 19** - Interface utilisateur moderne
- **TypeScript** - Typage statique pour la fiabilité
- **Tailwind CSS** - Framework CSS utilitaire
- **Vite** - Build tool rapide et moderne
- **React Router** - Navigation côté client
- **Shadcn/ui** - Composants UI professionnels

### DevOps
- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration locale
- **Kubernetes** - Déploiement production
- **Nginx** - Serveur web et proxy inverse

## 🚀 Installation et Démarrage

### Prérequis
- Docker et Docker Compose
- Node.js 18+ (pour le développement frontend)
- Python 3.11+ (pour le développement backend)

### Démarrage Rapide avec Docker

```bash
# Cloner le repository
git clone https://github.com/arbarak/erp_marocaine.git
cd erp_marocaine

# Démarrer tous les services
docker-compose up -d

# Créer un superutilisateur
docker-compose exec backend python manage.py createsuperuser

# Accéder à l'application
# Frontend: http://localhost:3003
# Backend API: http://localhost:8000
# Admin Django: http://localhost:8000/admin
```

### Développement Local

#### Backend
```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configurer la base de données
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Démarrer le serveur
python manage.py runserver
```

#### Frontend
```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## 🌐 Déploiement

### Déploiement Rapide sur Netlify

Le projet est configuré pour un déploiement facile sur Netlify :

1. **Fork le repository** sur GitHub
2. **Connectez Netlify** à votre repository GitHub
3. **Configurez les paramètres de build** :
   - Build command: `cd frontend && npm ci && npm run build`
   - Publish directory: `frontend/dist`
4. **Ajoutez les variables d'environnement** dans Netlify :
   ```bash
   VITE_API_URL=https://your-backend-api.herokuapp.com
   VITE_APP_ENV=production
   NODE_ENV=production
   ```

### Déploiement Backend

Le backend Django peut être déployé sur :
- **Heroku** (recommandé pour débuter)
- **Railway** (moderne et simple)
- **DigitalOcean App Platform**
- **AWS/GCP/Azure**

### Variables d'Environnement

Copiez et configurez les fichiers d'environnement :
- `.env.example` → `.env` (backend)
- `frontend/.env.example` → `frontend/.env` (frontend)

📖 **Consultez le [Guide de Déploiement Complet](./DEPLOYMENT.md) pour les instructions détaillées.**

## 📁 Structure du Projet

```
erp_marocaine/
├── backend/                 # API Django
│   ├── apps/               # Applications Django
│   │   ├── accounting/     # Comptabilité
│   │   ├── analytics/      # Analytics
│   │   ├── inventory/      # Gestion des stocks
│   │   ├── invoicing/      # Facturation
│   │   ├── purchasing/     # Achats
│   │   └── sales/          # Ventes
│   ├── config/             # Configuration Django
│   └── core/               # Utilitaires communs
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   └── utils/          # Utilitaires
├── docs/                   # Documentation
├── k8s/                    # Manifestes Kubernetes
└── ops/                    # Scripts DevOps
```

## 🇲🇦 Conformité Marocaine

### Réglementations Supportées
- **TVA** : Taux conformes (0%, 7%, 10%, 14%, 20%)
- **Plan Comptable** : PCGM (Plan Comptable Général Marocain)
- **Identifiants** : ICE, IF, RC, Patente, CNSS
- **Devises** : MAD (Dirham Marocain) par défaut

### Documents Légaux
- Factures conformes aux exigences marocaines
- Bons de livraison et de réception
- États de rapprochement bancaire
- Déclarations TVA

## 🔧 Configuration

### Variables d'Environnement

Créer un fichier `.env` dans le répertoire `backend/` :

```env
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/erp_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## 📊 Fonctionnalités Avancées

### Interface Utilisateur Moderne
- Design responsive et professionnel
- Notifications toast élégantes
- Navigation intuitive
- Thème sombre/clair
- Support multi-langues (Français, Arabe, Anglais)

### Gestion Multi-Entrepôts
- Support de plusieurs entrepôts
- Transferts inter-entrepôts
- Suivi des stocks par emplacement

### Automatisation
- Génération automatique des écritures comptables
- Calculs TVA automatiques
- Alertes et notifications en temps réel
- Workflows automatisés

### Rapports et Analytics
- Tableaux de bord personnalisables
- Analyses des tendances de vente
- Rapports de rentabilité
- Prévisions de stock
- Export PDF/Excel

### API REST Complète
- Endpoints pour toutes les fonctionnalités
- Documentation Swagger/OpenAPI
- Authentification JWT
- Permissions granulaires

## 🧪 Tests

```bash
# Tests backend
cd backend
python manage.py test

# Tests frontend
cd frontend
npm run test
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou support :
- Issues GitHub : [Issues](https://github.com/arbarak/erp_marocaine/issues)
- Documentation : [Wiki](https://github.com/arbarak/erp_marocaine/wiki)

## 🙏 Remerciements

- Équipe de développement
- Communauté open source
- Contributeurs du projet

---

**ERP Marocaine** - Solution ERP moderne pour les entreprises marocaines 🇲🇦
