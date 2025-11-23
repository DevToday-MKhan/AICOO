import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navigation from "./Navigation.jsx";
import Dashboard from "./dashboard.jsx";
import Settings from "./settings.jsx";
import Webhooks from "./webhooks.jsx";
import Chat from "./pages/Chat.jsx";

const App = () => (
  <Router>
    <div style={{ display: "flex", height: "100vh" }}>
      <Navigation />
      <div style={{ padding: "16px", flex: 1, overflowY: "auto" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/webhooks" element={<Webhooks />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </div>
  </Router>
);

export default App;
