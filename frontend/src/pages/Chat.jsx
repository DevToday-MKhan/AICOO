import { useState } from "react";
import { colors, spacing, borderRadius, shadows, typography } from "../styles/theme";
import { LoadingDots } from "../components/LoadingSpinner";

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
\`/memory\` — View AICOO memory & learning data
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
      
      if (assignMatch) {
        const orderId = assignMatch[1];
        
        // Call delivery assignment API
        const res = await fetch("/api/delivery/assign", {
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
        const res = await fetch("/api/memory");
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
      } else {
        // Fetch recent memory for context injection
        const memoryRes = await fetch("/api/memory");
        const memory = await memoryRes.json();
        const recentContext = memory.observations.slice(-5).reverse();
        
        const contextString = recentContext.length > 0
          ? `\n\nRecent System Activity:\n${recentContext.map(o => `- ${o.type} at ${new Date(o.timestamp).toLocaleTimeString()}`).join("\n")}`
          : "";
        
        // Normal GPT chat with memory context
        const res = await fetch("/api/gpt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userInput }),
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
      <div style={styles.header}>
        <div>
          <h1 style={{margin: 0, fontSize: typography.xxxl}}>AICOO™</h1>
          <p style={{margin: `${spacing.sm} 0 0 0`, color: colors.white, fontSize: typography.sm, opacity: 0.9}}>
            AI Chief Operating Officer — Enterprise Operational Intelligence
          </p>
        </div>
        <div style={{
          padding: `${spacing.md} ${spacing.lg}`,
          backgroundColor: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          border: `1px solid rgba(255,255,255,0.3)`,
          borderRadius: borderRadius.md,
          fontSize: typography.sm,
          color: colors.white,
          fontWeight: typography.medium,
        }}>
          <kbd style={{
            padding: `${spacing.xs} ${spacing.sm}`,
            backgroundColor: "rgba(255,255,255,0.2)",
            border: `1px solid rgba(255,255,255,0.3)`,
            borderRadius: borderRadius.sm,
            fontFamily: "monospace",
            fontSize: typography.xs,
            marginLeft: spacing.xs,
            marginRight: spacing.xs,
          }}>Ctrl+K</kbd> Command Palette ⚡
        </div>
      </div>

      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              background: msg.role === "user" ? colors.ctBlueLight : colors.white,
              border: msg.role === "user" ? `1px solid ${colors.ctBlue}` : `1px solid ${colors.gray300}`,
            }}
            onMouseEnter={(e) => e.target.style.transform = "translateY(-1px)"}
            onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div style={styles.typing}>
            <LoadingDots color={colors.purple} /> AICOO is thinking...
          </div>
        )}
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          placeholder="Ask AICOO anything about your store..."
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          onFocus={(e) => e.target.style.borderColor = colors.primary}
          onBlur={(e) => e.target.style.borderColor = colors.gray300}
        />
        <button 
          style={styles.button} 
          onClick={sendMessage}
          onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
        >
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    padding: spacing.xl, 
    maxWidth: "1000px", 
    margin: "0 auto" 
  },
  header: { 
    fontSize: typography.xxxl, 
    fontWeight: typography.bold, 
    marginBottom: spacing.xxl,
    padding: spacing.xl,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: colors.white,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.lg,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  chatBox: {
    border: `1px solid ${colors.gray300}`,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    height: "65vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
    background: colors.gray50,
    boxShadow: shadows.md,
  },
  message: {
    maxWidth: "70%",
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    fontSize: typography.base,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    boxShadow: shadows.sm,
    transition: "transform 0.2s ease",
  },
  typing: {
    fontStyle: "italic",
    opacity: 0.7,
    fontSize: typography.base,
    color: colors.textSecondary,
    display: "flex",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  inputRow: {
    marginTop: spacing.lg,
    display: "flex",
    gap: spacing.md,
  },
  input: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    border: `2px solid ${colors.gray300}`,
    fontSize: typography.base,
    fontFamily: "system-ui, -apple-system, sans-serif",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  button: {
    padding: `${spacing.lg} ${spacing.xxl}`,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: colors.white,
    border: "none",
    borderRadius: borderRadius.md,
    cursor: "pointer",
    fontWeight: typography.semibold,
    fontSize: typography.base,
    transition: "all 0.2s ease",
    boxShadow: shadows.md,
  }
};

export default Chat;
