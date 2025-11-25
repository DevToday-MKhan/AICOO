# 🚀 Quick Start: Deploy to Production

The fastest way to get AICOO running in production.

## Option 1: Guided Script (Recommended)

```bash
./deploy-production.sh
```

This interactive script will guide you through:
1. Deploying backend to Railway
2. Deploying frontend to Vercel  
3. Creating Shopify app
4. Setting up webhooks

## Option 2: Manual CLI Commands

### 1. Deploy Backend (5 minutes)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables in dashboard:
# https://railway.app/dashboard
```

Required variables:
- `OPENAI_API_KEY`
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`

### 2. Deploy Frontend (3 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
cd frontend
vercel login
vercel --prod

# Set in Vercel dashboard:
# VITE_API_URL = <your-railway-backend-url>
```

### 3. Configure Shopify (5 minutes)

1. Go to https://partners.shopify.com
2. Create app → Set URLs to your Vercel frontend
3. Add webhooks pointing to Railway backend
4. Install on development store

## What You'll Get

✅ **Backend:** https://aicoo-backend-production.up.railway.app
✅ **Frontend:** https://aicoo-frontend.vercel.app  
✅ **Shopify App:** Installed on your dev store
✅ **Real-time webhooks:** Orders automatically processed
✅ **AI Chat:** GPT-4 powered logistics assistant
✅ **Carrier APIs:** Rate shopping with FedEx/UPS/DHL

## Total Time: ~15 minutes

See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for detailed step-by-step instructions.

## Cost

**Free tier:** $0/month (Railway $5 credit renews monthly)
**Production:** $5-20/month depending on usage

## Support

- Check Railway logs: `railway logs`
- Check Vercel logs: Vercel dashboard
- Test backend: `curl <railway-url>/api/health`
- GitHub Issues: https://github.com/DevToday-MKhan/AICOO/issues
