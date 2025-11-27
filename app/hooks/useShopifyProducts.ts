import { useState, useEffect } from "react";

interface ProductsData {
  success: boolean;
  data: any[];
  count: number;
  error?: string;
}

export function useShopifyProducts() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch("/api/products");
        const result: ProductsData = await response.json();

        if (result.success) {
          setData(result.data);
          setError(null);
        } else {
          setError(result.error || "Failed to fetch products");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { data, loading, error };
}
