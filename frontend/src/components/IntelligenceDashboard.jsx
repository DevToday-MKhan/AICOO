import { apiFetch } from "../config/api";
import { useEffect, useState } from 'react';
import { getColors, shadows, animations, transitions } from '../styles/theme';

/**
 * AICOO Intelligence Layer - Modern, Animated, Fun UI
 * Daily Snapshot, Trends, and ZIP Distribution with gradients, animations, and micro-interactions
 */
export default function IntelligenceDashboard() {
  const [daily, setDaily] = useState(null);
  const [trends, setTrends] = useState(null);
  const [zipDist, setZipDist] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedValues, setAnimatedValues] = useState({ orders: 0, deliveries: 0, cost: 0 });
  const colors = getColors(document.documentElement.getAttribute('data-theme') || 'light');

  useEffect(() => {
    fetchIntelligence();
    const interval = setInterval(fetchIntelligence, 60000);
    return () => clearInterval(interval);
  }, []);

  // Animated counter effect
  useEffect(() => {
    if (daily) {
      let frame = 0;
      const totalFrames = 30;
      const targetOrders = daily.orders?.today || 0;
      const targetDeliveries = daily.deliveries?.today || 0;
      const targetCost = daily.deliveries?.avgCost || 0;

      const animate = () => {
        frame++;
        const progress = frame / totalFrames;
        const eased = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

        setAnimatedValues({
          orders: Math.floor(targetOrders * eased),
          deliveries: Math.floor(targetDeliveries * eased),
          cost: (targetCost * eased).toFixed(2)
        });

        if (frame < totalFrames) {
          requestAnimationFrame(animate);
        } else {
          setAnimatedValues({ orders: targetOrders, deliveries: targetDeliveries, cost: targetCost.toFixed(2) });
        }
      };

      animate();
    }
  }, [daily]);

  const fetchIntelligence = async () => {
    try {
      const [dailyRes, trendsRes, zipRes, analyticsRes] = await Promise.all([
        apiFetch('/api/analytics/daily'),
        apiFetch('/api/analytics/trends'),
        apiFetch('/api/analytics/zip'),
        apiFetch('/api/analytics')
      ]);

      const dailyData = await dailyRes.json();
      const trendsData = await trendsRes.json();
      const zipData = await zipRes.json();
      const analyticsData = await analyticsRes.json();

      setDaily(dailyData);
      setTrends(trendsData);
      setZipDist(zipData);
      setPredictions(analyticsData.predictions);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch intelligence:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        background: colors.primaryGradient,
        border: `1px solid ${colors.borderColor}`,
        borderRadius: '16px',
        padding: '48px 24px',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          animation: 'spin 1s linear infinite',
          fontSize: '32px',
          marginBottom: '16px'
        }}>🧠</div>
        <div>Loading AICOO Intelligence...</div>
        <style>{animations.spin}</style>
      </div>
    );
  }

  const getHotnessColor = (hotness) => {
    if (hotness > 10) return '#ef4444';
    if (hotness > 5) return '#f59e0b';
    if (hotness > 2) return '#10b981';
    return '#6b7280';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>
        {animations.fadeIn}
        {animations.slideUp}
        {animations.pulse}
        {animations.glow}
        {animations.scaleIn}
        {`
          .stat-card {
            transition: all ${transitions.normal} ${transitions.easing};
          }
          .stat-card:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: ${shadows.xl};
          }
          .glow-border {
            position: relative;
            overflow: hidden;
          }
          .glow-border::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899, #6366f1);
            background-size: 400% 400%;
            border-radius: 16px;
            z-index: -1;
            animation: gradientShift 3s ease infinite;
            opacity: 0;
            transition: opacity ${transitions.normal};
          }
          .glow-border:hover::before {
            opacity: 0.7;
          }
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .zip-row {
            transition: all ${transitions.fast} ${transitions.easing};
          }
          .zip-row:hover {
            background: ${colors.primaryLight} !important;
            transform: scale(1.01);
          }
        `}
      </style>

      {/* Daily Snapshot */}
      <div className="glow-border" style={{
        background: `linear-gradient(135deg, ${colors.cardBg} 0%, ${colors.gray50} 100%)`,
        border: `1px solid ${colors.borderColor}`,
        borderRadius: '16px',
        padding: '32px',
        boxShadow: shadows.lg,
        animation: 'scaleIn 0.5s ease-out'
      }}>
        <h3 style={{
          margin: '0 0 24px 0',
          fontSize: '24px',
          fontWeight: 'bold',
          background: colors.primaryGradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ animation: 'pulse 2s ease-in-out infinite' }}>🧠</span>
          AICOO Intelligence – Daily Snapshot
        </h3>

        {daily && (
          <div>
            {/* Animated Key Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              marginBottom: '28px'
            }}>
              <div className="stat-card" style={{
                background: colors.primaryGradient,
                padding: '24px',
                borderRadius: '12px',
                color: 'white',
                boxShadow: shadows.md,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '-20px', 
                  right: '-20px', 
                  fontSize: '80px', 
                  opacity: '0.2' 
                }}>📦</div>
                <div style={{ fontSize: '13px', marginBottom: '8px', opacity: 0.9 }}>
                  Total Orders Today
                </div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', position: 'relative' }}>
                  {animatedValues.orders}
                </div>
              </div>

              <div className="stat-card" style={{
                background: colors.successGradient,
                padding: '24px',
                borderRadius: '12px',
                color: 'white',
                boxShadow: shadows.md,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '-20px', 
                  right: '-20px', 
                  fontSize: '80px', 
                  opacity: '0.2' 
                }}>🚚</div>
                <div style={{ fontSize: '13px', marginBottom: '8px', opacity: 0.9 }}>
                  Total Deliveries
                </div>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                  {animatedValues.deliveries}
                </div>
              </div>

              <div className="stat-card" style={{
                background: colors.warningGradient,
                padding: '24px',
                borderRadius: '12px',
                color: 'white',
                boxShadow: shadows.md,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '-20px', 
                  right: '-20px', 
                  fontSize: '80px', 
                  opacity: '0.2' 
                }}>💰</div>
                <div style={{ fontSize: '13px', marginBottom: '8px', opacity: 0.9 }}>
                  Avg Delivery Cost
                </div>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                  ${animatedValues.cost}
                </div>
              </div>

              <div className="stat-card" style={{
                background: colors.purpleGradient,
                padding: '24px',
                borderRadius: '12px',
                color: 'white',
                boxShadow: shadows.md,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '-20px', 
                  right: '-20px', 
                  fontSize: '80px', 
                  opacity: '0.2' 
                }}>⚡</div>
                <div style={{ fontSize: '13px', marginBottom: '8px', opacity: 0.9 }}>
                  Route Efficiency
                </div>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                  {daily.efficiency || 100}%
                </div>
              </div>
            </div>

            {/* Top ZIP Codes */}
            {daily.orders?.topZIPs && daily.orders.topZIPs.length > 0 && (
              <div style={{
                background: colors.background,
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px',
                border: `1px solid ${colors.borderColor}`
              }}>
                <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: colors.textPrimary }}>
                  📍 Top ZIP Codes
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {daily.orders.topZIPs.slice(0, 5).map((zip, idx) => (
                    <div key={idx} style={{
                      padding: '12px 16px',
                      background: colors.primaryGradient,
                      color: 'white',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      boxShadow: shadows.md,
                      animation: `slideUp 0.3s ease-out ${idx * 0.1}s both`
                    }}>
                      <strong>{zip.zip}</strong> <span style={{ opacity: 0.9 }}>({zip.count} orders)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {daily.warnings && daily.warnings.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '10px', color: '#92400e' }}>
                  ⚠️ Warnings
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e' }}>
                  {daily.warnings.map((warning, idx) => (
                    <li key={idx} style={{ fontSize: '14px', marginBottom: '6px' }}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {daily.recommendations && daily.recommendations.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                border: '2px solid #3b82f6',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '10px', color: '#1e40af' }}>
                  💡 AICOO Recommendations
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af' }}>
                  {daily.recommendations.map((rec, idx) => (
                    <li key={idx} style={{ fontSize: '14px', marginBottom: '6px' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trends & Predictions */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.cardBg} 0%, ${colors.gray50} 100%)`,
        border: `1px solid ${colors.borderColor}`,
        borderRadius: '16px',
        padding: '32px',
        boxShadow: shadows.lg,
        animation: 'scaleIn 0.6s ease-out'
      }}>
        <h3 style={{
          margin: '0 0 24px 0',
          fontSize: '24px',
          fontWeight: 'bold',
          background: colors.successGradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          📈 AICOO Insights – Trends & Predictions
        </h3>

        {predictions && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div className="stat-card" style={{
              background: colors.background,
              padding: '20px',
              borderRadius: '12px',
              border: `3px solid #10b981`,
              boxShadow: shadows.glowSuccess
            }}>
              <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '10px' }}>
                🔮 Predicted Tomorrow Cost
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                ${predictions.tomorrowCost?.toFixed(2) || '0.00'}
              </div>
              <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '8px' }}>
                Confidence: <strong>{predictions.confidence || 'low'}</strong>
              </div>
            </div>

            <div className="stat-card" style={{
              background: colors.background,
              padding: '20px',
              borderRadius: '12px',
              border: `3px solid #3b82f6`,
              boxShadow: shadows.glow
            }}>
              <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '10px' }}>
                📦 Predicted Tomorrow Orders
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
                {predictions.tomorrowOrders || 0}
              </div>
              <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '8px' }}>
                Trend: <strong>{predictions.trend || 'stable'}</strong>
              </div>
            </div>

            {predictions.surgeWarnings && predictions.surgeWarnings.length > 0 && (
              <div className="stat-card" style={{
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: `3px solid #ef4444`,
                boxShadow: shadows.glowDanger
              }}>
                <div style={{ fontSize: '13px', color: '#7f1d1d', marginBottom: '10px' }}>
                  ⚠️ Surge Warnings
                </div>
                {predictions.surgeWarnings.map((warning, idx) => (
                  <div key={idx} style={{ fontSize: '13px', color: '#7f1d1d', marginBottom: '6px', fontWeight: '600' }}>
                    {warning}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7-Day Trends Chart */}
        {trends && trends.last7Days && trends.last7Days.length > 0 && (
          <div style={{
            background: colors.background,
            padding: '24px',
            borderRadius: '12px',
            border: `1px solid ${colors.borderColor}`
          }}>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: colors.textPrimary }}>
              📊 7-Day Trend: <span style={{ 
                color: trends.trend === 'increasing' ? '#10b981' : trends.trend === 'decreasing' ? '#ef4444' : '#6b7280'
              }}>{trends.trend || 'stable'}</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {trends.last7Days.map((day, idx) => {
                const maxOrders = Math.max(...trends.last7Days.map(d => d.orders));
                const height = maxOrders > 0 ? (day.orders / maxOrders) * 100 : 10;
                
                return (
                  <div key={idx} style={{
                    minWidth: '110px',
                    textAlign: 'center',
                    animation: `slideUp 0.4s ease-out ${idx * 0.05}s both`
                  }}>
                    <div style={{
                      height: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        height: `${height}%`,
                        background: colors.primaryGradient,
                        borderRadius: '8px 8px 0 0',
                        minHeight: '20px',
                        transition: 'all 0.3s ease',
                        boxShadow: shadows.md,
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-24px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: colors.textPrimary
                        }}>
                          {day.orders}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '4px' }}>
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                      ${day.cost?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ZIP Distribution */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.cardBg} 0%, ${colors.gray50} 100%)`,
        border: `1px solid ${colors.borderColor}`,
        borderRadius: '16px',
        padding: '32px',
        boxShadow: shadows.lg,
        animation: 'scaleIn 0.7s ease-out'
      }}>
        <h3 style={{
          margin: '0 0 24px 0',
          fontSize: '24px',
          fontWeight: 'bold',
          background: colors.accentGradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          🗺️ AICOO ZIP Distribution
        </h3>

        {zipDist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textSecondary }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📦</div>
            <div>No ZIP data yet. Process orders to see distribution.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ background: colors.background }}>
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: `2px solid ${colors.borderColor}`, fontWeight: '600' }}>ZIP</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: `2px solid ${colors.borderColor}`, fontWeight: '600' }}>Orders</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: `2px solid ${colors.borderColor}`, fontWeight: '600' }}>Deliveries</th>
                  <th style={{ padding: '16px', textAlign: 'right', borderBottom: `2px solid ${colors.borderColor}`, fontWeight: '600' }}>Avg Cost</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: `2px solid ${colors.borderColor}`, fontWeight: '600' }}>Hotness</th>
                </tr>
              </thead>
              <tbody>
                {zipDist.slice(0, 10).map((zip, idx) => (
                  <tr key={idx} className="zip-row" style={{
                    borderBottom: `1px solid ${colors.borderColor}`,
                    background: idx % 2 === 0 ? colors.background : 'transparent',
                    animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both`
                  }}>
                    <td style={{ padding: '16px', fontWeight: '600', fontSize: '15px' }}>{zip.zip}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>{zip.orders}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>{zip.deliveries}</td>
                    <td style={{ padding: '16px', textAlign: 'right', color: '#10b981', fontWeight: '600' }}>
                      ${zip.avgCost?.toFixed(2) || '0.00'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: getHotnessColor(zip.hotness),
                          boxShadow: `0 0 12px ${getHotnessColor(zip.hotness)}`,
                          animation: zip.hotness > 5 ? 'pulse 1.5s ease-in-out infinite' : 'none'
                        }} />
                        <span style={{ fontSize: '13px', color: colors.textSecondary, fontWeight: '600' }}>
                          {zip.hotness}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
