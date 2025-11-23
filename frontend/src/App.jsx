import React, { useState } from "react";
import Navigation from "./Navigation.jsx";
import Dashboard from "./dashboard.jsx";
import Settings from "./settings.jsx";
import Webhooks from "./webhooks.jsx";

const App = () => {
  const [page, setPage] = useState("Dashboard");

  const getPageComponent = () => {
    switch (page) {
      case "Dashboard":
        return <Dashboard />;
      case "Settings":
        return <Settings />;
      case "Webhooks":
        return <Webhooks />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Navigation onNavigate={setPage} />
      <div style={{ padding: "16px", flex: 1 }}>
        {getPageComponent()}
      </div>
    </div>
  );
};

export default App;
