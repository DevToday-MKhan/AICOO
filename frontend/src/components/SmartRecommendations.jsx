import { useEffect, useState } from 'react';
import { getColors } from '../styles/theme';

/**
 * Smart Recommendations Component
 * Displays AI-powered delivery optimization insights
 */
export default function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const colors = getColors(document.documentElement.getAttribute('data-theme') || 'light');

  useEffect(() => {
    fetchRecommendations();
    // Refresh every 60 seconds
    const interval = setInterval(fetchRecommendations, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchRecommendations = async () => {
    try {
      const [recsRes, statsRes] = await Promise.all([
        fetch('/api/recommendations'),
        fetch('/api/recommendations/stats')
      ]);

      const recsData = await recsRes.json();
      const statsData = await statsRes.json();

      setRecommendations(recsData);
      setStats(statsData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setLoading(false);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'cost': return '💰';
      case 'pattern': return '📊';
      case 'timing': return '⏰';
      case 'warning': return '⚠️';
      case 'opportunity': return '🎯';
      case 'optimization': return '⚡';
      case 'info': return 'ℹ️';
      default: return '💡';
    }
  };

  const getColorForPriority = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444'; // red
      case 'medium': return '#f59e0b'; // amber
      case 'low': return '#3b82f6'; // blue
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.borderColor}`,
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        color: colors.textSecondary
      }}>
        Loading recommendations...
      </div>
    );
  }

  return (
    <div style={{
      background: colors.cardBg,
      border: `1px solid ${colors.borderColor}`,
      borderRadius: '12px',
      padding: '24px'
    }}>
      <h3 style={{
        margin: '0 0 20px 0',
        fontSize: '20px',
        fontWeight: 'bold',
        color: colors.textPrimary,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        🧠 Smart Recommendations
        {stats && (
          <span style={{
            fontSize: '12px',
            fontWeight: 'normal',
            color: colors.textSecondary,
            marginLeft: 'auto'
          }}>
            {stats.totalDeliveries} deliveries analyzed
          </span>
        )}
      </h3>

      {/* Stats Summary */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: colors.bg,
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              ${stats.avgCost}
            </div>
            <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
              Avg Cost
            </div>
          </div>

          <div style={{
            background: colors.bg,
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
              {stats.optimizationRate}
            </div>
            <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
              Optimized
            </div>
          </div>

          <div style={{
            background: colors.bg,
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
              ${stats.potentialSavings}
            </div>
            <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
              Potential Savings
            </div>
          </div>
        </div>
      )}

      {/* Recommendations List */}
      {recommendations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: colors.textSecondary
        }}>
          ℹ️ No recommendations yet. Process a few deliveries to get personalized insights.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recommendations.map((rec, index) => (
            <div
              key={index}
              style={{
                background: colors.bg,
                border: `2px solid ${getColorForPriority(rec.priority)}`,
                borderRadius: '10px',
                padding: '16px',
                transition: 'all 0.2s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  fontSize: '28px',
                  flexShrink: 0
                }}>
                  {getIconForType(rec.type)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: '15px',
                      fontWeight: '600',
                      color: colors.textPrimary
                    }}>
                      {rec.title}
                    </h4>
                    
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 'bold',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: getColorForPriority(rec.priority),
                      color: 'white',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {rec.priority}
                    </span>
                  </div>
                  
                  <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    color: colors.textSecondary,
                    lineHeight: '1.5'
                  }}>
                    {rec.message}
                  </p>
                  
                  {rec.savings && (
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#10b981',
                      marginTop: '8px'
                    }}>
                      💵 Potential savings: {rec.savings}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Info */}
      <div style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: `1px solid ${colors.borderColor}`,
        fontSize: '12px',
        color: colors.textSecondary,
        textAlign: 'center'
      }}>
        💡 Recommendations update automatically based on your delivery patterns
      </div>
    </div>
  );
}
