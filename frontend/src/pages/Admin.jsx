import React, { useState, useEffect } from "react";

const containerStyle = {
  padding: "20px",
  maxWidth: "1000px",
  margin: "0 auto"
};

const sectionStyle = {
  border: "1px solid #ddd",
  padding: "20px",
  marginBottom: "20px",
  borderRadius: "8px",
  backgroundColor: "#fff",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
};

const headingStyle = {
  marginTop: 0,
  marginBottom: "16px",
  color: "#333",
  fontSize: "20px",
  fontWeight: "600",
  borderBottom: "2px solid #dc3545",
  paddingBottom: "8px"
};

const buttonStyle = {
  padding: "10px 20px",
  margin: "8px",
  fontSize: "14px",
  cursor: "pointer",
  border: "none",
  borderRadius: "4px",
  fontWeight: "500",
  transition: "all 0.2s"
};

const dangerButton = {
  ...buttonStyle,
  backgroundColor: "#dc3545",
  color: "#fff"
};

const primaryButton = {
  ...buttonStyle,
  backgroundColor: "#007bff",
  color: "#fff"
};

const successButton = {
  ...buttonStyle,
  backgroundColor: "#28a745",
  color: "#fff"
};

const statStyle = {
  display: "inline-block",
  padding: "12px 24px",
  margin: "8px",
  backgroundColor: "#f0f8ff",
  border: "2px solid #007bff",
  borderRadius: "6px",
  fontSize: "16px",
  fontWeight: "600"
};

