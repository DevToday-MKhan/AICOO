import { useState, useEffect } from "react";
import { colors, spacing, borderRadius, shadows, typography } from "../styles/theme";

const Toast = ({ message, type = "info", duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible || !message) return null;

  const typeStyles = {
    success: {
      backgroundColor: colors.successLight,
      borderColor: colors.success,
      color: colors.success,
      icon: "✅",
    },
    error: {
      backgroundColor: colors.dangerLight,
      borderColor: colors.danger,
      color: colors.danger,
      icon: "❌",
    },
    warning: {
      backgroundColor: colors.warningLight,
      borderColor: colors.warning,
      color: colors.warning,
      icon: "⚠️",
    },
    info: {
      backgroundColor: colors.infoLight,
      borderColor: colors.info,
      color: colors.info,
      icon: "ℹ️",
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div style={{
      position: "fixed",
      top: spacing.xl,
      right: spacing.xl,
      backgroundColor: style.backgroundColor,
      border: `2px solid ${style.borderColor}`,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      boxShadow: shadows.lg,
      zIndex: 10000,
      minWidth: "300px",
      maxWidth: "500px",
      animation: "slideDown 0.3s ease-out",
      display: "flex",
      alignItems: "center",
      gap: spacing.md,
    }}>
      <span style={{ fontSize: typography.lg }}>{style.icon}</span>
      <span style={{ 
        flex: 1, 
        color: style.color, 
        fontSize: typography.base,
        fontWeight: typography.medium 
      }}>
        {message}
      </span>
      <button
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        style={{
          background: "none",
          border: "none",
          color: style.color,
          cursor: "pointer",
          fontSize: typography.lg,
          padding: 0,
          marginLeft: spacing.sm,
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
