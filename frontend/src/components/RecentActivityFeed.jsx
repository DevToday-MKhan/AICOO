import { useEffect, useState } from "react";
import { colors, spacing, borderRadius, typography } from "../styles/theme";
import { useAICOOEvents } from "../hooks/useWebSocket";

const RecentActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time WebSocket events
  const { isConnected } = useAICOOEvents(
    // On new order
    (order) => {
      console.log('📦 Real-time order received:', order);
      const newActivity = {
        type: "order",
        timestamp: order.timestamp || new Date().toISOString(),
        icon: "📦",
        title: `Order #${order.id}`,
        subtitle: `New order received`,
      };
      setActivities(prev => [newActivity, ...prev].slice(0, 10));
    },
    // On new delivery
    (delivery) => {
      console.log('🚗 Real-time delivery received:', delivery);
      const newActivity = {
        type: "delivery",
        timestamp: delivery.timestamp,
        icon: delivery.type === "ride" ? "🚗" : "📮",
        title: `Delivery Assigned`,
        subtitle: `${delivery.service} • $${delivery.price}`,
      };
      setActivities(prev => [newActivity, ...prev].slice(0, 10));
    },
    // On new event
    (event) => {
      console.log('⚡ Real-time event received:', event);
      const newActivity = {
        type: "event",
        timestamp: event.timestamp,
        icon: "⚡",
        title: event.event_type || "Event",
        subtitle: new Date(event.timestamp).toLocaleTimeString(),
      };
      setActivities(prev => [newActivity, ...prev].slice(0, 10));
    }
  );

  useEffect(() => {
    fetchActivities();
    // Reduce polling frequency since we have WebSocket updates
    const interval = setInterval(fetchActivities, 30000); // Refresh every 30s as backup
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const [ordersRes, deliveriesRes, eventsRes, simsRes] = await Promise.all([
        fetch("/api/orders/latest"),
        fetch("/api/delivery/latest"),
        fetch("/api/events"),
        fetch("/api/simulate/list?limit=5"),
      ]);

      const orders = await ordersRes.json();
      const deliveries = await deliveriesRes.json();
      const events = await eventsRes.json();
      const simulations = await simsRes.json();

      // Combine and sort by timestamp
      const combined = [];

      // Add order
      if (orders.orderId) {
        combined.push({
          type: "order",
          timestamp: orders.routing?.timestamp || new Date().toISOString(),
          icon: "📦",
          title: `Order #${orders.orderId}`,
          subtitle: `${orders.customerZip} • ${orders.totalWeight} lbs`,
        });
      }

      // Add delivery
      if (deliveries.orderId) {
        combined.push({
          type: "delivery",
          timestamp: deliveries.timestamp,
          icon: deliveries.type === "ride" ? "🚗" : "📮",
          title: `Delivery Assigned`,
          subtitle: `${deliveries.service} • $${deliveries.price}`,
        });
      }

      // Add recent events
      events.slice(-5).forEach(event => {
        combined.push({
          type: "event",
          timestamp: event.timestamp,
          icon: "⚡",
          title: event.event_type || "Event",
          subtitle: new Date(event.timestamp).toLocaleTimeString(),
        });
      });

      // Add simulations
      if (Array.isArray(simulations)) {
        simulations.forEach(sim => {
          combined.push({
            type: "simulation",
            timestamp: sim.timestamp,
            icon: "🧪",
            title: `Simulation #${sim.simulationId}`,
            subtitle: sim.success ? `✓ Success` : `✗ Failed`,
          });
        });
      }

      // Sort by timestamp descending, take last 10
      combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setActivities(combined.slice(0, 10));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{color: colors.textMuted, padding: spacing.lg}}>Loading activities...</div>;
  }

  return (
    <div>
      {activities.length === 0 ? (
        <p style={{color: colors.textMuted}}>No recent activity</p>
      ) : (
        <div>
          {activities.map((activity, idx) => (
            <div key={idx} style={{
              display: "flex",
              gap: spacing.md,
              padding: spacing.md,
              marginBottom: spacing.sm,
              backgroundColor: idx % 2 === 0 ? colors.gray50 : colors.white,
              borderRadius: borderRadius.md,
              borderLeft: `3px solid ${getActivityColor(activity.type)}`,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.ctBlueLight}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? colors.gray50 : colors.white}
            >
              <span style={{fontSize: typography.xl}}>{activity.icon}</span>
              <div style={{flex: 1}}>
                <div style={{
                  fontSize: typography.base,
                  fontWeight: typography.semibold,
                  color: colors.textPrimary,
                  marginBottom: spacing.xs,
                }}>
                  {activity.title}
                </div>
                <div style={{
                  fontSize: typography.sm,
                  color: colors.textSecondary,
                }}>
                  {activity.subtitle}
                </div>
              </div>
              <div style={{
                fontSize: typography.xs,
                color: colors.textMuted,
                alignSelf: "center",
              }}>
                {formatTimeAgo(activity.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getActivityColor = (type) => {
  switch (type) {
    case "order": return colors.success;
    case "delivery": return colors.info;
    case "simulation": return colors.purple;
    case "event": return colors.warning;
    default: return colors.gray600;
  }
};

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now - then) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default RecentActivityFeed;
