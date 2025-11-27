import "@shopify/shopify-api/adapters/node";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;

// HOST MUST BE EXACTLY the domain, no https://, no replace(), no sanitation.
const HOST = process.env.HOST || "aicoo-production.up.railway.app";

const SCOPES = (process.env.SCOPES || "write_products,write_orders")
  .split(",")
  .map(s => s.trim());

console.log("🔑 Using hostName:", HOST);
console.log("🔑 OAuth callback → https://" + HOST + "/auth/callback");

const shopify = shopifyApp({
  api: {
    apiKey: SHOPIFY_API_KEY,
    apiSecretKey: SHOPIFY_API_SECRET,
    scopes: SCOPES,
    hostName: HOST,           // DO NOT MODIFY
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: true,
  },
  auth: {
    path: "/auth",
    callbackPath: "/auth/callback",
  },
  sessionStorage: new MemorySessionStorage(),
});

export default shopify;
