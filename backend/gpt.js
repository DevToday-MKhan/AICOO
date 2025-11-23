// =======================
// AICOO™ GPT Brain Module
// =======================

// Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

// Import OpenAI official SDK
import OpenAI from "openai";

// Other imports
import { events } from "./webhooks.js";
import Settings from "./settings.js";

// Initialize OpenAI with API key from .env
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =======================
// askAICOO FUNCTION
// =======================
export async function askAICOO(prompt) {
  try {
    const systemMessage = `
      You are AICOO™, an AI Chief Operating Officer for Shopify merchants.
      You analyze: webhook events, customer behavior, order patterns, store settings.
      You give: insights, strategy, warnings, suggestions, explanations, decisions.
      Keep answers clear, executive-level, and actionable.
    `;

    const context = `
      Store Settings: ${JSON.stringify(Settings.getSettings())}
      Latest Webhook Events (up to 20): ${JSON.stringify(events.slice(-20))}
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `Context: ${context}` },
        { role: "user", content: prompt }
      ]
    });

    return completion.choices[0].message.content;

  } catch (err) {
    console.error("🔥 GPT ERROR:", err);
    throw new Error("AICOO GPT engine failed.");
  }
}

