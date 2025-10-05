# 🌊 DigitalOcean Deployment Guide - ERP Marocaine Backend

## 🎯 Overview

This guide will help you deploy your Django ERP backend to DigitalOcean App Platform, which will work perfectly with your existing Netlify frontend.

## ✅ Prerequisites

1. **DigitalOcean Account** - Sign up at [digitalocean.com](https://digitalocean.com)
2. **GitHub Repository** - Your code is already pushed to GitHub
3. **Netlify Frontend** - Already deployed (✅ Done!)

## 🚀 Step-by-Step Deployment

### Step 1: Create DigitalOcean App

1. **Login to DigitalOcean**
   - Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
   - Navigate to "Apps" in the left sidebar

2. **Create New App**
   - Click "Create App"
   - Choose "GitHub" as source
   - Select your `erp_marocaine` repository
   - Choose `master` branch
   - **Important**: DigitalOcean should now detect Python components automatically

3. **Configure App Settings**
   - **App Name**: `erp-marocaine-backend`
   - **Region**: Choose closest to your users (e.g., Frankfurt for Europe)
   - **Source Directory**: Leave as root (/) or set to `backend` if prompted

### Step 2: Configure Environment Variables

In the DigitalOcean App settings, add these environment variables:

#### Required Variables:
```bash
DJANGO_SETTINGS_MODULE=config.settings.digitalocean
SECRET_KEY=your-super-secret-production-key-here-make-it-long-and-random
DEBUG=False
PYTHONPATH=/app
PYTHONUNBUFFERED=1
```

#### CORS Configuration (Update with your actual Netlify URL):
```bash
CORS_ALLOWED_ORIGINS=https://your-actual-frontend.netlify.app
CSRF_TRUSTED_ORIGINS=https://your-actual-frontend.netlify.app
```

#### Email Configuration (Optional):
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@erp.ma
```

#### Monitoring (Optional):
```bash
SENTRY_DSN=your-sentry-dsn-here
```

### Step 3: Add Database

1. **In App Settings**, go to "Database"
2. **Add Database** → **PostgreSQL**
3. **Choose Plan**: Basic ($7/month is sufficient for testing)
4. **Database Name**: `erp-db`

DigitalOcean will automatically provide `DATABASE_URL` environment variable.

### Step 4: Configure Build Settings

DigitalOcean should auto-detect Python, but verify:

- **Build Command**: `pip install -r requirements.txt`
- **Run Command**: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
- **Source Directory**: `backend`

### Step 5: Deploy

1. **Click "Create Resources"**
2. **Wait for deployment** (usually 5-10 minutes)
3. **Monitor build logs** for any issues

## 🔧 Post-Deployment Configuration

### 1. Get Your DigitalOcean URL

After deployment, you'll get a URL like:
`https://erp-marocaine-backend-xxxxx.ondigitalocean.app`

### 2. Update Netlify Frontend

Update your Netlify environment variables:

```bash
VITE_API_URL=https://erp-marocaine-backend-xxxxx.ondigitalocean.app
```

Then redeploy your Netlify frontend.

### 3. Test Your API

```bash
# Health check
curl https://your-app.ondigitalocean.app/api/health/

# Admin access
https://your-app.ondigitalocean.app/admin/
```

### 4. Create Superuser

In DigitalOcean App Console:

```bash
python manage.py createsuperuser
```

## 🔒 Security Checklist

### 1. Update CORS Settings

In your app environment variables, update:

```bash
CORS_ALLOWED_ORIGINS=https://your-actual-netlify-url.netlify.app
CSRF_TRUSTED_ORIGINS=https://your-actual-netlify-url.netlify.app
```

### 2. Generate Strong Secret Key

```python
# Generate a new secret key
import secrets
print(secrets.token_urlsafe(50))
```

### 3. Configure Custom Domain (Optional)

1. **Add your domain** in DigitalOcean App settings
2. **Update DNS** to point to DigitalOcean
3. **Update environment variables** with your custom domain

## 💰 Pricing Estimate

### Basic Setup:
- **App (Basic)**: $5/month
- **PostgreSQL (Basic)**: $7/month
- **Total**: ~$12/month

### With Redis (Optional):
- **Redis (Basic)**: $7/month
- **Total**: ~$19/month

## 🐛 Troubleshooting

### "No components detected" Error

If DigitalOcean shows "No components detected":

1. **Check repository structure**: Ensure you have `requirements.txt` in the root directory
2. **Verify file permissions**: Make sure DigitalOcean has read access to your repository
3. **Try manual configuration**:
   - Set source directory to `backend`
   - Choose "Python" as the environment manually
4. **Alternative**: Use the Dockerfile approach for more control

### Build Fails

**Check build logs** in DigitalOcean dashboard:

1. **Requirements issues**: Verify all packages in requirements.txt are valid
2. **Python version**: DigitalOcean uses Python 3.9+ by default
3. **Missing files**: Ensure all necessary files are in the `backend` directory
4. **Source directory**: Try setting source directory to `backend` if auto-detection fails

### Database Connection Issues

1. **Check DATABASE_URL**: Should be automatically provided by DigitalOcean
2. **Verify database is running**: Check database status in dashboard
3. **Migration issues**: Run migrations manually in console

### CORS Errors

1. **Update CORS_ALLOWED_ORIGINS** with your actual Netlify URL
2. **Check CSRF_TRUSTED_ORIGINS** configuration
3. **Verify frontend is using correct API URL**

### Static Files Not Loading

1. **Check STATIC_ROOT** setting in Django
2. **Verify WhiteNoise** is properly configured
3. **Run collectstatic** manually if needed

## 🔄 Continuous Deployment

DigitalOcean automatically redeploys when you push to your GitHub repository:

1. **Make changes** to your backend code
2. **Commit and push** to GitHub
3. **DigitalOcean automatically rebuilds** and deploys

## 📊 Monitoring

### App Metrics

DigitalOcean provides built-in monitoring:
- **CPU usage**
- **Memory usage**
- **Request metrics**
- **Error rates**

### Logs

Access logs in DigitalOcean dashboard:
- **Build logs**
- **Runtime logs**
- **Error logs**

## 🎉 Success Checklist

✅ **App deployed successfully**
✅ **Database connected**
✅ **Admin interface accessible**
✅ **API endpoints responding**
✅ **Frontend connected to backend**
✅ **CORS configured correctly**
✅ **Static files serving**
✅ **Environment variables set**

## 📞 Support

If you encounter issues:

1. **Check DigitalOcean build logs**
2. **Verify environment variables**
3. **Test API endpoints individually**
4. **Check Django logs for specific errors**

## 🌐 Final Integration

Once deployed:

1. **Backend**: `https://your-app.ondigitalocean.app`
2. **Frontend**: `https://your-frontend.netlify.app`
3. **Admin**: `https://your-app.ondigitalocean.app/admin/`
4. **API Docs**: `https://your-app.ondigitalocean.app/api/schema/swagger-ui/`

Your ERP Marocaine system will be fully operational! 🚀🇲🇦
