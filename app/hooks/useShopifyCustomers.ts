import { useState, useEffect } from "react";

interface CustomersData {
  success: boolean;
  data: any[];
  count: number;
  error?: string;
}

export function useShopifyCustomers() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true);
        const response = await fetch("/api/customers");
        const result: CustomersData = await response.json();

        if (result.success) {
          setData(result.data);
          setError(null);
        } else {
          setError(result.error || "Failed to fetch customers");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch customers");
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  return { data, loading, error };
}
