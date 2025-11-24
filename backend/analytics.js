// =======================================
// AICOO™ Analytics Engine
// =======================================
// Intelligent analytics, insights, forecasting, and predictions

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORDERS_PATH = path.join(__dirname, "data", "orders.json");
const DELIVERIES_PATH = path.join(__dirname, "data", "deliveries.json");
const ROUTES_PATH = path.join(__dirname, "data", "routes.json");
const MEMORY_PATH = path.join(__dirname, "data", "memory.json");

// ---------------------------------------
// DATA LOADING
// ---------------------------------------

function loadJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error loading ${filePath}:`, err);
    return [];
  }
}

function loadOrders() {
  return loadJSON(ORDERS_PATH);
}

function loadDeliveries() {
  return loadJSON(DELIVERIES_PATH);
}

function loadRoutes() {
  return loadJSON(ROUTES_PATH);
}

function loadMemory() {
  try {
    if (!fs.existsSync(MEMORY_PATH)) {
      return { observations: [], orders: [], deliveries: [], routes: [], analytics: {} };
    }
    const data = fs.readFileSync(MEMORY_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return { observations: [], orders: [], deliveries: [], routes: [], analytics: {} };
  }
}

function saveMemory(memory) {
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(memory, null, 2), "utf8");
}

// ---------------------------------------
// ANALYTICS FUNCTIONS
// ---------------------------------------

export function analyzeOrders(orders) {
  if (!orders || orders.length === 0) {
    return {
      total: 0,
      today: 0,
      avgValue: 0,
      topZIPs: [],
      totalValue: 0
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.timestamp?.startsWith(today));
  
  const zipCounts = {};
  let totalValue = 0;

  orders.forEach(order => {
    const zip = order.customerZip || order.shipping_address?.zip;
    if (zip) {
      zipCounts[zip] = (zipCounts[zip] || 0) + 1;
    }
    totalValue += parseFloat(order.total_price || order.totalPrice || 0);
  });

  const topZIPs = Object.entries(zipCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([zip, count]) => ({ zip, count }));

  return {
    total: orders.length,
    today: todayOrders.length,
    avgValue: orders.length > 0 ? totalValue / orders.length : 0,
    totalValue,
    topZIPs
  };
}

export function analyzeDeliveries(deliveries) {
  if (!deliveries || deliveries.length === 0) {
    return {
      total: 0,
      today: 0,
      avgCost: 0,
      totalCost: 0,
      byService: {},
      byType: { ride: 0, courier: 0 },
      safeModeCount: 0
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const todayDeliveries = deliveries.filter(d => d.timestamp?.startsWith(today));
  
  const byService = {};
  const byType = { ride: 0, courier: 0 };
  let totalCost = 0;
  let safeModeCount = 0;

  deliveries.forEach(delivery => {
    const service = delivery.service || delivery.method || 'Unknown';
    byService[service] = (byService[service] || 0) + 1;
    
    if (delivery.type === 'ride') byType.ride++;
    else if (delivery.type === 'courier') byType.courier++;
    
    totalCost += parseFloat(delivery.price || 0);
    
    if (delivery.safeMode) safeModeCount++;
  });

  return {
    total: deliveries.length,
    today: todayDeliveries.length,
    avgCost: deliveries.length > 0 ? totalCost / deliveries.length : 0,
    totalCost,
    byService,
    byType,
    safeModeCount,
    safeModeRate: deliveries.length > 0 ? (safeModeCount / deliveries.length * 100).toFixed(1) : 0
  };
}

export function analyzeRoutes(routes) {
  if (!routes || routes.length === 0) {
    return {
      total: 0,
      avgDistance: 0,
      courierPreferred: 0,
      ridePreferred: 0,
      slaughterhouseUsage: {}
    };
  }

  let totalDistance = 0;
  let courierPreferred = 0;
  let ridePreferred = 0;
  const slaughterhouseUsage = {};

  routes.forEach(route => {
    if (route.slaughterhouse?.distance) {
      totalDistance += route.slaughterhouse.distance;
    }
    
    if (route.bestMethod === 'courier') courierPreferred++;
    else if (route.bestMethod === 'ride') ridePreferred++;
    
    const shName = route.slaughterhouse?.name;
    if (shName) {
      slaughterhouseUsage[shName] = (slaughterhouseUsage[shName] || 0) + 1;
    }
  });

  return {
    total: routes.length,
    avgDistance: routes.length > 0 ? totalDistance / routes.length : 0,
    courierPreferred,
    ridePreferred,
    slaughterhouseUsage
  };
}

export function generateSummary() {
  const orders = loadOrders();
  const deliveries = loadDeliveries();
  const routes = loadRoutes();

  const orderAnalytics = analyzeOrders(orders);
  const deliveryAnalytics = analyzeDeliveries(deliveries);
  const routeAnalytics = analyzeRoutes(routes);

  const warnings = [];
  if (deliveryAnalytics.safeModeRate > 20) {
    warnings.push(`⚠️ High safe mode usage: ${deliveryAnalytics.safeModeRate}%`);
  }
  if (orderAnalytics.today === 0 && orders.length > 0) {
    warnings.push(`📭 No orders received today`);
  }

  const recommendations = [];
  if (deliveryAnalytics.byType.ride > deliveryAnalytics.byType.courier) {
    recommendations.push(`Use ride-sharing for short distances (${deliveryAnalytics.byType.ride} rides vs ${deliveryAnalytics.byType.courier} couriers)`);
  }
  if (orderAnalytics.topZIPs.length > 0) {
    const topZIP = orderAnalytics.topZIPs[0];
    recommendations.push(`Focus on ${topZIP.zip} (${topZIP.count} orders)`);
  }
  if (deliveryAnalytics.avgCost > 10) {
    recommendations.push(`Avg delivery cost $${deliveryAnalytics.avgCost.toFixed(2)} - explore bulk discounts`);
  }

  return {
    timestamp: new Date().toISOString(),
    orders: orderAnalytics,
    deliveries: deliveryAnalytics,
    routes: routeAnalytics,
    warnings,
    recommendations,
    efficiency: calculateEfficiency(deliveryAnalytics, routeAnalytics)
  };
}

export function generatePredictions() {
  const deliveries = loadDeliveries();
  const orders = loadOrders();

  if (deliveries.length < 5) {
    return {
      tomorrowCost: 0,
      tomorrowOrders: 0,
      surgeWarnings: [],
      confidence: 'low'
    };
  }

  // Simple moving average prediction
  const recentDeliveries = deliveries.slice(-7);
  const avgCost = recentDeliveries.reduce((sum, d) => sum + parseFloat(d.price || 0), 0) / recentDeliveries.length;
  
  const recentOrders = orders.slice(-7);
  const avgOrdersPerDay = recentOrders.length / 7;

  const surgeWarnings = [];
  const uberCount = deliveries.filter(d => d.service === 'Uber').length;
  const lyftCount = deliveries.filter(d => d.service === 'Lyft').length;
  
  if (uberCount > lyftCount * 1.5) {
    surgeWarnings.push('Uber may experience surge pricing');
  }

  return {
    tomorrowCost: avgCost * 1.05, // 5% increase buffer
    tomorrowOrders: Math.ceil(avgOrdersPerDay),
    surgeWarnings,
    confidence: deliveries.length > 10 ? 'high' : 'medium',
    trend: avgCost > 8 ? 'increasing' : 'stable'
  };
}

export function generateZIPDistribution() {
  const orders = loadOrders();
  const deliveries = loadDeliveries();

  const zipData = {};

  orders.forEach(order => {
    const zip = order.customerZip || order.shipping_address?.zip;
    if (zip) {
      if (!zipData[zip]) {
        zipData[zip] = { orders: 0, deliveries: 0, totalCost: 0 };
      }
      zipData[zip].orders++;
    }
  });

  deliveries.forEach(delivery => {
    const zip = delivery.customerZip;
    if (zip) {
      if (!zipData[zip]) {
        zipData[zip] = { orders: 0, deliveries: 0, totalCost: 0 };
      }
      zipData[zip].deliveries++;
      zipData[zip].totalCost += parseFloat(delivery.price || 0);
    }
  });

  // Calculate hotness (orders + deliveries)
  const distribution = Object.entries(zipData)
    .map(([zip, data]) => ({
      zip,
      ...data,
      hotness: data.orders + data.deliveries,
      avgCost: data.deliveries > 0 ? data.totalCost / data.deliveries : 0
    }))
    .sort((a, b) => b.hotness - a.hotness);

  return distribution;
}

export function generateCourierStats() {
  const deliveries = loadDeliveries();
  const courierDeliveries = deliveries.filter(d => d.type === 'courier');

  const stats = {
    FedEx: { count: 0, totalCost: 0, avgCost: 0, avgDays: 0 },
    UPS: { count: 0, totalCost: 0, avgCost: 0, avgDays: 0 },
    DHL: { count: 0, totalCost: 0, avgCost: 0, avgDays: 0 }
  };

  courierDeliveries.forEach(delivery => {
    const service = delivery.service;
    if (stats[service]) {
      stats[service].count++;
      stats[service].totalCost += parseFloat(delivery.price || 0);
      stats[service].avgDays += parseInt(delivery.estimatedDays || 0);
    }
  });

  Object.keys(stats).forEach(service => {
    if (stats[service].count > 0) {
      stats[service].avgCost = stats[service].totalCost / stats[service].count;
      stats[service].avgDays = stats[service].avgDays / stats[service].count;
    }
  });

  return stats;
}

export function generateRideStats() {
  const deliveries = loadDeliveries();
  const rideDeliveries = deliveries.filter(d => d.type === 'ride');

  const stats = {
    Uber: { count: 0, totalCost: 0, avgCost: 0, avgSurge: 0 },
    Lyft: { count: 0, totalCost: 0, avgCost: 0, avgSurge: 0 }
  };

  rideDeliveries.forEach(delivery => {
    const service = delivery.service;
    if (stats[service]) {
      stats[service].count++;
      stats[service].totalCost += parseFloat(delivery.price || 0);
      stats[service].avgSurge += parseFloat(delivery.surgeMultiplier || 1);
    }
  });

  Object.keys(stats).forEach(service => {
    if (stats[service].count > 0) {
      stats[service].avgCost = stats[service].totalCost / stats[service].count;
      stats[service].avgSurge = stats[service].avgSurge / stats[service].count;
    }
  });

  return stats;
}

export function generateTrends() {
  const deliveries = loadDeliveries();
  const orders = loadOrders();

  // Get last 7 days of data
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayOrders = orders.filter(o => o.timestamp?.startsWith(dateStr));
    const dayDeliveries = deliveries.filter(d => d.timestamp?.startsWith(dateStr));
    const dayCost = dayDeliveries.reduce((sum, d) => sum + parseFloat(d.price || 0), 0);

    last7Days.push({
      date: dateStr,
      orders: dayOrders.length,
      deliveries: dayDeliveries.length,
      cost: dayCost,
      avgCost: dayDeliveries.length > 0 ? dayCost / dayDeliveries.length : 0
    });
  }

  return {
    last7Days,
    trend: calculateTrendDirection(last7Days)
  };
}

function calculateEfficiency(deliveryAnalytics, routeAnalytics) {
  if (deliveryAnalytics.total === 0) return 100;
  
  const safeModeScore = 100 - parseFloat(deliveryAnalytics.safeModeRate);
  const routingScore = routeAnalytics.total > 0 ? 100 : 80;
  
  return Math.round((safeModeScore + routingScore) / 2);
}

function calculateTrendDirection(last7Days) {
  if (last7Days.length < 2) return 'stable';
  
  const recent3 = last7Days.slice(-3);
  const previous3 = last7Days.slice(-6, -3);
  
  const recentAvg = recent3.reduce((sum, d) => sum + d.cost, 0) / 3;
  const previousAvg = previous3.reduce((sum, d) => sum + d.cost, 0) / 3;
  
  if (recentAvg > previousAvg * 1.1) return 'increasing';
  if (recentAvg < previousAvg * 0.9) return 'decreasing';
  return 'stable';
}

// ---------------------------------------
// MAIN ANALYTICS COMPUTATION
// ---------------------------------------

export function computeAnalytics() {
  const summary = generateSummary();
  const predictions = generatePredictions();
  const zipDistribution = generateZIPDistribution();
  const courierStats = generateCourierStats();
  const rideStats = generateRideStats();
  const trends = generateTrends();

  const analytics = {
    timestamp: new Date().toISOString(),
    summary,
    predictions,
    zipDistribution,
    courierInsights: courierStats,
    rideInsights: rideStats,
    trends,
    hotspots: zipDistribution.slice(0, 5).map(z => z.zip)
  };

  // Save to memory
  const memory = loadMemory();
  memory.analytics = analytics;
  saveMemory(memory);

  return analytics;
}

export function getAnalytics() {
  const memory = loadMemory();
  return memory.analytics || computeAnalytics();
}

export function clearAnalytics() {
  const memory = loadMemory();
  memory.analytics = {};
  saveMemory(memory);
  return { status: 'cleared' };
}
