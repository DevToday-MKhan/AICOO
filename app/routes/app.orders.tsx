import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Badge,
  BlockStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  const response = await admin.rest.resources.Order.all({
    session,
    limit: 50,
  });

  const orders = response.data.map((order: any) => [
    order.name || order.id,
    order.customer?.first_name + " " + order.customer?.last_name || "Guest",
    `$${order.total_price}`,
    order.financial_status,
    order.fulfillment_status || "Unfulfilled",
    new Date(order.created_at).toLocaleDateString(),
  ]);

  return json({
    orders,
    totalOrders: response.data.length,
  });
}

export default function OrdersPage() {
  const { orders, totalOrders } = useLoaderData<typeof loader>();

  return (
    <Page
      title="Orders"
      subtitle={`Manage your ${totalOrders} orders`}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <DataTable
                columnContentTypes={[
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                ]}
                headings={[
                  "Order",
                  "Customer",
                  "Total",
                  "Payment Status",
                  "Fulfillment",
                  "Date",
                ]}
                rows={orders}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
