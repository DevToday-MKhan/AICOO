import { useWebSocket } from '../hooks/useWebSocket';
import { getColors } from '../styles/theme';

/**
 * WebSocket Connection Status Indicator
 * Shows real-time connection status in the UI
 */
export default function ConnectionStatus() {
  const { isConnected } = useWebSocket();
  const colors = getColors(
    document.documentElement.getAttribute('data-theme') || 'light'
  );

  const statusColor = isConnected ? '#10b981' : '#ef4444';
  const statusText = isConnected ? 'Live' : 'Disconnected';

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '8px 16px',
      background: colors.cardBg,
      border: `1px solid ${colors.borderColor}`,
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      fontWeight: '500',
      color: colors.textPrimary,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 9996,
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: statusColor,
        boxShadow: `0 0 8px ${statusColor}`,
        animation: isConnected ? 'pulse 2s infinite' : 'none'
      }} />
      <span>{statusText}</span>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
