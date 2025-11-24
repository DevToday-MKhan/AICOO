import { useState } from 'react';
import { getColors } from '../styles/theme';

/**
 * Advanced Search & Filter Component
 * Provides comprehensive filtering for orders, deliveries, and events
 */
export default function AdvancedFilter({ data = [], onFilterChange, dataType = 'orders' }) {
  const [filters, setFilters] = useState({
    searchTerm: '',
    dateFrom: '',
    dateTo: '',
    priceMin: '',
    priceMax: '',
    status: 'all',
    serviceType: 'all',
    sortBy: 'date-desc'
  });

  const [showFilters, setShowFilters] = useState(false);
  const colors = getColors(document.documentElement.getAttribute('data-theme') || 'light');

  // Apply filters to data
  const applyFilters = (newFilters) => {
    let filtered = [...data];

    // Search term filter
    if (newFilters.searchTerm) {
      const term = newFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const searchableText = JSON.stringify(item).toLowerCase();
        return searchableText.includes(term);
      });
    }

    // Date range filter
    if (newFilters.dateFrom) {
      const fromDate = new Date(newFilters.dateFrom);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= fromDate;
      });
    }

    if (newFilters.dateTo) {
      const toDate = new Date(newFilters.dateTo);
      toDate.setHours(23, 59, 59); // End of day
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate <= toDate;
      });
    }

    // Price range filter (for orders/deliveries)
    if (newFilters.priceMin) {
      const minPrice = parseFloat(newFilters.priceMin);
      filtered = filtered.filter(item => {
        const price = parseFloat(item.price || item.total_price || 0);
        return price >= minPrice;
      });
    }

    if (newFilters.priceMax) {
      const maxPrice = parseFloat(newFilters.priceMax);
      filtered = filtered.filter(item => {
        const price = parseFloat(item.price || item.total_price || 0);
        return price <= maxPrice;
      });
    }

    // Service type filter (for deliveries)
    if (newFilters.serviceType !== 'all') {
      filtered = filtered.filter(item => {
        if (newFilters.serviceType === 'ride') {
          return item.type === 'ride';
        } else if (newFilters.serviceType === 'courier') {
          return item.type === 'courier';
        }
        return true;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (newFilters.sortBy) {
        case 'date-desc':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'date-asc':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'price-desc':
          return (parseFloat(b.price || b.total_price || 0)) - (parseFloat(a.price || a.total_price || 0));
        case 'price-asc':
          return (parseFloat(a.price || a.total_price || 0)) - (parseFloat(b.price || b.total_price || 0));
        default:
          return 0;
      }
    });

    onFilterChange?.(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  // Reset all filters
  const resetFilters = () => {
    const defaultFilters = {
      searchTerm: '',
      dateFrom: '',
      dateTo: '',
      priceMin: '',
      priceMax: '',
      status: 'all',
      serviceType: 'all',
      sortBy: 'date-desc'
    };
    setFilters(defaultFilters);
    applyFilters(defaultFilters);
  };

  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy') return false; // Don't count sort as active filter
    return value && value !== 'all' && value !== '';
  }).length;

  return (
    <div style={{
      background: colors.cardBg,
      border: `1px solid ${colors.borderColor}`,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px'
    }}>
      {/* Search Bar & Toggle */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: showFilters ? '16px' : '0' }}>
        <input
          type="text"
          placeholder="🔍 Search..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: `1px solid ${colors.borderColor}`,
            borderRadius: '8px',
            background: colors.bg,
            color: colors.textPrimary,
            fontSize: '14px',
            outline: 'none'
          }}
        />
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: '10px 18px',
            background: colors.accent,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {showFilters ? '▲' : '▼'} Filters
          {activeFilterCount > 0 && (
            <span style={{
              background: 'white',
              color: colors.accent,
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            style={{
              padding: '10px 14px',
              background: colors.borderColor,
              color: colors.textPrimary,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          paddingTop: '16px',
          borderTop: `1px solid ${colors.borderColor}`
        }}>
          {/* Date Range */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${colors.borderColor}`,
                borderRadius: '6px',
                background: colors.bg,
                color: colors.textPrimary,
                fontSize: '13px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${colors.borderColor}`,
                borderRadius: '6px',
                background: colors.bg,
                color: colors.textPrimary,
                fontSize: '13px'
              }}
            />
          </div>

          {/* Price Range */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>
              Min Price ($)
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={filters.priceMin}
              onChange={(e) => handleFilterChange('priceMin', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${colors.borderColor}`,
                borderRadius: '6px',
                background: colors.bg,
                color: colors.textPrimary,
                fontSize: '13px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>
              Max Price ($)
            </label>
            <input
              type="number"
              placeholder="999.99"
              value={filters.priceMax}
              onChange={(e) => handleFilterChange('priceMax', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${colors.borderColor}`,
                borderRadius: '6px',
                background: colors.bg,
                color: colors.textPrimary,
                fontSize: '13px'
              }}
            />
          </div>

          {/* Service Type (for deliveries) */}
          {dataType === 'deliveries' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>
                Service Type
              </label>
              <select
                value={filters.serviceType}
                onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: '6px',
                  background: colors.bg,
                  color: colors.textPrimary,
                  fontSize: '13px'
                }}
              >
                <option value="all">All Services</option>
                <option value="ride">Ride-sharing</option>
                <option value="courier">Courier</option>
              </select>
            </div>
          )}

          {/* Sort By */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${colors.borderColor}`,
                borderRadius: '6px',
                background: colors.bg,
                color: colors.textPrimary,
                fontSize: '13px'
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="price-asc">Price (Low to High)</option>
            </select>
          </div>
        </div>
      )}

      {/* Filter Summary */}
      {activeFilterCount > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: colors.bg,
          borderRadius: '6px',
          fontSize: '12px',
          color: colors.textSecondary
        }}>
          <strong>{activeFilterCount}</strong> active filter{activeFilterCount !== 1 ? 's' : ''} applied
        </div>
      )}
    </div>
  );
}
