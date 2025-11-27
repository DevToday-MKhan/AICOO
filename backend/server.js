//////////////////////////////////////////////////////////////////
//  AI-COO — Production Embedded App Server
//////////////////////////////////////////////////////////////////

import express from "express";
import cookieParser from "cookie-parser";
import shopify from "./shopify.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cookieParser());

// Auth routes
app.use("/auth", shopify.auth.begin());
app.use("/auth/callback", shopify.auth.callback());

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


