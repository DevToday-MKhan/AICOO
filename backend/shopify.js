import { shopifyApp } from "@shopify/shopify-app-express";
import { LATEST_API_VERSION } from "@shopify/shopify-api";

const shopify = shopifyApp({
  api: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    apiVersion: LATEST_API_VERSION,
    scopes: process.env.SCOPES.split(","),
    hostName: process.env.HOST.replace(/^https?:\/\//, "")
  },
  auth: {
    path: "/auth",
    callbackPath: "/auth/callback"
  },
  webhooks: {
    path: "/webhooks"
  }
});

export default shopify;
