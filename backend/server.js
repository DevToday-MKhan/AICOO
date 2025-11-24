// =======================================
// AICOO™ Backend Server (PRODUCTION-READY)
// =======================================

// Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

// Core imports
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getEvents, recordEvent, verifyShopifyWebhook, saveShopifyOrder, getLatestOrder } from "./webhooks.js";
import { getSettings, updateSettings } from "./settings.js";
import Suggestions from "./suggestions.js";
import { askAICOO } from "./gpt.js";
import { getComparisonQuote as getCourierQuote, getQuoteHistory as getCourierHistory } from "./courier.js";
import { getComparisonQuote as getRideQuote, getQuoteHistory as getRideHistory } from "./ride.js";
import { getRouteQuote, getRouteHistory } from "./routing.js";
import { assignDelivery, getDeliveryHistory, getLatestDelivery } from "./delivery.js";
import { exportAllData, exportZipped, getStorageHealth } from "./admin/backup.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------
// ENVIRONMENT MODE
// ---------------------------------------
const MODE = process.env.MODE || "DEV";
const IS_DEV = MODE === "DEV";
const IS_LIVE = MODE === "LIVE";

console.log(`🚀 AICOO Starting in ${MODE} mode`);

if (IS_DEV) {
  console.log("📝 Verbose logging enabled (DEV mode)");
}

// Error logging
let lastError = null;
const logError = (error, context = "") => {
  lastError = {
    message: error.message,
    context,
    timestamp: new Date().toISOString()
  };
  
  if (IS_DEV) {
    console.error(`🔥 ERROR [${context}]:`, error);
  } else {
    // In LIVE mode, log to file
    const logEntry = `[${new Date().toISOString()}] [${context}] ${error.message}\n`;
    fs.appendFileSync(path.join(__dirname, "server.log"), logEntry);
  }
};

// Initialize Express
const app = express();
app.use(cors());

// Raw body parser for webhook verification
app.use("/webhooks", express.raw({ type: "application/json" }));

// JSON parser for all other routes
app.use(express.json());

// ---------------------------------------
// WEBHOOKS — STORE EVENTS & ROUTE ORDERS
// ---------------------------------------
app.post("/webhooks/orders/create", async (req, res) => {
  const hmacHeader = req.headers["x-shopify-hmac-sha256"];
  const rawBody = req.body.toString("utf8");

  // Verify HMAC signature
  if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
    console.error("🔒 HMAC verification failed - rejecting webhook");
    return res.status(401).send("Unauthorized - Invalid HMAC");
  }

  console.log("✅ HMAC verified - processing webhook");

  const event_type = req.headers["x-shopify-topic"];
  let eventData;

  try {
    eventData = JSON.parse(rawBody);
  } catch (err) {
    console.error("❌ Invalid JSON in webhook body");
    return res.status(400).send("Bad Request - Invalid JSON");
  }

  const event = {
    ...eventData,
    event_type,
  };

  // Record the raw event
  recordEvent(event);

  // Process order routing for orders/create webhook
  if (event_type === "orders/create" || event_type === "orders/paid") {
    try {
      const orderId = eventData.id || eventData.order_number || "unknown";
      const customerZip = eventData.shipping_address?.zip || eventData.billing_address?.zip;
      const lineItems = eventData.line_items || [];

      // Calculate total weight (convert grams to pounds)
      let totalWeight = 0;
      for (const item of lineItems) {
        const grams = item.grams || (item.weight ? item.weight * 1000 : 0);
        totalWeight += (grams / 453.592) * (item.quantity || 1); // grams to lbs
      }

      // Fallback to mock weight if missing
      if (totalWeight === 0) {
        totalWeight = 3; // 3 lbs default
        console.log("⚠️ No weight data in order, using default 3 lbs");
      }

      // Validate ZIP
      const zipPattern = /^\d{5}$/;
      if (customerZip && zipPattern.test(customerZip)) {
        // Get routing recommendation
        const routingResult = getRouteQuote({ 
          customerZip, 
          weight: parseFloat(totalWeight.toFixed(2))
        });

        // Save order with routing info
        const orderData = {
          orderId,
          customerZip,
          totalWeight: parseFloat(totalWeight.toFixed(2)),
          routing: routingResult,
        };

        saveShopifyOrder(orderData);
        console.log(`🚚 Order ${orderId} routed: ${routingResult.recommendation}`);
      } else {
        console.warn(`⚠️ Invalid or missing ZIP for order ${orderId}: ${customerZip}`);
      }
    } catch (routingErr) {
      console.error("🔥 Routing error:", routingErr);
      // Don't fail the webhook - still return 200 OK
    }
  }

  res.status(200).send("Event received");
});

