import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EVENTS_PATH = path.join(__dirname, "data", "events.json");
const ORDERS_PATH = path.join(__dirname, "data", "orders.json");

function loadEvents() {
  try {
    const raw = fs.readFileSync(EVENTS_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveEvents(events) {
  fs.writeFileSync(EVENTS_PATH, JSON.stringify(events, null, 2), "utf8");
}

export function verifyShopifyWebhook(rawBody, hmacHeader) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  
  if (!secret) {
    console.warn("⚠️ SHOPIFY_WEBHOOK_SECRET not set - skipping HMAC verification");
    return true; // Allow in dev if secret not configured
  }

  if (!hmacHeader) {
    return false;
  }

  const hash = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(hmacHeader)
  );
}

export function recordEvent(event) {
  const events = loadEvents();
  events.push({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...event,
  });
  saveEvents(events);
}

export function getEvents() {
  return loadEvents();
}

function loadOrders() {
  try {
    const raw = fs.readFileSync(ORDERS_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveOrder(order) {
  const orders = loadOrders();
  const orderRecord = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...order,
  };
  orders.push(orderRecord);
  
  // Record in AICOO memory
  Memory.addObservation("order_received", {
    orderId: orderRecord.id,
    totalPrice: order.total_price,
    lineItems: order.line_items?.length || 0
  });
  
  // Keep only last 20 orders
  const trimmed = orders.slice(-20);
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(trimmed, null, 2), "utf8");
}

export function getOrders() {
  return loadOrders();
}

export function getLatestOrder() {
  const orders = loadOrders();
  return orders.length > 0 ? orders[orders.length - 1] : null;
}

export function saveShopifyOrder(orderData) {
  saveOrder(orderData);
}
