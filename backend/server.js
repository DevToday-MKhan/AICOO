//////////////////////////////////////////////////////////////////
//  AI-COO — Production Embedded App Server
//////////////////////////////////////////////////////////////////

import express from "express";
import cookieParser from "cookie-parser";
import { createShopifyAuth, ShopifyAuth } from "@shopify/shopify-api";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cookieParser());

// Shopify API v7 setup
const shopify = createShopifyAuth({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES.split(","),
  hostName: process.env.HOST.replace(/^https?:\/\//, ''),
  hostScheme: process.env.HOST_SCHEME || 'https',
  isEmbeddedApp: true,
  apiVersion: "2024-07"
});

// Auth routes
app.get('/auth', async (req, res) => {
  try {
    const authRoute = await ShopifyAuth.beginAuth(
      req,
      res,
      req.query.shop,
      '/auth/callback',
      false
    );
    return authRoute;
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).send('Authentication failed');
  }
});

app.get('/auth/callback', async (req, res) => {
  try {
    const callbackRoute = await ShopifyAuth.validateAuthCallback(
      req,
      res,
      req.query
    );
    return callbackRoute;
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).send('Authentication callback failed');
  }
});

// Main app route - ensure authenticated
app.get('/', shopify.ensureInstalledOnShop(), async (req, res) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AI-COO</title>
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
        </head>
        <body>
          <div id="app"></div>
          <script>
            var AppBridge = window['app-bridge'];
            var createApp = AppBridge.default;
            var app = createApp({
              apiKey: '${process.env.SHOPIFY_API_KEY}',
              host: new URLSearchParams(window.location.search).get('host')
            });
          </script>
        </body>
      </html>
    `);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`AI-COO server running on port ${PORT}`);
});


