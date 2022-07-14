import Redis from 'ioredis';

let _redis: Redis;

export function redis(): { client: Redis | null; error: Error | null } {
  if (_redis) {
    return { client: _redis, error: null };
  }

  try {
    _redis = new Redis(process.env.REDIS_CONNECT_URL);
    return { client: _redis, error: null };
  } catch (error) {
    console.error('Failed connect redis: ' + error.message);
    return { client: null, error };
  }
}
