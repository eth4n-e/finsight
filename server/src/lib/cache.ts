import { Client } from 'memjs'

export const cacheClient = Client.create(`${process.env.CACHE_HOST}:${process.env.CACHE_PORT}`);