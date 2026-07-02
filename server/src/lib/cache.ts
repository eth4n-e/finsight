import { Client } from 'memjs'

export const cache = Client.create(process.env.CACHE_SERVER);