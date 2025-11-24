import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

// Mock FedEx API
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

// Mock UPS API
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

// Mock DHL API
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

// Get all quotes and determine best option
export function getComparisonQuote(fromZip, toZip, weight) {
  const fedex = getFedExQuote(fromZip, toZip, weight);
  const ups = getUPSQuote(fromZip, toZip, weight);
  const dhl = getDHLQuote(fromZip, toZip, weight);

  // Determine best (lowest price)
  const options = [fedex, ups, dhl];
  const best = options.reduce((min, curr) => 
    curr.price < min.price ? curr : min
  );

  const result = {
    request: { fromZip, toZip, weight },
    fedex,
    ups,
    dhl,
    best: best.carrier,
  };

  // Save to history
  saveQuote(result);

  return result;
}

export function getQuoteHistory() {
  return loadQuotes();
}
