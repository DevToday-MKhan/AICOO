import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  BlockStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  const response = await admin.rest.resources.Customer.all({
    session,
    limit: 50,
  });

  const customers = response.data.map((customer: any) => [
    `${customer.first_name} ${customer.last_name}`,
    customer.email || "—",
    customer.phone || "—",
    customer.orders_count || 0,
    customer.total_spent || "$0",
    new Date(customer.created_at).toLocaleDateString(),
  ]);

  return json({
    customers,
    totalCustomers: response.data.length,
  });
}

export default function CustomersPage() {
  const { customers, totalCustomers } = useLoaderData<typeof loader>();

  return (
    <Page
      title="Customers"
      subtitle={`Manage your ${totalCustomers} customers`}
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
                  "numeric",
                  "text",
                  "text",
                ]}
                headings={[
                  "Name",
                  "Email",
                  "Phone",
                  "Orders",
                  "Total Spent",
                  "Joined",
                ]}
                rows={customers}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
