import { useState, useEffect } from "react";
import { getColors, spacing, borderRadius, shadows, typography } from "../styles/theme";

const ThemeToggle = ({ onThemeChange }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('aicoo-theme') || 'light';
  });
  
  const colors = getColors(theme);

  useEffect(() => {
    localStorage.setItem('aicoo-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (onThemeChange) onThemeChange(theme);
  }, [theme, onThemeChange]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: `${spacing.sm} ${spacing.md}`,
        backgroundColor: colors.cardBg,
        border: `2px solid ${colors.gray300}`,
        borderRadius: borderRadius.md,
        cursor: "pointer",
        fontSize: typography.base,
        fontWeight: typography.medium,
        boxShadow: shadows.sm,
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        gap: spacing.sm,
        color: colors.textPrimary,
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = colors.gray100;
        e.target.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = colors.cardBg;
        e.target.style.transform = "translateY(0)";
      }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
      {theme === 'light' ? 'Dark' : 'Light'}
    </button>
  );
};

export default ThemeToggle;
