export function rateLimit(fn: typeof fetch, options: { windowMs: number; max: number }) {
  const requests = new Map<string, number[]>()

  return function rateLimitedFetch(input: RequestInfo | URL, init?: RequestInit) {
    const now = Date.now()
    const key = typeof input === 'string' ? input : input.toString()
    
    // Get or initialize timestamps for this endpoint
    let timestamps = requests.get(key) || []
    timestamps = timestamps.filter(time => now - time < options.windowMs)
    
    if (timestamps.length >= options.max) {
      throw new Error('Too many requests, please try again later')
    }
    
    timestamps.push(now)
    requests.set(key, timestamps)
    
    return fn(input, init)
  }
} 