// ---------------------------------------
// EVENTS FEED
// ---------------------------------------
app.get("/api/events", (req, res) => {
  res.json(getEvents());
});

// ---------------------------------------
// SETTINGS
// ---------------------------------------
app.get("/api/settings", (req, res) => {
  res.json(getSettings());
});

app.post("/api/settings", (req, res) => {
  const updated = updateSettings(req.body);
  res.json({ status: "ok", settings: updated });
});

// ---------------------------------------
// SUGGESTIONS
// ---------------------------------------
app.get("/api/suggestions", (req, res) => {
  res.json(Suggestions.getSuggestions());
});

// ---------------------------------------
// GPT — AICOO AI COO ENGINE
// ---------------------------------------
app.post("/api/gpt", async (req, res) => {
  const { prompt } = req.body;

  try {
    const answer = await askAICOO(prompt);
    res.json({ answer });
  } catch (err) {
    console.error("🔥 GPT ERROR:", err);
    res.status(500).json({ error: "GPT error" });
  }
});

// ---------------------------------------
// COURIER COMPARE — MULTI-CARRIER QUOTES
// ---------------------------------------
app.post("/api/courier/quote", (req, res) => {
  const { fromZip, toZip, weight } = req.body;

  if (!fromZip || !toZip || !weight) {
    return res.status(400).json({ error: "Missing required fields: fromZip, toZip, weight" });
  }

  try {
    const result = getCourierQuote(fromZip, toZip, weight);
    res.json(result);
  } catch (err) {
    console.error("🔥 COURIER ERROR:", err);
    res.status(500).json({ error: "Courier comparison failed" });
  }
});

app.get("/api/courier/history", (req, res) => {
  res.json(getCourierHistory());
});

// ---------------------------------------
// RIDE COMPARE — UBER VS LYFT
// ---------------------------------------
app.post("/api/ride/quote", (req, res) => {
  const { fromZip, toZip } = req.body;

  // Validate ZIP codes (must be 5 digits)
  const zipPattern = /^\d{5}$/;
  if (!fromZip || !toZip) {
    return res.status(400).json({ error: "Missing required fields: fromZip, toZip" });
  }
  if (!zipPattern.test(fromZip) || !zipPattern.test(toZip)) {
    return res.status(400).json({ error: "Invalid ZIP code format. Must be 5 digits." });
  }

  try {
    const result = getRideQuote(fromZip, toZip);
    res.json(result);
  } catch (err) {
    console.error("🔥 RIDE ERROR:", err);
    res.status(500).json({ error: "Ride comparison failed" });
  }
});

app.get("/api/ride/history", (req, res) => {
  res.json(getRideHistory());
});

// ---------------------------------------
// ROUTING ENGINE — CHICKENTODAY ROUTING
// ---------------------------------------
app.post("/api/route/quote", (req, res) => {
  const { customerZip, weight } = req.body;

  // Validate inputs
  const zipPattern = /^\d{5}$/;
  if (!customerZip || !weight) {
    return res.status(400).json({ error: "Missing required fields: customerZip, weight" });
  }
  if (!zipPattern.test(customerZip)) {
    return res.status(400).json({ error: "Invalid ZIP code format. Must be 5 digits." });
  }
  if (weight <= 0) {
    return res.status(400).json({ error: "Weight must be greater than 0" });
  }

  try {
    const result = getRouteQuote({ customerZip, weight });
    res.json(result);
  } catch (err) {
    console.error("🔥 ROUTING ERROR:", err);
    res.status(500).json({ error: err.message || "Routing engine failed" });
  }
});

app.get("/api/route/history", (req, res) => {
  res.json(getRouteHistory());
});

// ---------------------------------------
// ORDERS — LATEST SHOPIFY ORDER
// ---------------------------------------
app.get("/api/orders/latest", (req, res) => {
  const latest = getLatestOrder();
  res.json(latest || {});
});

// ---------------------------------------
// DELIVERY ASSIGNMENTS
// ---------------------------------------
app.post("/api/delivery/assign", (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: "Missing required field: orderId" });
  }

  try {
    // Load all orders to find the requested one
    const orders = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "orders.json"), "utf8"));
    const order = orders.find(o => o.orderId == orderId);

    if (!order) {
      return res.status(404).json({ error: `Order ${orderId} not found` });
    }

    // Assign delivery based on routing decision
    const assignment = assignDelivery({
      orderId: order.orderId,
      customerZip: order.customerZip,
      weight: order.totalWeight,
      routing: order.routing,
    });

    res.json(assignment);
  } catch (err) {
    console.error("🔥 DELIVERY ASSIGNMENT ERROR:", err);
    res.status(500).json({ error: err.message || "Delivery assignment failed" });
  }
});

