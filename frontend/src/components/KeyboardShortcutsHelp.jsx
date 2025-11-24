import { useEffect } from "react";
import { colors, spacing, borderRadius, shadows, typography } from "../styles/theme";

const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { category: "Global", items: [
      { key: ["Ctrl", "K"], desc: "Open Command Palette" },
      { key: ["?"], desc: "Show this help" },
      { key: ["Esc"], desc: "Close modal/palette" },
    ]},
    { category: "Navigation", items: [
      { key: ["↑", "↓"], desc: "Navigate command list" },
      { key: ["Enter"], desc: "Execute command" },
      { key: ["Tab"], desc: "Switch between inputs" },
    ]},
    { category: "Commands", items: [
      { key: ["assign <id>"], desc: "Assign delivery" },
      { key: ["route <zip> <wt>"], desc: "Get routing quote" },
      { key: ["memory"], desc: "View memory data" },
      { key: ["simulate <z> <w>"], desc: "Simulate order" },
      { key: ["help"], desc: "Show all commands" },
    ]},
    { category: "Chat", items: [
      { key: ["Enter"], desc: "Send message" },
      { key: ["/assign <id>"], desc: "Assign via chat" },
      { key: ["/memory"], desc: "Memory snapshot" },
    ]},
  ];

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          animation: "fadeIn 0.2s ease-out",
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: colors.white,
            borderRadius: borderRadius.xl,
            boxShadow: shadows.xxl,
            width: "90%",
            maxWidth: "700px",
            maxHeight: "80vh",
            overflowY: "auto",
            animation: "slideUp 0.3s ease-out",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: spacing.xl,
            borderBottom: `2px solid ${colors.gray200}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <h2 style={{
              margin: 0,
              fontSize: typography.xxl,
              fontWeight: typography.bold,
              color: colors.textPrimary,
            }}>
              ⌨️ Keyboard Shortcuts
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: typography.xxl,
                cursor: "pointer",
                color: colors.textMuted,
                padding: spacing.sm,
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: spacing.xl }}>
            {shortcuts.map((section, idx) => (
              <div key={idx} style={{ marginBottom: spacing.xxl }}>
                <h3 style={{
                  fontSize: typography.lg,
                  fontWeight: typography.semibold,
                  color: colors.primary,
                  marginTop: 0,
                  marginBottom: spacing.lg,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  {section.category}
                </h3>
                {section.items.map((item, i) => (
                  <div key={i} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: `${spacing.md} 0`,
                    borderBottom: i < section.items.length - 1 ? `1px solid ${colors.gray200}` : "none",
                  }}>
                    <span style={{
                      fontSize: typography.base,
                      color: colors.textPrimary,
                    }}>
                      {item.desc}
                    </span>
                    <div style={{ display: "flex", gap: spacing.xs }}>
                      {item.key.map((k, ki) => (
                        <kbd key={ki} style={{
                          padding: `${spacing.xs} ${spacing.md}`,
                          backgroundColor: colors.gray100,
                          border: `2px solid ${colors.gray300}`,
                          borderRadius: borderRadius.sm,
                          fontSize: typography.sm,
                          fontWeight: typography.semibold,
                          fontFamily: "monospace",
                          boxShadow: shadows.sm,
                          color: colors.textPrimary,
                        }}>
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div style={{
              marginTop: spacing.xxl,
              padding: spacing.lg,
              backgroundColor: colors.ctBlueLight,
              borderRadius: borderRadius.md,
              fontSize: typography.sm,
              color: colors.textSecondary,
              textAlign: "center",
            }}>
              💡 Press <kbd style={{
                padding: `${spacing.xs} ${spacing.sm}`,
                backgroundColor: colors.white,
                border: `1px solid ${colors.gray300}`,
                borderRadius: borderRadius.sm,
                fontFamily: "monospace",
                margin: `0 ${spacing.xs}`,
              }}>?</kbd> anytime to view shortcuts
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default KeyboardShortcutsHelp;
