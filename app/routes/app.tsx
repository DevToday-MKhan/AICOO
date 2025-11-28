import { Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { AppProvider as PolarisAppProvider, Frame } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import Navigation from "../components/Navigation";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  
  return json({
    shop: session.shop,
  });
}

export default function AppLayout() {
  const { shop } = useLoaderData<typeof loader>();

  return (
    <PolarisAppProvider i18n={{}}>
      <Frame navigation={<Navigation shop={shop} />}>
        <Outlet />
      </Frame>
    </PolarisAppProvider>
  );
}
