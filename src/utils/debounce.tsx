import { useEffect, useState } from "react";

function useDebounce<S>(value: S, delay: number): S {
    const [debouncedValue, setDebouncedValue] = useState<S>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

export { useDebounce };
