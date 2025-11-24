import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEMORY_FILE = path.join(__dirname, "data", "memory.json");
const MAX_OBSERVATIONS = 50;
const MAX_RECORDS = 50;

/**
 * AICOO Memory Engine
 * Persistent learning and intelligence layer for operational insights
 */

// Load memory from disk
export function loadMemory() {
  try {
    if (!fs.existsSync(MEMORY_FILE)) {
      const initialMemory = {
        observations: [],
        orders: [],
        routes: [],
        deliveries: [],
        analytics: {
          totalOrders: 0,
          totalDeliveries: 0,
          totalRoutes: 0,
          avgDeliveryPrice: 0,
          commonCarrier: null,
          commonService: null,
        },
      };
      fs.writeFileSync(MEMORY_FILE, JSON.stringify(initialMemory, null, 2));
      return initialMemory;
    }
    const data = fs.readFileSync(MEMORY_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Memory load error:", error.message);
    return {
      observations: [],
      orders: [],
      routes: [],
      deliveries: [],
      analytics: {},
    };
  }
}

// Save memory to disk
export function saveMemory(memory) {
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
    return true;
  } catch (error) {
    console.error("❌ Memory save error:", error.message);
    return false;
  }
}

// Add observation with sliding window (keep last 50)
export function addObservation(type, data) {
  const memory = loadMemory();
  const observation = {
    type,
    data,
    timestamp: new Date().toISOString(),
  };

  memory.observations.push(observation);

  // Keep only last MAX_OBSERVATIONS
  if (memory.observations.length > MAX_OBSERVATIONS) {
    memory.observations = memory.observations.slice(-MAX_OBSERVATIONS);
  }

  saveMemory(memory);
  return observation;
}

// Record order (from routing)
export function recordOrder(orderData) {
  const memory = loadMemory();
  const record = {
    orderId: orderData.orderId || orderData.id,
    customerZip: orderData.customerZip,
    totalWeight: orderData.totalWeight,
    totalPrice: orderData.totalPrice,
    lineItems: orderData.lineItems?.length || 0,
    timestamp: new Date().toISOString(),
  };

  memory.orders.push(record);

  // Keep sliding window
  if (memory.orders.length > MAX_RECORDS) {
    memory.orders = memory.orders.slice(-MAX_RECORDS);
  }

  // Update analytics
  memory.analytics.totalOrders = (memory.analytics.totalOrders || 0) + 1;

  saveMemory(memory);
  return record;
}

// Record route decision
export function recordRoute(routeData) {
  const memory = loadMemory();
  const record = {
    orderId: routeData.orderId,
    slaughterhouse: routeData.slaughterhouse?.name || "Unknown",
    distance: routeData.distance,
    duration: routeData.duration,
    reason: routeData.reason || "Auto-selected",
    timestamp: new Date().toISOString(),
  };

  memory.routes.push(record);

  // Keep sliding window
  if (memory.routes.length > MAX_RECORDS) {
    memory.routes = memory.routes.slice(-MAX_RECORDS);
  }

  // Update analytics
  memory.analytics.totalRoutes = (memory.analytics.totalRoutes || 0) + 1;

  saveMemory(memory);
  return record;
}

// Record delivery assignment
export function recordDelivery(deliveryData) {
  const memory = loadMemory();
  const record = {
    orderId: deliveryData.orderId,
    type: deliveryData.type, // "courier" or "ride"
    service: deliveryData.service || deliveryData.carrier,
    price: deliveryData.price,
    eta: deliveryData.eta,
    safeMode: deliveryData.safeMode || false,
    timestamp: new Date().toISOString(),
  };

  memory.deliveries.push(record);

  // Keep sliding window
  if (memory.deliveries.length > MAX_RECORDS) {
    memory.deliveries = memory.deliveries.slice(-MAX_RECORDS);
  }

  // Update analytics
  memory.analytics.totalDeliveries = (memory.analytics.totalDeliveries || 0) + 1;

  // Calculate average delivery price
  const prices = memory.deliveries.map((d) => d.price);
  memory.analytics.avgDeliveryPrice = (
    prices.reduce((sum, p) => sum + p, 0) / prices.length
  ).toFixed(2);

  // Find most common carrier/service
  const serviceCounts = {};
  memory.deliveries.forEach((d) => {
    const key = d.service || d.carrier || "Unknown";
    serviceCounts[key] = (serviceCounts[key] || 0) + 1;
  });
  const mostCommon = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];
  memory.analytics.commonService = mostCommon ? mostCommon[0] : null;

  saveMemory(memory);
  return record;
}

// Get recent observations
export function getRecentObservations(limit = 10) {
  const memory = loadMemory();
  return memory.observations.slice(-limit).reverse();
}

// Get recent orders
export function getRecentOrders(limit = 10) {
  const memory = loadMemory();
  return memory.orders.slice(-limit).reverse();
}

// Get recent deliveries
export function getRecentDeliveries(limit = 10) {
  const memory = loadMemory();
  return memory.deliveries.slice(-limit).reverse();
}

// Get recent routes
export function getRecentRoutes(limit = 10) {
  const memory = loadMemory();
  return memory.routes.slice(-limit).reverse();
}

// Get analytics summary
export function getAnalytics() {
  const memory = loadMemory();
  return memory.analytics;
}

// Update analytics (called after routing, delivery, simulation, webhook)
export async function updateAnalytics() {
  try {
    const { computeAnalytics } = await import('./analytics.js');
    return computeAnalytics();
  } catch (err) {
    console.error('Analytics update failed:', err.message);
    return null;
  }
}

// Clear all memory (admin only)
export function clearMemory() {
  const freshMemory = {
    observations: [],
    orders: [],
    routes: [],
    deliveries: [],
    analytics: {
      totalOrders: 0,
      totalDeliveries: 0,
      totalRoutes: 0,
      avgDeliveryPrice: 0,
      commonCarrier: null,
      commonService: null,
    },
  };
  saveMemory(freshMemory);
  return freshMemory;
}
