import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SETTINGS_PATH = path.join(__dirname, "data", "settings.json");

function loadSettings() {
  try {
    const raw = fs.readFileSync(SETTINGS_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return { storeName: "ChickenToday", notificationEmail: "admin@example.com" };
  }
}

function saveSettings(newSettings) {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(newSettings, null, 2), "utf8");
}

export function getSettings() {
  return loadSettings();
}

export function updateSettings(body) {
  const current = loadSettings();
  const merged = { ...current, ...body };
  saveSettings(merged);
  return merged;
}
