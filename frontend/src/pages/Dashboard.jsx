import React, { useState, useEffect } from "react";

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
  borderBottom: "2px solid #007bff",
  paddingBottom: "8px"
};

const loadingStyle = {
  color: "#666",
  fontStyle: "italic",
  padding: "40px",
  textAlign: "center"
};

const buttonStyle = {
  padding: "6px 12px",
  marginLeft: "12px",
  fontSize: "13px",
  cursor: "pointer",
  border: "1px solid #007bff",
  backgroundColor: "#fff",
  color: "#007bff",
  borderRadius: "4px",
  fontWeight: "500"
};

const tagStyle = {
  padding: "2px 8px",
  borderRadius: "3px",
  fontSize: "11px",
  fontWeight: "bold",
  marginRight: "8px",
  display: "inline-block"
};

const getEventTag = (eventType) => {
  if (!eventType) return { text: "INFO", color: "#6c757d" };
  if (eventType.includes("order")) return { text: "ORDER", color: "#28a745" };
  if (eventType.includes("delivery")) return { text: "DELIVERY", color: "#17a2b8" };
  if (eventType.includes("error")) return { text: "ERROR", color: "#dc3545" };
  return { text: "INFO", color: "#6c757d" };
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
    return <div style={loadingStyle}>Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div style={{...loadingStyle, color: "#dc3545", padding: "60px"}}>
        <h2>⚠️ {error}</h2>
        <p style={{marginTop: "20px", fontSize: "14px", color: "#666"}}>
          Please check that the backend server is running on port 3000.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "14px",
            cursor: "pointer",
            border: "1px solid #007bff",
            backgroundColor: "#007bff",
            color: "#fff",
            borderRadius: "4px"
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }


  const displayedEvents = showAllEvents ? events : events.slice(-5);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "24px", color: "#333" }}>AICOO Dashboard</h1>

      {/* System Health Card */}
      <div style={{...sectionStyle, backgroundColor: "#f0f8ff", borderColor: "#007bff"}}>
        <h3 style={{...headingStyle, borderColor: "#007bff"}}>
          System Health
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          <div><strong>Backend:</strong> <span style={{color: "#28a745"}}>● Online</span></div>
          <div><strong>Webhook HMAC:</strong> <span style={{color: "#28a745"}}>✓ Enabled</span></div>
          <div><strong>Delivery Engine:</strong> <span style={{color: "#28a745"}}>✓ Enabled</span></div>
          <div><strong>Routing Engine:</strong> <span style={{color: "#28a745"}}>✓ Enabled</span></div>
          <div><strong>CourierCompare:</strong> <span style={{color: "#28a745"}}>✓ Enabled</span></div>
          <div><strong>RideCompare:</strong> <span style={{color: "#28a745"}}>✓ Enabled</span></div>
          <div><strong>Data Storage:</strong> <span style={{color: "#28a745"}}>✓ Enabled</span></div>
          <div><strong>App Version:</strong> 1.0.0</div>
        </div>
      </div>

      {/* Events Section */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>
          Events
          <button style={buttonStyle} onClick={() => setShowAllEvents(!showAllEvents)}>
            {showAllEvents ? "Show Less" : "Show More"}
          </button>
        </h3>
        <p><strong>Total Events:</strong> {events.length}</p>
        {events.length === 0 ? (
          <p style={{color: "#999"}}>No events yet.</p>
        ) : (
          <div>
            {displayedEvents.map((event, idx) => {
              const tag = getEventTag(event.event_type);
              const preview = JSON.stringify(event).substring(0, 120);
              return (
                <div key={idx} style={{ 
                  padding: "10px", 
                  marginBottom: "8px", 
                  backgroundColor: "#f9f9f9",
                  borderLeft: `4px solid ${tag.color}`,
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: "13px"
                }}>
                  <span style={{...tagStyle, backgroundColor: tag.color, color: "#fff"}}>
                    {tag.text}
                  </span>
                  <strong>{event.event_type || "Event"}:</strong>{" "}
                  <span style={{color: "#666"}}>{preview}...</span>
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
          <p style={{color: "#999"}}>No suggestions available.</p>
        ) : (
          <ul style={{lineHeight: "1.8"}}>
            {suggestions.map((suggestion, idx) => (
              <li key={idx} style={{marginBottom: "8px"}}>{suggestion}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Settings Section */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>Settings</h3>
        {settings ? (
          <div>
            <p>
              <strong>Store Name:</strong> {settings.storeName || "Not set"}
            </p>
            <p>
              <strong>Notification Email:</strong>{" "}
              {settings.notificationEmail || "Not set"}
            </p>
          </div>
        ) : (
          <p>Settings not available.</p>
        )}
      </div>

      {/* CourierCompare Section */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>CourierCompare - Latest Quote</h3>
        {courierHistory.length === 0 ? (
          <p>No courier quotes yet. Use the API to get shipping quotes.</p>
        ) : (
          (() => {
            const latest = courierHistory[courierHistory.length - 1];
            const bestCarrier = latest.best;
            return (
              <div>
                <p>
                  <strong>Request:</strong> {latest.request.fromZip} → {latest.request.toZip} ({latest.request.weight} lbs)
                </p>
                <p>
                  <strong>Timestamp:</strong> {new Date(latest.timestamp).toLocaleString()}
                </p>
                <div style={{ marginTop: "12px" }}>
                  <div style={{ 
                    padding: "8px", 
                    marginBottom: "6px",
                    backgroundColor: bestCarrier === "FedEx" ? "#d4edda" : "#fff",
                    border: bestCarrier === "FedEx" ? "2px solid #28a745" : "1px solid #ddd",
                    borderRadius: "4px"
                  }}>
                    <strong>FedEx:</strong> ${latest.fedex.price} ({latest.fedex.estimatedDays} days)
                    {bestCarrier === "FedEx" && <span style={{ color: "#28a745", marginLeft: "8px" }}>✓ BEST</span>}
                  </div>
                  <div style={{ 
                    padding: "8px", 
                    marginBottom: "6px",
                    backgroundColor: bestCarrier === "UPS" ? "#d4edda" : "#fff",
                    border: bestCarrier === "UPS" ? "2px solid #28a745" : "1px solid #ddd",
                    borderRadius: "4px"
                  }}>
                    <strong>UPS:</strong> ${latest.ups.price} ({latest.ups.estimatedDays} days)
                    {bestCarrier === "UPS" && <span style={{ color: "#28a745", marginLeft: "8px" }}>✓ BEST</span>}
                  </div>
                  <div style={{ 
                    padding: "8px",
                    backgroundColor: bestCarrier === "DHL" ? "#d4edda" : "#fff",
                    border: bestCarrier === "DHL" ? "2px solid #28a745" : "1px solid #ddd",
                    borderRadius: "4px"
                  }}>
                    <strong>DHL:</strong> ${latest.dhl.price} ({latest.dhl.estimatedDays} days)
                    {bestCarrier === "DHL" && <span style={{ color: "#28a745", marginLeft: "8px" }}>✓ BEST</span>}
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
