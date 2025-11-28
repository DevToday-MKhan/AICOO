import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineGrid,
  Badge,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  // Fetch orders count
  const ordersResponse = await admin.rest.resources.Order.count({ session });
  const ordersCount = ordersResponse.count || 0;

  // Fetch products count
  const productsResponse = await admin.rest.resources.Product.count({ session });
  const productsCount = productsResponse.count || 0;

  // Fetch customers count
  const customersResponse = await admin.rest.resources.Customer.count({ session });
  const customersCount = customersResponse.count || 0;

  return json({
    shop: session.shop,
    metrics: {
      orders: ordersCount,
      products: productsCount,
      customers: customersCount,
      revenue: 0, // Mock value - implement revenue calculation
    },
  });
}

export default function DashboardPage() {
  const { shop, metrics } = useLoaderData<typeof loader>();

  return (
    <Page title="Dashboard" subtitle={`Welcome to AI-COO - ${shop}`}>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <InlineGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Total Orders
                  </Text>
                  <Text as="p" variant="heading2xl">
                    {metrics.orders}
                  </Text>
                  <Badge tone="success">Active</Badge>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Products
                  </Text>
                  <Text as="p" variant="heading2xl">
                    {metrics.products}
                  </Text>
                  <Badge tone="info">In Catalog</Badge>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Customers
                  </Text>
                  <Text as="p" variant="heading2xl">
                    {metrics.customers}
                  </Text>
                  <Badge>Registered</Badge>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Revenue (Mock)
                  </Text>
                  <Text as="p" variant="heading2xl">
                    ${metrics.revenue}
                  </Text>
                  <Badge tone="attention">Placeholder</Badge>
                </BlockStack>
              </Card>
            </InlineGrid>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  AI-Powered Insights
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Get GPT-powered recommendations by visiting the AI Assistant page.
                  Analyze your inventory, predict demand, and optimize pricing strategies.
                </Text>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
