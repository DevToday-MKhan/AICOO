//////////////////////////////////////////////////////////////////
//  AI-COO — Legacy Backend Server (DEPRECATED)
//  This file is no longer used - all routing handled by /server.js
//////////////////////////////////////////////////////////////////

// NOTE: Railway should run "node server.js" from root, not this file
// This file is kept for reference/backup only

import express from "express";
import cookieParser from "cookie-parser";
import shopify from "./shopify.js";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const app = express();
app.use(express.json());
app.use(cookieParser());

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
global.io = io;

// Auth routes
app.use("/app/auth", shopify.auth.begin());
app.use("/app/auth/callback", shopify.auth.callback());

// Backend server.js is no longer used - all routing handled by root server.js
// This file is kept for reference only

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`AI-COO server running on port ${PORT}`);
});

export default app;
