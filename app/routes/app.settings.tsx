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
  });
}

export default function SettingsPage() {
  const { shop } = useLoaderData<typeof loader>();

  return (
    <Page title="Settings" subtitle={`Configure AI-COO for ${shop}`}>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                App Settings
              </Text>
              <Text as="p" variant="bodyMd">
                Configure notifications, API integrations, GPT preferences,
                and multi-store management.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
