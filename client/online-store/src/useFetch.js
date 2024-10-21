import { useEffect, useState } from "react";

export default function useFetch(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(url);
                if(!response.ok)
                    throw new Error(`Произошла ошибка: ${response.statusText}`);
                const jsonData = await response.json();
                setData(jsonData);
            }
            catch(error) {
                setError(error.message);
            }
            setLoading(false);
        }
        fetchData();
    }, [url]);

    return { data, loading, error };
}