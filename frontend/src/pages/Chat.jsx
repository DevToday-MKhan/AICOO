import { useState } from "react";

function Chat() {
  const [messages, setMessages] = useState([]);
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
      } else {
        // Normal GPT chat
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
      <h1 style={styles.header}>AICOO Chat</h1>

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
  container: { padding: 20, maxWidth: 800, margin: "0 auto" },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  chatBox: {
    border: "1px solid #ccc",
    borderRadius: 8,
    padding: 10,
    height: "60vh",
    overflowY: "scroll",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background: "#fff",
  },
  message: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 6,
    fontSize: 15,
  },
  typing: {
    fontStyle: "italic",
    opacity: 0.7,
  },
  inputRow: {
    marginTop: 15,
    display: "flex",
    gap: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 15,
  },
  button: {
    padding: "12px 20px",
    background: "#4A8FE7",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Chat;
