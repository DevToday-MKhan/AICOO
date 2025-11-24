import React from "react";
import { Routes, Route } from "react-router-dom";

import Navigation from "./Navigation.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Settings from "./settings.jsx";
import Webhooks from "./webhooks.jsx";
import Chat from "./pages/Chat.jsx";
import Admin from "./pages/Admin.jsx";

const App = () => (
  <div style={{ display: "flex", height: "100vh" }}>
    <Navigation />
    <div style={{ padding: "16px", flex: 1, overflowY: "auto" }}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/webhooks" element={<Webhooks />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  </div>
);

export default App;
