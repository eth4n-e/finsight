import GNews from '@gnews-io/gnews-io-js';

export const newsClient = new GNews(process.env.NEWS_API_KEY!);