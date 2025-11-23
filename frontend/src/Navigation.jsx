import React from "react";

const sidebarStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "16px",
  borderRight: "1px solid #ccc",
};

const linkStyle = {
  cursor: "pointer",
};

const Navigation = ({ onNavigate }) => {
  return (
    <div style={sidebarStyle}>
      <a style={linkStyle} onClick={() => onNavigate("Dashboard")}>Dashboard</a>
      <a style={linkStyle} onClick={() => onNavigate("Settings")}>Settings</a>
      <a style={linkStyle} onClick={() => onNavigate("Webhooks")}>Webhooks</a>
    </div>
  );
};

export default Navigation;
