import { useState, useEffect } from "react";

interface OrdersData {
  success: boolean;
  data: any[];
  count: number;
  error?: string;
}

export function useShopifyOrders() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const response = await fetch("/api/orders");
        const result: OrdersData = await response.json();

        if (result.success) {
          setData(result.data);
          setError(null);
        } else {
          setError(result.error || "Failed to fetch orders");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  return { data, loading, error };
}
