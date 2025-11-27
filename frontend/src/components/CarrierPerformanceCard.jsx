import { apiFetch } from "../config/api";
import { useState, useEffect } from 'react';
import { getColors } from '../styles/theme';

export default function CarrierPerformanceCard({ isDarkMode }) {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const colors = getColors(isDarkMode);

  useEffect(() => {
    fetchCarrierPerformance();
    const interval = setInterval(fetchCarrierPerformance, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchCarrierPerformance = async () => {
    try {
      const response = await apiFetch('/api/memory/carrier-performance');
      const data = await response.json();
      setPerformance(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch carrier performance:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        ...styles.card,
        background: colors.card,
        borderColor: colors.border,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
      }}>
        <div style={{ fontSize: '2rem', animation: 'spin 2s linear infinite' }}>📦</div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div style={{ ...styles.card, background: colors.card, borderColor: colors.border }}>
        <h3 style={{ color: colors.text, margin: '0 0 16px 0' }}>📦 Carrier Performance</h3>
        <p style={{ color: colors.textSecondary }}>No carrier data available</p>
      </div>
    );
  }

  // Find preferred carrier (highest on-time %)
  const carriers = Object.entries(performance);
  const preferred = carriers.reduce((best, [name, stats]) => {
    if (stats.totalShipments === 0) return best;
    if (!best || stats.onTimePercentage > best.stats.onTimePercentage) {
      return { name, stats };
    }
    return best;
  }, null);

  return (
    <div style={{ ...styles.card, background: colors.card, borderColor: colors.border }}>
      <div style={styles.header}>
        <h3 style={{ color: colors.text, margin: 0 }}>📦 Carrier Performance</h3>
        {preferred && (
          <div style={{
            ...styles.badge,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
          }}>
            ⭐ Preferred: {preferred.name.toUpperCase()}
          </div>
        )}
      </div>

      <div style={styles.carrierGrid}>
        {Object.entries(performance).map(([name, stats]) => {
          const hasData = stats.totalShipments > 0;
          const icon = name === 'fedex' ? '📮' : name === 'ups' ? '📦' : '🚚';
          const gradient = name === 'fedex' 
            ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
            : name === 'ups' 
            ? 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';

          return (
            <div
              key={name}
              style={{
                ...styles.carrierCard,
                background: hasData ? gradient : colors.card,
                border: hasData ? 'none' : `1px solid ${colors.border}`,
                opacity: hasData ? 1 : 0.6,
                animation: hasData ? 'scaleIn 0.5s ease-out' : 'none'
              }}
            >
              <div style={styles.carrierHeader}>
                <span style={{ fontSize: '2rem' }}>{icon}</span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: hasData ? 'rgba(255, 255, 255, 0.95)' : colors.text
                }}>
                  {name}
                </span>
              </div>

              <div style={styles.stats}>
                <div style={styles.statRow}>
                  <span style={{
                    fontSize: '11px',
                    color: hasData ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary
                  }}>
                    Shipments
                  </span>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: hasData ? 'white' : colors.text
                  }}>
                    {stats.totalShipments}
                  </span>
                </div>

                <div style={styles.statRow}>
                  <span style={{
                    fontSize: '11px',
                    color: hasData ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary
                  }}>
                    On-Time
                  </span>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: hasData ? 'white' : colors.text
                  }}>
                    {stats.onTimePercentage}%
                  </span>
                </div>

                <div style={styles.statRow}>
                  <span style={{
                    fontSize: '11px',
                    color: hasData ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary
                  }}>
                    Avg Cost
                  </span>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: hasData ? 'white' : colors.text
                  }}>
                    ${stats.avgCost}
                  </span>
                </div>

                <div style={styles.statRow}>
                  <span style={{
                    fontSize: '11px',
                    color: hasData ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary
                  }}>
                    Avg Days
                  </span>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: hasData ? 'white' : colors.text
                  }}>
                    {stats.avgDays.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
    transition: 'all 0.3s ease'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  badge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white'
  },
  carrierGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px'
  },
  carrierCard: {
    padding: '20px',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  carrierHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px'
  },
  stats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
};
