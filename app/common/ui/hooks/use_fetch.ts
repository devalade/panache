import { useState, useEffect } from 'react';

type  FetchResult<T> =  {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

type FetchConfig = {
    enabled?: boolean;
}

function useFetch<T>(url: string, config: FetchConfig = { enabled: true } ): FetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };
    if(config.enabled) {
        fetchData();
    }
  }, [url, config.enabled]);

  return { data, loading, error };
}

export default useFetch;
