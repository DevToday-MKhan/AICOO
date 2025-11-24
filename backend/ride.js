import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RIDE_PATH = path.join(__dirname, "data", "ride.json");

function loadQuotes() {
  try {
    const raw = fs.readFileSync(RIDE_PATH, "utf8");
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
  fs.writeFileSync(RIDE_PATH, JSON.stringify(trimmed, null, 2), "utf8");
}

// Calculate mock distance based on ZIP codes
function estimateDistance(fromZip, toZip) {
  const diff = Math.abs(parseInt(fromZip) - parseInt(toZip));
  // Rough estimate: larger ZIP difference = longer distance
  return Math.min(diff * 0.01, 50); // Cap at 50 miles
}

// Mock Uber API
export function getUberQuote(fromZip, toZip) {
  const distance = estimateDistance(fromZip, toZip);
  const baseRate = 5.0;
  const perMile = 2.5;
  
  // Random surge (1.0 to 2.0)
  const surgeMultiplier = parseFloat((1.0 + Math.random()).toFixed(2));
  
  const basePrice = baseRate + (distance * perMile);
  const price = parseFloat((basePrice * surgeMultiplier).toFixed(2));
  const estimatedMinutes = Math.ceil(distance / 0.5); // ~30mph average
  
  return {
    service: "Uber",
    price,
    estimatedMinutes,
    surgeMultiplier,
  };
}

// Mock Lyft API
export function getLyftQuote(fromZip, toZip) {
  const distance = estimateDistance(fromZip, toZip);
  const baseRate = 4.5;
  const perMile = 2.7;
  
  // Random surge (1.0 to 2.0)
  const surgeMultiplier = parseFloat((1.0 + Math.random()).toFixed(2));
  
  const basePrice = baseRate + (distance * perMile);
  const price = parseFloat((basePrice * surgeMultiplier).toFixed(2));
  const estimatedMinutes = Math.ceil(distance / 0.5); // ~30mph average
  
  return {
    service: "Lyft",
    price,
    estimatedMinutes,
    surgeMultiplier,
  };
}

// Get comparison of both services
export function getComparisonQuote(fromZip, toZip) {
  const uber = getUberQuote(fromZip, toZip);
  const lyft = getLyftQuote(fromZip, toZip);

  // Determine best (lowest price)
  const best = uber.price < lyft.price ? "Uber" : "Lyft";

  const result = {
    request: { fromZip, toZip },
    uber,
    lyft,
    best,
    timestamp: new Date().toISOString(),
  };

  // Save to history
  saveQuote(result);

  return result;
}

export function getQuoteHistory() {
  return loadQuotes();
}
