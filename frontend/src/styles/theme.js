// AICOO™ Unified Design System - Modern Edition
// Vibrant colors, gradients, and animations for an engaging UI

// Light Theme Colors
const lightColors = {
  // Primary Brand Colors with Gradients
  primary: "#6366f1",
  primaryLight: "#eef2ff",
  primaryDark: "#4f46e5",
  primaryGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  
  // ChickenToday Blue - Enhanced
  ctBlue: "#3b82f6",
  ctBlueLight: "#dbeafe",
  ctBlueGradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  
  // Status Colors with Gradients
  success: "#10b981",
  successLight: "#d1fae5",
  successGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  warning: "#f59e0b",
  warningLight: "#fef3c7",
  warningGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  danger: "#ef4444",
  dangerLight: "#fee2e2",
  dangerGradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  info: "#06b6d4",
  infoLight: "#cffafe",
  infoGradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
  
  // Purple (Memory & Simulation) - Enhanced
  purple: "#8b5cf6",
  purpleLight: "#f5f3ff",
  purpleGradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
  
  // Accent Colors
  accent: "#ec4899",
  accentLight: "#fce7f3",
  accentGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
  
  // Neutral Colors
  white: "#ffffff",
  background: "#f8fafc",
  cardBg: "#ffffff",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",
  
  // Text Colors
  textPrimary: "#1f2937",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  
  // Mode Indicators
  devMode: "#f59e0b",
  liveMode: "#10b981",
  
  // Glassmorphism
  glassLight: "rgba(255, 255, 255, 0.7)",
  glassDark: "rgba(255, 255, 255, 0.1)",
  
  // Overlays
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.2)",
  
  // Border Colors
  borderColor: "#e5e7eb",
  borderFocus: "#6366f1",
};

// Dark Theme Colors
const darkColors = {
  // Primary Brand Colors with Gradients
  primary: "#818cf8",
  primaryLight: "#312e81",
  primaryDark: "#a5b4fc",
  primaryGradient: "linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)",
  
  // ChickenToday Blue - Enhanced
  ctBlue: "#60a5fa",
  ctBlueLight: "#1e3a8a",
  ctBlueGradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
  
  // Status Colors with Gradients
  success: "#34d399",
  successLight: "#064e3b",
  successGradient: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
  warning: "#fbbf24",
  warningLight: "#78350f",
  warningGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
  danger: "#f87171",
  dangerLight: "#7f1d1d",
  dangerGradient: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)",
  info: "#22d3ee",
  infoLight: "#164e63",
  infoGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)",
  
  // Purple (Memory & Simulation) - Enhanced
  purple: "#a78bfa",
  purpleLight: "#4c1d95",
  purpleGradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
  
  // Accent Colors
  accent: "#f472b6",
  accentLight: "#831843",
  accentGradient: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
  
  // Neutral Colors
  white: "#111827",
  background: "#0f172a",
  cardBg: "#1e293b",
  gray50: "#1e293b",
  gray100: "#334155",
  gray200: "#475569",
  gray300: "#64748b",
  gray400: "#94a3b8",
  gray500: "#cbd5e1",
  gray600: "#e2e8f0",
  gray700: "#f1f5f9",
  gray800: "#f8fafc",
  gray900: "#ffffff",
  
  // Text Colors
  textPrimary: "#f8fafc",
  textSecondary: "#cbd5e1",
  textMuted: "#94a3b8",
  
  // Mode Indicators
  devMode: "#fbbf24",
  liveMode: "#34d399",
  
  // Glassmorphism
  glassLight: "rgba(30, 41, 59, 0.7)",
  glassDark: "rgba(30, 41, 59, 0.3)",
  
  // Overlays
  overlay: "rgba(0, 0, 0, 0.7)",
  overlayLight: "rgba(0, 0, 0, 0.3)",
  
  // Border Colors
  borderColor: "#334155",
  borderFocus: "#818cf8",
};

// Get current theme from localStorage or default to light
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('aicoo-theme') || 'light';
  }
  return 'light';
};

// Export theme-aware colors
export const getColors = (theme = getInitialTheme()) => {
  return theme === 'dark' ? darkColors : lightColors;
};

// Default export for backward compatibility
export const colors = getColors();

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  xxl: "24px",
  xxxl: "32px",
};

export const borderRadius = {
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  full: "9999px",
};

export const shadows = {
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,0.05)",
  md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
  lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
  xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
  xxl: "0 25px 50px -12px rgba(0,0,0,0.25)",
  glow: "0 0 20px rgba(99, 102, 241, 0.4)",
  glowSuccess: "0 0 20px rgba(16, 185, 129, 0.4)",
  glowWarning: "0 0 20px rgba(245, 158, 11, 0.4)",
  glowDanger: "0 0 20px rgba(239, 68, 68, 0.4)",
};

export const typography = {
  // Font Sizes
  xs: "11px",
  sm: "12px",
  base: "14px",
  md: "16px",
  lg: "18px",
  xl: "20px",
  xxl: "24px",
  xxxl: "28px",
  
  // Font Weights
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

// Common Component Styles
export const components = {
  card: {
    backgroundColor: colors.white,
    border: `1px solid ${colors.gray300}`,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    boxShadow: shadows.md,
  },
  
  cardHeader: {
    fontSize: typography.xl,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginTop: 0,
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottom: `2px solid ${colors.primary}`,
  },
  
  button: {
    padding: `${spacing.md} ${spacing.xl}`,
    fontSize: typography.base,
    fontWeight: typography.medium,
    borderRadius: borderRadius.md,
    border: "1px solid",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: colors.white,
  },
  
  buttonSuccess: {
    backgroundColor: colors.success,
    borderColor: colors.success,
    color: colors.white,
  },
  
  buttonDanger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
    color: colors.white,
  },
  
  badge: {
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: borderRadius.sm,
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    display: "inline-block",
  },
  
  input: {
    padding: spacing.md,
    fontSize: typography.base,
    border: `1px solid ${colors.gray300}`,
    borderRadius: borderRadius.md,
    outline: "none",
    width: "100%",
  },
};

// Animation Keyframes
export const animations = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  
  slideDown: `
    @keyframes slideDown {
      from { transform: translateY(-10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `,
  
  slideUp: `
    @keyframes slideUp {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `,
  
  slideInLeft: `
    @keyframes slideInLeft {
      from { transform: translateX(-20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `,
  
  slideInRight: `
    @keyframes slideInRight {
      from { transform: translateX(20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `,
  
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.05); }
    }
  `,
  
  glow: `
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 10px rgba(99, 102, 241, 0.3); }
      50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.6); }
    }
  `,
  
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
  
  bounce: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `,
  
  shimmer: `
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
  `,
  
  scaleIn: `
    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `,
};

// Animation Durations
export const transitions = {
  fast: "150ms",
  normal: "250ms",
  slow: "400ms",
  slower: "600ms",
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
};

// Utility Functions
export const getStatusColor = (status) => {
  const statusMap = {
    success: colors.success,
    ok: colors.success,
    error: colors.danger,
    failed: colors.danger,
    warning: colors.warning,
    pending: colors.info,
  };
  return statusMap[status?.toLowerCase()] || colors.gray600;
};

export const getModeColor = (mode) => {
  return mode === "LIVE" ? colors.liveMode : colors.devMode;
};
