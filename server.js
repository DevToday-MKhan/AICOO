import { createRequestHandler } from "@remix-run/express";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Force production mode
process.env.NODE_ENV = "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Basic middleware
app.use(express.json());
app.use(cookieParser());

// Create HTTP server and Socket.IO
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
global.io = io;

// Serve static files from public/build in production
app.use(
  "/build",
  express.static(path.join(__dirname, "public/build"), {
    immutable: true,
    maxAge: "1y",
  })
);

// Serve other static files
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1h" }));

// Import all API route handlers - keep existing backend logic
// These will remain as Express routes and won't be touched
// Add your API routes here if needed
// Example: app.use("/api/deliveries", deliveryRouter);

// Import Remix build (production only)
const build = await import("./build/index.js");

app.all(
  "*",
  createRequestHandler({
    build,
    mode: "production",
  })
);

const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, () => {
  console.log(`🚀 AI-COO server running on port ${PORT}`);
  console.log(`📦 Environment: production`);
  console.log(`✅ Remix build loaded from ./build/index.js`);
});

export default app;
