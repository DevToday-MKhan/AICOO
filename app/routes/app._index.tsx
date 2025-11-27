import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";
  const host = url.searchParams.get("host") || "";
  
  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    shop,
    host,
  });
}

export default function AppIndex() {
  const { apiKey, shop, host } = useLoaderData<typeof loader>();

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1>🚀 AICOO - AI Chicken Logistics</h1>
      <p>Welcome to your Shopify embedded app!</p>
      
      <div style={{
        background: '#f3f4f6',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>App Status</h2>
        <ul>
          <li><strong>Shop:</strong> {shop || 'Not provided'}</li>
          <li><strong>Host:</strong> {host ? 'Connected' : 'Not provided'}</li>
          <li><strong>API Key:</strong> {apiKey ? '✅ Configured' : '❌ Missing'}</li>
          <li><strong>Session:</strong> ✅ Authenticated</li>
        </ul>
      </div>

      <div style={{
        background: '#dbeafe',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>🎯 Next Steps</h2>
        <ol>
          <li>Build your custom UI components here</li>
          <li>Add routes for different features</li>
          <li>Use App Bridge for native Shopify integration</li>
          <li>Connect to backend APIs at <code>/api/*</code></li>
        </ol>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Initialize App Bridge
            if (window.shopify && window.shopify.environment) {
              console.log('✅ Shopify App Bridge loaded');
              console.log('Shop:', '${shop}');
              console.log('Host:', '${host}');
            }
          `,
        }}
      />
    </div>
  );
}
