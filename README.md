# AI-COO - Universal E-Commerce Management Platform

Phase 1 of a GPT-integrated, Shopify-compatible business management platform built with Node 18, Remix, and modern web standards.

## Features

✅ **Multi-Store Shopify Support** - Manage multiple Shopify stores from one dashboard  
✅ **GPT-Powered AI Assistant** - Get business insights, recommendations, and forecasts  
✅ **Order Management** - View and manage orders across all stores  
✅ **Product & Inventory** - CRUD operations with inventory tracking  
✅ **Customer Management** - View customers and purchase history  
✅ **Analytics Dashboard** - Sales metrics and business intelligence  
✅ **Modern UI** - Built with Shopify Polaris for consistency  
✅ **Railway Deployment** - Docker-ready with one-click deploy  

## Tech Stack

- **Runtime**: Node 18.x LTS
- **Framework**: Remix (React 18+)
- **UI**: Shopify Polaris
- **Database**: Prisma (SQLite dev, PostgreSQL/MySQL prod)
- **AI**: OpenAI GPT-4
- **Deployment**: Railway + Docker

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your credentials:
- `SHOPIFY_API_KEY` - From your Shopify Partner dashboard
- `SHOPIFY_API_SECRET` - From your Shopify Partner dashboard
- `SHOPIFY_APP_URL` - Your app's public URL (Railway provides this)
- `OPENAI_API_KEY` - From OpenAI dashboard
- `DATABASE_URL` - PostgreSQL connection string (Railway provides this)

### 3. Initialize Database

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Deployment

### Railway Deployment

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Phase 1: AI-COO foundational scaffolding"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

2. Connect to Railway:
   - Go to railway.app
   - Create new project from GitHub repo
   - Add environment variables
   - Railway will auto-deploy using Dockerfile

### Environment Variables (Railway)

Add these in Railway dashboard:
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_SCOPES`
- `SHOPIFY_APP_URL`
- `OPENAI_API_KEY`
- `DATABASE_URL` (provided by Railway PostgreSQL)
- `SESSION_SECRET` (generate random string)

## Project Structure

```
app/
  components/         # Reusable UI components
    Navigation.tsx    # Sidebar navigation
  routes/             # Remix routes (pages & API)
    app.tsx          # App layout wrapper
    app.dashboard.tsx # Main dashboard
    app.orders.tsx   # Orders management
    app.products.tsx # Products catalog
    app.customers.tsx # Customer list
    app.chat.tsx     # GPT AI assistant
    app.analytics.tsx # Analytics dashboard
    app.settings.tsx # App settings
    auth.$.tsx       # Auth handler
    webhooks.tsx     # Webhook receiver
  shopify.server.ts  # Shopify API client
  db.server.ts       # Prisma client
prisma/
  schema.prisma      # Database schema
```

## API Routes

- `/app/dashboard` - Main metrics dashboard
- `/app/orders` - Order management
- `/app/products` - Product catalog
- `/app/customers` - Customer directory
- `/app/analytics` - Business analytics
- `/app/chat` - AI assistant interface
- `/app/settings` - Configuration

## Features Roadmap

### Phase 1 (Current) ✅
- Shopify OAuth authentication
- Multi-store support
- Orders, Products, Customers CRUD
- GPT chat interface
- Basic analytics

### Phase 2 (Planned)
- Advanced GPT recommendations
- Inventory forecasting
- Marketing campaign suggestions
- Discount code optimization
- Webhook-based real-time updates

### Phase 3 (Future)
- WooCommerce connector
- Custom platform connectors
- Advanced analytics dashboards
- Mobile app

## Security

- OAuth tokens encrypted in database
- API keys stored in environment variables
- Rate limiting on Shopify API calls
- HTTPS required in production
- Webhook signature verification

## Support

For issues or questions, please open a GitHub issue.

## License

Proprietary - All rights reserved
