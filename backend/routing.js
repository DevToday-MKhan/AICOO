import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getComparisonQuote as getCourierQuote } from "./courier.js";
import { getComparisonQuote as getRideQuote } from "./ride.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SLAUGHTERHOUSES_PATH = path.join(__dirname, "data", "slaughterhouses.json");
const ROUTES_PATH = path.join(__dirname, "data", "routes.json");

function loadSlaughterhouses() {
  try {
    const raw = fs.readFileSync(SLAUGHTERHOUSES_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function loadRoutes() {
  try {
    const raw = fs.readFileSync(ROUTES_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveRoute(route) {
  const routes = loadRoutes();
  routes.push({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...route,
  });
  
  // Keep only last 10
  const trimmed = routes.slice(-10);
  fs.writeFileSync(ROUTES_PATH, JSON.stringify(trimmed, null, 2), "utf8");
}

// Calculate distance based on ZIP code difference
function estimateDistance(zip1, zip2) {
  const diff = Math.abs(parseInt(zip1) - parseInt(zip2));
  // Rough estimate: larger ZIP difference = longer distance
  return Math.min(diff * 0.01, 100); // Cap at 100 miles
}

// Find nearest slaughterhouse to customer ZIP
export function findNearestSlaughterhouse(customerZip) {
  const slaughterhouses = loadSlaughterhouses();
  
  if (slaughterhouses.length === 0) {
    throw new Error("No slaughterhouses configured");
  }

  let nearest = slaughterhouses[0];
  let minDistance = estimateDistance(customerZip, nearest.zip);

  for (const slaughterhouse of slaughterhouses) {
    const distance = estimateDistance(customerZip, slaughterhouse.zip);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = slaughterhouse;
    }
  }

  return { ...nearest, distance: minDistance };
}

// Get complete routing quote with courier and ride options
export function getRouteQuote({ customerZip, weight }) {
  // Find nearest slaughterhouse
  const slaughterhouse = findNearestSlaughterhouse(customerZip);

  // Get courier quote (slaughterhouse ZIP → customer ZIP)
  const courierQuote = getCourierQuote(slaughterhouse.zip, customerZip, weight);

  // Get ride quote (slaughterhouse ZIP → customer ZIP)
  const rideQuote = getRideQuote(slaughterhouse.zip, customerZip);

  // Determine best method based on price
  // Compare best courier vs best ride
  const bestCourierPrice = courierQuote[courierQuote.best.toLowerCase()].price;
  const bestRidePrice = rideQuote[rideQuote.best.toLowerCase()].price;

  const bestMethod = bestCourierPrice < bestRidePrice ? "courier" : "ride";

  const result = {
    customerZip,
    weight,
    slaughterhouse: {
      name: slaughterhouse.name,
      zip: slaughterhouse.zip,
      distance: slaughterhouse.distance,
    },
    courier: {
      fedex: courierQuote.fedex,
      ups: courierQuote.ups,
      dhl: courierQuote.dhl,
      best: courierQuote.best,
    },
    ride: {
      uber: rideQuote.uber,
      lyft: rideQuote.lyft,
      best: rideQuote.best,
    },
    bestMethod,
    recommendation: bestMethod === "courier" 
      ? `Use ${courierQuote.best} courier ($${bestCourierPrice})`
      : `Use ${rideQuote.best} ride-sharing ($${bestRidePrice})`,
    timestamp: new Date().toISOString(),
  };

  // Save to history
  saveRoute(result);

  return result;
}

export function getRouteHistory() {
  return loadRoutes();
}

