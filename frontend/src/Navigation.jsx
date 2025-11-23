import React from "react";
import { Link } from "react-router-dom";

const sidebarStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "16px",
  borderRight: "1px solid #ccc",
};

const linkStyle = {
  cursor: "pointer",
  textDecoration: "none",
  color: "inherit",
};

const Navigation = () => {
  return (
    <div style={sidebarStyle}>
      <li>
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
      </li>
      <li>
        <Link to="/settings" style={linkStyle}>Settings</Link>
      </li>
      <li>
        <Link to="/webhooks" style={linkStyle}>Webhooks</Link>
      </li>
      <li>
        <Link to="/chat" style={linkStyle}>AI COO Chat</Link>
      </li>
    </div>
  );
};

export default Navigation;
