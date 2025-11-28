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
  Icon,
  ProgressBar,
  Banner,
} from "@shopify/polaris";
import {
  PlusCircleIcon,
  ExportIcon,
  ChartVerticalIcon,
  FileIcon,
  OrderIcon,
  CashDollarIcon,
  PersonIcon,
  ProductIcon,
} from "@shopify/polaris-icons";
import { useState, useEffect } from "react";
import createApp from "@shopify/app-bridge";

declare global {
  interface Window {
    ENV: {
      SHOPIFY_API_KEY: string;
    };
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);

  return json({
    title: "AI-COO Dashboard",
  });
}

export default function Dashboard() {
  const { title } = useLoaderData<typeof loader>();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const host = new URLSearchParams(window.location.search).get("host");

  useEffect(() => {
    if (!host) return;
    const app = createApp({
      apiKey: window.ENV.SHOPIFY_API_KEY,
      host,
      forceRedirect: false,
    });
    app.dispatch({ type: "APP::IFRAME::RESIZE" });
  }, [host]);

  return (
    <div id="dashboard-root">
      <Page 
      title={title}
      subtitle="Your AI-powered business control center"
    >
      <Layout>
        {/* Hero Header Section - Fills empty space */}
        <Layout.Section>
          <Box
            padding="600"
            background="bg-surface-secondary"
            borderRadius="300"
          >
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <Text variant="headingLg" as="h2">AI-COO Status</Text>
                  <Badge tone="success">ONLINE</Badge>
                </InlineStack>

                <Text variant="bodyMd" as="p" tone="subdued">
                  Your store systems are synced and running. AI-COO is monitoring performance, routing, and insights.
                </Text>
              </BlockStack>

              <InlineStack gap="300" blockAlign="center">
                <Button variant="primary" size="slim">
                  Sync Now
                </Button>
              </InlineStack>
            </InlineStack>

            <Box paddingBlockStart="400">
              <Divider />
            </Box>

            <Box paddingBlockStart="400">
              <InlineGrid columns={4} gap="400">
                <BlockStack gap="100">
                  <Text tone="subdued" variant="bodySm" as="p">AI Activity</Text>
                  <Text variant="bodyLg" as="p" fontWeight="bold">Active</Text>
                </BlockStack>

                <BlockStack gap="100">
                  <Text tone="subdued" variant="bodySm" as="p">Last Sync</Text>
                  <Text variant="bodyLg" as="p" fontWeight="bold">Just now</Text>
                </BlockStack>

                <BlockStack gap="100">
                  <Text tone="subdued" variant="bodySm" as="p">System Health</Text>
                  <Badge tone="success">Optimal</Badge>
                </BlockStack>

                <BlockStack gap="100">
                  <Text tone="subdued" variant="bodySm" as="p">Automations Today</Text>
                  <Text variant="bodyLg" as="p" fontWeight="bold">0 actions</Text>
                </BlockStack>
              </InlineGrid>
            </Box>
          </Box>
        </Layout.Section>

        {/* Welcome Banner */}
        <Layout.Section>
          <Banner
            title="Welcome to AI-COO! 👋"
            tone="info"
          >
            <p>
              Your intelligent operations assistant is ready to help optimize your store. 
              Start by reviewing today's metrics below.
            </p>
          </Banner>
        </Layout.Section>

        {/* Summary Metrics - 4 Column Grid with Icons */}
        <Layout.Section>
          <InlineGrid columns={4} gap="400">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="start">
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3" tone="subdued">
                      Orders Today
                    </Text>
                    <Text variant="heading2xl" as="p" fontWeight="bold">
                      0
                    </Text>
                  </BlockStack>
                  <Box
                    padding="300"
                    background="bg-fill-info"
                    borderRadius="200"
                  >
                    <Icon source={OrderIcon} tone="info" />
                  </Box>
                </InlineStack>
                <ProgressBar progress={0} tone="success" size="small" />
                <Text variant="bodySm" as="p" tone="subdued">
                  +0% from yesterday
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="start">
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3" tone="subdued">
                      Revenue Today
                    </Text>
                    <Text variant="heading2xl" as="p" fontWeight="bold">
                      $0.00
                    </Text>
                  </BlockStack>
                  <Box
                    padding="300"
                    background="bg-fill-success"
                    borderRadius="200"
                  >
                    <Icon source={CashDollarIcon} tone="success" />
                  </Box>
                </InlineStack>
                <ProgressBar progress={0} tone="success" size="small" />
                <Text variant="bodySm" as="p" tone="subdued">
                  +0% from yesterday
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="start">
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3" tone="subdued">
                      Total Customers
                    </Text>
                    <Text variant="heading2xl" as="p" fontWeight="bold">
                      0
                    </Text>
                  </BlockStack>
                  <Box
                    padding="300"
                    background="bg-fill-brand"
                    borderRadius="200"
                  >
                    <Icon source={PersonIcon} tone="emphasis" />
                  </Box>
                </InlineStack>
                <ProgressBar progress={0} tone="primary" size="small" />
                <Text variant="bodySm" as="p" tone="subdued">
                  Growing steadily
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="start">
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3" tone="subdued">
                      Low Stock Items
                    </Text>
                    <Text variant="heading2xl" as="p" fontWeight="bold">
                      0
                    </Text>
                  </BlockStack>
                  <Box
                    padding="300"
                    background="bg-fill-warning"
                    borderRadius="200"
                  >
                    <Icon source={ProductIcon} tone="warning" />
                  </Box>
                </InlineStack>
                <ProgressBar progress={0} size="small" />
                <Text variant="bodySm" as="p" tone="subdued">
                  No alerts
                </Text>
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>

        {/* Orders & Inventory - 2 Column Layout */}
        <Layout.Section>
          <InlineGrid columns={2} gap="400">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingLg" as="h2">
                    Orders Summary
                  </Text>
                  <Button size="slim" variant="plain">View all</Button>
                </InlineStack>
                <Divider />
                <BlockStack gap="400">
                  <Box
                    padding="300"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="200" blockAlign="center">
                        <Badge tone="attention">Pending</Badge>
                        <Text variant="bodyMd" as="p">
                          Pending Orders
                        </Text>
                      </InlineStack>
                      <Text variant="headingMd" as="p" fontWeight="bold">
                        0
                      </Text>
                    </InlineStack>
                  </Box>
                  
                  <Box
                    padding="300"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="200" blockAlign="center">
                        <Badge tone="success">Fulfilled</Badge>
                        <Text variant="bodyMd" as="p">
                          Fulfilled Today
                        </Text>
                      </InlineStack>
                      <Text variant="headingMd" as="p" fontWeight="bold">
                        0
                      </Text>
                    </InlineStack>
                  </Box>
                  
                  <Box
                    padding="300"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="200" blockAlign="center">
                        <Badge>Cancelled</Badge>
                        <Text variant="bodyMd" as="p">
                          Cancelled Today
                        </Text>
                      </InlineStack>
                      <Text variant="headingMd" as="p" fontWeight="bold">
                        0
                      </Text>
                    </InlineStack>
                  </Box>
                </BlockStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingLg" as="h2">
                    Inventory Summary
                  </Text>
                  <Button size="slim" variant="plain">Manage</Button>
                </InlineStack>
                <Divider />
                <BlockStack gap="400">
                  <Box
                    padding="300"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="200" blockAlign="center">
                        <Badge tone="info">Active</Badge>
                        <Text variant="bodyMd" as="p">
                          Total Products
                        </Text>
                      </InlineStack>
                      <Text variant="headingMd" as="p" fontWeight="bold">
                        0
                      </Text>
                    </InlineStack>
                  </Box>
                  
                  <Box
                    padding="300"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="200" blockAlign="center">
                        <Badge tone="warning">Alert</Badge>
                        <Text variant="bodyMd" as="p">
                          Low Stock Alerts
                        </Text>
                      </InlineStack>
                      <Text variant="headingMd" as="p" fontWeight="bold">
                        0
                      </Text>
                    </InlineStack>
                  </Box>
                  
                  <Box
                    padding="300"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="200" blockAlign="center">
                        <Badge tone="critical">Empty</Badge>
                        <Text variant="bodyMd" as="p">
                          Out of Stock
                        </Text>
                      </InlineStack>
                      <Text variant="headingMd" as="p" fontWeight="bold">
                        0
                      </Text>
                    </InlineStack>
                  </Box>
                </BlockStack>
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>

        {/* AI Insights Section - Enhanced */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="headingLg" as="h2">
                  🤖 AI-COO Insights
                </Text>
                <Badge tone="magic">Powered by AI</Badge>
              </InlineStack>
              <Divider />
              <BlockStack gap="400">
                <Box
                  padding="500"
                  background="bg-fill-info-secondary"
                  borderRadius="300"
                >
                  <BlockStack gap="300">
                    <InlineStack gap="200" blockAlign="center">
                      <Text variant="headingMd" as="h3">
                        💡 Smart Recommendation
                      </Text>
                    </InlineStack>
                    <Text variant="bodyLg" as="p">
                      AI-COO will analyze your store data and provide actionable insights here. 
                      Connect live data to see personalized recommendations for growth.
                    </Text>
                    <Button variant="primary" tone="success">
                      Activate AI Analysis
                    </Button>
                  </BlockStack>
                </Box>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Quick Actions Section - Interactive */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingLg" as="h2">
                ⚡ Quick Actions
              </Text>
              <Divider />
              <InlineGrid columns={4} gap="400">
                <Box
                  padding="400"
                  background={selectedAction === "discount" ? "bg-fill-selected" : "bg-surface"}
                  borderRadius="200"
                  borderColor="border"
                  borderWidth="025"
                >
                  <Button 
                    icon={PlusCircleIcon} 
                    variant="primary"
                    fullWidth
                    onClick={() => setSelectedAction("discount")}
                  >
                    Create Discount
                  </Button>
                </Box>
                
                <Box
                  padding="400"
                  background={selectedAction === "export" ? "bg-fill-selected" : "bg-surface"}
                  borderRadius="200"
                  borderColor="border"
                  borderWidth="025"
                >
                  <Button 
                    icon={ExportIcon}
                    fullWidth
                    onClick={() => setSelectedAction("export")}
                  >
                    Export Data
                  </Button>
                </Box>
                
                <Box
                  padding="400"
                  background={selectedAction === "analyze" ? "bg-fill-selected" : "bg-surface"}
                  borderRadius="200"
                  borderColor="border"
                  borderWidth="025"
                >
                  <Button 
                    icon={ChartVerticalIcon}
                    fullWidth
                    onClick={() => setSelectedAction("analyze")}
                  >
                    Analyze Store
                  </Button>
                </Box>
                
                <Box
                  padding="400"
                  background={selectedAction === "report" ? "bg-fill-selected" : "bg-surface"}
                  borderRadius="200"
                  borderColor="border"
                  borderWidth="025"
                >
                  <Button 
                    icon={FileIcon}
                    fullWidth
                    onClick={() => setSelectedAction("report")}
                  >
                    Sales Report
                  </Button>
                </Box>
              </InlineGrid>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
    </div>
  );
}
