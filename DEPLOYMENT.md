# 🚀 Guide de Déploiement - ERP Marocaine

Ce guide détaille le processus de déploiement de l'application ERP Marocaine sur Netlify (frontend) et les options pour le backend Django.

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Déploiement Frontend (Netlify)](#déploiement-frontend-netlify)
4. [Déploiement Backend (Django)](#déploiement-backend-django)
5. [Configuration des Variables d'Environnement](#configuration-des-variables-denvironnement)
6. [Tests de Déploiement](#tests-de-déploiement)
7. [Dépannage](#dépannage)

## 🎯 Vue d'ensemble

L'architecture de déploiement sépare le frontend et le backend :

- **Frontend (React/Vite)** : Déployé sur Netlify comme site statique
- **Backend (Django)** : Déployé sur un service cloud (Heroku, Railway, DigitalOcean, etc.)
- **Base de données** : PostgreSQL hébergée (Heroku Postgres, Supabase, etc.)
- **Stockage de fichiers** : AWS S3 ou service compatible

## ✅ Prérequis

### Comptes requis :
- [ ] Compte GitHub (pour le code source)
- [ ] Compte Netlify (pour le frontend)
- [ ] Compte Heroku/Railway/DigitalOcean (pour le backend)
- [ ] Service de base de données PostgreSQL

### Outils locaux :
- [ ] Node.js 18+ et npm
- [ ] Python 3.11+ et pip
- [ ] Git

## 🌐 Déploiement Frontend (Netlify)

### Étape 1 : Préparation du Repository

1. **Assurez-vous que le code est poussé sur GitHub :**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin master
   ```

### Étape 2 : Configuration Netlify

1. **Connectez-vous à Netlify** : https://app.netlify.com
2. **Créez un nouveau site** : "New site from Git"
3. **Connectez GitHub** et sélectionnez le repository `erp_marocaine`
4. **Configurez les paramètres de build** :
   - **Branch to deploy** : `master`
   - **Build command** : `cd frontend && npm ci && npm run build`
   - **Publish directory** : `frontend/dist`

### Étape 3 : Variables d'Environnement Netlify

Dans les paramètres Netlify (Site settings > Environment variables), ajoutez :

```bash
# API Configuration
VITE_API_URL=https://your-backend-api.herokuapp.com
VITE_API_VERSION=v1

# Application Configuration
VITE_APP_NAME=ERP Marocaine
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
VITE_ENABLE_DEVTOOLS=false

# Build Configuration
NODE_VERSION=18
NPM_VERSION=9
NODE_ENV=production
```

### Étape 4 : Configuration du Domaine (Optionnel)

1. **Domaine personnalisé** : Site settings > Domain management
2. **HTTPS** : Automatiquement configuré par Netlify
3. **Redirections** : Déjà configurées dans `netlify.toml`

## 🖥️ Déploiement Backend (Django)

### Option A : Heroku

1. **Créez une application Heroku :**
   ```bash
   heroku create your-erp-backend
   ```

2. **Ajoutez les add-ons :**
   ```bash
   heroku addons:create heroku-postgresql:mini
   heroku addons:create heroku-redis:mini
   ```

3. **Configurez les variables d'environnement :**
   ```bash
   heroku config:set DEBUG=False
   heroku config:set SECRET_KEY=your-production-secret-key
   heroku config:set DJANGO_SETTINGS_MODULE=config.settings.prod
   heroku config:set ALLOWED_HOSTS=your-erp-backend.herokuapp.com,your-frontend.netlify.app
   heroku config:set CORS_ALLOWED_ORIGINS=https://your-frontend.netlify.app
   heroku config:set CSRF_TRUSTED_ORIGINS=https://your-frontend.netlify.app
   ```

4. **Déployez :**
   ```bash
   git subtree push --prefix=backend heroku master
   ```

### Option B : Railway

1. **Connectez votre repository à Railway**
2. **Configurez les variables d'environnement** (voir section dédiée)
3. **Railway détecte automatiquement Django** et configure le déploiement

### Option C : DigitalOcean App Platform

1. **Créez une nouvelle app** sur DigitalOcean
2. **Connectez votre repository GitHub**
3. **Configurez le service** :
   - **Source Directory** : `/backend`
   - **Build Command** : `pip install -r requirements.txt`
   - **Run Command** : `gunicorn config.wsgi:application`

## ⚙️ Configuration des Variables d'Environnement

### Variables Backend (Production)

```bash
# Django Core
DEBUG=False
SECRET_KEY=your-super-secret-production-key-here
DJANGO_SETTINGS_MODULE=config.settings.prod
ALLOWED_HOSTS=your-backend-domain.com,your-frontend.netlify.app

# Database (fournie par le service cloud)
DATABASE_URL=postgresql://user:password@host:port/database

# Redis (fournie par le service cloud)
REDIS_URL=redis://user:password@host:port

# Security
CORS_ALLOWED_ORIGINS=https://your-frontend.netlify.app
CSRF_TRUSTED_ORIGINS=https://your-frontend.netlify.app

# Email (configurez selon votre fournisseur)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@domain.com
EMAIL_HOST_PASSWORD=your-email-password

# Storage (AWS S3 ou compatible)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=eu-west-1

# Monitoring (optionnel)
SENTRY_DSN=your-sentry-dsn
```

### Variables Frontend (Netlify)

```bash
# API Configuration
VITE_API_URL=https://your-backend-api.herokuapp.com

# Application
VITE_APP_ENV=production
VITE_ENABLE_DEBUG=false
VITE_ENABLE_DEVTOOLS=false

# Build
NODE_ENV=production
NODE_VERSION=18
```

## 🧪 Tests de Déploiement

### Test Local de Production

1. **Testez le build de production localement :**
   ```bash
   cd frontend
   npm run build:prod
   npm run preview:prod
   ```

2. **Vérifiez que l'application fonctionne** sur http://localhost:4173

### Test de l'API

1. **Vérifiez les endpoints de santé :**
   ```bash
   curl https://your-backend-api.herokuapp.com/api/health/
   curl https://your-backend-api.herokuapp.com/api/readiness/
   ```

2. **Testez l'authentification :**
   ```bash
   curl -X POST https://your-backend-api.herokuapp.com/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"username": "test", "password": "test"}'
   ```

### Test Frontend

1. **Vérifiez le déploiement Netlify**
2. **Testez les routes principales** :
   - Page d'accueil
   - Connexion
   - Tableau de bord
   - Modules principaux

3. **Vérifiez la console du navigateur** pour les erreurs

## 🔧 Dépannage

### Problèmes Courants

#### Build Netlify échoue

```bash
# Vérifiez les logs de build dans Netlify
# Solutions communes :
- Vérifiez que Node.js version est 18+
- Assurez-vous que toutes les dépendances sont dans package.json
- Vérifiez les variables d'environnement
```

#### Erreurs CORS

```python
# Dans backend/config/settings/prod.py
CORS_ALLOWED_ORIGINS = [
    'https://your-frontend.netlify.app',
]

CSRF_TRUSTED_ORIGINS = [
    'https://your-frontend.netlify.app',
]
```

#### Erreurs de Base de Données

```bash
# Vérifiez la variable DATABASE_URL
# Exécutez les migrations :
heroku run python manage.py migrate
```

#### Erreurs de Fichiers Statiques

```python
# Configurez AWS S3 dans settings/prod.py
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
STATICFILES_STORAGE = 'storages.backends.s3boto3.StaticS3Boto3Storage'
```

### Logs et Monitoring

1. **Logs Netlify** : Site overview > Functions > View logs
2. **Logs Heroku** : `heroku logs --tail`
3. **Monitoring** : Configurez Sentry pour le monitoring d'erreurs

## 📞 Support

Pour toute question ou problème de déploiement :

1. Vérifiez les logs d'erreur
2. Consultez la documentation officielle :
   - [Netlify Docs](https://docs.netlify.com/)
   - [Heroku Docs](https://devcenter.heroku.com/)
   - [Django Deployment](https://docs.djangoproject.com/en/5.0/howto/deployment/)

## ✅ Checklist de Déploiement

- [ ] Code poussé sur GitHub
- [ ] Variables d'environnement configurées
- [ ] Build local testé
- [ ] Site Netlify créé et configuré
- [ ] Backend déployé et accessible
- [ ] Base de données migrée
- [ ] Tests de bout en bout réussis
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] Monitoring configuré (optionnel)

---

🎉 **Félicitations !** Votre application ERP Marocaine est maintenant déployée et accessible en production !
