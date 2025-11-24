import { colors } from "../styles/theme";

const LoadingSpinner = ({ size = 40, color = colors.primary }) => {
  return (
    <div style={{
      display: "inline-block",
      width: size,
      height: size,
      border: `4px solid ${colors.gray200}`,
      borderTopColor: color,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export const LoadingDots = ({ color = colors.primary }) => {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
      <span style={{
        width: "8px",
        height: "8px",
        backgroundColor: color,
        borderRadius: "50%",
        animation: "pulse 1.4s ease-in-out 0s infinite",
      }} />
      <span style={{
        width: "8px",
        height: "8px",
        backgroundColor: color,
        borderRadius: "50%",
        animation: "pulse 1.4s ease-in-out 0.2s infinite",
      }} />
      <span style={{
        width: "8px",
        height: "8px",
        backgroundColor: color,
        borderRadius: "50%",
        animation: "pulse 1.4s ease-in-out 0.4s infinite",
      }} />
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
