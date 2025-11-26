# AICOO - Production Deployment Guide

## 🚀 Shopify Embedded App - Railway Deployment

This guide provides the exact steps to deploy AICOO as a production-ready Shopify embedded app on Railway.

---

## ✅ What's Been Fixed

### Backend
- ✅ Shopify API v10 integration with proper OAuth flow
- ✅ Session management using MemorySessionStorage
- ✅ Webhook processing via `shopify.processWebhooks()`
- ✅ Static file serving for production frontend
- ✅ Health endpoint at `/health`
- ✅ Test endpoint at `/api/test`
- ✅ PORT configuration for Railway (`process.env.PORT || 8080`)
- ✅ Production build system in railway.json

### Frontend
- ✅ Shopify App Bridge v3.7.0 integration
- ✅ Shopify Polaris UI framework v12.0.0
- ✅ React 18.2.0 (compatible with Shopify libraries)
- ✅ Production build configuration in vite.config.js
- ✅ ShopifyProvider wrapper for embedded app functionality
- ✅ Environment variable support for API keys

### Configuration
- ✅ Railway.json with full-stack build process
- ✅ Procfile for Heroku-style deployment
- ✅ Updated .env.example with SCOPES and HOST variables
- ✅ CORS configured for Shopify iframe embedding

---

## 📋 Prerequisites

1. **Shopify Partner Account**
   - Go to https://partners.shopify.com
   - Create a new app in your Partner Dashboard
   - Note down your API Key and API Secret

2. **Railway Account**
   - Sign up at https://railway.app
   - Connect your GitHub account

3. **Development Store** (optional for testing)
   - Create a development store in your Partner Dashboard

---

## 🔧 Railway Deployment Steps

### Step 1: Create New Railway Project

```bash
# In your Railway dashboard:
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose: DevToday-MKhan/AICOO
4. Select the "main" branch
5. Choose "backend" as the root directory
```

### Step 2: Configure Environment Variables

In Railway project settings, add these environment variables:

```bash
# Required Shopify Variables
SHOPIFY_API_KEY=your_shopify_api_key_from_partner_dashboard
SHOPIFY_API_SECRET=your_shopify_api_secret_from_partner_dashboard
SCOPES=write_products,read_products,write_orders,read_orders
HOST=your-app-name.up.railway.app

# Server Configuration
NODE_ENV=production
PORT=8080

# Optional: OpenAI (for AI features)
OPENAI_API_KEY=your_openai_key_here

# Optional: Carrier APIs (for real shipping rates)
FEDEX_CLIENT_ID=your_fedex_client_id
FEDEX_CLIENT_SECRET=your_fedex_client_secret
UPS_CLIENT_ID=your_ups_client_id
UPS_CLIENT_SECRET=your_ups_client_secret
DHL_API_KEY=your_dhl_api_key
```

**Important**: Replace `your-app-name.up.railway.app` with your actual Railway deployment URL after first deploy.

### Step 3: Deploy

Railway will automatically:
1. Install backend dependencies
2. Install frontend dependencies
3. Build frontend production bundle
4. Start the backend server
5. Serve frontend from backend

Monitor the deployment logs to ensure success.

### Step 4: Configure Shopify App URLs

In your Shopify Partner Dashboard, update your app settings:

```
App URL: https://your-app-name.up.railway.app
Allowed redirection URL(s): https://your-app-name.up.railway.app/auth/callback
```

### Step 5: Update HOST Environment Variable

