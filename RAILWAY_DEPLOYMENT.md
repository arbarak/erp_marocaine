# 🚂 Railway Deployment Guide - ERP Marocaine Backend

## 🎯 Quick Fix for "Error creating build plan with Railpack"

The deployment error you encountered has been fixed by creating proper Railway configuration files and cleaning up the requirements.txt.

## ✅ What Was Fixed

1. **Cleaned requirements.txt** - Removed duplicate packages and invalid dependencies
2. **Created railway.json** - Railway-specific build and deploy configuration
3. **Created Procfile** - Process definitions for web, worker, and beat
4. **Created runtime.txt** - Python version specification
5. **Created railway.py settings** - Railway-optimized Django settings
6. **Created start.sh** - Startup script with database checks

## 🚀 Railway Deployment Steps

### Step 1: Push Changes to GitHub

```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin master
```

### Step 2: Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `erp_marocaine` repository
5. Select the `backend` folder as the root directory

### Step 3: Configure Environment Variables

In Railway dashboard, add these environment variables:

#### Required Variables:
```bash
DJANGO_SETTINGS_MODULE=config.settings.railway
SECRET_KEY=your-super-secret-production-key-here
DEBUG=False
PYTHONPATH=/app
PYTHONUNBUFFERED=1
```

#### CORS and Security:
```bash
CORS_ALLOWED_ORIGINS=https://your-frontend.netlify.app
CSRF_TRUSTED_ORIGINS=https://your-frontend.netlify.app
```

#### Email Configuration (optional):
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@erp.ma
```

#### Monitoring (optional):
```bash
SENTRY_DSN=your-sentry-dsn-here
```

### Step 4: Add Database

1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically provide database environment variables:
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`

### Step 5: Add Redis (for Celery)

1. Click "New" → "Database" → "Redis"
2. Railway will provide `REDIS_URL` automatically

### Step 6: Deploy

1. Railway will automatically detect the configuration and start building
2. The build process will:
   - Install Python dependencies
   - Run database migrations
   - Collect static files
   - Start the Gunicorn server

## 🔧 Configuration Files Explained

### `railway.json`
- Defines build and deployment configuration
- Specifies health check endpoint
- Sets restart policy

### `Procfile`
- Defines different process types (web, worker, beat)
- Railway will run the "web" process by default

### `runtime.txt`
- Specifies Python version (3.11.7)

### `config/settings/railway.py`
- Railway-optimized Django settings
- Automatic database and Redis configuration
- Security settings for production
- CORS configuration for Netlify

### `start.sh`
- Startup script with database connectivity checks
- Runs migrations and collects static files
- Creates default superuser
- Starts Gunicorn with optimized settings

## 🌐 After Deployment

### Get Your Railway URL

1. After successful deployment, Railway will provide a URL like:
   `https://your-app-name.railway.app`

2. Update your Netlify environment variables:
   ```bash
   VITE_API_URL=https://your-app-name.railway.app
   ```

### Test Your API

```bash
# Health check
curl https://your-app-name.railway.app/api/health/

# Admin access
https://your-app-name.railway.app/admin/
# Login: admin / admin123 (change this!)
```

## 🔒 Security Checklist

After deployment:

1. **Change default superuser password**:
   ```bash
   # In Railway console
   python manage.py changepassword admin
   ```

2. **Update CORS origins** with your actual Netlify URL

3. **Set up proper email configuration**

4. **Configure Sentry for error monitoring**

5. **Set up custom domain** (optional)

## 🐛 Troubleshooting

### Build Fails
- Check Railway logs for specific error messages
- Ensure all environment variables are set
- Verify requirements.txt has no syntax errors

### Database Connection Issues
- Ensure PostgreSQL service is running
- Check database environment variables
- Verify network connectivity

### Static Files Not Loading
- Check `STATIC_URL` and `STATIC_ROOT` settings
- Ensure `collectstatic` runs successfully
- Verify WhiteNoise configuration

### CORS Errors
- Update `CORS_ALLOWED_ORIGINS` with your Netlify URL
- Check `CSRF_TRUSTED_ORIGINS` configuration
- Verify frontend is using correct API URL

## 📞 Support

If you encounter issues:

1. Check Railway deployment logs
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Check Django logs for specific errors

## 🎉 Success!

Once deployed successfully:
- Your Django API will be available at `https://your-app.railway.app`
- Admin interface at `https://your-app.railway.app/admin/`
- API documentation at `https://your-app.railway.app/api/schema/swagger-ui/`

Update your Netlify frontend with the Railway URL and you're ready to go! 🚀
