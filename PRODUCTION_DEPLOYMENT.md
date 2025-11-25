# 🚀 AICOO Production Deployment Guide

Complete step-by-step guide to deploy AICOO as a Shopify app using Railway (backend) and Vercel (frontend).

## 📋 Prerequisites

- [x] Git repository pushed to GitHub
- [ ] Shopify Partner account ([Create one here](https://partners.shopify.com/signup))
- [ ] Railway account ([Sign up here](https://railway.app))
- [ ] Vercel account ([Sign up here](https://vercel.com))
- [ ] OpenAI API key ([Get it here](https://platform.openai.com))
- [ ] (Optional) FedEx, UPS, DHL API credentials

---

## 🎯 Architecture Overview

```
Shopify Store → Webhooks → Railway Backend → OpenAI GPT
                              ↓ ↑
                         Vercel Frontend
                              ↓ ↑
                    Carrier APIs (FedEx/UPS/DHL)
```

**Railway** hosts the Node.js backend (free tier: $5/month credit)
**Vercel** hosts the React frontend (free tier: unlimited)

---

## Part 1: Deploy Backend to Railway

### Step 1.1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 1.2: Login to Railway

```bash
railway login
```

This opens your browser - authorize the CLI.

### Step 1.3: Create New Project

```bash
# From the AICOO root directory
railway init
```

Choose:
- **Create new project** → Yes
- **Project name** → aicoo-backend
- **Service name** → backend

### Step 1.4: Deploy Backend

```bash
railway up
```

Railway will:
1. Detect Node.js project
2. Run `npm install` in backend/
3. Start server with `npm start`
4. Assign a public URL

**Your backend URL will look like:**
`https://aicoo-backend-production.up.railway.app`

### Step 1.5: Set Environment Variables

Go to Railway dashboard: https://railway.app/dashboard

Click your project → **Variables** tab → Add these:

```env
# Required
OPENAI_API_KEY=sk-proj-xxxxx
PORT=3000
NODE_ENV=production

# Shopify (get from Partner Dashboard - see Part 3)
SHOPIFY_API_KEY=your_key_here
SHOPIFY_API_SECRET=your_secret_here
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_token_here

# Optional: Real Carrier APIs
FEDEX_CLIENT_ID=your_fedex_id
FEDEX_CLIENT_SECRET=your_fedex_secret
FEDEX_ACCOUNT_NUMBER=123456789
FEDEX_USE_SANDBOX=true

UPS_CLIENT_ID=your_ups_id
UPS_CLIENT_SECRET=your_ups_secret
UPS_ACCOUNT_NUMBER=123456
UPS_USE_SANDBOX=true

DHL_API_KEY=your_dhl_key
DHL_API_SECRET=your_dhl_secret
DHL_ACCOUNT_NUMBER=123456789
DHL_USE_SANDBOX=true
```

Click **Deploy** to restart with new variables.

### Step 1.6: Test Backend

```bash
curl https://your-railway-url.up.railway.app/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-06-16T12:00:00.000Z",
  "mode": "production",
  "services": {
    "openai": true,
    "shopify": false,
    "carriers": {
      "fedex": false,
      "ups": false,
      "dhl": false
    }
  }
}
```

✅ **Backend deployed!** Copy your Railway URL for next step.

---

## Part 2: Deploy Frontend to Vercel

### Step 2.1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2.2: Login to Vercel

```bash
vercel login
```

### Step 2.3: Deploy Frontend

```bash
cd frontend
vercel
```

Answer the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name** → aicoo-frontend
- **Directory** → ./
- **Override settings?** → No

Vercel will:
1. Build your React app (`npm run build`)
2. Upload to CDN
3. Give you a preview URL

For production deployment:

```bash
vercel --prod
```

**Your frontend URL will look like:**
`https://aicoo-frontend.vercel.app`

### Step 2.4: Set Environment Variable

Go to Vercel dashboard: https://vercel.com/dashboard

Click **aicoo-frontend** → **Settings** → **Environment Variables**

Add:
```
VITE_API_URL = https://your-railway-backend-url.up.railway.app
```

**Important:** No trailing slash!

Then **Redeploy**:
```bash
vercel --prod
```

### Step 2.5: Test Frontend

Visit: `https://aicoo-frontend.vercel.app`

You should see the AICOO dashboard. Check:
- ✅ Dashboard loads
- ✅ Connection status shows "Connected" (top right)
- ✅ No console errors about API calls

✅ **Frontend deployed!**

---

## Part 3: Create Shopify App

### Step 3.1: Create Shopify Partner Account

1. Go to https://partners.shopify.com
2. Sign up / Login
3. Create an organization (if first time)

### Step 3.2: Create New App

1. Click **Apps** in sidebar
2. Click **Create App**
3. Choose **Custom app**
4. App name: `AICOO AI Logistics`

### Step 3.3: Configure App URLs

In your app settings:

**App URL:**
```
https://aicoo-frontend.vercel.app
```

**Allowed redirection URL(s):**
```
https://aicoo-frontend.vercel.app/auth/callback
```

### Step 3.4: Set API Scopes

Under **API access** → **Configuration**, select:

- ✅ `read_orders` - Read order data
- ✅ `write_orders` - Update order status
- ✅ `read_shipping` - Read shipping info
- ✅ `write_shipping` - Create shipping labels
- ✅ `read_customers` - Read customer data

Click **Save**.

### Step 3.5: Get API Credentials

Under **API credentials**:

1. Copy **API key** → Add to Railway as `SHOPIFY_API_KEY`
2. Copy **API secret key** → Add to Railway as `SHOPIFY_API_SECRET`

Go back to Railway dashboard and update these variables, then redeploy.

### Step 3.6: Create Development Store

1. In Partner Dashboard → **Stores**
2. Click **Add store** → **Development store**
3. Store name: `AICOO Test Store`
4. Password: (choose one)
5. Store purpose: **Test app**

### Step 3.7: Install App on Dev Store

1. Go to your app in Partner Dashboard
2. Click **Test your app**
3. Select your development store
4. Click **Install app**
5. Authorize all permissions

### Step 3.8: Get Access Token

After installation:
1. Go to **Settings** → **Apps and sales channels**
2. Click your app name
3. Copy **Admin API access token** → Add to Railway as `SHOPIFY_ACCESS_TOKEN`
4. Copy your store URL (e.g., `aicoo-test.myshopify.com`) → Add to Railway as `SHOPIFY_SHOP_DOMAIN`

Redeploy Railway backend.

---

## Part 4: Configure Webhooks

### Step 4.1: Set Up Shopify Webhooks

In Shopify Admin (your dev store):

1. **Settings** → **Notifications** → **Webhooks**
2. Click **Create webhook**

Create these webhooks:

#### Webhook 1: Order Creation
- **Event:** Order creation
- **Format:** JSON
- **URL:** `https://your-railway-url.up.railway.app/api/webhooks/shopify/orders`
- **API version:** 2024-10

#### Webhook 2: Order Updated
- **Event:** Order updated
- **Format:** JSON
- **URL:** `https://your-railway-url.up.railway.app/api/webhooks/shopify/orders`
- **API version:** 2024-10

#### Webhook 3: Fulfillment Created
- **Event:** Fulfillment created
- **Format:** JSON
- **URL:** `https://your-railway-url.up.railway.app/api/webhooks/shopify/delivery`
- **API version:** 2024-10

### Step 4.2: Verify Webhooks

Railway logs will show incoming webhooks. Check:

```bash
railway logs
```

---

## Part 5: Testing

### Step 5.1: Create Test Order

In your Shopify dev store:

1. Add a product (Settings → Products → Add product)
2. Go to storefront (Online Store → View)
3. Add product to cart
4. Checkout with test data:
   - Email: test@example.com
   - Address: Any US address
   - Payment: Bogus Gateway (enabled by default in dev stores)

### Step 5.2: Verify AICOO Received Order

1. Open AICOO dashboard: `https://aicoo-frontend.vercel.app`
2. Check **Recent Activity** feed - should show new order
3. Check **Chat** - AICOO should mention the order
4. Check Railway logs:
   ```bash
   railway logs
   ```
   Look for: `✅ Shopify webhook received: orders/create`

### Step 5.3: Test Carrier Rate Shopping

In AICOO Chat page:

```
/rates 10001 90210 5
```

Should return FedEx, UPS, DHL rates (or mock rates if carriers not configured).

### Step 5.4: Test Admin Panel

1. Go to **Admin** page
2. **Carrier Credentials** section
3. Add FedEx credentials (if you have them)
4. Click **Test Connection**
5. Should show ✅ Connection successful

---

## 🎉 Deployment Complete!

Your AICOO app is now live!

### Your URLs:
- **Frontend:** https://aicoo-frontend.vercel.app
- **Backend:** https://your-railway-backend.up.railway.app
- **Shopify Store:** https://your-store.myshopify.com

### Next Steps:

1. **Enable Real Carriers** (optional):
   - Get FedEx credentials: https://developer.fedex.com
   - Get UPS credentials: https://developer.ups.com
   - Get DHL credentials: https://developer.dhl.com
   - Add to Railway environment variables
   - Set `USE_SANDBOX=false` for production

2. **Monitor Performance**:
   - Railway dashboard: CPU, memory, logs
   - Vercel analytics: Page views, load times
   - AICOO Analytics: Carrier performance, delivery stats

3. **Scale Up** (when needed):
   - Railway: Add more resources ($5/GB RAM)
   - Vercel: Enable Analytics ($10/month)

4. **Go Live on Real Store**:
   - Submit app for review in Partner Dashboard
   - List on Shopify App Store
   - Install on production stores

---

## 🐛 Troubleshooting

### Backend won't start
- Check Railway logs: `railway logs`
- Verify environment variables are set
- Ensure OpenAI API key is valid

### Frontend can't reach backend
- Check VITE_API_URL is set correctly in Vercel
- Verify Railway backend is running
- Check for CORS errors in browser console

### Webhooks not working
- Verify webhook URLs are correct
- Check Railway logs for incoming requests
- Ensure SHOPIFY_API_SECRET is set correctly

### Carrier APIs failing
- Check credentials in Railway variables
- Verify USE_SANDBOX is set correctly
- Check carrier dashboard for API limits

---

## 💰 Cost Estimate

**Free Tier (Perfect for testing):**
- Railway: $5/month credit (renews monthly)
- Vercel: Unlimited free
- **Total: $0/month** (within Railway credit)

**Production (Moderate traffic):**
- Railway: $5-20/month
- Vercel: Free (or $20/month for Pro features)
- **Total: $5-20/month**

---

## 📚 Resources

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Shopify App Development](https://shopify.dev/docs/apps)
- [AICOO GitHub Repo](https://github.com/DevToday-MKhan/AICOO)

---

**Need help?** Check Railway/Vercel logs and GitHub issues.
