import React, { useState, useEffect } from "react";
import { colors, spacing, borderRadius, shadows, typography, components } from "../styles/theme";
import LoadingSpinner from "../components/LoadingSpinner";

const sectionStyle = {
  ...components.card,
  marginBottom: spacing.xl,
};

const headingStyle = {
  ...components.cardHeader,
  fontSize: typography.xl,
  fontWeight: typography.bold,
};

const loadingStyle = {
  color: colors.textSecondary,
  fontStyle: "italic",
  padding: "60px 40px",
  textAlign: "center"
};

const buttonStyle = {
  padding: `${spacing.sm} ${spacing.lg}`,
  marginLeft: spacing.md,
  fontSize: typography.sm,
  cursor: "pointer",
  border: `1px solid ${colors.primary}`,
  backgroundColor: colors.white,
  color: colors.primary,
  borderRadius: borderRadius.md,
  fontWeight: typography.medium,
  transition: "all 0.2s ease",
};

const tagStyle = {
  ...components.badge,
  marginRight: spacing.sm,
};

const getEventTag = (eventType) => {
  if (!eventType) return { text: "INFO", color: colors.gray600 };
  if (eventType.includes("order")) return { text: "ORDER", color: colors.success };
  if (eventType.includes("delivery")) return { text: "DELIVERY", color: colors.info };
  if (eventType.includes("error")) return { text: "ERROR", color: colors.danger };
  return { text: "INFO", color: colors.gray600 };
};

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [courierHistory, setCourierHistory] = useState([]);
  const [rideHistory, setRideHistory] = useState([]);
  const [routeHistory, setRouteHistory] = useState([]);
  const [latestOrder, setLatestOrder] = useState(null);
  const [latestDelivery, setLatestDelivery] = useState(null);
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Collapsible state
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showAllDeliveries, setShowAllDeliveries] = useState(false);
  const [showAllRoutes, setShowAllRoutes] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch events
        const eventsRes = await fetch("/api/events");
        if (!eventsRes.ok) throw new Error("Failed to fetch events");
        const eventsData = await eventsRes.json();
        setEvents(eventsData);

        // Fetch suggestions
        const suggestionsRes = await fetch("/api/suggestions");
        if (!suggestionsRes.ok) throw new Error("Failed to fetch suggestions");
        const suggestionsData = await suggestionsRes.json();
        setSuggestions(suggestionsData);

        // Fetch settings
        const settingsRes = await fetch("/api/settings");
        if (!settingsRes.ok) throw new Error("Failed to fetch settings");
        const settingsData = await settingsRes.json();
        setSettings(settingsData);

        // Fetch courier history
        const courierRes = await fetch("/api/courier/history");
        if (!courierRes.ok) throw new Error("Failed to fetch courier history");
        const courierData = await courierRes.json();
        setCourierHistory(courierData);

        // Fetch ride history
        const rideRes = await fetch("/api/ride/history");
        if (!rideRes.ok) throw new Error("Failed to fetch ride history");
        const rideData = await rideRes.json();
        setRideHistory(rideData);

        // Fetch route history
        const routeRes = await fetch("/api/route/history");
        if (!routeRes.ok) throw new Error("Failed to fetch route history");
        const routeData = await routeRes.json();
        setRouteHistory(routeData);

        // Fetch latest Shopify order
        const orderRes = await fetch("/api/orders/latest");
        if (!orderRes.ok) throw new Error("Failed to fetch latest order");
        const orderData = await orderRes.json();
        setLatestOrder(orderData);

        // Fetch latest delivery assignment
        const deliveryRes = await fetch("/api/delivery/latest");
        if (!deliveryRes.ok) throw new Error("Failed to fetch latest delivery");
        const deliveryData = await deliveryRes.json();
        setLatestDelivery(deliveryData);

        // Fetch AICOO memory
        const memoryRes = await fetch("/api/memory");
        if (!memoryRes.ok) throw new Error("Failed to fetch memory");
        const memoryData = await memoryRes.json();
        setMemory(memoryData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Service Unavailable - Backend may be offline or experiencing issues");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={loadingStyle}>
        <LoadingSpinner size={50} color={colors.primary} />
        <div style={{ marginTop: spacing.lg, fontSize: typography.md }}>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{...loadingStyle, color: colors.danger, padding: "80px 40px"}}>
        <h2 style={{ marginTop: 0 }}>⚠️ {error}</h2>
        <p style={{marginTop: spacing.xl, fontSize: typography.base, color: colors.textSecondary}}>
          Please check that the backend server is running on port 3000.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            ...components.buttonPrimary,
            ...components.button,
            marginTop: spacing.xl,
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const displayedEvents = showAllEvents ? events : events.slice(-5);

  return (
    <div style={{ padding: spacing.xl, maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: spacing.xxl,
        paddingBottom: spacing.lg,
        borderBottom: `2px solid ${colors.gray200}`
      }}>
        <h1 style={{ margin: 0, color: colors.textPrimary, fontSize: typography.xxxl, fontWeight: typography.bold }}>
          AICOO Dashboard
        </h1>
        <div style={{
          padding: `${spacing.md} ${spacing.lg}`,
          backgroundColor: colors.ctBlueLight,
          border: `1px solid ${colors.ctBlue}`,
          borderRadius: borderRadius.md,
          fontSize: typography.sm,
          color: colors.ctBlue,
          fontWeight: typography.medium,
          boxShadow: shadows.sm,
        }}>
          Press <kbd style={{
            padding: `${spacing.xs} ${spacing.sm}`,
            backgroundColor: colors.white,
            border: `1px solid ${colors.gray300}`,
            borderRadius: borderRadius.sm,
            fontFamily: "monospace",
            fontSize: typography.xs,
            marginLeft: spacing.xs,
            marginRight: spacing.xs,
          }}>Ctrl+K</kbd> for Command Palette ⚡
        </div>
      </div>

      {/* System Health Card */}
      <div style={{...sectionStyle, backgroundColor: colors.ctBlueLight, borderColor: colors.ctBlue}}>
        <h3 style={{...headingStyle, borderColor: colors.ctBlue}}>
          System Health
        </h3>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
          gap: spacing.lg,
          fontSize: typography.base,
        }}>
          <div><strong>Backend:</strong> <span style={{color: colors.success}}>● Online</span></div>
          <div><strong>Webhook HMAC:</strong> <span style={{color: colors.success}}>✓ Enabled</span></div>
          <div><strong>Delivery Engine:</strong> <span style={{color: colors.success}}>✓ Enabled</span></div>
          <div><strong>Routing Engine:</strong> <span style={{color: colors.success}}>✓ Enabled</span></div>
          <div><strong>CourierCompare:</strong> <span style={{color: colors.success}}>✓ Enabled</span></div>
          <div><strong>RideCompare:</strong> <span style={{color: colors.success}}>✓ Enabled</span></div>
          <div><strong>Data Storage:</strong> <span style={{color: colors.success}}>✓ Enabled</span></div>
          <div><strong>App Version:</strong> 1.0.0</div>
        </div>
      </div>

      {/* Events Section */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>
          Events
          <button 
            style={buttonStyle} 
            onClick={() => setShowAllEvents(!showAllEvents)}
            onMouseEnter={(e) => e.target.style.backgroundColor = colors.primary}
            onMouseLeave={(e) => e.target.style.backgroundColor = colors.white}
          >
            {showAllEvents ? "Show Less" : "Show More"}
          </button>
        </h3>
        <p style={{ fontSize: typography.base, marginBottom: spacing.md }}>
          <strong>Total Events:</strong> {events.length}
        </p>
        {events.length === 0 ? (
          <p style={{color: colors.textMuted}}>No events yet.</p>
        ) : (
          <div>
            {displayedEvents.map((event, idx) => {
              const tag = getEventTag(event.event_type);
              const preview = JSON.stringify(event).substring(0, 150);
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} style={{ 
                  padding: spacing.md, 
                  marginBottom: spacing.sm, 
                  backgroundColor: isEven ? colors.gray50 : colors.white,
                  borderLeft: `4px solid ${tag.color}`,
                  borderRadius: borderRadius.md,
                  fontFamily: "monospace",
                  fontSize: typography.sm,
                  transition: "background-color 0.2s ease",
                }}>
                  <span style={{...tagStyle, backgroundColor: tag.color, color: colors.white}}>
                    {tag.text}
                  </span>
                  <strong>{event.event_type || "Event"}:</strong>{" "}
                  <span style={{color: colors.textSecondary}}>{preview}...</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Suggestions Section */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>Suggestions</h3>
        {suggestions.length === 0 ? (
          <p style={{color: colors.textMuted}}>No suggestions available.</p>
        ) : (
          <ul style={{lineHeight: "2", paddingLeft: spacing.xl, fontSize: typography.base}}>
            {suggestions.map((suggestion, idx) => (
              <li key={idx} style={{marginBottom: spacing.sm, color: colors.textPrimary}}>{suggestion}</li>
            ))}
          </ul>
        )}
      </div>

      {/* AICOO Memory Section */}
      {memory && (
        <div style={{...sectionStyle, backgroundColor: colors.purpleLight, borderColor: colors.purple}}>
          <h3 style={{...headingStyle, borderColor: colors.purple}}>
            🧠 AICOO Memory & Learning
          </h3>
          
          <div style={{marginBottom: spacing.xl}}>
            <h4 style={{fontSize: typography.lg, marginBottom: spacing.md, color: colors.textPrimary, fontWeight: typography.semibold}}>Analytics Summary</h4>
            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: spacing.lg, fontSize: typography.base}}>
              <div><strong>Total Orders:</strong> {memory.analytics.totalOrders}</div>
              <div><strong>Total Deliveries:</strong> {memory.analytics.totalDeliveries}</div>
              <div><strong>Total Routes:</strong> {memory.analytics.totalRoutes}</div>
              <div><strong>Avg Delivery Price:</strong> ${memory.analytics.avgDeliveryPrice}</div>
              <div><strong>Most Used Service:</strong> {memory.analytics.commonService || "N/A"}</div>
            </div>
          </div>

          <div style={{marginBottom: spacing.xl}}>
            <h4 style={{fontSize: typography.lg, marginBottom: spacing.md, color: colors.textPrimary, fontWeight: typography.semibold}}>Recent Observations</h4>
            {memory.observations.length === 0 ? (
              <p style={{color: colors.textMuted}}>No observations yet.</p>
            ) : (
              <div>
                {memory.observations.slice(-5).reverse().map((obs, idx) => (
                  <div key={idx} style={{
                    padding: spacing.md,
                    marginBottom: spacing.sm,
                    backgroundColor: colors.white,
                    borderLeft: `3px solid ${colors.purple}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.sm
                  }}>
                    <strong>{obs.type}</strong>
                    <span style={{marginLeft: spacing.md, color: colors.textSecondary, fontSize: typography.xs}}>
                      {new Date(obs.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{marginBottom: spacing.xl}}>
            <h4 style={{fontSize: typography.lg, marginBottom: spacing.md, color: colors.textPrimary, fontWeight: typography.semibold}}>Recent Deliveries</h4>
            {memory.deliveries.length === 0 ? (
              <p style={{color: colors.textMuted}}>No deliveries recorded yet.</p>
            ) : (
              <div>
                {memory.deliveries.slice(-5).reverse().map((del, idx) => (
                  <div key={idx} style={{
                    padding: spacing.md,
                    marginBottom: spacing.sm,
                    backgroundColor: colors.white,
                    borderRadius: borderRadius.md,
                    fontSize: typography.sm
                  }}>
                    <strong>Order {del.orderId}:</strong> {del.service} - ${del.price}
                    {del.safeMode && <span style={{marginLeft: spacing.md, color: colors.danger, fontSize: typography.xs}}>⚠️ Safe Mode</span>}
                    <br/>
                    <span style={{color: colors.textSecondary, fontSize: typography.xs}}>
                      {new Date(del.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Section */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>Settings</h3>
        {settings ? (
          <div style={{fontSize: typography.base, lineHeight: "1.8"}}>
            <p style={{marginBottom: spacing.md}}>
              <strong>Store Name:</strong> {settings.storeName || "Not set"}
            </p>
            <p style={{marginBottom: spacing.md}}>
              <strong>Notification Email:</strong>{" "}
              {settings.notificationEmail || "Not set"}
            </p>
          </div>
        ) : (
          <p style={{color: colors.textMuted}}>Settings not available.</p>
        )}
      </div>

      {/* CourierCompare Section */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>CourierCompare - Latest Quote</h3>
        {courierHistory.length === 0 ? (
          <p style={{color: colors.textMuted}}>No courier quotes yet. Use the API to get shipping quotes.</p>
        ) : (
          (() => {
            const latest = courierHistory[courierHistory.length - 1];
            const bestCarrier = latest.best;
            return (
              <div>
                <p style={{fontSize: typography.base, marginBottom: spacing.md}}>
                  <strong>Request:</strong> {latest.request.fromZip} → {latest.request.toZip} ({latest.request.weight} lbs)
                </p>
                <p style={{fontSize: typography.base, marginBottom: spacing.md, color: colors.textSecondary}}>
                  <strong>Timestamp:</strong> {new Date(latest.timestamp).toLocaleString()}
                </p>
                <div style={{ marginTop: spacing.lg }}>
                  <div style={{ 
                    padding: spacing.md, 
                    marginBottom: spacing.sm,
                    backgroundColor: bestCarrier === "FedEx" ? colors.successLight : colors.white,
                    border: bestCarrier === "FedEx" ? `2px solid ${colors.success}` : `1px solid ${colors.gray300}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.base,
                  }}>
                    <strong>FedEx:</strong> ${latest.fedex.price} ({latest.fedex.estimatedDays} days)
                    {bestCarrier === "FedEx" && <span style={{ color: colors.success, marginLeft: spacing.sm, fontWeight: typography.bold }}>✓ BEST</span>}
                  </div>
                  <div style={{ 
                    padding: spacing.md, 
                    marginBottom: spacing.sm,
                    backgroundColor: bestCarrier === "UPS" ? colors.successLight : colors.white,
                    border: bestCarrier === "UPS" ? `2px solid ${colors.success}` : `1px solid ${colors.gray300}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.base,
                  }}>
                    <strong>UPS:</strong> ${latest.ups.price} ({latest.ups.estimatedDays} days)
                    {bestCarrier === "UPS" && <span style={{ color: colors.success, marginLeft: spacing.sm, fontWeight: typography.bold }}>✓ BEST</span>}
                  </div>
                  <div style={{ 
                    padding: spacing.md,
                    backgroundColor: bestCarrier === "DHL" ? colors.successLight : colors.white,
                    border: bestCarrier === "DHL" ? `2px solid ${colors.success}` : `1px solid ${colors.gray300}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.base,
                  }}>
                    <strong>DHL:</strong> ${latest.dhl.price} ({latest.dhl.estimatedDays} days)
                    {bestCarrier === "DHL" && <span style={{ color: colors.success, marginLeft: spacing.sm, fontWeight: typography.bold }}>✓ BEST</span>}
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>

      {/* RideCompare Section */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>RideCompare - Latest Quote</h3>
        {rideHistory.length === 0 ? (
          <p>No ride quotes yet. Use the API to get ride-sharing quotes.</p>
        ) : (
          (() => {
            const latest = rideHistory[rideHistory.length - 1];
            const bestService = latest.best;
            return (
              <div>
                <p>
                  <strong>Route:</strong> {latest.request.fromZip} → {latest.request.toZip}
                </p>
                <p>
                  <strong>Timestamp:</strong> {new Date(latest.timestamp).toLocaleString()}
                </p>
                <div style={{ marginTop: "12px" }}>
                  <div style={{ 
                    padding: "8px", 
                    marginBottom: "6px",
                    backgroundColor: bestService === "Uber" ? "#d4edda" : "#fff",
                    border: bestService === "Uber" ? "2px solid #28a745" : "1px solid #ddd",
                    borderRadius: "4px"
                  }}>
                    <strong>Uber:</strong> ${latest.uber.price} (~{latest.uber.estimatedMinutes} min)
                    {latest.uber.surgeMultiplier > 1.2 && <span style={{ color: "#dc3545", marginLeft: "8px" }}>⚡ Surge {latest.uber.surgeMultiplier}x</span>}
                    {bestService === "Uber" && <span style={{ color: "#28a745", marginLeft: "8px" }}>✓ BEST</span>}
                  </div>
                  <div style={{ 
                    padding: "8px",
                    backgroundColor: bestService === "Lyft" ? "#d4edda" : "#fff",
                    border: bestService === "Lyft" ? "2px solid #28a745" : "1px solid #ddd",
                    borderRadius: "4px"
                  }}>
                    <strong>Lyft:</strong> ${latest.lyft.price} (~{latest.lyft.estimatedMinutes} min)
                    {latest.lyft.surgeMultiplier > 1.2 && <span style={{ color: "#dc3545", marginLeft: "8px" }}>⚡ Surge {latest.lyft.surgeMultiplier}x</span>}
                    {bestService === "Lyft" && <span style={{ color: "#28a745", marginLeft: "8px" }}>✓ BEST</span>}
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>

      {/* Routing Engine Section */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>Routing Engine - Latest Route</h3>
        {routeHistory.length === 0 ? (
          <p>No routing decisions yet. Use the API to calculate optimal delivery routes.</p>
        ) : (
          (() => {
            const latest = routeHistory[routeHistory.length - 1];
            const bestMethod = latest.bestMethod;
            return (
              <div>
                <p>
                  <strong>Customer ZIP:</strong> {latest.customerZip} | <strong>Weight:</strong> {latest.weight} lbs
                </p>
                <p>
                  <strong>Selected Slaughterhouse:</strong> {latest.slaughterhouse.name} (ZIP: {latest.slaughterhouse.zip}, ~{latest.slaughterhouse.distance.toFixed(1)} mi)
                </p>
                <p>
                  <strong>Timestamp:</strong> {new Date(latest.timestamp).toLocaleString()}
                </p>
                <div style={{ marginTop: "12px" }}>
                  {/* Courier Option */}
                  <div style={{ 
                    padding: "12px", 
                    marginBottom: "8px",
                    backgroundColor: bestMethod === "courier" ? "#d4edda" : "#fff",
                    border: bestMethod === "courier" ? "2px solid #28a745" : "1px solid #ddd",
                    borderRadius: "4px"
                  }}>
                    <strong>📦 Courier Option:</strong> {latest.courier.best} - ${latest.courier[latest.courier.best.toLowerCase()].price}
                    {bestMethod === "courier" && <span style={{ color: "#28a745", marginLeft: "8px" }}>✓ RECOMMENDED</span>}
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                      FedEx: ${latest.courier.fedex.price} | UPS: ${latest.courier.ups.price} | DHL: ${latest.courier.dhl.price}
                    </div>
                  </div>

                  {/* Ride Option */}
                  <div style={{ 
                    padding: "12px",
                    backgroundColor: bestMethod === "ride" ? "#d4edda" : "#fff",
                    border: bestMethod === "ride" ? "2px solid #28a745" : "1px solid #ddd",
                    borderRadius: "4px"
                  }}>
                    <strong>🚗 Ride Option:</strong> {latest.ride.best} - ${latest.ride[latest.ride.best.toLowerCase()].price}
                    {bestMethod === "ride" && <span style={{ color: "#28a745", marginLeft: "8px" }}>✓ RECOMMENDED</span>}
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                      Uber: ${latest.ride.uber.price} | Lyft: ${latest.ride.lyft.price}
                    </div>
                  </div>
                </div>
                <p style={{ marginTop: "12px", padding: "8px", backgroundColor: "#e7f3ff", borderLeft: "4px solid #007bff", fontWeight: "bold" }}>
                  💡 {latest.recommendation}
                </p>
              </div>
            );
          })()
        )}
      </div>

      {/* Shopify Order Routing Section */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>Shopify - Latest Order Route</h3>
        {!latestOrder || !latestOrder.orderId ? (
          <p>No Shopify orders processed yet. Orders will appear here when a Shopify webhook is received.</p>
        ) : (
          <div>
            <p>
              <strong>Order ID:</strong> {latestOrder.orderId} | <strong>Customer ZIP:</strong> {latestOrder.customerZip} | <strong>Weight:</strong> {latestOrder.totalWeight} lbs
            </p>
            <p>
              <strong>Selected Slaughterhouse:</strong> {latestOrder.routing.slaughterhouse.name} (ZIP: {latestOrder.routing.slaughterhouse.zip}, ~{latestOrder.routing.slaughterhouse.distance.toFixed(1)} mi)
            </p>
            <p>
              <strong>Timestamp:</strong> {new Date(latestOrder.routing.timestamp).toLocaleString()}
            </p>
            <div style={{ marginTop: "12px" }}>
              {/* Courier Option */}
              <div style={{ 
                padding: "12px", 
                marginBottom: "8px",
                backgroundColor: latestOrder.routing.bestMethod === "courier" ? "#d4edda" : "#fff",
                border: latestOrder.routing.bestMethod === "courier" ? "2px solid #28a745" : "1px solid #ddd",
                borderRadius: "4px"
              }}>
                <strong>📦 Courier Option:</strong> {latestOrder.routing.courier.best} - ${latestOrder.routing.courier[latestOrder.routing.courier.best.toLowerCase()].price}
                {latestOrder.routing.bestMethod === "courier" && <span style={{ color: "#28a745", marginLeft: "8px" }}>✓ RECOMMENDED</span>}
                <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                  FedEx: ${latestOrder.routing.courier.fedex.price} | UPS: ${latestOrder.routing.courier.ups.price} | DHL: ${latestOrder.routing.courier.dhl.price}
                </div>
              </div>

              {/* Ride Option */}
              <div style={{ 
                padding: "12px",
                backgroundColor: latestOrder.routing.bestMethod === "ride" ? "#d4edda" : "#fff",
                border: latestOrder.routing.bestMethod === "ride" ? "2px solid #28a745" : "1px solid #ddd",
                borderRadius: "4px"
              }}>
                <strong>🚗 Ride Option:</strong> {latestOrder.routing.ride.best} - ${latestOrder.routing.ride[latestOrder.routing.ride.best.toLowerCase()].price}
                {latestOrder.routing.bestMethod === "ride" && <span style={{ color: "#28a745", marginLeft: "8px" }}>✓ RECOMMENDED</span>}
                <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                  Uber: ${latestOrder.routing.ride.uber.price} | Lyft: ${latestOrder.routing.ride.lyft.price}
                </div>
              </div>
            </div>
            <p style={{ marginTop: "12px", padding: "8px", backgroundColor: "#e7f3ff", borderLeft: "4px solid #007bff", fontWeight: "bold" }}>
              💡 {latestOrder.routing.recommendation}
            </p>
          </div>
        )}
      </div>

      {/* Delivery Assignments Section */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>Delivery Assignments - Latest</h3>
        {!latestDelivery || latestDelivery.message ? (
          <p>{latestDelivery?.message || "No deliveries assigned yet. Use the API to assign deliveries."}</p>
        ) : (
          <div>
            <p>
              <strong>Order ID:</strong> {latestDelivery.orderId} | <strong>Customer ZIP:</strong> {latestDelivery.customerZip} | <strong>Weight:</strong> {latestDelivery.weight} lbs
            </p>
            <p>
              <strong>Slaughterhouse:</strong> {latestDelivery.slaughterhouse.name} (ZIP: {latestDelivery.slaughterhouse.zip}, ~{latestDelivery.slaughterhouse.distance.toFixed(1)} mi)
            </p>
            <p>
              <strong>Assigned:</strong> {new Date(latestDelivery.timestamp).toLocaleString()}
            </p>
            <div style={{ 
              marginTop: "12px", 
              padding: "16px", 
              backgroundColor: "#d4edda", 
              border: "2px solid #28a745",
              borderRadius: "8px"
            }}>
              {latestDelivery.type === "ride" ? (
                <>
                  <div style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>
                    🚗 {latestDelivery.service} - ASSIGNED
                  </div>
                  <div style={{ fontSize: "16px", marginBottom: "4px" }}>
                    <strong>Price:</strong> ${latestDelivery.price}
                  </div>
                  <div style={{ fontSize: "16px", marginBottom: "4px" }}>
                    <strong>ETA:</strong> {latestDelivery.eta}
                  </div>
                  {latestDelivery.surgeMultiplier > 1.2 && (
                    <div style={{ fontSize: "14px", color: "#dc3545", marginTop: "8px" }}>
                      ⚡ Surge Pricing: {latestDelivery.surgeMultiplier}x
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>
                    📦 {latestDelivery.carrier} - ASSIGNED
                  </div>
                  <div style={{ fontSize: "16px", marginBottom: "4px" }}>
                    <strong>Price:</strong> ${latestDelivery.price}
                  </div>
                  <div style={{ fontSize: "16px", marginBottom: "4px" }}>
                    <strong>ETA:</strong> {latestDelivery.eta}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
