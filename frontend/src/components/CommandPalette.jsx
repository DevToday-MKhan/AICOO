import { useState, useEffect, useRef } from "react";
import { colors, spacing, borderRadius, shadows, typography } from "../styles/theme";

const COMMANDS = [
  // Simulation Commands
  { name: "simulate <zip> <weight>", description: "Simulate order with fake data", example: "simulate 10001 5", category: "Simulation" },
  { name: "replay <orderId>", description: "Replay existing order", example: "replay 12345", category: "Simulation" },
  { name: "simulations", description: "List simulation history", example: "simulations", category: "Simulation" },
  
  // Delivery Commands
  { name: "assign <orderId>", description: "Assign delivery for order", example: "assign 12345", category: "Delivery" },
  { name: "deliveries", description: "View delivery history", example: "deliveries", category: "Delivery" },
  
  // Routing Commands
  { name: "route <zip> <weight>", description: "Get routing quote", example: "route 10001 5", category: "Routing" },
  { name: "courier <fromZip> <toZip> <weight>", description: "Compare courier services", example: "courier 10001 90210 10", category: "Routing" },
  { name: "ride <fromZip> <toZip>", description: "Compare rideshare services", example: "ride 10001 90210", category: "Routing" },
  
  // Memory Commands
  { name: "memory", description: "View AICOO memory & learning", example: "memory", category: "Memory" },
  
  // Admin Commands
  { name: "orders", description: "View recent orders", example: "orders", category: "Admin" },
  { name: "events", description: "View system events", example: "events", category: "Admin" },
  { name: "health", description: "Check system health", example: "health", category: "Admin" },
  { name: "clear events", description: "Clear all events", example: "clear events", category: "Admin" },
  { name: "clear orders", description: "Clear all orders", example: "clear orders", category: "Admin" },
  { name: "clear deliveries", description: "Clear all deliveries", example: "clear deliveries", category: "Admin" },
  { name: "clear routes", description: "Clear route history", example: "clear routes", category: "Admin" },
  
  // Help
  { name: "help", description: "Show all commands", example: "help", category: "Help" },
];

const CATEGORY_COLORS = {
  "Simulation": colors.purple,
  "Delivery": colors.success,
  "Routing": colors.info,
  "Memory": colors.warning,
  "Admin": colors.danger,
  "Help": colors.gray600,
};

