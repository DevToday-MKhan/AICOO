import { useState } from "react";
import { getColors, spacing, borderRadius, shadows, typography, animations, transitions } from "../styles/theme";
import { LoadingDots } from "../components/LoadingSpinner";
import { apiFetch } from "../config/api";

function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `👋 **I am AICOO™** — your AI Chief Operating Officer.

I analyze operations, optimize logistics, monitor system health, and provide strategic guidance for your business.

**What I can do:**
• Analyze Shopify orders and webhooks
• Assign deliveries with /assign [orderID]
• Compare courier & rideshare pricing
• Monitor system health and performance
• Learn from operations with persistent memory
• Provide operational insights and forecasts
• Execute admin commands

**Quick Commands:**
\`/assign 12345\` — Assign delivery for order
\`/analytics\` — View daily analytics snapshot
\`/summary\` — Daily performance summary
\`/trends\` — 7-day trend analysis
\`/predict\` — Tomorrow's predictions
\`/memory\` — View AICOO memory & learning data
\`/rates 07102 10001 5\` — Compare carrier rates
\`/label 12345\` — Create shipping label
\`/track FX1234567890\` — Track shipment
\`/validate-address <address>\` — Validate address
\`health\` — Check system status
\`analyze orders\` — Review recent order trends

How can I help optimize your operations today?`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    const userInput = input;
    setInput("");
    setLoading(true);

    try {
      // Check for /assign command
      const assignMatch = userInput.match(/^\/assign\s+(\d+)/i);
      
      // Check for /memory command
      const memoryMatch = userInput.match(/^\/memory$/i);
      
      // Check for analytics commands
      const analyticsMatch = userInput.match(/^\/(analytics|summary|trends|predict)$/i);
      
      // Check for carrier commands (NEW - Mission 11)
      const ratesMatch = userInput.match(/^\/rates\s+(\d{5})\s+(\d{5})\s+(\d+(?:\.\d+)?)/i);
      const labelMatch = userInput.match(/^\/label\s+(.+)/i);
      const trackMatch = userInput.match(/^\/track\s+(.+)/i);
      const validateMatch = userInput.match(/^\/validate-address\s+(.+)/i);
      
      if (assignMatch) {
        const orderId = assignMatch[1];
        
        // Call delivery assignment API
        const res = await apiFetch("/api/delivery/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });

        if (!res.ok) {
          throw new Error(`Delivery API error: ${res.status}`);
        }

        const data = await res.json();

        if (data.error) {
          // Error response from API
          const aiMessage = {
            role: "assistant",
            content: `❌ Error: ${data.error}`,
          };
          setMessages((prev) => [...prev, aiMessage]);
        } else {
          // Format delivery assignment response
          const deliveryType = data.type === "ride" ? "🚗" : "📦";
          const serviceName = data.type === "ride" ? data.service : data.carrier;
          const safeModeWarning = data.safeMode ? "\n\n⚠️ Safe Mode: Using fallback delivery method" : "";
          const aiMessage = {
            role: "assistant",
            content: `✅ Delivery assigned for Order #${data.orderId}!\n\n${deliveryType} **${serviceName}** - $${data.price}\nETA: ${data.eta}\nCustomer ZIP: ${data.customerZip}\nSlaughterhouse: ${data.slaughterhouse.name}${safeModeWarning}\n\nCheck the Dashboard for full details.`,
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
      } else if (memoryMatch) {
        // Show AICOO memory
        const res = await apiFetch("/api/memory");
        const memory = await res.json();
        
        const recentObs = memory.observations.slice(-5).reverse();
        const recentDels = memory.deliveries.slice(-5).reverse();
        
        const obsText = recentObs.length > 0
          ? recentObs.map(o => `• ${o.type} (${new Date(o.timestamp).toLocaleString()})`).join("\n")
          : "No recent observations";
        
        const delsText = recentDels.length > 0
          ? recentDels.map(d => `• Order ${d.orderId}: ${d.service} - $${d.price}`).join("\n")
          : "No recent deliveries";
        
        const aiMessage = {
          role: "assistant",
          content: `🧠 **AICOO Memory Snapshot**\n\n**Recent Observations:**\n${obsText}\n\n**Recent Deliveries:**\n${delsText}\n\n**Analytics:**\n• Total Orders: ${memory.analytics.totalOrders}\n• Total Deliveries: ${memory.analytics.totalDeliveries}\n• Avg Delivery Price: $${memory.analytics.avgDeliveryPrice}\n• Most Used Service: ${memory.analytics.commonService || "N/A"}`
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else if (analyticsMatch) {
        const command = analyticsMatch[1].toLowerCase();
        
        if (command === "analytics" || command === "summary") {
          const res = await apiFetch("/api/analytics/daily");
          const data = await res.json();
          
          const warnings = data.warnings && data.warnings.length > 0
            ? `\n\n⚠️ **Warnings:**\n${data.warnings.map(w => `• ${w}`).join('\n')}`
            : '';
          
          const recs = data.recommendations && data.recommendations.length > 0
            ? `\n\n💡 **Recommendations:**\n${data.recommendations.map(r => `• ${r}`).join('\n')}`
            : '';
          
          const aiMessage = {
            role: "assistant",
            content: `📊 **Daily Analytics Snapshot**\n\n**Today's Performance:**\n• Orders: ${data.orders?.today || 0}\n• Deliveries: ${data.deliveries?.today || 0}\n• Avg Cost: $${data.deliveries?.avgCost?.toFixed(2) || '0.00'}\n• Efficiency: ${data.efficiency || 100}%${warnings}${recs}`
          };
          setMessages((prev) => [...prev, aiMessage]);
        } else if (command === "trends") {
          const res = await apiFetch("/api/analytics/trends");
          const data = await res.json();
          
          const trendText = data.last7Days && data.last7Days.length > 0
            ? data.last7Days.slice(0, 3).map(d => 
                `• ${new Date(d.date).toLocaleDateString()}: ${d.orders} orders, $${d.cost?.toFixed(2)}`
              ).join('\n')
            : 'No trend data available';
          
          const aiMessage = {
            role: "assistant",
            content: `📈 **7-Day Trends**\n\n**Trend Direction:** ${data.trend || 'stable'}\n\n**Recent Days:**\n${trendText}\n\nUse the Dashboard for complete visualization.`
          };
          setMessages((prev) => [...prev, aiMessage]);
        } else if (command === "predict") {
          const res = await apiFetch("/api/analytics");
          const data = await res.json();
          const pred = data.predictions;
          
          const surgeTxt = pred?.surgeWarnings && pred.surgeWarnings.length > 0
            ? `\n\n⚠️ **Surge Warnings:**\n${pred.surgeWarnings.map(s => `• ${s}`).join('\n')}`
            : '';
          
          const aiMessage = {
            role: "assistant",
            content: `🔮 **Tomorrow's Predictions**\n\n• Predicted Cost: $${pred?.tomorrowCost?.toFixed(2) || '0.00'}\n• Predicted Orders: ${pred?.tomorrowOrders || 0}\n• Confidence: ${pred?.confidence || 'low'}\n• Trend: ${pred?.trend || 'stable'}${surgeTxt}`
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
      } else if (ratesMatch) {
        // /rates command - Rate shopping
        const fromZip = ratesMatch[1];
        const toZip = ratesMatch[2];
        const weight = parseFloat(ratesMatch[3]);
        
        const res = await apiFetch("/api/courier/rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fromZip, toZip, weight })
        });
        
        if (!res.ok) {
          throw new Error(`Rates API error: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.error) {
          const aiMessage = {
            role: "assistant",
            content: `❌ Error: ${data.error}`
          };
          setMessages((prev) => [...prev, aiMessage]);
        } else {
          // Format rate comparison response
          const fedexServices = data.fedex?.services || [];
          const upsServices = data.ups?.services || [];
          const dhlServices = data.dhl?.services || [];
          
          const fedexText = fedexServices.length > 0
            ? fedexServices.map(s => `  • ${s.service}: $${s.price} (${s.deliveryDays}d)`).join('\n')
            : '  • No rates available';
          
          const upsText = upsServices.length > 0
            ? upsServices.map(s => `  • ${s.service}: $${s.price} (${s.deliveryDays}d)`).join('\n')
            : '  • No rates available';
          
          const dhlText = dhlServices.length > 0
            ? dhlServices.map(s => `  • ${s.service}: $${s.price} (${s.deliveryDays}d)`).join('\n')
            : '  • No rates available';
          
          const bestOption = data.best
            ? `\n\n⭐ **BEST OPTION**\n${data.best.carrier} ${data.best.service}\n💰 $${data.best.price} (${data.best.deliveryDays} days)\n💵 Save $${data.best.savings} vs next best`
            : '';
          
          const mockWarning = (data.fedex?.mock || data.ups?.mock || data.dhl?.mock)
            ? '\n\n⚠️ *Using mock data - configure carrier API credentials in Admin for live rates*'
            : '';
          
          const aiMessage = {
            role: "assistant",
            content: `🔍 **Rate Shopping Results**\n\nRoute: ${fromZip} → ${toZip} (${weight} lbs)\n\n📮 **FedEx:**\n${fedexText}\n\n📦 **UPS:**\n${upsText}\n\n🚚 **DHL:**\n${dhlText}${bestOption}${mockWarning}`
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
      } else if (labelMatch) {
        // /label command - Create shipping label
        const orderId = labelMatch[1].trim();
        
        // For demo, we'll use default shipment data
        // In production, this would fetch order details first
        const res = await apiFetch("/api/courier/label", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderId,
            carrier: "fedex",
            fromZip: "07102",
            toZip: "10001",
            weight: 5,
            customerName: "Customer",
            customerAddress: "123 Main St",
            customerCity: "New York",
            customerState: "NY"
          })
        });
        
        if (!res.ok) {
          throw new Error(`Label API error: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.error) {
          const aiMessage = {
            role: "assistant",
            content: `❌ Error: ${data.error}`
          };
          setMessages((prev) => [...prev, aiMessage]);
        } else {
          const mockWarning = data.mock
            ? '\n\n⚠️ *Mock label generated - configure carrier API credentials in Admin for real labels*'
            : '';
          
          const aiMessage = {
            role: "assistant",
            content: `✅ **Shipping Label Created!**\n\nOrder: #${orderId}\nCarrier: ${data.carrier}\nTracking: \`${data.trackingNumber}\`\nCost: $${data.cost}\nService: ${data.service}\nEstimated Delivery: ${new Date(data.estimatedDelivery).toLocaleDateString()}\n\n📄 [Download Label](${data.labelUrl})${mockWarning}\n\nUse \`/track ${data.trackingNumber}\` to monitor shipment.`
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
      } else if (trackMatch) {
        // /track command - Track shipment
        const trackingNumber = trackMatch[1].trim();
        
        const res = await apiFetch("/api/courier/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackingNumber })
        });
        
        if (!res.ok) {
          throw new Error(`Track API error: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.error) {
          const aiMessage = {
            role: "assistant",
            content: `❌ Error: ${data.error}`
          };
          setMessages((prev) => [...prev, aiMessage]);
        } else {
          const statusEmoji = data.status === 'DELIVERED' ? '✅'
            : data.status === 'IN_TRANSIT' ? '🚚'
            : data.status === 'PICKED_UP' ? '📦'
            : '📍';
          
          const eventsText = data.events && data.events.length > 0
            ? data.events.slice(0, 5).map(e => 
                `• ${new Date(e.timestamp).toLocaleString()}\n  ${e.status} - ${e.location || 'N/A'}`
              ).join('\n')
            : 'No tracking events available';
          
          const mockWarning = data.mock
            ? '\n\n⚠️ *Mock tracking data - configure carrier API credentials in Admin for live tracking*'
            : '';
          
          const aiMessage = {
            role: "assistant",
            content: `📦 **Shipment Tracking**\n\nTracking #: \`${trackingNumber}\`\nCarrier: ${data.carrier}\nStatus: ${statusEmoji} ${data.status}\nEst. Delivery: ${new Date(data.estimatedDelivery).toLocaleDateString()}\n\n**History:**\n${eventsText}${mockWarning}`
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
      } else if (validateMatch) {
        // /validate-address command
        const addressString = validateMatch[1].trim();
        
        // Parse address (simple format: street, city, state zip)
        const parts = addressString.split(',').map(p => p.trim());
        const address = {
          street: parts[0] || addressString,
          city: parts[1] || "New York",
          state: parts[2]?.split(' ')[0] || "NY",
          zip: parts[2]?.split(' ')[1] || "10001"
        };
        
        const res = await apiFetch("/api/courier/validate-address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, carrier: "fedex" })
        });
        
        if (!res.ok) {
          throw new Error(`Address validation error: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.error) {
          const aiMessage = {
            role: "assistant",
            content: `❌ Error: ${data.error}`
          };
          setMessages((prev) => [...prev, aiMessage]);
        } else {
          const validEmoji = data.valid ? '✅' : '⚠️';
          const validText = data.valid ? 'Valid' : 'Invalid or Unverified';
          
          const aiMessage = {
            role: "assistant",
            content: `📍 **Address Validation**\n\nStatus: ${validEmoji} ${validText}\nConfidence: ${data.confidence || 'medium'}\n\n**Submitted:**\n${address.street}\n${address.city}, ${address.state} ${address.zip}\n\n${data.valid ? '✓ Address can be used for shipping' : '⚠️ Address may need correction'}`
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
      } else {
        // Fetch analytics insights for context injection
        let analyticsContext = "";
        try {
          const analyticsRes = await apiFetch("/api/analytics/daily");
          const analytics = await analyticsRes.json();
          
          if (analytics) {
            analyticsContext = `\n\n[AICOO Intelligence Context]
Orders Today: ${analytics.orders?.today || 0}
Deliveries: ${analytics.deliveries?.today || 0}
Avg Cost: $${analytics.deliveries?.avgCost?.toFixed(2) || '0.00'}
Efficiency: ${analytics.efficiency || 100}%
${analytics.warnings && analytics.warnings.length > 0 ? `Warnings: ${analytics.warnings.join('; ')}` : ''}
`;
          }
        } catch (e) {
          console.warn("Failed to fetch analytics context:", e);
        }
        
        // Fetch recent memory for context injection
        const memoryRes = await apiFetch("/api/memory");
        const memory = await memoryRes.json();
        const recentContext = memory.observations.slice(-5).reverse();
        
        const contextString = recentContext.length > 0
          ? `\n\nRecent System Activity:\n${recentContext.map(o => `- ${o.type} at ${new Date(o.timestamp).toLocaleTimeString()}`).join("\n")}`
          : "";
        
        // Normal GPT chat with memory + analytics context
        const res = await apiFetch("/api/gpt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userInput + analyticsContext + contextString }),
        });

        if (!res.ok) {
          throw new Error(`GPT API error: ${res.status}`);
        }

        const data = await res.json();
        const aiMessage = { role: "assistant", content: data.answer };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Service Unavailable - Unable to connect to AICOO backend. Please check that the server is running.",
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <style>
        {animations.slideDown}
        {animations.slideUp}
        {animations.pulse}
        {animations.fadeIn}
        {`
          .chat-message:hover {
            transform: translateY(-2px);
            box-shadow: ${shadows.lg};
          }
          .send-button:hover {
            transform: scale(1.05);
            box-shadow: ${shadows.glow};
          }
          .send-button:active {
            transform: scale(0.98);
          }
          .send-button::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255,255,255,0.5);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
          }
          .send-button:active::before {
            width: 300px;
            height: 300px;
          }
          .chat-input:focus {
            border-color: ${getColors().primary};
            box-shadow: ${shadows.glow};
          }
          .header-bg {
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
          }
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <div style={styles.header}>
        <div className="header-bg"></div>
        <div style={{position: "relative", zIndex: 1}}>
          <h1 style={{margin: 0, fontSize: typography.xxxl, textShadow: "0 2px 10px rgba(0,0,0,0.2)"}}>AICOO™</h1>
          <p style={{margin: `${spacing.sm} 0 0 0`, color: "white", fontSize: typography.sm, opacity: 0.95}}>
            AI Chief Operating Officer — Enterprise Operational Intelligence
          </p>
        </div>
        <div style={{
          padding: `${spacing.md} ${spacing.lg}`,
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)",
          border: `1px solid rgba(255,255,255,0.25)`,
          borderRadius: "10px",
          fontSize: typography.sm,
          color: "white",
          fontWeight: typography.medium,
          boxShadow: shadows.md,
          position: "relative",
          zIndex: 1
        }}>
          <kbd style={{
            padding: `${spacing.xs} ${spacing.sm}`,
            background: "rgba(255,255,255,0.2)",
            border: `1px solid rgba(255,255,255,0.3)`,
            borderRadius: "6px",
            fontFamily: "monospace",
            fontSize: typography.xs,
            marginLeft: spacing.xs,
            marginRight: spacing.xs,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>Ctrl+K</kbd> Command Palette ⚡
        </div>
      </div>

      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className="chat-message"
            style={{
              ...styles.message,
              ...(msg.role === "user" ? styles.userMessage : styles.assistantMessage),
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start"
            }}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div style={styles.typing}>
            <LoadingDots color={getColors().purple} /> AICOO is thinking...
          </div>
        )}
      </div>

      <div style={styles.inputRow}>
        <input
          className="chat-input"
          style={styles.input}
          value={input}
          placeholder="Ask AICOO anything... (e.g., /assign 123, /analytics, or any question)"
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button 
          className="send-button"
          style={styles.button} 
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          {loading ? "⏳" : "Send"} ✨
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    padding: spacing.xl, 
    maxWidth: "1000px", 
    margin: "0 auto",
    position: "relative"
  },
  header: { 
    fontSize: typography.xxxl, 
    fontWeight: typography.bold, 
    marginBottom: spacing.xxl,
    padding: spacing.xl,
    background: getColors().primaryGradient,
    color: "white",
    borderRadius: "16px",
    boxShadow: shadows.xl,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    animation: "slideDown 0.5s ease-out"
  },
  chatBox: {
    border: `1px solid ${getColors().borderColor}`,
    borderRadius: "16px",
    padding: spacing.xl,
    height: "65vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
    background: `linear-gradient(135deg, ${getColors().background} 0%, ${getColors().gray50} 100%)`,
    boxShadow: shadows.lg,
    position: "relative"
  },
  message: {
    maxWidth: "70%",
    padding: spacing.lg,
    borderRadius: "12px",
    fontSize: typography.base,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    boxShadow: shadows.md,
    transition: `all ${transitions.normal} ${transitions.easing}`,
    animation: "slideUp 0.3s ease-out"
  },
  userMessage: {
    background: getColors().primaryGradient,
    color: "white",
    borderBottomRightRadius: "4px"
  },
  assistantMessage: {
    background: getColors().cardBg,
    color: getColors().textPrimary,
    border: `1px solid ${getColors().borderColor}`,
    borderBottomLeftRadius: "4px"
  },
  typing: {
    fontStyle: "italic",
    opacity: 0.9,
    fontSize: typography.base,
    color: getColors().textSecondary,
    display: "flex",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    background: getColors().cardBg,
    borderRadius: "12px",
    border: `1px solid ${getColors().borderColor}`,
    maxWidth: "150px",
    animation: "pulse 1.5s ease-in-out infinite"
  },
  inputRow: {
    marginTop: spacing.lg,
    display: "flex",
    gap: spacing.md,
    animation: "slideUp 0.6s ease-out"
  },
  input: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: "12px",
    border: `2px solid ${getColors().borderColor}`,
    fontSize: typography.base,
    fontFamily: "system-ui, -apple-system, sans-serif",
    outline: "none",
    transition: `all ${transitions.normal} ${transitions.easing}`,
    background: getColors().cardBg,
    color: getColors().textPrimary
  },
  button: {
    padding: `${spacing.lg} ${spacing.xxl}`,
    background: getColors().primaryGradient,
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: typography.semibold,
    fontSize: typography.base,
    transition: `all ${transitions.normal} ${transitions.spring}`,
    boxShadow: shadows.md,
    position: "relative",
    overflow: "hidden"
  }
};

export default Chat;
