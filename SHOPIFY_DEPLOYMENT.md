# AICOO - Shopify App Deployment Guide

## Prerequisites
- Shopify Partner account (free at partners.shopify.com)
- Development store
- Public domain or ngrok for webhooks

## Step-by-Step Deployment

### 1. Create Shopify App in Partner Dashboard
1. Go to https://partners.shopify.com/
2. Click "Apps" → "Create app"
3. Choose "Custom app" (or "Public app" for App Store)
4. App name: "AICOO - AI Chicken Logistics"

### 2. Configure App Settings

**App URL:** `https://your-domain.com` (or ngrok URL for testing)

**Allowed redirection URLs:**
```
https://your-domain.com/auth/callback
https://your-domain.com/auth/shopify/callback
```

**Webhook URLs:**
```
https://your-domain.com/api/webhooks/shopify/orders
https://your-domain.com/api/webhooks/shopify/delivery
```

**Required Scopes:**
- `read_orders` - Read order data
- `write_orders` - Update order fulfillment
- `read_shipping` - Access shipping info
- `write_shipping` - Create shipping labels
- `read_customers` - Customer addresses
- `read_locations` - Store locations

### 3. Get API Credentials

From your Shopify app settings, copy:
- **API Key** (Client ID)
- **API Secret** (Client Secret)
- **Access Token** (after installation)

### 4. Update AICOO Configuration

Create `.env` file in `/backend`:
```bash
# Shopify
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_access_token_here

# Carrier APIs (from Admin UI)
FEDEX_CLIENT_ID=your_fedex_id
FEDEX_CLIENT_SECRET=your_fedex_secret
FEDEX_ACCOUNT_NUMBER=your_fedex_account

UPS_CLIENT_ID=your_ups_id
UPS_CLIENT_SECRET=your_ups_secret
UPS_ACCOUNT_NUMBER=your_ups_account

DHL_API_KEY=your_dhl_key
DHL_API_SECRET=your_dhl_secret
DHL_ACCOUNT_NUMBER=your_dhl_account

# OpenAI
OPENAI_API_KEY=your_openai_key

# Server
PORT=3000
NODE_ENV=production
```

### 5. Deploy Backend

**Option A: Railway/Render/Heroku**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Option B: DigitalOcean/AWS/GCP**
```bash
# Build
npm run build

# Start with PM2
npm install -g pm2
pm2 start backend/server.js --name aicoo-backend
pm2 save
```

**Option C: Vercel Serverless**
```bash
npm install -g vercel
vercel --prod
```

### 6. Deploy Frontend

```bash
cd frontend
npm run build

# Deploy to Vercel/Netlify/Cloudflare Pages
vercel --prod
# OR
netlify deploy --prod
```

### 7. Install App on Store

1. Go to your Shopify Partner dashboard
2. Select your app
3. Click "Test on development store"
4. Choose your store
5. Click "Install app"

### 8. Configure Webhooks

In Shopify Partner Dashboard → Your App → API credentials:

**Add webhook subscriptions:**
- `orders/create` → `https://your-domain.com/api/webhooks/shopify/orders`
- `orders/updated` → `https://your-domain.com/api/webhooks/shopify/orders`
- `fulfillments/create` → `https://your-domain.com/api/webhooks/shopify/delivery`

### 9. Test the Integration

1. Create a test order in your Shopify store
2. Check AICOO dashboard for the order
3. Verify carrier rate shopping works
4. Test label creation

### 10. Production Checklist

- [ ] SSL certificate installed
- [ ] Environment variables set
- [ ] Carrier API credentials configured
- [ ] Webhooks verified
- [ ] Database backups scheduled
- [ ] Error monitoring (Sentry/LogRocket)
- [ ] Rate limiting enabled
- [ ] CORS configured properly

## Testing Locally with ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start backend
cd backend && npm start

# In another terminal, expose it
ngrok http 3000

# Use the ngrok URL as your Shopify App URL
# Example: https://abc123.ngrok.io
```

## Troubleshooting

**Webhooks not received:**
- Check Shopify Admin → Settings → Notifications → Webhooks
- Verify URL is publicly accessible
- Check backend logs

**Authentication errors:**
- Verify API credentials in .env
- Check scopes are approved
- Reinstall app if needed

**Rate shopping not working:**
- Verify carrier credentials in Admin UI
- Check if in mock mode (expected without real keys)
- Test each carrier individually

## Support

- AICOO GitHub: https://github.com/DevToday-MKhan/AICOO
- Shopify Partner Docs: https://shopify.dev/apps
- Carrier APIs: FedEx/UPS/DHL developer portals
