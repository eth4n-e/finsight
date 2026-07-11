import { newsClient } from '../../lib/news';
import { NewsParams, NewsResult } from '@/types';


export const newsAdapter = {
    async getHeadlines(params?: NewsParams): Promise<NewsResult[]> {
        // const {
        //     category,
        //     max,
        //     from,
        //     to
        // } = params;

        const res = await newsClient.topHeadlines({
            category: 'general',
            lang: 'en'
            // from: ,
            // to,
        });

        return res.articles;
    },
    // async search(params: NewsParams) {
        
    // }
}