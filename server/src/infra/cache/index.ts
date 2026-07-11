import { cacheClient } from '@/lib/cache'

export const cacheGet = async <T>(key: string) => {
    const { value } = await cacheClient.get(key);
    return value ?? null
}

export const cacheSet = async (key: string, value: string) => {
    await cacheClient.set(key, value);
}

export const cacheRemove = async (key: string) => {
    await cacheClient.delete(key);
}