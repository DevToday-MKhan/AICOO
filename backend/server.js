//////////////////////////////////////////////////////////////////
//  AI-COO — Production Embedded App Server
//////////////////////////////////////////////////////////////////

import express from "express";
import cookieParser from "cookie-parser";
import shopify from "./shopify.js";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cookieParser());

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*", // Adjust as needed
    methods: ["GET", "POST"]
  }
});
global.io = io;

// Auth routes
app.use("/auth", shopify.auth.begin());
app.use("/auth/callback", shopify.auth.callback());

app.get("/", (req, res) => {
  const indexPath = path.join(distPath, "index.html");
  fs.readFile(indexPath, 'utf8', (err, html) => {
    if (err) {
      return res.status(500).send("Error loading page");
    }
    html = html.replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY);
    res.send(html);
  });
});

const distPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(distPath));
app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(distPath, "index.html"));
  } else {
    next();
  }
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`AI-COO server running on port ${PORT}`);
});

export default app;
