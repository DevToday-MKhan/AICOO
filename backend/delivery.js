// =======================================
// AICOO™ Delivery Engine
// =======================================
// Assigns deliveries based on routing decisions
// Supports Uber, Lyft, FedEx, UPS, DHL

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as Memory from "./memory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DELIVERIES_PATH = path.join(__dirname, "data", "deliveries.json");

// ---------------------------------------
// STORAGE MANAGEMENT
// ---------------------------------------

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

function saveDelivery(delivery) {
  const deliveries = loadDeliveries();
  
  // Add unique ID and timestamp
  const deliveryRecord = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...delivery,
  };
  
  deliveries.push(deliveryRecord);
  
  // Keep only last 20 deliveries
  const trimmed = deliveries.slice(-20);
  
  fs.writeFileSync(DELIVERIES_PATH, JSON.stringify(trimmed, null, 2));
  
  return deliveryRecord;
}

export function getDeliveryHistory() {
  return loadDeliveries();
}

export function getLatestDelivery() {
  const deliveries = loadDeliveries();
  return deliveries.length > 0 ? deliveries[deliveries.length - 1] : null;
}

// ---------------------------------------
// DELIVERY ASSIGNMENT LOGIC
// ---------------------------------------

export function assignDelivery({ orderId, customerZip, weight, routing }) {
  if (!orderId || !customerZip || !weight) {
    throw new Error("Missing required fields: orderId, customerZip, weight");
  }

  let assignment = {
    orderId,
    customerZip,
    weight,
    safeMode: false
  };

  // SAFE MODE FALLBACK: If routing data is missing or invalid
  if (!routing || !routing.bestMethod || !routing.slaughterhouse) {
    console.warn(`⚠️  SAFE MODE activated for Order ${orderId} - routing data unavailable`);
    
    assignment.safeMode = true;
    assignment.method = "lyft";
    assignment.service = "Lyft";
    assignment.price = 7.99;
    assignment.eta = "5 min";
    assignment.estimatedMinutes = 5;
    assignment.surgeMultiplier = 1.0;
    assignment.type = "ride";
    assignment.slaughterhouse = {
      name: "Default Location",
      zip: customerZip,
      distance: 0
    };
    assignment.warning = "Safe mode fallback - routing engine unavailable";
    
    const saved = saveDelivery(assignment);
    
    // Record in AICOO memory
    Memory.recordDelivery(saved);
    Memory.addObservation("safe_mode_activated", { orderId, reason: "routing_unavailable" });
    
    console.log(`🛡️  SAFE MODE delivery assigned: Order ${orderId} → LYFT ($7.99)`);
    return saved;
  }

  const { bestMethod, courier, ride, slaughterhouse } = routing;

  assignment.slaughterhouse = {
    name: slaughterhouse.name,
    zip: slaughterhouse.zip,
    distance: slaughterhouse.distance,
  };

  try {
    // Assign based on routing recommendation
    if (bestMethod === "ride") {
      // Assign ride-sharing service (Uber or Lyft)
      const selectedService = ride.best.toLowerCase(); // "uber" or "lyft"
      const serviceData = ride[selectedService];
      
      if (!serviceData) {
        throw new Error("Ride data unavailable");
      }
      
      assignment.method = selectedService;
      assignment.service = serviceData.service;
      assignment.price = serviceData.price;
      assignment.eta = `${serviceData.estimatedMinutes} min`;
      assignment.estimatedMinutes = serviceData.estimatedMinutes;
      assignment.surgeMultiplier = serviceData.surgeMultiplier;
      assignment.type = "ride";
      
    } else if (bestMethod === "courier") {
      // Assign courier service (FedEx, UPS, or DHL)
      const selectedCarrier = courier.best.toLowerCase(); // "fedex", "ups", or "dhl"
      const carrierData = courier[selectedCarrier];
      
      if (!carrierData) {
        throw new Error("Courier data unavailable");
      }
      
      assignment.method = selectedCarrier;
      assignment.carrier = carrierData.carrier;
      assignment.price = carrierData.price;
      assignment.eta = `${carrierData.estimatedDays} ${carrierData.estimatedDays === 1 ? 'day' : 'days'}`;
      assignment.estimatedDays = carrierData.estimatedDays;
      assignment.type = "courier";
      
    } else {
      throw new Error(`Unknown delivery method: ${bestMethod}`);
    }

    // Save assignment to deliveries.json
    const saved = saveDelivery(assignment);
    
    // Record in AICOO memory
    Memory.recordDelivery(saved);
    
    console.log(`📦 Delivery assigned: Order ${orderId} → ${assignment.method.toUpperCase()} ($${assignment.price})`);
    return saved;
    
  } catch (err) {
    // SAFE MODE FALLBACK on any error
    console.error(`🔥 Delivery assignment error for Order ${orderId}:`, err.message);
    console.warn(`⚠️  SAFE MODE activated - falling back to default`);
    
    assignment.safeMode = true;
    assignment.method = "lyft";
    assignment.service = "Lyft";
    assignment.price = 7.99;
    assignment.eta = "5 min";
    assignment.estimatedMinutes = 5;
    assignment.surgeMultiplier = 1.0;
    assignment.type = "ride";
    assignment.warning = `Safe mode fallback - ${err.message}`;
    
    const saved = saveDelivery(assignment);
    
    // Record in AICOO memory
    Memory.recordDelivery(saved);
    Memory.addObservation("safe_mode_activated", { orderId, reason: err.message });
    
    console.log(`🛡️  SAFE MODE delivery assigned: Order ${orderId} → LYFT ($7.99)`);
    return saved;
  }
}
