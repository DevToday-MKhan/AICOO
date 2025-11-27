import "@shopify/shopify-api/adapters/node";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

// Load ENV
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SCOPES = process.env.SCOPES?.split(",") || ["read_products"];
const HOST = process.env.HOST?.replace(/^https?:\/\//, "");

// IMPORTANT: App URL uses /app prefix
const appUrlPrefix = "/app";

const shopify = shopifyApp({
  api: {
    apiKey: SHOPIFY_API_KEY,
    apiSecretKey: SHOPIFY_API_SECRET,
    scopes: SCOPES,
    hostName: HOST,
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: true,
  },
  auth: {
    path: `${appUrlPrefix}/auth`,
    callbackPath: `${appUrlPrefix}/auth/callback`,
  },
  sessionStorage: new MemorySessionStorage(),
});

export default shopify;
