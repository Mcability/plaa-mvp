import { useCallback, useEffect, useState } from "react";

function getHashPath(): string {
  const hash = window.location.hash.replace(/^#/, "");
  return hash || "/";
}

export function useHashRoute(): [string, (path: string) => void] {
  const [path, setPath] = useState(getHashPath());

  useEffect(() => {
    const onChange = () => setPath(getHashPath());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((next: string) => {
    window.location.hash = next;
  }, []);

  return [path, navigate];
}