After getting your Railway URL:
1. Go to Railway project settings
2. Update the `HOST` variable to your actual Railway URL (without https://)
3. Example: `your-app-name.up.railway.app`
4. Redeploy if needed

---

## 🧪 Testing Your Deployment

### 1. Health Check
```bash
curl https://your-app-name.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "AICOO Backend",
  "version": "1.1.0",
  "mode": "production",
  "shopify": {
    "configured": true,
    "host": "your-app-name.up.railway.app"
  }
}
```

### 2. API Test
```bash
curl https://your-app-name.up.railway.app/api/test
```

Expected response:
```json
{
  "message": "AICOO API is working",
  "timestamp": "2025-11-26T11:00:00.000Z",
  "mode": "production"
}
```

### 3. Install App in Shopify

1. In Partner Dashboard, click "Test on development store"
2. Select your development store
3. Click "Install app"
4. App should load inside Shopify admin iframe

---

## 📁 Project Structure

```
AICOO/
├── backend/
│   ├── server.js              # Main Express server
│   ├── shopify.js             # Shopify OAuth & App Bridge config
│   ├── package.json           # Backend dependencies
│   ├── railway.json           # Railway build config
│   ├── Procfile               # Process definition
│   ├── data/                  # JSON data storage
│   ├── admin/                 # Admin utilities
│   ├── carriers/              # Shipping carrier integrations
│   └── utils/                 # Utility functions
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx           # Entry point with ShopifyProvider
│   │   ├── App.jsx            # Main app component
│   │   ├── ShopifyProvider.jsx # Shopify App Bridge wrapper
│   │   ├── pages/             # Page components
│   │   └── components/        # Reusable components
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Vite build config
│   └── dist/                  # Production build output
│
├── config/
│   ├── constants.js
│   └── routes.json
│
└── .env.example               # Environment variables template
```

---

## 🔄 Redeployment Process

When you make changes to the code:

```bash
# Commit changes
git add .
git commit -m "Your commit message"
git push origin main
```

Railway will automatically redeploy on push to main branch.

---

## 🐛 Troubleshooting

### Issue: "Cannot read properties of undefined (reading 'process')"
**Solution**: Ensure `@shopify/shopify-api` is v10+ and `shopify.processWebhooks()` is used (not `shopify.webhooks.process()`)

### Issue: "Missing parameter name at index X"
**Solution**: Express 5 doesn't support wildcard routes like `/*` or `/api/*`. Use specific routes or middleware without wildcards.

### Issue: Frontend not loading
**Solution**: 
1. Verify frontend build exists: `ls -la frontend/dist`
2. Check backend logs for static serving message
3. Rebuild frontend: `cd frontend && npm run build`

### Issue: OAuth redirect fails
**Solution**: 
1. Verify `HOST` env var matches Railway URL (without https://)
2. Check Shopify Partner Dashboard redirect URL matches exactly
3. Ensure `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` are correct

### Issue: Railway build fails
**Solution**:
1. Check Railway build logs
2. Ensure both backend and frontend have package-lock.json
3. Verify railway.json build command is correct

---

## 📊 Monitoring

### Railway Logs
```bash
# View real-time logs in Railway dashboard
# Or use Railway CLI:
railway logs
```

### Health Monitoring
Set up a monitoring service (e.g., UptimeRobot) to ping:
```
https://your-app-name.up.railway.app/health
```

---

## 🔐 Security Best Practices

1. **Never commit .env files** - Use Railway's environment variables
2. **Rotate API keys** regularly in production
3. **Use HTTPS only** - Railway provides this by default
4. **Validate webhooks** - HMAC verification is already implemented
5. **Rate limiting** - Consider adding rate limiting middleware for production

---

## 📚 Additional Resources

- [Shopify App Development Docs](https://shopify.dev/docs/apps)
- [Shopify App Bridge Documentation](https://shopify.dev/docs/api/app-bridge)
- [Railway Documentation](https://docs.railway.app/)
- [Express.js Guide](https://expressjs.com/)

---

## 🎯 Next Steps

1. **Add webhook handlers** in `backend/server.js` for order processing
2. **Implement real carrier integrations** (FedEx, UPS, DHL)
3. **Add database** (PostgreSQL via Railway) to replace JSON file storage
4. **Set up monitoring** and alerting
5. **Add tests** for critical functionality
6. **Enable analytics** for usage tracking

---

## 💡 Support

For issues or questions:
- Check Railway deployment logs
- Review Shopify Partner Dashboard for app configuration
- Verify environment variables are set correctly
- Test individual endpoints with curl/Postman

---

**Version**: 1.1.0  
**Last Updated**: November 26, 2025  
**Deployment Platform**: Railway  
**Shopify API Version**: 10.0.0
