import React, { useMemo } from 'react';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';

/**
 * ShopifyProvider - Wraps the app with Shopify App Bridge and Polaris
 * Enables embedded app functionality within Shopify Admin
 */
const ShopifyProvider = ({ children }) => {
  // Get Shopify config from meta tag or environment
  const apiKey = useMemo(() => {
    const metaTag = document.querySelector('meta[name="shopify-api-key"]');
    return metaTag?.content || import.meta.env.VITE_SHOPIFY_API_KEY || '';
  }, []);

  // Get host from URL params (Shopify passes this)
  const host = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('host') || '';
  }, []);

  const config = useMemo(() => ({
    apiKey,
    host,
    forceRedirect: false,
  }), [apiKey, host]);

  // If no API key, render without Shopify wrapper (development mode)
  if (!apiKey) {
    console.warn('⚠️ SHOPIFY_API_KEY not found - running in standalone mode');
    return (
      <AppProvider i18n={{}}>
        {children}
      </AppProvider>
    );
  }

  return (
    <AppBridgeProvider config={config}>
      <AppProvider i18n={{}}>
        {children}
      </AppProvider>
    </AppBridgeProvider>
  );
};

export default ShopifyProvider;
