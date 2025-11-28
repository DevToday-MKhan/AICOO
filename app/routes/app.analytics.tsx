import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  return json({
    shop: session.shop,
    placeholder: true,
  });
}

export default function AnalyticsPage() {
  const { shop } = useLoaderData<typeof loader>();

  return (
    <Page title="Analytics" subtitle="Business insights and forecasting">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Analytics Dashboard Coming Soon
              </Text>
              <Text as="p" variant="bodyMd">
                View sales trends, revenue forecasts, customer segments, and
                GPT-powered business recommendations.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
