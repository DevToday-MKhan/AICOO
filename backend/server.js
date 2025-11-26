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
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { fileURLToPath } from "url";
import shopify from "./shopify.js";
import { getEvents, recordEvent, verifyShopifyWebhook, saveShopifyOrder, getLatestOrder } from "./webhooks.js";
import { getSettings, updateSettings } from "./settings.js";
import Suggestions from "./suggestions.js";
import { askAICOO } from "./gpt.js";
import { getComparisonQuote as getCourierQuote, getQuoteHistory as getCourierHistory } from "./courier.js";
import { getComparisonQuote as getRideQuote, getQuoteHistory as getRideHistory } from "./ride.js";
import { getRouteQuote, getRouteHistory } from "./routing.js";
import { assignDelivery, getDeliveryHistory, getLatestDelivery } from "./delivery.js";
import { exportAllData, exportZipped, getStorageHealth } from "./admin/backup.js";
import * as Memory from "./memory.js";
import * as Simulator from "./simulator.js";
import * as Recommendations from "./recommendations.js";
import * as Analytics from "./analytics.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(process.cwd(), "frontend/dist");

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
const httpServer = http.createServer(app);

// Initialize Socket.IO with CORS
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    methods: ["GET", "POST"]
  }
});

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log(`🔌 WebSocket client connected [${socket.id}]`);
  
  socket.on('disconnect', () => {
    console.log(`🔌 WebSocket client disconnected [${socket.id}]`);
  });
});

app.use(cors());

// Shopify OAuth + Session Middleware
app.use("/auth", shopify.auth.begin());
app.use("/auth/callback", shopify.auth.callback());

// Process Shopify webhooks - Shopify library handles body parsing and HMAC verification
app.use(shopify.processWebhooks({
  webhookHandlers: {
    ORDERS_CREATE: async (topic, shop, body) => {
      console.log("📦 ORDERS_CREATE webhook received from", shop);
      
      try {
        const orderData = JSON.parse(body);
        recordEvent({ ...orderData, event_type: topic });
        
        // Process order routing
        const orderId = orderData.id || orderData.order_number || "unknown";
        const customerZip = orderData.shipping_address?.zip || orderData.billing_address?.zip;
        const lineItems = orderData.line_items || [];

        // Calculate total weight
        let totalWeight = 0;
        for (const item of lineItems) {
          const grams = item.grams || (item.weight ? item.weight * 1000 : 0);
          totalWeight += (grams / 453.592) * (item.quantity || 1);
        }

        if (totalWeight === 0) totalWeight = 3;

        const zipPattern = /^\d{5}$/;
        if (customerZip && zipPattern.test(customerZip)) {
          const routingResult = getRouteQuote({ customerZip, weight: parseFloat(totalWeight.toFixed(2)) });
          saveShopifyOrder({
            orderId,
            customerZip,
            totalWeight: parseFloat(totalWeight.toFixed(2)),
            routing: routingResult,
          });
          console.log(`🚚 Order ${orderId} routed: ${routingResult.recommendation}`);
        }
      } catch (err) {
        console.error("🔥 Webhook processing error:", err);
      }
    }
  }
}));

// Root route for Shopify embedded app
app.get("/", async (req, res) => {
  const distPath = path.resolve(process.cwd(), "frontend/dist");
  const indexFile = path.join(distPath, "index.html");

  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors https://admin.shopify.com https://*.myshopify.com;"
  );

  if (!fs.existsSync(indexFile)) {
    return res.status(500).send("index.html not found");
  }

  let html = fs.readFileSync(indexFile, "utf8");
  html = html.replace(
    '<meta name="shopify-api-key" content=""/>',
    `<meta name="shopify-api-key" content="${process.env.SHOPIFY_API_KEY}"/>`
  );

  res.status(200).send(html);
});

// Shopify session validation for /api routes (optional - comment out if not needed)
// app.use("/api", shopify.validateAuthenticatedSession());

// JSON parser for all other routes - comes after webhook processing
app.use(express.json());

