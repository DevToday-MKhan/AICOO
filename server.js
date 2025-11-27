import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady } from "@remix-run/node";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

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

// Vite dev server for HMR in development
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  // Serve static files from public/build in production
  app.use(
    "/build",
    express.static(path.join(__dirname, "../public/build"), {
      immutable: true,
      maxAge: "1y",
    })
  );
}

// Serve other static files
app.use(express.static(path.join(__dirname, "../public"), { maxAge: "1h" }));

// Import all API route handlers - keep existing backend logic
// These will remain as Express routes and won't be touched
// Add your API routes here if needed
// Example: app.use("/api/deliveries", deliveryRouter);

// Remix request handler for all non-API routes
const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
  : await import("./build/index.js");

app.all(
  "*",
  createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
  })
);

const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, async () => {
  console.log(`🚀 AI-COO server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
  
  if (process.env.NODE_ENV === "development" && viteDevServer) {
    try {
      await broadcastDevReady(await build);
    } catch (error) {
      console.warn("⚠️  Dev ready broadcast skipped:", error.message);
    }
  }
});

export default app;