const CommandPalette = ({ isOpen, onClose, onExecute }) => {
  const [input, setInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Filter commands based on input
  const filteredCommands = input.trim()
    ? COMMANDS.filter(cmd => 
        cmd.name.toLowerCase().includes(input.toLowerCase()) ||
        cmd.description.toLowerCase().includes(input.toLowerCase())
      )
    : COMMANDS;

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setInput("");
      setResult(null);
      setError(null);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex].example);
        } else if (input.trim()) {
          executeCommand(input.trim());
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, input]);

  // Execute command
  const executeCommand = async (cmd) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const parts = cmd.trim().split(/\s+/);
      const command = parts[0].toLowerCase();

      // Help command
      if (command === "help") {
        setResult({
          type: "help",
          data: COMMANDS
        });
        setLoading(false);
        return;
      }

      // Assign delivery
      if (command === "assign") {
        const orderId = parts[1];
        if (!orderId) throw new Error("Usage: assign <orderId>");
        
        const res = await fetch("/api/delivery/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Delivery assignment failed");
        
        setResult({ type: "assign", data });
      }
      
      // Route quote
      else if (command === "route") {
        const customerZip = parts[1];
        const weight = parseFloat(parts[2]);
        if (!customerZip || !weight) throw new Error("Usage: route <zip> <weight>");
        
        const res = await fetch("/api/route/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerZip, weight })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Route quote failed");
        
        setResult({ type: "route", data });
      }
      
      // Courier comparison
      else if (command === "courier") {
        const fromZip = parts[1];
        const toZip = parts[2];
        const weight = parseFloat(parts[3]);
        if (!fromZip || !toZip || !weight) throw new Error("Usage: courier <fromZip> <toZip> <weight>");
        
        const res = await fetch("/api/courier/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fromZip, toZip, weight })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Courier comparison failed");
        
        setResult({ type: "courier", data });
      }
      
      // Ride comparison
      else if (command === "ride") {
        const fromZip = parts[1];
        const toZip = parts[2];
        if (!fromZip || !toZip) throw new Error("Usage: ride <fromZip> <toZip>");
        
        const res = await fetch("/api/ride/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fromZip, toZip })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Ride comparison failed");
        
        setResult({ type: "ride", data });
      }
      
      // Memory
      else if (command === "memory") {
        const res = await fetch("/api/memory");
        const data = await res.json();
        
        if (!res.ok) throw new Error("Failed to fetch memory");
        
        setResult({ type: "memory", data });
      }
      
      // Health
      else if (command === "health") {
        const res = await fetch("/api/health");
        const data = await res.json();
        
        if (!res.ok) throw new Error("Failed to fetch health");
        
        setResult({ type: "health", data });
      }
      
      // Orders
      else if (command === "orders") {
        const res = await fetch("/api/orders/latest");
        const data = await res.json();
        
        if (!res.ok) throw new Error("Failed to fetch orders");
        
        setResult({ type: "orders", data });
      }
      
      // Deliveries
      else if (command === "deliveries") {
        const res = await fetch("/api/delivery/history");
        const data = await res.json();
        
        if (!res.ok) throw new Error("Failed to fetch deliveries");
        
        setResult({ type: "deliveries", data });
      }
      
      // Events
      else if (command === "events") {
        const res = await fetch("/api/events");
        const data = await res.json();
        
        if (!res.ok) throw new Error("Failed to fetch events");
        
        setResult({ type: "events", data });
      }
      
      // Clear commands
      else if (command === "clear") {
        const target = parts[1];
        if (!target) throw new Error("Usage: clear <events|orders|deliveries|routes>");
        
        if (!["events", "orders", "deliveries", "routes"].includes(target)) {
          throw new Error("Invalid target. Use: events, orders, deliveries, or routes");
        }
        
        if (!window.confirm(`Clear all ${target}? This cannot be undone.`)) {
          setLoading(false);
          return;
        }
        
        const res = await fetch(`/api/admin/clear-${target}`, { method: "POST" });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || `Failed to clear ${target}`);
        
        setResult({ type: "clear", target, data });
      }
      
      // Simulate order
      else if (command === "simulate") {
        const zip = parts[1];
        const weight = parseFloat(parts[2]);
        if (!zip || !weight) throw new Error("Usage: simulate <zip> <weight>");
        
        const res = await fetch(`/api/simulate/fake-order?zip=${zip}&weight=${weight}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Simulation failed");
        
        setResult({ type: "simulate", data });
      }
      
      // Replay order
      else if (command === "replay") {
        const orderId = parts[1];
        if (!orderId) throw new Error("Usage: replay <orderId>");
        
        const res = await fetch("/api/simulate/replay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Replay failed");
        
        setResult({ type: "replay", data });
      }
      
      // List simulations
      else if (command === "simulations") {
        const res = await fetch("/api/simulate/list");
        const data = await res.json();
        
        if (!res.ok) throw new Error("Failed to fetch simulations");
        
        setResult({ type: "simulations", data });
      }
      
      else {
        throw new Error(`Unknown command: ${command}. Type "help" for available commands.`);
      }

      // Notify parent if needed
      if (onExecute) {
        onExecute(cmd);
      }

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.title}>⚡ AICOO Command Palette</span>
          <span style={styles.hint}>
            <kbd style={styles.kbd}>Esc</kbd> to close • <kbd style={styles.kbd}>↑↓</kbd> to navigate • <kbd style={styles.kbd}>Enter</kbd> to execute
          </span>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setSelectedIndex(0);
            setResult(null);
            setError(null);
          }}
          placeholder="Type a command... (e.g., 'assign 12345' or 'help')"
          style={styles.input}
        />

        {/* Results or Suggestions */}
        {result ? (
          <div style={styles.resultContainer}>
            {renderResult(result)}
          </div>
        ) : error ? (
          <div style={styles.error}>
            ❌ {error}
          </div>
        ) : loading ? (
          <div style={styles.loading}>
            ⏳ Executing command...
          </div>
        ) : (
          <div style={styles.suggestions}>
            {filteredCommands.length === 0 ? (
              <div style={styles.noResults}>No commands found. Type "help" to see all commands.</div>
            ) : (
              filteredCommands.map((cmd, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.suggestion,
                    ...(idx === selectedIndex ? styles.suggestionSelected : {})
                  }}
                  onClick={() => {
                    setInput(cmd.example);
                    executeCommand(cmd.example);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div style={{display: "flex", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs}}>
                    <span style={{
                      ...styles.categoryBadge,
                      backgroundColor: CATEGORY_COLORS[cmd.category],
                    }}>
                      {cmd.category}
                    </span>
                    <div style={styles.commandName}>{cmd.name}</div>
                  </div>
                  <div style={styles.commandDesc}>{cmd.description}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

// Render command results
function renderResult(result) {
  switch (result.type) {
    case "help":
      return (
        <div>
          <h3 style={{marginTop: 0, marginBottom: "16px", color: "#333"}}>Available Commands</h3>
          {result.data.map((cmd, idx) => (
            <div key={idx} style={{marginBottom: "12px", padding: "8px", backgroundColor: "#f9f9f9", borderRadius: "4px"}}>
              <strong>{cmd.name}</strong> — {cmd.description}
              <div style={{fontSize: "12px", color: "#666", marginTop: "4px"}}>Example: <code>{cmd.example}</code></div>
            </div>
          ))}
        </div>
      );

    case "assign":
      return (
        <div>
          <h3 style={{marginTop: 0, color: "#28a745"}}>✅ Delivery Assigned</h3>
          <p><strong>Order ID:</strong> {result.data.orderId}</p>
          <p><strong>Service:</strong> {result.data.service || result.data.carrier}</p>
          <p><strong>Price:</strong> ${result.data.price}</p>
          <p><strong>ETA:</strong> {result.data.eta}</p>
          {result.data.safeMode && <p style={{color: "#dc3545"}}>⚠️ Safe Mode Activated</p>}
        </div>
      );

    case "route":
      return (
        <div>
          <h3 style={{marginTop: 0, color: "#007bff"}}>📍 Route Quote</h3>
          <p><strong>Best Method:</strong> {result.data.bestMethod}</p>
          <p><strong>Slaughterhouse:</strong> {result.data.slaughterhouse?.name}</p>
          <p><strong>Distance:</strong> {result.data.slaughterhouse?.distance} miles</p>
          <p><strong>Estimated Time:</strong> {result.data.estimatedMinutes} min</p>
        </div>
      );

    case "courier":
      return (
        <div>
          <h3 style={{marginTop: 0, color: "#007bff"}}>📦 Courier Comparison</h3>
          <p><strong>Best:</strong> {result.data.best} - ${result.data[result.data.best.toLowerCase()]?.price}</p>
          <p><strong>FedEx:</strong> ${result.data.fedex?.price} ({result.data.fedex?.eta})</p>
          <p><strong>UPS:</strong> ${result.data.ups?.price} ({result.data.ups?.eta})</p>
          <p><strong>DHL:</strong> ${result.data.dhl?.price} ({result.data.dhl?.eta})</p>
        </div>
      );

    case "ride":
      return (
        <div>
          <h3 style={{marginTop: 0, color: "#007bff"}}>🚗 Ride Comparison</h3>
          <p><strong>Best:</strong> {result.data.best} - ${result.data[result.data.best.toLowerCase()]?.price}</p>
          <p><strong>Uber:</strong> ${result.data.uber?.price} ({result.data.uber?.estimatedMinutes} min)</p>
          <p><strong>Lyft:</strong> ${result.data.lyft?.price} ({result.data.lyft?.estimatedMinutes} min)</p>
        </div>
      );

    case "memory":
      return (
        <div>
          <h3 style={{marginTop: 0, color: "#9b59b6"}}>🧠 AICOO Memory</h3>
          <p><strong>Total Orders:</strong> {result.data.analytics.totalOrders}</p>
          <p><strong>Total Deliveries:</strong> {result.data.analytics.totalDeliveries}</p>
          <p><strong>Avg Delivery Price:</strong> ${result.data.analytics.avgDeliveryPrice}</p>
          <p><strong>Observations:</strong> {result.data.observations.length}</p>
        </div>
      );

    case "health":
      return (
        <div>
          <h3 style={{marginTop: 0, color: "#28a745"}}>💚 System Health</h3>
          <p><strong>Backend:</strong> {result.data.backend}</p>
          <p><strong>Mode:</strong> {result.data.mode}</p>
          <p><strong>Storage:</strong> {result.data.storage}</p>
          <p><strong>Uptime:</strong> {result.data.uptime?.toFixed(2)}s</p>
        </div>
      );

    case "clear":
      return (
        <div>
          <h3 style={{marginTop: 0, color: "#28a745"}}>✅ Cleared Successfully</h3>
          <p>All {result.target} have been cleared.</p>
        </div>
      );

    case "simulate":
    case "replay":
      return (
        <div>
          <h3 style={{marginTop: 0, color: "#9b59b6"}}>🧪 Simulation Complete</h3>
          <p><strong>Simulation ID:</strong> {result.data.simulationId}</p>
          <p><strong>Status:</strong> {result.data.success ? "✅ Success" : "❌ Failed"}</p>
          <p><strong>Order ID:</strong> {result.data.order?.id}</p>
          {result.data.routing && (
            <div style={{marginTop: "16px"}}>
              <h4 style={{fontSize: "14px", marginBottom: "8px"}}>Routing</h4>
              <p><strong>Method:</strong> {result.data.routing.bestMethod}</p>
              <p><strong>Slaughterhouse:</strong> {result.data.routing.slaughterhouse?.name}</p>
            </div>
          )}
          {result.data.delivery && (
            <div style={{marginTop: "16px"}}>
              <h4 style={{fontSize: "14px", marginBottom: "8px"}}>Delivery</h4>
              <p><strong>Service:</strong> {result.data.delivery.service || result.data.delivery.carrier}</p>
              <p><strong>Price:</strong> ${result.data.delivery.price}</p>
              <p><strong>ETA:</strong> {result.data.delivery.eta}</p>
            </div>
          )}
          {result.data.errors?.length > 0 && (
            <div style={{marginTop: "16px", color: "#dc3545"}}>
              <h4 style={{fontSize: "14px", marginBottom: "8px"}}>Errors</h4>
              {result.data.errors.map((err, idx) => <p key={idx}>• {err}</p>)}
            </div>
          )}
        </div>
      );

    case "simulations":
      return (
        <div>
          <h3 style={{marginTop: 0, color: "#9b59b6"}}>🧪 Simulation History</h3>
          {result.data.length === 0 ? (
            <p>No simulations yet.</p>
          ) : (
            <div>
              {result.data.slice(0, 10).map((sim, idx) => (
                <div key={idx} style={{
                  padding: "10px",
                  marginBottom: "8px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "4px",
                  borderLeft: `4px solid ${sim.success ? "#28a745" : "#dc3545"}`
                }}>
                  <strong>Simulation #{sim.simulationId}</strong>
                  <span style={{marginLeft: "10px", fontSize: "12px", color: "#666"}}>
                    {new Date(sim.timestamp).toLocaleString()}
                  </span>
                  <br/>
                  <span style={{fontSize: "13px"}}>
                    Order {sim.order?.id} → {sim.delivery?.service || "N/A"} (${sim.delivery?.price || "N/A"})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    default:
      return <pre style={{fontSize: "12px", overflow: "auto"}}>{JSON.stringify(result.data, null, 2)}</pre>;
  }
}

// Styles
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: "12vh",
    zIndex: 9999,
    animation: "fadeIn 0.2s ease-out",
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    boxShadow: shadows.xxl,
    width: "90%",
    maxWidth: "750px",
    maxHeight: "75vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    animation: "slideDown 0.3s ease-out",
  },
  header: {
    padding: spacing.lg,
    borderBottom: `1px solid ${colors.gray200}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.gray50,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  hint: {
    fontSize: typography.xs,
    color: colors.textMuted,
    display: "flex",
    gap: spacing.xs,
    alignItems: "center",
  },
  kbd: {
    padding: `${spacing.xs} ${spacing.sm}`,
    backgroundColor: colors.white,
    border: `1px solid ${colors.gray300}`,
    borderRadius: borderRadius.sm,
    fontFamily: "monospace",
    fontSize: typography.xs,
    boxShadow: shadows.sm,
  },
  input: {
    padding: spacing.lg,
    fontSize: typography.md,
    border: "none",
    borderBottom: `2px solid ${colors.gray200}`,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
  },
  suggestions: {
    overflowY: "auto",
    maxHeight: "450px",
    padding: `${spacing.sm} 0`,
  },
  suggestion: {
    padding: spacing.lg,
    cursor: "pointer",
    transition: "all 0.15s ease",
    borderLeft: `3px solid transparent`,
  },
  suggestionSelected: {
    backgroundColor: colors.ctBlueLight,
    borderLeft: `3px solid ${colors.ctBlue}`,
  },
  categoryBadge: {
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.sm,
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  commandName: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    fontFamily: "monospace",
  },
  commandDesc: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginLeft: "62px",
  },
  noResults: {
    padding: "60px 20px",
    textAlign: "center",
    color: colors.textMuted,
    fontSize: typography.base,
  },
  resultContainer: {
    padding: spacing.xl,
    overflowY: "auto",
    maxHeight: "450px",
  },
  error: {
    padding: spacing.lg,
    color: colors.danger,
    backgroundColor: colors.dangerLight,
    margin: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.base,
  },
  loading: {
    padding: "60px 20px",
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: typography.base,
  },
};

export default CommandPalette;
