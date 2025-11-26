import "@shopify/shopify-api/adapters/node";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

// Get environment variables with safe defaults
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || "test-key";
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || "test-secret";
const SCOPES = (process.env.SCOPES || "read_products").split(",").filter(s => s.trim());
const HOST = (process.env.HOST || "localhost:8080").replace(/^https?:\/\//, "");

console.log(`🔑 Shopify Config: Host=${HOST}, Scopes=${SCOPES.join(",")}`);

// Initialize Shopify App - it will create the API internally
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
    path: "/auth",
    callbackPath: "/auth/callback",
  },
  webhooks: {
    path: "/webhooks",
  },
  sessionStorage: new MemorySessionStorage(),
});

console.log("✅ Shopify app initialized successfully");

// Export the complete shopify instance as default
export default shopify;
