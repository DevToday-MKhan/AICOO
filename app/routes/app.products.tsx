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

  const response = await admin.rest.resources.Product.all({
    session,
    limit: 50,
  });

  const products = response.data.map((product: any) => [
    product.title,
    product.vendor || "—",
    product.product_type || "—",
    product.variants?.[0]?.price || "—",
    product.variants?.[0]?.inventory_quantity || 0,
    product.status,
  ]);

  return json({
    products,
    totalProducts: response.data.length,
  });
}

export default function ProductsPage() {
  const { products, totalProducts } = useLoaderData<typeof loader>();

  return (
    <Page
      title="Products"
      subtitle={`Manage your ${totalProducts} products`}
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
                  "numeric",
                  "text",
                ]}
                headings={[
                  "Product",
                  "Vendor",
                  "Type",
                  "Price",
                  "Inventory",
                  "Status",
                ]}
                rows={products}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
