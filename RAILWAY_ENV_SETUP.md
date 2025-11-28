# 🚨 URGENT: Railway Environment Variables Required

## Current Deployment Error
```
Error: Detected an empty appUrl configuration
```

## ✅ Required Environment Variables for Railway

Add these in your Railway dashboard → Variables section:

### 1. Shopify Configuration (REQUIRED)
```
SHOPIFY_API_KEY=your_shopify_api_key_here
SHOPIFY_API_SECRET=your_shopify_api_secret_here
SHOPIFY_APP_URL=https://your-railway-app.up.railway.app
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_customers,write_customers
```

### 2. Session Secret (REQUIRED)
```
SESSION_SECRET=generate_a_random_32_character_string_here
```

Generate a random secret:
```bash
openssl rand -base64 32
```

### 3. OpenAI (Optional - for AI features)
```
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
```

### 4. Node Environment (Optional)
```
NODE_ENV=production
```

---

## 📋 Step-by-Step Setup

### Step 1: Get Railway App URL
1. Go to your Railway project
2. Click on your service
3. Go to "Settings" tab
4. Find "Domains" section
5. Copy the Railway-provided domain (e.g., `your-app.up.railway.app`)

### Step 2: Create Shopify Partner App
1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Click "Apps" → "Create app"
3. Choose "Custom app"
4. Fill in:
   - **App name:** AI-COO
   - **App URL:** `https://your-app.up.railway.app`
   - **Allowed redirection URL:** `https://your-app.up.railway.app/auth/callback`
5. Copy the **API key** and **API secret**

### Step 3: Add Variables to Railway
1. In Railway dashboard, go to your service
2. Click "Variables" tab
3. Click "+ New Variable"
4. Add each variable one by one:
   - Variable name: `SHOPIFY_API_KEY`
   - Value: (paste your API key)
5. Repeat for all required variables

### Step 4: Redeploy
Railway will automatically redeploy when you add/change variables.

---

## 🔍 Verify Deployment

After adding variables, check Railway logs for:
```
✅ Remix app running on http://0.0.0.0:3000
```

If you see this, your app is live!

---

## ⚠️ Minimum Variables to Start

If you just want to test the deployment (without Shopify), set these:

```
SHOPIFY_API_KEY=placeholder_key
SHOPIFY_API_SECRET=placeholder_secret
SHOPIFY_APP_URL=https://your-railway-app.up.railway.app
SESSION_SECRET=your_random_32_char_string_here
```

**Note:** The app won't connect to Shopify, but it will start and you can verify the deployment works.

---

## 📞 Next Steps After Variables Are Set

1. ✅ Railway will auto-redeploy
2. ✅ App will start successfully
3. ✅ Visit your Railway URL
4. ✅ Install app in Shopify development store
5. ✅ Test all features

---

**Current Status:** ⏳ Waiting for environment variables in Railway dashboard
