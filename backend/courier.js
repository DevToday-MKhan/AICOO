import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as fedex from "./carriers/fedex.js";
import * as ups from "./carriers/ups.js";
import * as dhl from "./carriers/dhl.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COURIER_PATH = path.join(__dirname, "data", "courier.json");

function loadQuotes() {
  try {
    const raw = fs.readFileSync(COURIER_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveQuote(quote) {
  const quotes = loadQuotes();
  quotes.push({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...quote,
  });
  
  // Keep only last 10
  const trimmed = quotes.slice(-10);
  fs.writeFileSync(COURIER_PATH, JSON.stringify(trimmed, null, 2), "utf8");
}

// Mock FedEx API (Legacy - kept for backward compatibility)
export function getFedExQuote(fromZip, toZip, weight) {
  // Simulate pricing logic
  const baseRate = 12.5;
  const weightFactor = weight * 0.8;
  const distanceFactor = Math.abs(parseInt(toZip) - parseInt(fromZip)) * 0.001;
  
  return {
    carrier: "FedEx",
    price: parseFloat((baseRate + weightFactor + distanceFactor).toFixed(2)),
    estimatedDays: 2,
  };
}

// Mock UPS API (Legacy - kept for backward compatibility)
export function getUPSQuote(fromZip, toZip, weight) {
  const baseRate = 13.0;
  const weightFactor = weight * 0.75;
  const distanceFactor = Math.abs(parseInt(toZip) - parseInt(fromZip)) * 0.0012;
  
  return {
    carrier: "UPS",
    price: parseFloat((baseRate + weightFactor + distanceFactor).toFixed(2)),
    estimatedDays: 3,
  };
}

// Mock DHL API (Legacy - kept for backward compatibility)
export function getDHLQuote(fromZip, toZip, weight) {
  const baseRate = 14.5;
  const weightFactor = weight * 0.85;
  const distanceFactor = Math.abs(parseInt(toZip) - parseInt(fromZip)) * 0.0008;
  
  return {
    carrier: "DHL",
    price: parseFloat((baseRate + weightFactor + distanceFactor).toFixed(2)),
    estimatedDays: 4,
  };
}

/**
 * Get live shipping rates from all carriers (NEW - Real API Integration)
 * @param {string} fromZip - Origin ZIP code
 * @param {string} toZip - Destination ZIP code
 * @param {number} weight - Package weight in pounds
 * @returns {Promise<object>} Rate comparison with all carriers
 */
export async function getLiveRates(fromZip, toZip, weight) {
  try {
    // Call all carrier APIs in parallel
    const [fedexRates, upsRates, dhlRates] = await Promise.all([
      fedex.getRates(fromZip, toZip, weight).catch(err => {
        console.error("FedEx rates error:", err);
        return { carrier: "FedEx", error: err.message, services: [] };
      }),
      ups.getRates(fromZip, toZip, weight).catch(err => {
        console.error("UPS rates error:", err);
        return { carrier: "UPS", error: err.message, services: [] };
      }),
      dhl.getRates(fromZip, toZip, weight).catch(err => {
        console.error("DHL rates error:", err);
        return { carrier: "DHL", error: err.message, services: [] };
      })
    ]);

    // Extract all service options
    const allOptions = [];
    
    if (fedexRates.services) {
      fedexRates.services.forEach(svc => {
        allOptions.push({
          carrier: "FedEx",
          service: svc.service,
          price: parseFloat(svc.price),
          deliveryDays: svc.deliveryDays,
          currency: svc.currency || "USD"
        });
      });
    }

    if (upsRates.services) {
      upsRates.services.forEach(svc => {
        allOptions.push({
          carrier: "UPS",
          service: svc.service,
          price: parseFloat(svc.price),
          deliveryDays: svc.deliveryDays,
          currency: svc.currency || "USD"
        });
      });
    }

    if (dhlRates.services) {
      dhlRates.services.forEach(svc => {
        allOptions.push({
          carrier: "DHL",
          service: svc.service,
          price: parseFloat(svc.price),
          deliveryDays: svc.deliveryDays,
          currency: svc.currency || "USD"
        });
      });
    }

    // Find best option (lowest price)
    let best = null;
    let secondBest = null;
    
    if (allOptions.length > 0) {
      const sorted = allOptions.sort((a, b) => a.price - b.price);
      best = sorted[0];
      secondBest = sorted[1] || null;
    }

    // Calculate savings
    const savings = secondBest ? (secondBest.price - best.price).toFixed(2) : 0;

    const result = {
      request: { fromZip, toZip, weight },
      fedex: fedexRates,
      ups: upsRates,
      dhl: dhlRates,
      allOptions,
      best: best ? {
        carrier: best.carrier,
        service: best.service,
        price: best.price,
        deliveryDays: best.deliveryDays,
        savings: parseFloat(savings)
      } : null,
      timestamp: new Date().toISOString()
    };

    // Save to history
    saveQuote(result);

    return result;
  } catch (error) {
    console.error("getLiveRates error:", error);
    throw error;
  }
}

// Get all quotes and determine best option (Legacy - uses mock)
export function getComparisonQuote(fromZip, toZip, weight) {
  const fedexQuote = getFedExQuote(fromZip, toZip, weight);
  const upsQuote = getUPSQuote(fromZip, toZip, weight);
  const dhlQuote = getDHLQuote(fromZip, toZip, weight);

  // Determine best (lowest price)
  const options = [fedexQuote, upsQuote, dhlQuote];
  const best = options.reduce((min, curr) => 
    curr.price < min.price ? curr : min
  );

  const result = {
    request: { fromZip, toZip, weight },
    fedex: fedexQuote,
    ups: upsQuote,
    dhl: dhlQuote,
    best: best.carrier,
  };

  // Save to history
  saveQuote(result);

  return result;
}

/**
 * Create shipping label with chosen carrier
 * @param {object} orderData - Order details with carrier selection
 * @returns {Promise<object>} Label with tracking number
 */
export async function createShippingLabel(orderData) {
  const carrier = (orderData.carrier || "").toLowerCase();
  
  try {
    let labelData;
    
    switch (carrier) {
      case "fedex":
        labelData = await fedex.createLabel(orderData);
        break;
      case "ups":
        labelData = await ups.createLabel(orderData);
        break;
      case "dhl":
        labelData = await dhl.createLabel(orderData);
        break;
      default:
        throw new Error(`Unknown carrier: ${orderData.carrier}`);
    }

    return {
      ...labelData,
      orderId: orderData.orderId,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("createShippingLabel error:", error);
    throw error;
  }
}

/**
 * Track shipment with any carrier
 * @param {string} trackingNumber - Tracking number
 * @param {string} carrier - Carrier name (optional, auto-detect if not provided)
 * @returns {Promise<object>} Tracking information
 */
export async function trackShipment(trackingNumber, carrier = null) {
  try {
    // Auto-detect carrier from tracking number format
    if (!carrier) {
      if (trackingNumber.startsWith("FX")) {
        carrier = "fedex";
      } else if (trackingNumber.startsWith("1Z")) {
        carrier = "ups";
      } else if (trackingNumber.startsWith("DHL")) {
        carrier = "dhl";
      }
    }

    carrier = (carrier || "").toLowerCase();

    let trackingData;
    
    switch (carrier) {
      case "fedex":
        trackingData = await fedex.track(trackingNumber);
        break;
      case "ups":
        trackingData = await ups.track(trackingNumber);
        break;
      case "dhl":
        trackingData = await dhl.track(trackingNumber);
        break;
      default:
        throw new Error(`Unknown carrier: ${carrier} - Cannot track ${trackingNumber}`);
    }

    return trackingData;
  } catch (error) {
    console.error("trackShipment error:", error);
    throw error;
  }
}

/**
 * Validate address with carrier APIs
 * @param {object} address - Address to validate
 * @param {string} carrier - Carrier to use (defaults to FedEx)
 * @returns {Promise<object>} Validation result
 */
export async function validateAddress(address, carrier = "fedex") {
  carrier = carrier.toLowerCase();
  
  try {
    switch (carrier) {
      case "fedex":
        return await fedex.validateAddress(address);
      case "ups":
        return await ups.validateAddress(address);
      case "dhl":
        return await dhl.validateAddress(address);
      default:
        throw new Error(`Unknown carrier: ${carrier}`);
    }
  } catch (error) {
    console.error("validateAddress error:", error);
    throw error;
  }
}

export function getQuoteHistory() {
  return loadQuotes();
}