app.get("/api/delivery/latest", (req, res) => {
  const latest = getLatestDelivery();
  if (!latest) {
    return res.json({ message: "No deliveries yet." });
  }
  res.json(latest);
});

app.get("/api/delivery/history", (req, res) => {
  res.json(getDeliveryHistory());
});

// ---------------------------------------
// SYSTEM HEALTH
// ---------------------------------------
app.get("/api/health", (req, res) => {
  try {
    const events = getEvents();
    const deliveries = getDeliveryHistory();
    const routes = getRouteHistory();
    const couriers = getCourierHistory();
    const rides = getRideHistory();
    const storageHealth = getStorageHealth();
    
    const health = {
      backend: "ok",
      mode: MODE,
      storage: storageHealth.status,
      routing: "ok",
      delivery: "ok",
      webhooks: "ok",
      counts: {
        events: events.length,
        deliveries: deliveries.length,
        routes: routes.length,
        couriers: couriers.length,
        rides: rides.length
      },
      storageDetails: storageHealth,
      lastError: lastError,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
    
    res.json(health);
  } catch (err) {
    logError(err, "HEALTH_CHECK");
    res.status(500).json({
      backend: "error",
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ---------------------------------------
// ADMIN TOOLS
// ---------------------------------------
app.post("/api/admin/clear-events", (req, res) => {
  try {
    fs.writeFileSync(path.join(__dirname, "data", "events.json"), "[]");
    console.log("🗑️  Events cleared");
    res.json({ status: "ok", message: "Events cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear events" });
  }
});

app.post("/api/admin/clear-orders", (req, res) => {
  try {
    fs.writeFileSync(path.join(__dirname, "data", "orders.json"), "[]");
    console.log("🗑️  Orders cleared");
    res.json({ status: "ok", message: "Orders cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear orders" });
  }
});

app.post("/api/admin/clear-deliveries", (req, res) => {
  try {
    fs.writeFileSync(path.join(__dirname, "data", "deliveries.json"), "[]");
    console.log("🗑️  Deliveries cleared");
    res.json({ status: "ok", message: "Deliveries cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear deliveries" });
  }
});

app.post("/api/admin/clear-routes", (req, res) => {
  try {
    fs.writeFileSync(path.join(__dirname, "data", "routes.json"), "[]");
    console.log("🗑️  Routes cleared");
    res.json({ status: "ok", message: "Routes cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear routes" });
  }
});

app.post("/api/admin/clear-couriers", (req, res) => {
  try {
    fs.writeFileSync(path.join(__dirname, "data", "courier.json"), "[]");
    console.log("🗑️  Courier history cleared");
    res.json({ status: "ok", message: "Courier history cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear courier history" });
  }
});

app.post("/api/admin/clear-rides", (req, res) => {
  try {
    fs.writeFileSync(path.join(__dirname, "data", "ride.json"), "[]");
    console.log("🗑️  Ride history cleared");
    res.json({ status: "ok", message: "Ride history cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear ride history" });
  }
});

app.get("/api/admin/backup", (req, res) => {
  try {
    const backup = exportAllData();
    if (IS_DEV) console.log("📦 Backup created via /api/admin/backup");
    res.json(backup);
  } catch (err) {
    logError(err, "ADMIN_BACKUP");
    res.status(500).json({ error: "Failed to create backup" });
  }
});

app.get("/api/admin/export-all", (req, res) => {
  try {
    const data = exportAllData();
    if (IS_DEV) console.log("📦 Full export created");
    res.json(data);
  } catch (err) {
    logError(err, "ADMIN_EXPORT_ALL");
    res.status(500).json({ error: "Failed to export data" });
  }
});

app.get("/api/admin/export-zip", (req, res) => {
  try {
    const zipData = exportZipped();
    if (IS_DEV) console.log(`📦 ZIP export created: ${zipData.filename}`);
    res.json(zipData);
  } catch (err) {
    logError(err, "ADMIN_EXPORT_ZIP");
    res.status(500).json({ error: "Failed to create ZIP export" });
  }
});

app.get("/api/admin/mode", (req, res) => {
  res.json({
    mode: MODE,
    isDev: IS_DEV,
    isLive: IS_LIVE,
    verboseLogging: IS_DEV
  });
});

// TEMP – ENV CHECK
if (IS_DEV) {
  console.log(
    "ENV CHECK → OPENAI KEY:",
    process.env.OPENAI_API_KEY ? "LOADED" : "NOT LOADED"
  );
}

// ---------------------------------------
// START SERVER
// ---------------------------------------
app.listen(3000, () => {
  console.log("AICOO backend running on port 3000");
});

// ---------------------------------------
// EXPORT — MUST BE LAST
// ---------------------------------------
export default app;

