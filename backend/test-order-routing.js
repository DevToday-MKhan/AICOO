import dotenv from "dotenv";
dotenv.config();

import { saveShopifyOrder, getLatestOrder } from "./webhooks.js";
import { getRouteQuote } from "./routing.js";

console.log("Testing order routing...");

// Simulate Shopify order data
const customerZip = "07102"; // Newark, NJ
const weight = 10; // 10 lbs total

console.log(`Input: ZIP ${customerZip}, Weight ${weight} lbs`);

// Get routing recommendation
const routingResult = getRouteQuote({ customerZip, weight });
console.log("Routing result:", JSON.stringify(routingResult, null, 2));

// Save order
const orderData = {
  orderId: 4567890123456,
  customerZip,
  totalWeight: weight,
  routing: routingResult,
};

saveShopifyOrder(orderData);
console.log("Order saved!");

// Retrieve latest order
const latest = getLatestOrder();
console.log("Latest order:", JSON.stringify(latest, null, 2));
