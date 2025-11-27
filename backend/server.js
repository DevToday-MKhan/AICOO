//////////////////////////////////////////////////////////////////
//  AI-COO — Production Embedded App Server
//////////////////////////////////////////////////////////////////

import express from "express";
import cookieParser from "cookie-parser";
import { shopifyApp } from "@shopify/shopify-app-express";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-07";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cookieParser());

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: "2024-07",
  scopes: process.env.SCOPES.split(","),
  appUrl: process.env.APP_URL,
  authPath: "/auth",
  authCallbackPath: "/auth/callback",
  sessionStorage: new shopifyApp.SessionStorage.MemorySessionStorage(),
  isEmbeddedApp: true,
  restResources,
});

app.use(shopify.cspHeaders());
app.use("/*", shopify.ensureInstalledOnShop(), async (req, res, next) => {
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


