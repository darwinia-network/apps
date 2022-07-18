import Redis from 'ioredis';

let _redis: Redis | null = null;

export function redis(): { client: Redis | null; error: Error | null } {
  if (_redis) {
    return { client: _redis, error: null };
  }

  if (!process.env.REDIS_CONNECT_URL) {
    return { client: null, error: new Error('Failed to get cache client url') };
  }

  try {
    _redis = new Redis(process.env.REDIS_CONNECT_URL);
    return { client: _redis, error: null };
  } catch (err) {
    const error = err as Error;
    console.error('Failed connect redis: ' + error.message);
    return { client: null, error };
  }
}
