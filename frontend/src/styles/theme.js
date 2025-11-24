// AICOO™ Unified Design System
// Consistent colors, spacing, and styles across all components

export const colors = {
  // Primary Brand Colors
  primary: "#007bff",
  primaryLight: "#e3f2fd",
  primaryDark: "#0056b3",
  
  // ChickenToday Blue
  ctBlue: "#007bff",
  ctBlueLight: "#f0f8ff",
  
  // Status Colors
  success: "#28a745",
  successLight: "#d4edda",
  warning: "#ffc107",
  warningLight: "#fff3cd",
  danger: "#dc3545",
  dangerLight: "#f8d7da",
  info: "#17a2b8",
  infoLight: "#d1ecf1",
  
  // Purple (Memory & Simulation)
  purple: "#9b59b6",
  purpleLight: "#f5f0ff",
  
  // Neutral Colors
  white: "#ffffff",
  gray50: "#f9f9f9",
  gray100: "#f8f9fa",
  gray200: "#e9ecef",
  gray300: "#dee2e6",
  gray400: "#ced4da",
  gray500: "#adb5bd",
  gray600: "#6c757d",
  gray700: "#495057",
  gray800: "#343a40",
  gray900: "#212529",
  
  // Text Colors
  textPrimary: "#333",
  textSecondary: "#666",
  textMuted: "#999",
  
  // Mode Indicators
  devMode: "#ff9800",
  liveMode: "#28a745",
};

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
  md: "0 2px 4px rgba(0,0,0,0.1)",
  lg: "0 4px 6px rgba(0,0,0,0.1)",
  xl: "0 10px 20px rgba(0,0,0,0.15)",
  xxl: "0 20px 40px rgba(0,0,0,0.2)",
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
  
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
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
