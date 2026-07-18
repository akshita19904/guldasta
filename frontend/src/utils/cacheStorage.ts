const EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

export function saveCachedResult(key: string, data: any) {
  const payload = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(key, JSON.stringify(payload));
}

export function getCachedResult(key: string): any | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const payload = JSON.parse(raw);
    const isExpired = Date.now() - payload.timestamp > EXPIRY_MS;
    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }
    return payload.data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function clearCachedResult(key: string) {
  localStorage.removeItem(key);
}