const Admin = () => {
  const [stats, setStats] = useState({
    events: 0,
    orders: 0,
    deliveries: 0,
    routes: 0,
    couriers: 0,
    rides: 0
  });
  const [health, setHealth] = useState(null);
  const [mode, setMode] = useState("DEV");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchHealth();
    fetchMode();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      console.error("Error fetching health:", err);
    }
  };

  const fetchMode = async () => {
    try {
      const res = await fetch("/api/admin/mode");
      const data = await res.json();
      setMode(data.mode);
    } catch (err) {
      console.error("Error fetching mode:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const [eventsRes, ordersRes, deliveriesRes, routesRes, couriersRes, ridesRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/orders/latest"),
        fetch("/api/delivery/history"),
        fetch("/api/route/history"),
        fetch("/api/courier/history"),
        fetch("/api/ride/history")
      ]);

      const events = await eventsRes.json();
      const deliveries = await deliveriesRes.json();
      const routes = await routesRes.json();
      const couriers = await couriersRes.json();
      const rides = await ridesRes.json();

      // Count orders by reading orders.json indirectly
      const ordersCount = await fetch("/api/orders/latest").then(r => r.json()).then(data => data.orderId ? 1 : 0);

      setStats({
        events: Array.isArray(events) ? events.length : 0,
        orders: ordersCount,
        deliveries: Array.isArray(deliveries) ? deliveries.length : 0,
        routes: Array.isArray(routes) ? routes.length : 0,
        couriers: Array.isArray(couriers) ? couriers.length : 0,
        rides: Array.isArray(rides) ? rides.length : 0
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setLoading(false);
    }
  };

  const handleClear = async (endpoint, name) => {
    if (!window.confirm(`Are you sure you want to clear all ${name}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      
      if (res.ok) {
        setMessage(`✅ ${name} cleared successfully`);
        fetchStats(); // Refresh stats
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`❌ Error clearing ${name}`);
    }

    setTimeout(() => setMessage(""), 3000);
  };

  const handleBackup = async () => {
    try {
      const res = await fetch("/api/admin/export-all");
      const data = await res.json();
      
      if (res.ok) {
        // Create downloadable JSON file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `aicoo-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        setMessage("✅ Full backup downloaded successfully");
      } else {
        setMessage("❌ Backup failed");
      }
    } catch (err) {
      setMessage("❌ Error creating backup");
    }

    setTimeout(() => setMessage(""), 3000);
  };

  const handleZipBackup = async () => {
    try {
      const res = await fetch("/api/admin/export-zip");
      const data = await res.json();
      
      if (res.ok) {
        // Create downloadable file from base64
        const blob = new Blob([atob(data.data)], { type: "application/zip" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename;
        a.click();
        URL.revokeObjectURL(url);
        
        setMessage(`✅ ZIP backup downloaded: ${data.filename}`);
      } else {
        setMessage("❌ ZIP backup failed");
      }
    } catch (err) {
      setMessage("❌ Error creating ZIP backup");
    }

    setTimeout(() => setMessage(""), 3000);
  };

  const handleRestartBackend = () => {
    setMessage("⚠️  Backend restart simulation - in production, this would restart the server");
    setTimeout(() => setMessage(""), 4000);
  };

  const handleReset = async () => {
    if (!window.confirm("⚠️ DANGER: This will reset ALL data to empty state. Are you absolutely sure?")) {
      return;
    }

    if (!window.confirm("This action is IRREVERSIBLE. Type your confirmation by clicking OK again.")) {
      return;
    }

    try {
      await Promise.all([
        fetch("/api/admin/clear-events", { method: "POST" }),
        fetch("/api/admin/clear-orders", { method: "POST" }),
        fetch("/api/admin/clear-deliveries", { method: "POST" }),
        fetch("/api/admin/clear-routes", { method: "POST" }),
        fetch("/api/admin/clear-couriers", { method: "POST" }),
        fetch("/api/admin/clear-rides", { method: "POST" })
      ]);

      setMessage("✅ System reset complete");
      fetchStats();
    } catch (err) {
      setMessage("❌ Reset failed");
    }

    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) {
    return <div style={containerStyle}>Loading admin panel...</div>;
  }

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: "24px", color: "#333" }}>AICOO Admin Tools</h1>

      {/* Current Mode Indicator */}
      <div style={{
        padding: "12px",
        marginBottom: "20px",
        backgroundColor: mode === "LIVE" ? "#ffe6e6" : "#e6f7ff",
        border: `2px solid ${mode === "LIVE" ? "#dc3545" : "#007bff"}`,
        borderRadius: "4px",
        fontWeight: "bold",
        textAlign: "center"
      }}>
        Current Mode: {mode} {mode === "LIVE" ? "🔴 PRODUCTION" : "🟢 DEVELOPMENT"}
      </div>

      {message && (
        <div style={{
          padding: "12px",
          marginBottom: "20px",
          backgroundColor: message.includes("✅") ? "#d4edda" : "#f8d7da",
          border: `1px solid ${message.includes("✅") ? "#28a745" : "#dc3545"}`,
          borderRadius: "4px",
          color: message.includes("✅") ? "#155724" : "#721c24"
        }}>
          {message}
        </div>
      )}

      {/* System Health */}
      {health && (
        <div style={{...sectionStyle, backgroundColor: "#f0fff4", borderColor: "#28a745"}}>
          <h3 style={{...headingStyle, borderColor: "#28a745"}}>System Health</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <div><strong>Backend:</strong> <span style={{color: health.backend === "ok" ? "#28a745" : "#dc3545"}}>● {health.backend}</span></div>
            <div><strong>Storage:</strong> <span style={{color: health.storage === "ok" ? "#28a745" : "#dc3545"}}>● {health.storage}</span></div>
            <div><strong>Routing:</strong> <span style={{color: health.routing === "ok" ? "#28a745" : "#dc3545"}}>● {health.routing}</span></div>
            <div><strong>Delivery:</strong> <span style={{color: health.delivery === "ok" ? "#28a745" : "#dc3545"}}>● {health.delivery}</span></div>
            <div><strong>Webhooks:</strong> <span style={{color: health.webhooks === "ok" ? "#28a745" : "#dc3545"}}>● {health.webhooks}</span></div>
            <div><strong>Uptime:</strong> {Math.floor(health.uptime / 60)}m {Math.floor(health.uptime % 60)}s</div>
          </div>
          {health.lastError && (
            <div style={{marginTop: "12px", padding: "8px", backgroundColor: "#fff3cd", borderLeft: "4px solid #ffc107"}}>
              <strong>Last Error:</strong> {health.lastError.message} ({health.lastError.context})
            </div>
          )}
        </div>
      )}

      {/* System Statistics */}
      <div style={sectionStyle}>
        <h3 style={{...headingStyle, borderColor: "#007bff"}}>System Statistics</h3>
        <div style={{ textAlign: "center" }}>
          <div style={statStyle}>
            <div style={{fontSize: "12px", color: "#666"}}>Total Events</div>
            <div style={{fontSize: "24px", color: "#007bff"}}>{stats.events}</div>
          </div>
          <div style={statStyle}>
            <div style={{fontSize: "12px", color: "#666"}}>Total Deliveries</div>
            <div style={{fontSize: "24px", color: "#007bff"}}>{stats.deliveries}</div>
          </div>
          <div style={statStyle}>
            <div style={{fontSize: "12px", color: "#666"}}>Total Routes</div>
            <div style={{fontSize: "24px", color: "#007bff"}}>{stats.routes}</div>
          </div>
          <div style={statStyle}>
            <div style={{fontSize: "12px", color: "#666"}}>Courier Quotes</div>
            <div style={{fontSize: "24px", color: "#007bff"}}>{stats.couriers}</div>
          </div>
          <div style={statStyle}>
            <div style={{fontSize: "12px", color: "#666"}}>Ride Quotes</div>
            <div style={{fontSize: "24px", color: "#007bff"}}>{stats.rides}</div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>Data Management</h3>
        <p style={{marginBottom: "20px", color: "#666"}}>
          Clear specific data types. These actions cannot be undone.
        </p>
        <div>
          <button 
            style={dangerButton}
            onClick={() => handleClear("/api/admin/clear-events", "Events")}
          >
            Clear Events
          </button>
          <button 
            style={dangerButton}
            onClick={() => handleClear("/api/admin/clear-orders", "Orders")}
          >
            Clear Orders
          </button>
          <button 
            style={dangerButton}
            onClick={() => handleClear("/api/admin/clear-deliveries", "Deliveries")}
          >
            Clear Deliveries
          </button>
          <button 
            style={dangerButton}
            onClick={() => handleClear("/api/admin/clear-routes", "Routes")}
          >
            Clear Routes
          </button>
          <button 
            style={dangerButton}
            onClick={() => handleClear("/api/admin/clear-couriers", "Courier History")}
          >
            Clear Couriers
          </button>
          <button 
            style={dangerButton}
            onClick={() => handleClear("/api/admin/clear-rides", "Ride History")}
          >
            Clear Rides
          </button>
        </div>
      </div>

      {/* Backup & Restore */}
      <div style={sectionStyle}>
        <h3 style={{...headingStyle, borderColor: "#28a745"}}>Backup & Production Controls</h3>
        <p style={{marginBottom: "20px", color: "#666"}}>
          Download complete backups, export data, and manage production operations.
        </p>
        <button style={successButton} onClick={handleBackup}>
          📥 Download Full Backup (JSON)
        </button>
        <button style={successButton} onClick={handleZipBackup}>
          📦 Download ZIP Backup
        </button>
        <button style={primaryButton} onClick={handleRestartBackend}>
          🔄 Restart Backend (Simulated)
        </button>
      </div>

      {/* System Reset */}
      <div style={{...sectionStyle, backgroundColor: "#fff5f5", borderColor: "#dc3545"}}>
        <h3 style={headingStyle}>⚠️ Danger Zone</h3>
        <p style={{marginBottom: "20px", color: "#721c24"}}>
          <strong>Warning:</strong> This will clear ALL data and reset the system to initial state.
        </p>
        <button style={dangerButton} onClick={handleReset}>
          🔥 Reset Entire System
        </button>
      </div>
    </div>
  );
};

export default Admin;
