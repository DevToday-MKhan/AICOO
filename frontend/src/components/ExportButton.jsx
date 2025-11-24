import { colors, spacing, borderRadius, typography } from "../styles/theme";

const ExportButton = ({ data, filename, format = "json", label, icon = "📥" }) => {
  const handleExport = () => {
    let content, mimeType, fileExt;

    if (format === "json") {
      content = JSON.stringify(data, null, 2);
      mimeType = "application/json";
      fileExt = "json";
    } else if (format === "csv") {
      // Convert array of objects to CSV
      if (!Array.isArray(data) || data.length === 0) {
        alert("No data to export");
        return;
      }
      
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(","),
        ...data.map(row =>
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes
            const escaped = String(value).replace(/"/g, '""');
            return `"${escaped}"`;
          }).join(",")
        )
      ];
      content = csvRows.join("\n");
      mimeType = "text/csv";
      fileExt = "csv";
    }

    // Create download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename || 'export'}.${fileExt}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      style={{
        padding: `${spacing.sm} ${spacing.lg}`,
        margin: spacing.xs,
        fontSize: typography.sm,
        cursor: "pointer",
        border: `1px solid ${colors.primary}`,
        backgroundColor: colors.white,
        color: colors.primary,
        borderRadius: borderRadius.md,
        fontWeight: typography.medium,
        transition: "all 0.2s ease",
        display: "inline-flex",
        alignItems: "center",
        gap: spacing.xs,
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = colors.primary;
        e.target.style.color = colors.white;
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = colors.white;
        e.target.style.color = colors.primary;
      }}
      title={`Export as ${format.toUpperCase()}`}
    >
      <span>{icon}</span>
      <span>{label || `Export ${format.toUpperCase()}`}</span>
    </button>
  );
};

export default ExportButton;
