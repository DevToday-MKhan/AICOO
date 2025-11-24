// =======================================
// AICOO™ Backup System
// =======================================
// Production-grade backup and export utilities

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "..", "data");

// ---------------------------------------
// DATA EXPORT
// ---------------------------------------

export function exportAllData() {
  try {
    const backup = {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      mode: process.env.MODE || "DEV",
      data: {
        events: loadJSON("events.json"),
        orders: loadJSON("orders.json"),
        deliveries: loadJSON("deliveries.json"),
        routes: loadJSON("routes.json"),
        courier: loadJSON("courier.json"),
        ride: loadJSON("ride.json"),
        settings: loadJSON("settings.json"),
        slaughterhouses: loadJSON("slaughterhouses.json")
      },
      metadata: {
        eventsCount: loadJSON("events.json").length,
        ordersCount: loadJSON("orders.json").length,
        deliveriesCount: loadJSON("deliveries.json").length,
        routesCount: loadJSON("routes.json").length,
        courierCount: loadJSON("courier.json").length,
        rideCount: loadJSON("ride.json").length
      }
    };

    console.log(`📦 Full backup created (${backup.metadata.eventsCount} events, ${backup.metadata.ordersCount} orders, ${backup.metadata.deliveriesCount} deliveries)`);
    return backup;
  } catch (err) {
    console.error("🔥 Backup creation failed:", err);
    throw new Error("Failed to create backup");
  }
}

export function exportZipped() {
  try {
    const data = exportAllData();
    
    // Mock ZIP as base64-encoded JSON (in production, use JSZip or similar)
    const jsonString = JSON.stringify(data, null, 2);
    const base64 = Buffer.from(jsonString).toString('base64');
    
    console.log("📦 ZIP backup created (base64 encoded)");
    
    return {
      filename: `aicoo-backup-${new Date().toISOString().split('T')[0]}.zip`,
      contentType: "application/zip",
      encoding: "base64",
      data: base64,
      size: base64.length,
      uncompressedSize: jsonString.length
    };
  } catch (err) {
    console.error("🔥 ZIP backup failed:", err);
    throw new Error("Failed to create ZIP backup");
  }
}

// ---------------------------------------
// HELPER FUNCTIONS
// ---------------------------------------

function loadJSON(filename) {
  try {
    const filePath = path.join(DATA_PATH, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filename}, returning empty array`);
      return [];
    }
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error loading ${filename}:`, err.message);
    return [];
  }
}

export function getStorageHealth() {
  const files = [
    "events.json",
    "orders.json", 
    "deliveries.json",
    "routes.json",
    "courier.json",
    "ride.json",
    "settings.json",
    "slaughterhouses.json"
  ];

  const health = {
    status: "ok",
    files: {},
    totalSize: 0,
    accessible: 0,
    errors: []
  };

  for (const file of files) {
    const filePath = path.join(DATA_PATH, file);
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        health.files[file] = {
          exists: true,
          size: stats.size,
          readable: true
        };
        health.totalSize += stats.size;
        health.accessible++;
      } else {
        health.files[file] = {
          exists: false,
          readable: false
        };
        health.errors.push(`Missing: ${file}`);
      }
    } catch (err) {
      health.files[file] = {
        exists: false,
        readable: false,
        error: err.message
      };
      health.errors.push(`Error reading ${file}: ${err.message}`);
    }
  }

  if (health.errors.length > 0) {
    health.status = "degraded";
  }

  return health;
}
