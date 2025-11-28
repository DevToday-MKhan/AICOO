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
  InlineGrid,
  Divider,
} from "@shopify/polaris";
import {
  PlusCircleIcon,
  ExportIcon,
  ChartVerticalIcon,
  FileIcon,
} from "@shopify/polaris-icons";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);

  return json({
    title: "AI-COO Dashboard",
  });
}

export default function Dashboard() {
  const { title } = useLoaderData<typeof loader>();

  return (
    <Page 
      title={title}
      subtitle="Your AI-powered business control center"
    >
      <Layout>
        {/* Summary Metrics - 4 Column Grid */}
        <Layout.Section>
          <InlineGrid columns={4} gap="400">
            <Card>
              <BlockStack gap="300">
                <Text variant="headingSm" as="h3" tone="subdued">
                  Orders Today
                </Text>
                <Text variant="heading2xl" as="p" fontWeight="bold">
                  0
                </Text>
                <Badge tone="success">Live</Badge>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text variant="headingSm" as="h3" tone="subdued">
                  Revenue Today
                </Text>
                <Text variant="heading2xl" as="p" fontWeight="bold">
                  $0.00
                </Text>
                <Badge tone="info">Updated</Badge>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text variant="headingSm" as="h3" tone="subdued">
                  Total Customers
                </Text>
                <Text variant="heading2xl" as="p" fontWeight="bold">
                  0
                </Text>
                <Badge>Active</Badge>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text variant="headingSm" as="h3" tone="subdued">
                  Low Stock Items
                </Text>
                <Text variant="heading2xl" as="p" fontWeight="bold">
                  0
                </Text>
                <Badge tone="warning">Monitor</Badge>
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>

        {/* Orders & Inventory - 2 Column Layout */}
        <Layout.Section>
          <InlineGrid columns={2} gap="400">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingLg" as="h2">
                  Orders Summary
                </Text>
                <Divider />
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="p">
                      Pending Orders
                    </Text>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      0
                    </Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="p">
                      Fulfilled Today
                    </Text>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      0
                    </Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="p">
                      Cancelled Today
                    </Text>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      0
                    </Text>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingLg" as="h2">
                  Inventory Summary
                </Text>
                <Divider />
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="p">
                      Total Products
                    </Text>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      0
                    </Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="p">
                      Low Stock Alerts
                    </Text>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      0
                    </Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="p">
                      Out of Stock
                    </Text>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      0
                    </Text>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>

        {/* AI Insights Section */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingLg" as="h2">
                AI-COO Insights
              </Text>
              <Divider />
              <BlockStack gap="300">
                <Box
                  padding="400"
                  background="bg-surface-secondary"
                  borderRadius="200"
                >
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3">
                      💡 Recommendation
                    </Text>
                    <Text variant="bodyMd" as="p" tone="subdued">
                      AI-COO will analyze your store data and provide actionable insights here. Connect live data to see personalized recommendations.
                    </Text>
                  </BlockStack>
                </Box>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Quick Actions Section */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingLg" as="h2">
                Quick Actions
              </Text>
              <Divider />
              <InlineStack gap="300" wrap>
                <Button icon={PlusCircleIcon} variant="primary">
                  Create Discount
                </Button>
                <Button icon={ExportIcon}>
                  Export Customers
                </Button>
                <Button icon={ChartVerticalIcon}>
                  Analyze Store
                </Button>
                <Button icon={FileIcon}>
                  Sales Report
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
