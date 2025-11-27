import { apiFetch } from "../config/api";
import { useState, useEffect } from "react";
import { colors, spacing, borderRadius, typography, shadows } from "../styles/theme";

const ModeIndicator = () => {
  const [mode, setMode] = useState("DEV");

  useEffect(() => {
    apiFetch("/api/admin/mode")
      .then(res => res.json())
      .then(data => setMode(data.mode))
      .catch(() => setMode("DEV"));
  }, []);

  const isLive = mode === "LIVE";

  return (
    <div style={{
      position: "fixed",
      top: spacing.lg,
      right: spacing.lg,
      zIndex: 9998,
      padding: `${spacing.sm} ${spacing.md}`,
      backgroundColor: isLive ? colors.liveMode : colors.devMode,
      color: colors.white,
      borderRadius: borderRadius.md,
      fontSize: typography.sm,
      fontWeight: typography.bold,
      boxShadow: shadows.md,
      display: "flex",
      alignItems: "center",
      gap: spacing.sm,
    }}>
      <span style={{
        width: "8px",
        height: "8px",
        backgroundColor: colors.white,
        borderRadius: "50%",
        animation: isLive ? "pulse 2s ease-in-out infinite" : "none",
      }} />
      {mode}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default ModeIndicator;
