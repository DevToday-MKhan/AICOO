import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

let appBridge: any;

export function getAppBridge() {
  if (!appBridge) {
    const host =
      new URLSearchParams(window.location.search).get("host") ||
      (window as any).__SHOPIFY_DEV_HOST ||
      "";

    appBridge = createApp({
      apiKey: (window as any).ENV?.SHOPIFY_API_KEY || "",
      host: host,
      forceRedirect: true,
    });
  }

  return appBridge;
}

export async function getSessionTokenClient() {
  const app = getAppBridge();
  const token = await getSessionToken(app);
  return token;
}
