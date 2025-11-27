import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

export const loader = async () => {
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    apiBaseUrl: process.env.API_BASE_URL || "",
  };
};

export default function App() {
  const { apiKey, apiBaseUrl } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <meta name="shopify-api-key" content={apiKey} />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <Outlet />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify({ SHOPIFY_API_KEY: apiKey, API_BASE_URL: apiBaseUrl })}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