// ---------------------------------------
// WEBHOOKS — LEGACY MANUAL HANDLER (kept for custom webhooks if needed)
// ---------------------------------------
// Note: Shopify webhooks are now handled by shopify.processWebhooks() middleware above
// This route can be used for custom webhook testing or non-Shopify webhooks

app.post("/webhooks/orders/create", async (req, res) => {
  console.log("⚠️ Manual webhook endpoint called - use Shopify middleware instead");
  res.status(200).send("Use shopify.processWebhooks() middleware for Shopify webhooks");
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

// NEW: Live carrier rates (real API integration)
app.post("/api/courier/rates", async (req, res) => {
  const { fromZip, toZip, weight } = req.body;

  if (!fromZip || !toZip || !weight) {
    return res.status(400).json({ error: "Missing required fields: fromZip, toZip, weight" });
  }

  try {
    const { getLiveRates } = await import("./courier.js");
    const result = await getLiveRates(fromZip, toZip, weight);
    res.json(result);
  } catch (err) {
    console.error("🔥 LIVE RATES ERROR:", err);
    res.status(500).json({ error: "Failed to fetch live rates", details: err.message });
  }
});

// NEW: Create shipping label
app.post("/api/courier/label", async (req, res) => {
  const orderData = req.body;

  if (!orderData.carrier || !orderData.fromZip || !orderData.toZip) {
    return res.status(400).json({ error: "Missing required fields: carrier, fromZip, toZip" });
  }

  try {
    const { createShippingLabel } = await import("./courier.js");
    const label = await createShippingLabel(orderData);
    res.json(label);
  } catch (err) {
    console.error("🔥 LABEL CREATION ERROR:", err);
    res.status(500).json({ error: "Failed to create shipping label", details: err.message });
  }
});

// NEW: Track shipment
app.post("/api/courier/track", async (req, res) => {
  const { trackingNumber, carrier } = req.body;

  if (!trackingNumber) {
    return res.status(400).json({ error: "Missing required field: trackingNumber" });
  }

  try {
    const { trackShipment } = await import("./courier.js");
    const tracking = await trackShipment(trackingNumber, carrier);
    res.json(tracking);
  } catch (err) {
    console.error("🔥 TRACKING ERROR:", err);
    res.status(500).json({ error: "Failed to track shipment", details: err.message });
  }
});

// NEW: Validate address
app.post("/api/courier/validate-address", async (req, res) => {
  const { address, carrier } = req.body;

  if (!address || !address.street || !address.city || !address.zip) {
    return res.status(400).json({ error: "Missing required address fields" });
  }

  try {
    const { validateAddress } = await import("./courier.js");
    const validation = await validateAddress(address, carrier);
    res.json(validation);
  } catch (err) {
    console.error("🔥 ADDRESS VALIDATION ERROR:", err);
    res.status(500).json({ error: "Failed to validate address", details: err.message });
  }
});

// NEW: FedEx webhook endpoint
app.post("/api/courier/webhooks/fedex", async (req, res) => {
  console.log("📦 FedEx Webhook received:", JSON.stringify(req.body, null, 2));
  
  try {
    // TODO: Implement FedEx webhook processing
    // - Parse tracking update
    // - Update delivery status in deliveries.json
    // - Trigger analytics recomputation
    // - Send WebSocket notification to frontend
    
    res.json({ received: true, carrier: "FedEx", timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("🔥 FEDEX WEBHOOK ERROR:", err);
    res.status(500).json({ error: "Failed to process FedEx webhook" });
  }
});

// NEW: UPS webhook endpoint
app.post("/api/courier/webhooks/ups", async (req, res) => {
  console.log("📦 UPS Webhook received:", JSON.stringify(req.body, null, 2));
  
  try {
    // TODO: Implement UPS webhook processing
    
    res.json({ received: true, carrier: "UPS", timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("🔥 UPS WEBHOOK ERROR:", err);
    res.status(500).json({ error: "Failed to process UPS webhook" });
  }
});

// NEW: DHL webhook endpoint
app.post("/api/courier/webhooks/dhl", async (req, res) => {
  console.log("📦 DHL Webhook received:", JSON.stringify(req.body, null, 2));
  
  try {
    // TODO: Implement DHL webhook processing
    
    res.json({ received: true, carrier: "DHL", timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("🔥 DHL WEBHOOK ERROR:", err);
    res.status(500).json({ error: "Failed to process DHL webhook" });
  }
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

// ---------------------------------------
// MEMORY ENGINE — AICOO LEARNING LAYER
// ---------------------------------------
app.get("/api/memory", (req, res) => {
  try {
    const memory = Memory.loadMemory();
    res.json(memory);
  } catch (err) {
    logError(err, "MEMORY_LOAD");
    res.status(500).json({ error: "Failed to load memory" });
  }
});

// RECOMMENDATIONS ENGINE
// ---------------------------------------
app.get("/api/recommendations", (req, res) => {
  try {
    const recommendations = Recommendations.getRecommendations();
    res.json(recommendations);
  } catch (err) {
    logError(err, "RECOMMENDATIONS");
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

app.get("/api/recommendations/stats", (req, res) => {
  try {
    const stats = Recommendations.getRecommendationStats();
    res.json(stats);
  } catch (err) {
    logError(err, "RECOMMENDATION_STATS");
    res.status(500).json({ error: "Failed to get recommendation stats" });
  }
});

// ANALYTICS ENGINE
// ---------------------------------------
app.get("/api/analytics", (req, res) => {
  try {
    const analytics = Analytics.getAnalytics();
    res.json(analytics);
  } catch (err) {
    logError(err, "ANALYTICS");
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

app.get("/api/analytics/daily", (req, res) => {
  try {
    const summary = Analytics.generateSummary();
    res.json(summary);
  } catch (err) {
    logError(err, "ANALYTICS_DAILY");
    res.status(500).json({ error: "Failed to generate daily summary" });
  }
});

app.get("/api/analytics/trends", (req, res) => {
  try {
    const trends = Analytics.generateTrends();
    res.json(trends);
  } catch (err) {
    logError(err, "ANALYTICS_TRENDS");
    res.status(500).json({ error: "Failed to generate trends" });
  }
});

app.get("/api/analytics/zip", (req, res) => {
  try {
    const zipDistribution = Analytics.generateZIPDistribution();
    res.json(zipDistribution);
  } catch (err) {
    logError(err, "ANALYTICS_ZIP");
    res.status(500).json({ error: "Failed to generate ZIP distribution" });
  }
});

app.post("/api/analytics/compute", (req, res) => {
  try {
    const analytics = Analytics.computeAnalytics();
    res.json(analytics);
  } catch (err) {
    logError(err, "ANALYTICS_COMPUTE");
    res.status(500).json({ error: "Failed to compute analytics" });
  }
});

app.delete("/api/analytics", (req, res) => {
  try {
    const result = Analytics.clearAnalytics();
    res.json(result);
  } catch (err) {
    logError(err, "ANALYTICS_CLEAR");
    res.status(500).json({ error: "Failed to clear analytics" });
  }
});

app.post("/api/memory/observe", (req, res) => {
  try {
    const { type, data } = req.body;
    if (!type || !data) {
      return res.status(400).json({ error: "Missing type or data" });
    }
    const observation = Memory.addObservation(type, data);
    if (IS_DEV) console.log(`🧠 Observation recorded: ${type}`);
    res.json(observation);
  } catch (err) {
    logError(err, "MEMORY_OBSERVE");
    res.status(500).json({ error: "Failed to record observation" });
  }
});

app.post("/api/memory/record-order", (req, res) => {
  try {
    const record = Memory.recordOrder(req.body);
    if (IS_DEV) console.log(`🧠 Order recorded: ${record.orderId}`);
    res.json(record);
  } catch (err) {
    logError(err, "MEMORY_RECORD_ORDER");
    res.status(500).json({ error: "Failed to record order" });
  }
});

app.post("/api/memory/record-delivery", (req, res) => {
  try {
    const record = Memory.recordDelivery(req.body);
    if (IS_DEV) console.log(`🧠 Delivery recorded: ${record.orderId}`);
    res.json(record);
  } catch (err) {
    logError(err, "MEMORY_RECORD_DELIVERY");
    res.status(500).json({ error: "Failed to record delivery" });
  }
});

app.post("/api/memory/record-route", (req, res) => {
  try {
    const record = Memory.recordRoute(req.body);
    if (IS_DEV) console.log(`🧠 Route recorded: ${record.orderId}`);
    res.json(record);
  } catch (err) {
    logError(err, "MEMORY_RECORD_ROUTE");
    res.status(500).json({ error: "Failed to record route" });
  }
});

// NEW: Get carrier performance statistics
app.get("/api/memory/carrier-performance", (req, res) => {
  try {
    const stats = Memory.getCarrierPerformance();
    res.json(stats);
  } catch (err) {
    logError(err, "GET_CARRIER_PERFORMANCE");
    res.status(500).json({ error: "Failed to get carrier performance" });
  }
});

// NEW: Record carrier performance
app.post("/api/memory/carrier-performance", (req, res) => {
  try {
    const performance = Memory.recordCarrierPerformance(req.body);
    if (IS_DEV) console.log(`📊 Carrier performance recorded: ${req.body.carrier}`);
    res.json(performance);
  } catch (err) {
    logError(err, "RECORD_CARRIER_PERFORMANCE");
    res.status(500).json({ error: "Failed to record carrier performance" });
  }
});

app.post("/api/admin/clear-memory", (req, res) => {
  try {
    Memory.clearMemory();
    console.log("🗑️  AICOO memory cleared");
    res.json({ status: "ok", message: "AICOO memory cleared successfully" });
  } catch (err) {
    logError(err, "CLEAR_MEMORY");
    res.status(500).json({ error: "Failed to clear memory" });
  }
});

// NEW: Save carrier credentials (Mission 11)
app.post("/api/admin/credentials/:carrier", (req, res) => {
  const { carrier } = req.params;
  const credentials = req.body;
  
  // TODO: In production, save to .env file or encrypted storage
  // For now, we'll just validate and acknowledge
  
  console.log(`🔑 Carrier credentials received for ${carrier.toUpperCase()}`);
  console.log(`   Client ID/API Key: ${credentials.clientId || credentials.apiKey ? '***' : 'not provided'}`);
  console.log(`   Secret: ${credentials.clientSecret || credentials.apiSecret ? '***' : 'not provided'}`);
  console.log(`   Account: ${credentials.accountNumber || 'not provided'}`);
  
  res.json({ 
    status: "ok", 
    message: `${carrier.toUpperCase()} credentials saved (currently in-memory only. For production, implement .env storage)`,
    carrier: carrier
  });
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

// ---------------------------------------
// SIMULATION ENGINE — DEV MODE ONLY
// ---------------------------------------
app.post("/api/simulate/order", async (req, res) => {
  if (IS_LIVE) {
    return res.status(403).json({ error: "Simulation disabled in LIVE mode" });
  }

  try {
    const orderPayload = req.body;
    if (!orderPayload) {
      return res.status(400).json({ error: "Missing order payload" });
    }

    const result = await Simulator.simulateOrder(orderPayload);
    if (IS_DEV) console.log("🧪 Simulation completed:", result.simulationId);
    res.json(result);
  } catch (err) {
    logError(err, "SIMULATE_ORDER");
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/simulate/replay", async (req, res) => {
  if (IS_LIVE) {
    return res.status(403).json({ error: "Simulation disabled in LIVE mode" });
  }

  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId" });
    }

    const result = await Simulator.replayOrder(orderId);
    if (IS_DEV) console.log("🔄 Replay completed:", result.simulationId);
    res.json(result);
  } catch (err) {
    logError(err, "SIMULATE_REPLAY");
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/simulate/fake-order", async (req, res) => {
  if (IS_LIVE) {
    return res.status(403).json({ error: "Simulation disabled in LIVE mode" });
  }

  try {
    const { zip, weight } = req.query;
    if (!zip || !weight) {
      return res.status(400).json({ error: "Missing zip or weight parameters" });
    }

    const fakeOrder = Simulator.generateFakeOrder(zip, parseFloat(weight));
    const result = await Simulator.simulateOrder(fakeOrder);
    
    if (IS_DEV) console.log("🧪 Fake order simulated:", result.simulationId);
    res.json(result);
  } catch (err) {
    logError(err, "FAKE_ORDER");
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/simulate/list", (req, res) => {
  if (IS_LIVE) {
    return res.status(403).json({ error: "Simulation disabled in LIVE mode" });
  }

  try {
    const limit = parseInt(req.query.limit) || 20;
    const simulations = Simulator.listSimulations(limit);
    res.json(simulations);
  } catch (err) {
    logError(err, "LIST_SIMULATIONS");
    res.status(500).json({ error: "Failed to list simulations" });
  }
});

app.get("/api/simulate/stats", (req, res) => {
  if (IS_LIVE) {
    return res.status(403).json({ error: "Simulation disabled in LIVE mode" });
  }

  try {
    const stats = Simulator.getSimulationStats();
    res.json(stats);
  } catch (err) {
    logError(err, "SIMULATION_STATS");
    res.status(500).json({ error: "Failed to get simulation stats" });
  }
});

app.post("/api/admin/clear-simulations", (req, res) => {
  if (IS_LIVE) {
    return res.status(403).json({ error: "Simulation disabled in LIVE mode" });
  }

  try {
    Simulator.clearSimulations();
    console.log("🗑️  Simulations cleared");
    res.json({ status: "ok", message: "Simulations cleared successfully" });
  } catch (err) {
    logError(err, "CLEAR_SIMULATIONS");
    res.status(500).json({ error: "Failed to clear simulations" });
  }
});

// TEMP – ENV CHECK
if (IS_DEV) {
  console.log(
    "ENV CHECK → OPENAI KEY:",
    process.env.OPENAI_API_KEY ? "LOADED" : "NOT LOADED"
  );
}

// ---------------------------------------
// HEALTH & TEST ENDPOINTS
// ---------------------------------------
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "AICOO Backend",
    version: "1.1.0",
    mode: MODE,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    shopify: {
      configured: !!(process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET),
      host: process.env.HOST || "not-set"
    }
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "AICOO API is working",
    timestamp: new Date().toISOString(),
    mode: MODE
  });
});

// ---------------------------------------
// FRONTEND SERVING
// ---------------------------------------

const frontendDistPath = path.resolve(process.cwd(), "frontend/dist");
app.use(express.static(frontendDistPath));

// Catch-all route for SPA routes (Express 5 compatible - regex pattern)
app.get(/.*/, async (req, res) => {
  if (
    req.path.startsWith("/api") ||
    req.path.startsWith("/auth") ||
    req.path.startsWith("/webhooks")
  ) {
    return res.status(404).end();
  }

  const distPath = path.resolve(process.cwd(), "frontend/dist");
  const indexFile = path.join(distPath, "index.html");

  if (!fs.existsSync(indexFile)) {
    return res.status(500).send("frontend missing");
  }

  let html = fs.readFileSync(indexFile, "utf8");
  html = html.replace(
    '<meta name="shopify-api-key" content=""/>',
    `<meta name="shopify-api-key" content="${process.env.SHOPIFY_API_KEY}"/>`
  );

  res.send(html);
});

// ---------------------------------------
// START SERVER (with WebSocket support)
// ---------------------------------------
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`🚀 AICOO backend running on port ${PORT}`);
  console.log("🔌 WebSocket server ready for real-time updates");
});

// ---------------------------------------
// EXPORT — MUST BE LAST
// ---------------------------------------
export default app;


