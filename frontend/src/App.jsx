import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Navigation from "./Navigation.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Settings from "./settings.jsx";
import Webhooks from "./webhooks.jsx";
import Chat from "./pages/Chat.jsx";
import Admin from "./pages/Admin.jsx";
import CommandPalette from "./components/CommandPalette.jsx";
import ModeIndicator from "./components/ModeIndicator.jsx";
import Toast from "./components/Toast.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import QuickStats from "./components/QuickStats.jsx";
import KeyboardShortcutsHelp from "./components/KeyboardShortcutsHelp.jsx";
import ConnectionStatus from "./components/ConnectionStatus.jsx";

const App = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState('light');

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      // ? key for shortcuts help
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeElement = document.activeElement;
        // Don't trigger if typing in input/textarea
        if (activeElement.tagName !== "INPUT" && activeElement.tagName !== "TEXTAREA") {
          e.preventDefault();
          setShortcutsHelpOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Navigation />
      <div style={{ padding: "16px", flex: 1, overflowY: "auto" }}>
        {/* Theme Toggle in top-left */}
        <div style={{ position: "absolute", top: "16px", left: "220px", zIndex: 9996 }}>
          <ThemeToggle onThemeChange={setTheme} />
        </div>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/webhooks" element={<Webhooks />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>

      {/* Global Quick Stats Widget */}
      <QuickStats />

      {/* Global Mode Indicator */}
      <ModeIndicator />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onExecute={(cmd) => {
          console.log("Command executed:", cmd);
          setToast({ message: "Command executed successfully", type: "success" });
        }}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isOpen={shortcutsHelpOpen}
        onClose={() => setShortcutsHelpOpen(false)}
      />

      {/* Global Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* WebSocket Connection Status */}
      <ConnectionStatus />
    </div>
  );
};

export default App;
