import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { getFrontendAssets } from "../utils/manifest.server";
import { useEffect, useRef } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  
  const url = new URL(request.url);
  const host = url.searchParams.get("host") || "";
  const assets = getFrontendAssets();
  
  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    host,
    assets,
  });
}

export default function AppIndex() {
  const { apiKey, host, assets } = useLoaderData<typeof loader>();
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Initialize frontend app
    if (typeof window !== "undefined" && !scriptLoaded.current) {
      // Set global environment variables
      (window as any).ENV = { SHOPIFY_API_KEY: apiKey };
      (window as any).__SHOPIFY_DEV_HOST = host;
      
      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.crossOrigin = 'anonymous';
      link.href = assets.css;
      document.head.appendChild(link);
      
      // Load the frontend app's main script
      const script = document.createElement('script');
      script.type = 'module';
      script.crossOrigin = 'anonymous';
      script.src = assets.js;
      script.onload = () => {
        console.log('Frontend app loaded');
      };
      document.body.appendChild(script);
      
      scriptLoaded.current = true;
    }
  }, [apiKey, host, assets]);

  return (
    <div 
      style={{ 
        height: "100vh", 
        width: "100vw",
        margin: 0,
        padding: 0,
        overflow: "auto"
      }}
    >
      <div id="root"></div>
    </div>
  );
}
