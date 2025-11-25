#!/bin/bash

# AICOO Shopify Deployment Helper
echo "🚀 AICOO Shopify Deployment Setup"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
  echo "📝 Creating .env file..."
  cat > backend/.env << 'EOF'
# Shopify Configuration
SHOPIFY_API_KEY=your_shopify_api_key_here
SHOPIFY_API_SECRET=your_shopify_api_secret_here
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_shopify_access_token_here

# Carrier APIs
FEDEX_CLIENT_ID=
FEDEX_CLIENT_SECRET=
FEDEX_ACCOUNT_NUMBER=
FEDEX_USE_SANDBOX=true

UPS_CLIENT_ID=
UPS_CLIENT_SECRET=
UPS_ACCOUNT_NUMBER=
UPS_USE_SANDBOX=true

DHL_API_KEY=
DHL_API_SECRET=
DHL_ACCOUNT_NUMBER=
DHL_USE_SANDBOX=true

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Server Config
PORT=3000
NODE_ENV=development
EOF
  echo "✅ Created backend/.env - Please edit with your credentials"
else
  echo "✅ .env file already exists"
fi

echo ""
echo "📦 Installing production dependencies..."
cd backend && npm install --production
cd ../frontend && npm install

echo ""
echo "🔨 Building frontend..."
npm run build

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your Shopify credentials"
echo "2. Create app at https://partners.shopify.com"
echo "3. Deploy backend to hosting service (Railway/Render/Heroku)"
echo "4. Deploy frontend to Vercel/Netlify"
echo "5. Configure webhooks in Shopify Partner Dashboard"
echo ""
echo "For local testing with ngrok:"
echo "  ngrok http 3000"
echo ""
echo "Read SHOPIFY_DEPLOYMENT.md for detailed instructions"
