// =======================================
// AICOO™ Smart Recommendations Engine
// =======================================
// Analyzes delivery patterns to provide cost-saving insights

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as Memory from "./memory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DELIVERIES_PATH = path.join(__dirname, "data", "deliveries.json");

/**
 * Load delivery history
 */
function loadDeliveries() {
  try {
    if (!fs.existsSync(DELIVERIES_PATH)) {
      return [];
    }
    const data = fs.readFileSync(DELIVERIES_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error loading deliveries:", err);
    return [];
  }
}

/**
 * Analyze delivery patterns and generate insights
 */
export function getRecommendations() {
  const deliveries = loadDeliveries();
  const memory = Memory.loadMemory();
  const recommendations = [];

  if (deliveries.length === 0) {
    return [{
      type: "info",
      title: "No Data Yet",
      message: "Process a few deliveries to receive personalized recommendations.",
      priority: "low"
    }];
  }

  // Analyze service usage patterns
  const serviceUsage = {};
  const zipCodes = {};
  const timeSlots = {};
  let totalCost = 0;
  let rideCost = 0;
  let courierCost = 0;
  let rideCount = 0;
  let courierCount = 0;

  deliveries.forEach(delivery => {
    // Service usage
    const service = delivery.service || delivery.method;
    serviceUsage[service] = (serviceUsage[service] || 0) + 1;

    // Zip code analysis
    if (delivery.customerZip) {
      if (!zipCodes[delivery.customerZip]) {
        zipCodes[delivery.customerZip] = { count: 0, totalCost: 0, services: {} };
      }
      zipCodes[delivery.customerZip].count++;
      zipCodes[delivery.customerZip].totalCost += parseFloat(delivery.price || 0);
      zipCodes[delivery.customerZip].services[service] = 
        (zipCodes[delivery.customerZip].services[service] || 0) + 1;
    }

    // Time slot analysis
    if (delivery.timestamp) {
      const hour = new Date(delivery.timestamp).getHours();
      const timeSlot = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      if (!timeSlots[timeSlot]) {
        timeSlots[timeSlot] = { count: 0, totalCost: 0 };
      }
      timeSlots[timeSlot].count++;
      timeSlots[timeSlot].totalCost += parseFloat(delivery.price || 0);
    }

    // Cost analysis
    const cost = parseFloat(delivery.price || 0);
    totalCost += cost;
    
    if (delivery.type === 'ride') {
      rideCost += cost;
      rideCount++;
    } else {
      courierCost += cost;
      courierCount++;
    }
  });

  const avgCost = totalCost / deliveries.length;
  const avgRideCost = rideCount > 0 ? rideCost / rideCount : 0;
  const avgCourierCost = courierCount > 0 ? courierCost / courierCount : 0;

  // Recommendation 1: Service Cost Comparison
  if (rideCount > 0 && courierCount > 0) {
    const savings = Math.abs(avgRideCost - avgCourierCost);
    const cheaper = avgRideCost < avgCourierCost ? 'ride-sharing' : 'courier';
    const percentage = ((savings / Math.max(avgRideCost, avgCourierCost)) * 100).toFixed(1);
    
    recommendations.push({
      type: "cost",
      title: `${cheaper === 'ride-sharing' ? 'Ride-sharing' : 'Courier'} services are ${percentage}% cheaper`,
      message: `Average ${cheaper} cost: $${(cheaper === 'ride-sharing' ? avgRideCost : avgCourierCost).toFixed(2)} vs $${(cheaper === 'ride-sharing' ? avgCourierCost : avgRideCost).toFixed(2)}. Consider using ${cheaper} more often.`,
      priority: "high",
      savings: `$${savings.toFixed(2)} per delivery`
    });
  }

  // Recommendation 2: High-frequency zip codes
  const topZips = Object.entries(zipCodes)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);

  if (topZips.length > 0 && topZips[0][1].count >= 3) {
    const [zip, data] = topZips[0];
    const avgZipCost = data.totalCost / data.count;
    const bestService = Object.entries(data.services)
      .sort((a, b) => b[1] - a[1])[0][0];

    recommendations.push({
      type: "pattern",
      title: `Frequent deliveries to ${zip}`,
      message: `You've shipped to ${zip} ${data.count} times (avg cost: $${avgZipCost.toFixed(2)}). Most used: ${bestService}. Consider negotiating bulk rates.`,
      priority: "medium"
    });
  }

  // Recommendation 3: Time-based optimization
  if (Object.keys(timeSlots).length > 1) {
    const cheapestSlot = Object.entries(timeSlots)
      .sort((a, b) => (a[1].totalCost / a[1].count) - (b[1].totalCost / b[1].count))[0];
    
    const [slot, data] = cheapestSlot;
    const avgSlotCost = data.totalCost / data.count;
    
    if (avgSlotCost < avgCost * 0.9) { // 10% cheaper
      const savings = avgCost - avgSlotCost;
      recommendations.push({
        type: "timing",
        title: `Ship in the ${slot} to save money`,
        message: `${slot.charAt(0).toUpperCase() + slot.slice(1)} deliveries average $${avgSlotCost.toFixed(2)}, saving $${savings.toFixed(2)} per delivery.`,
        priority: "medium",
        savings: `$${savings.toFixed(2)} per delivery`
      });
    }
  }

  // Recommendation 4: Safe mode alerts
  const safeModeDeliveries = deliveries.filter(d => d.safeMode);
  if (safeModeDeliveries.length > 0) {
    const safeModePercent = ((safeModeDeliveries.length / deliveries.length) * 100).toFixed(1);
    recommendations.push({
      type: "warning",
      title: `${safeModePercent}% of deliveries used Safe Mode fallback`,
      message: `${safeModeDeliveries.length} deliveries couldn't use optimal routing. Check your routing configuration to reduce costs.`,
      priority: "high"
    });
  }

  // Recommendation 5: Volume discount opportunities
  if (deliveries.length >= 10) {
    const weeklyAvg = deliveries.length / 4; // Assuming 4 weeks of data
    if (weeklyAvg >= 5) {
      recommendations.push({
        type: "opportunity",
        title: "Volume discount eligibility",
        message: `You're averaging ${weeklyAvg.toFixed(1)} deliveries per week. Contact carriers about volume discounts (typically 10-15% off).`,
        priority: "medium",
        savings: "Est. $" + (totalCost * 0.12).toFixed(2) + " potential savings"
      });
    }
  }

  // Recommendation 6: Service diversity
  const uniqueServices = Object.keys(serviceUsage).length;
  if (uniqueServices === 1 && deliveries.length >= 5) {
    recommendations.push({
      type: "optimization",
      title: "Limited service usage detected",
      message: `You're only using ${Object.keys(serviceUsage)[0]}. Try comparing multiple services to find better rates.`,
      priority: "low"
    });
  }

  // Sort by priority
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

/**
 * Get summary stats for recommendations
 */
export function getRecommendationStats() {
  const deliveries = loadDeliveries();
  const memory = Memory.loadMemory();

  let totalCost = 0;
  let totalSavings = 0;
  let optimalChoices = 0;

  deliveries.forEach(delivery => {
    totalCost += parseFloat(delivery.price || 0);
    
    // Count optimal routing decisions (non-safe-mode)
    if (!delivery.safeMode) {
      optimalChoices++;
    }
  });

  const avgCost = deliveries.length > 0 ? totalCost / deliveries.length : 0;
  const optimizationRate = deliveries.length > 0 
    ? ((optimalChoices / deliveries.length) * 100).toFixed(1)
    : 0;

  return {
    totalDeliveries: deliveries.length,
    totalCost: totalCost.toFixed(2),
    avgCost: avgCost.toFixed(2),
    optimizationRate: `${optimizationRate}%`,
    potentialSavings: (totalCost * 0.15).toFixed(2) // Conservative 15% estimate
  };
}
