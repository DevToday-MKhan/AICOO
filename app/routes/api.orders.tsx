import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  try {
    const response = await admin.rest.resources.Order.all({
      session: admin.session,
      limit: 50,
      status: "any",
    });

    return json({
      success: true,
      data: response.data || [],
      count: response.data?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}
