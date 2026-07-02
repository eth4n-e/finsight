import { cache } from '@/lib/cache'

export const cacheGet = async <T>(key: string) => {
    const value = await cache.get(key);
    return value ?? null;
}

export const cacheSet = async (key: string, value: string) => {
    await cache.set(key, value);
}

export const cacheRemove = async (key: string) => {
    await cache.delete(key);
}