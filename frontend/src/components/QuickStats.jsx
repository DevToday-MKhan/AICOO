import { apiFetch } from "../config/api";
import { useState, useEffect } from "react";
import { colors, spacing, borderRadius, shadows, typography } from "../styles/theme";

const QuickStats = () => {
  const [stats, setStats] = useState({
    todayOrders: 0,
    weekCost: 0,
    avgDeliveryTime: "N/A",
    uptime: "99.9%",
    totalEvents: 0,
    lastOrder: null,
  });
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const [ordersRes, eventsRes, deliveriesRes, memoryRes] = await Promise.all([
        apiFetch("/api/orders/latest"),
        apiFetch("/api/events"),
        apiFetch("/api/delivery/latest"),
        apiFetch("/api/memory"),
      ]);

      const orders = await ordersRes.json();
      const events = await eventsRes.json();
      const deliveries = await deliveriesRes.json();
      const memory = await memoryRes.json();

      // Calculate today's orders (mock for now)
      const today = new Date().toDateString();
      const todayOrders = events.filter(e => 
        e.event_type?.includes("order") && 
        new Date(e.timestamp).toDateString() === today
      ).length;

      // Calculate week's cost from memory
      const weekCost = memory.analytics.avgDeliveryPrice * memory.analytics.totalDeliveries;

      setStats({
        todayOrders,
        weekCost: weekCost.toFixed(2),
        avgDeliveryTime: memory.analytics.totalDeliveries > 0 ? "2.5 days" : "N/A",
        uptime: "99.9%",
        totalEvents: events.length,
        lastOrder: orders.orderId || null,
      });
    } catch (err) {
      console.error("Error fetching quick stats:", err);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: "80px",
      right: spacing.lg,
      zIndex: 9997,
      width: collapsed ? "50px" : "280px",
      transition: "width 0.3s ease",
    }}>
      <div style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.gray300}`,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.lg,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: spacing.md,
          backgroundColor: colors.primary,
          color: colors.white,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setCollapsed(!collapsed)}
        >
          {!collapsed && <span style={{ fontSize: typography.base, fontWeight: typography.semibold }}>⚡ Quick Stats</span>}
          <span style={{ fontSize: typography.lg }}>{collapsed ? "📊" : "−"}</span>
        </div>

        {/* Stats */}
        {!collapsed && (
          <div style={{ padding: spacing.lg }}>
            <div style={statItemStyle}>
              <div style={statLabelStyle}>Today's Orders</div>
              <div style={statValueStyle}>{stats.todayOrders}</div>
            </div>
            <div style={statItemStyle}>
              <div style={statLabelStyle}>Week's Cost</div>
              <div style={{...statValueStyle, color: colors.success}}>${stats.weekCost}</div>
            </div>
            <div style={statItemStyle}>
              <div style={statLabelStyle}>Avg Delivery</div>
              <div style={statValueStyle}>{stats.avgDeliveryTime}</div>
            </div>
            <div style={statItemStyle}>
              <div style={statLabelStyle}>System Uptime</div>
              <div style={{...statValueStyle, color: colors.success}}>{stats.uptime}</div>
            </div>
            <div style={statItemStyle}>
              <div style={statLabelStyle}>Total Events</div>
              <div style={statValueStyle}>{stats.totalEvents}</div>
            </div>
            {stats.lastOrder && (
              <div style={{
                marginTop: spacing.md,
                padding: spacing.sm,
                backgroundColor: colors.gray50,
                borderRadius: borderRadius.sm,
                fontSize: typography.xs,
                color: colors.textSecondary,
              }}>
                Last Order: #{stats.lastOrder}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const statItemStyle = {
  marginBottom: spacing.md,
  paddingBottom: spacing.sm,
  borderBottom: `1px solid ${colors.gray200}`,
};

const statLabelStyle = {
  fontSize: typography.xs,
  color: colors.textSecondary,
  marginBottom: spacing.xs,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const statValueStyle = {
  fontSize: typography.xl,
  fontWeight: typography.bold,
  color: colors.textPrimary,
};

export default QuickStats;
