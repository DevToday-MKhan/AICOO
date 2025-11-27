import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  try {
    const response = await admin.rest.resources.Product.all({
      session: admin.session,
      limit: 50,
    });

    return json({
      success: true,
      data: response.data || [],
      count: response.data?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
