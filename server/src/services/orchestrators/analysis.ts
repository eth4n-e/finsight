import { QuoteResult, StockContext } from '../../types/index'
import { financeAdapter } from '../adapters/yahooFinance'
import { llmAdapter } from '../adapters/llm'
import { newsAdapter } from '../adapters/news'
import { cacheGet, cacheSet } from '../../infra/cache'

export const analysisService = {
    async buildMarketContext(ticker: string, range: string): Promise<StockContext> {
        // TODO:
        // 4. Fetch anything else from the yahoo api that might shed light on the companies performance
        // TODO: expand the parameters to build market context to pass to newsAdapter to narrow results 
        // TODO: add in news search query potentially too
        const [quote, history, articles] = await Promise.all([
            financeAdapter.getQuote(ticker),
            financeAdapter.getHistory(ticker, range),
            newsAdapter.getHeadlines()
        ]);

        return {
            name: quote.name,
            ticker,
            history,
            quote,
            articles
        }
    }, 
    async getAnalysis(ticker: string, range: string): Promise<string> {
        const key = `analysis:${ticker.toUpperCase()}:${range}`
        const value = await cacheGet<string>(key);
    
        if (value) {
            console.log(`Cache hit for key: ${key}`);
            return value ? value.toString() : '';
        }
    
        const context = await this.buildMarketContext(ticker, range);
        const analysis = await llmAdapter.analyzePerformance(context);
    
        await cacheSet(key, analysis);
        return analysis;
    }
}
