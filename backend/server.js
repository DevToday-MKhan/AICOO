// =======================================
// AICOO™ Backend Server (FINAL, CLEANEST)
// =======================================

// Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

// Core imports
import cors from "cors";
import express from "express";
import Webhooks, { events } from "./webhooks.js";
import Settings from "./settings.js";
import Suggestions from "./suggestions.js";
import { askAICOO } from "./gpt.js";

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------
// WEBHOOKS — STORE EVENTS
// ---------------------------------------
app.post("/webhooks/orders/create", Webhooks.handleOrderCreated);

// ---------------------------------------
// EVENTS FEED
// ---------------------------------------
app.get("/api/events", (req, res) => {
  res.json(events);
});

// ---------------------------------------
// SETTINGS
// ---------------------------------------
app.get("/api/settings", (req, res) => {
  res.json(Settings.getSettings());
});

app.post("/api/settings", (req, res) => {
  Settings.updateSettings(req.body);
  res.json({ status: "ok" });
});

// ---------------------------------------
// SUGGESTIONS
// ---------------------------------------
app.get("/api/suggestions", (req, res) => {
  res.json(Suggestions.getSuggestions());
});

// ---------------------------------------
// GPT — AICOO AI COO ENGINE
// ---------------------------------------
app.post("/api/gpt", async (req, res) => {
  const { prompt } = req.body;

  try {
    const answer = await askAICOO(prompt);
    res.json({ answer });
  } catch (err) {
    console.error("🔥 GPT ERROR:", err);
    res.status(500).json({ error: "GPT error" });
  }
});

// TEMP – ENV CHECK
console.log(
  "ENV CHECK → OPENAI KEY:",
  process.env.OPENAI_API_KEY ? "LOADED" : "NOT LOADED"
);

// ---------------------------------------
// START SERVER
// ---------------------------------------
app.listen(3000, () => {
  console.log("AICOO backend running on port 3000");
});

// ---------------------------------------
// EXPORT — MUST BE LAST
// ---------------------------------------
export default app;

