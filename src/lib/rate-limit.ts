/**
 * Simple Rate Limiter using Cloudflare KV
 */
export async function checkRateLimit(
  kv: any,
  key: string,
  limit: number = 5,
  windowSeconds: number = 60
): Promise<{ success: boolean; remaining: number }> {
  if (!kv) return { success: true, remaining: limit };

  const kvKey = `rate_limit:${key}`;
  const current = await kv.get(kvKey, "json") as { count: number; expires: number } | null;
  const now = Math.floor(Date.now() / 1000);

  if (!current || now > current.expires) {
    // Start new window
    const newState = { count: 1, expires: now + windowSeconds };
    await kv.put(kvKey, JSON.stringify(newState), { expirationTtl: windowSeconds });
    return { success: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return { success: false, remaining: 0 };
  }

  // Increment count
  const updatedState = { count: current.count + 1, expires: current.expires };
  await kv.put(kvKey, JSON.stringify(updatedState), { expirationTtl: current.expires - now });
  
  return { success: true, remaining: limit - updatedState.count };
}
