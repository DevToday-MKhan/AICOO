import { useState } from "react";

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
          <h1 style={{margin: 0, fontSize: "28px"}}>AICOO™</h1>
          <p style={{margin: "8px 0 0 0", color: "#666", fontSize: "14px"}}>
            AI Chief Operating Officer — Enterprise Operational Intelligence
          </p>
        </div>
        <div style={{
          padding: "8px 16px",
          backgroundColor: "#f0f8ff",
          border: "1px solid #007bff",
          borderRadius: "6px",
          fontSize: "13px",
          color: "#007bff",
          fontWeight: "500"
        }}>
          <kbd style={{
            padding: "2px 6px",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "3px",
            fontFamily: "monospace",
            fontSize: "12px"
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
              background:
                msg.role === "user" ? "#DCF8C6" : "rgba(0,0,0,0.05)",
            }}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div style={styles.typing}>
            AICOO is typing<span className="dots">...</span>
          </div>
        )}
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          placeholder="Ask AICOO anything about your store..."
          onChange={(e) => setInput(e.target.value)}
        />
        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 20, maxWidth: 900, margin: "0 auto" },
  header: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 24,
    padding: "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  chatBox: {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 16,
    height: "60vh",
    overflowY: "scroll",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    background: "#f9fafb",
  },
  message: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    boxShadow: "0 2px 4px rgba(0,0,0,0.08)"
  },
  typing: {
    fontStyle: "italic",
    opacity: 0.6,
    fontSize: 14,
    color: "#666"
  },
  inputRow: {
    marginTop: 16,
    display: "flex",
    gap: 10,
  },
  input: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 15,
    fontFamily: "system-ui, -apple-system, sans-serif"
  },
  button: {
    padding: "14px 28px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
    transition: "transform 0.2s",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
  }
};

export default Chat;
