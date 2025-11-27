import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Box,
  Badge,
} from "@shopify/polaris";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);

  return json({
    title: "AI-COO Dashboard",
  });
}

export default function Dashboard() {
  const { title } = useLoaderData<typeof loader>();

  return (
    <Page title={title}>
      <Layout>
        {/* Summary Cards Section */}
        <Layout.Section>
          <BlockStack gap="400">
            <Text variant="headingLg" as="h2">
              Summary Cards
            </Text>
            <InlineStack gap="400" wrap={false}>
              <Card>
                <BlockStack gap="200">
                  <Text variant="headingSm" as="h3">
                    Orders Today
                  </Text>
                  <Text variant="heading2xl" as="p">
                    0
                  </Text>
                  <Badge tone="success">Live</Badge>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <Text variant="headingSm" as="h3">
                    Revenue Today
                  </Text>
                  <Text variant="heading2xl" as="p">
                    $0.00
                  </Text>
                  <Badge tone="info">Updated</Badge>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <Text variant="headingSm" as="h3">
                    Total Customers
                  </Text>
                  <Text variant="heading2xl" as="p">
                    0
                  </Text>
                  <Badge>Active</Badge>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <Text variant="headingSm" as="h3">
                    Low Stock Items
                  </Text>
                  <Text variant="heading2xl" as="p">
                    0
                  </Text>
                  <Badge tone="warning">Monitor</Badge>
                </BlockStack>
              </Card>
            </InlineStack>
          </BlockStack>
        </Layout.Section>

        {/* Orders Summary Section */}
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingLg" as="h2">
                Orders Summary
              </Text>
              <Box padding="400">
                <Text variant="bodyMd" as="p" tone="subdued">
                  Orders summary will appear here.
                </Text>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Inventory Summary Section */}
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingLg" as="h2">
                Inventory Summary
              </Text>
              <Box padding="400">
                <Text variant="bodyMd" as="p" tone="subdued">
                  Inventory summary will appear here.
                </Text>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* AI Insights Section */}
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingLg" as="h2">
                AI Insights
              </Text>
              <Box padding="400">
                <Text variant="bodyMd" as="p" tone="subdued">
                  AI-COO will generate real-time business insights here.
                </Text>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Quick Actions Section */}
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingLg" as="h2">
                Quick Actions
              </Text>
              <InlineStack gap="300">
                <Button>Create Discount</Button>
                <Button>Export Customers CSV</Button>
                <Button>Analyze Store</Button>
                <Button>Generate Sales Report</Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
