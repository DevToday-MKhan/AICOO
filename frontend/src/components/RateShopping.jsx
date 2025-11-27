import { apiFetch } from "../config/api";
import { useState } from 'react';
import { getColors } from '../styles/theme';

export default function RateShopping({ isDarkMode }) {
  const [fromZip, setFromZip] = useState('07102');
  const [toZip, setToZip] = useState('10001');
  const [weight, setWeight] = useState(5);
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const colors = getColors(isDarkMode);

  const handleGetRates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/courier/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromZip, toZip, weight: parseFloat(weight) })
      });
      const data = await response.json();
      setRates(data);
    } catch (error) {
      console.error('Failed to fetch rates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.container, background: colors.card, borderColor: colors.border }}>
      <h3 style={{ color: colors.text, margin: '0 0 20px 0' }}>🔍 Rate Shopping</h3>

      <div style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={{ color: colors.textSecondary, fontSize: '12px' }}>From ZIP</label>
          <input
            type="text"
            value={fromZip}
            onChange={(e) => setFromZip(e.target.value)}
            placeholder="07102"
            style={{
              ...styles.input,
              background: colors.background,
              color: colors.text,
              borderColor: colors.border
            }}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={{ color: colors.textSecondary, fontSize: '12px' }}>To ZIP</label>
          <input
            type="text"
            value={toZip}
            onChange={(e) => setToZip(e.target.value)}
            placeholder="10001"
            style={{
              ...styles.input,
              background: colors.background,
              color: colors.text,
              borderColor: colors.border
            }}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={{ color: colors.textSecondary, fontSize: '12px' }}>Weight (lbs)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="5"
            style={{
              ...styles.input,
              background: colors.background,
              color: colors.text,
              borderColor: colors.border
            }}
          />
        </div>

        <button
          onClick={handleGetRates}
          disabled={loading}
          style={{
            ...styles.button,
            background: loading ? colors.border : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳ Loading...' : '🚀 Compare Rates'}
        </button>
      </div>

      {rates && rates.allOptions && rates.allOptions.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ color: colors.text, margin: '0 0 16px 0' }}>
            💰 Available Options ({rates.allOptions.length})
          </h4>

          {rates.best && (
            <div style={{
              ...styles.bestOption,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              marginBottom: '16px',
              animation: 'glow 2s ease-in-out infinite'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>⭐ BEST OPTION</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '4px' }}>
                    {rates.best.carrier} - {rates.best.service}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                    {rates.best.deliveryDays} day{rates.best.deliveryDays !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '32px', fontWeight: '800' }}>${rates.best.price}</div>
                  {rates.best.savings > 0 && (
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>
                      Save ${rates.best.savings}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div style={styles.optionsGrid}>
            {rates.allOptions.map((option, idx) => {
              const isBest = rates.best && 
                option.carrier === rates.best.carrier && 
                option.service === rates.best.service;

              return (
                <div
                  key={idx}
                  style={{
                    ...styles.optionCard,
                    background: isBest ? 'rgba(16, 185, 129, 0.1)' : colors.background,
                    borderColor: isBest ? '#10b981' : colors.border,
                    borderWidth: isBest ? '2px' : '1px'
                  }}
                >
                  <div style={styles.optionHeader}>
                    <span style={{ fontSize: '18px' }}>
                      {option.carrier === 'FedEx' ? '📮' : option.carrier === 'UPS' ? '📦' : '🚚'}
                    </span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>
                        {option.carrier}
                      </div>
                      <div style={{ fontSize: '11px', color: colors.textSecondary }}>
                        {option.service}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: colors.text }}>
                      ${option.price}
                    </div>
                    <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
                      {option.deliveryDays} day{option.deliveryDays !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {rates && rates.allOptions && rates.allOptions.length === 0 && (
        <div style={{ marginTop: '24px', textAlign: 'center', color: colors.textSecondary }}>
          No rates available. Check carrier credentials.
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px'
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
    alignItems: 'end'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s'
  },
  button: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
  },
  bestOption: {
    padding: '20px',
    borderRadius: '12px',
    color: 'white'
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px'
  },
  optionCard: {
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid',
    transition: 'all 0.3s'
  },
  optionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
};
