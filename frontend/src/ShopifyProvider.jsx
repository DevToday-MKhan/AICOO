import React, { useMemo, useEffect, useState } from 'react';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';

/**
 * ShopifyProvider - Wraps the app with Shopify App Bridge and Polaris
 * Enables embedded app functionality within Shopify Admin
 */
const ShopifyProvider = ({ children }) => {
  const [error, setError] = useState(null);

  // Get Shopify config from meta tag or environment
  const apiKey = useMemo(() => {
    const metaTag = document.querySelector('meta[name="shopify-api-key"]');
    const key = metaTag?.content || import.meta.env.VITE_SHOPIFY_API_KEY || '';
    
    // Check if it's still a placeholder
    if (key.includes('%VITE_SHOPIFY_API_KEY%') || key === '') {
      console.error('❌ SHOPIFY_API_KEY not properly set in environment');
      return '';
    }
    
    return key;
  }, []);

  // Get host from URL params (Shopify passes this)
  const host = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const hostParam = params.get('host');
    
    if (!hostParam) {
      console.warn('⚠️ No host parameter found in URL');
    }
    
    return hostParam || '';
  }, []);

  // Get shop from URL params
  const shop = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('shop') || '';
  }, []);

  const config = useMemo(() => {
    // App Bridge requires either 'host' OR 'shop' parameter
    // Shopify passes both in the URL when app is loaded in admin
    const cfg = {
      apiKey,
      host: host || undefined,
      forceRedirect: false,
    };
    
    console.log('🔑 Shopify App Bridge Config:', {
      apiKey: apiKey ? '***' + apiKey.slice(-4) : 'missing',
      host: host || 'missing',
      shop: shop || 'missing'
    });
    
    return cfg;
  }, [apiKey, host, shop]);

  useEffect(() => {
    if (!apiKey) {
      setError('Missing SHOPIFY_API_KEY - check environment variables');
    } else if (!host && shop) {
      setError('Missing host parameter - app may not load in Shopify admin');
    }
  }, [apiKey, host, shop]);

  // If no API key OR (no host AND no shop), render without Shopify wrapper (development/standalone mode)
  if (!apiKey || (!host && !shop)) {
    const isStandalone = !host && !shop;
    console.warn(isStandalone ? '⚠️ Running in standalone mode (no shop/host parameters)' : '⚠️ SHOPIFY_API_KEY not found');
    
    return (
      <AppProvider i18n={{}}>
        {!apiKey && (
          <div style={{ padding: '20px', background: '#fff3cd', border: '1px solid #ffc107' }}>
            <h3>⚠️ Development Mode</h3>
            <p>SHOPIFY_API_KEY not configured. Set VITE_SHOPIFY_API_KEY environment variable.</p>
          </div>
        )}
        {children}
      </AppProvider>
    );
  }

  // If no host parameter, show warning but continue
  if (!host && error) {
    console.error('❌ Shopify App Bridge Error:', error);
  }

  return (
    <AppBridgeProvider config={config}>
      <AppProvider i18n={{}}>
        {error && (
          <div style={{ 
            padding: '10px', 
            background: '#f8d7da', 
            color: '#721c24',
            borderBottom: '1px solid #f5c6cb',
            fontSize: '12px'
          }}>
            ⚠️ {error}
          </div>
        )}
        {children}
      </AppProvider>
    </AppBridgeProvider>
  );
};

export default ShopifyProvider;
