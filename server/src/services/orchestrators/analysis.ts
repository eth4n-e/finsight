import { QuoteResult, StockContext } from '../../types/index'
import { market } from '../adapters/yahooFinance'
import { llm } from '../adapters/llm'
import { cacheGet, cacheSet } from '../../infra/cache'

export const analysisService = {
    async buildMarketContext(ticker: string, range: string): Promise<StockContext> {
        // TODO:
        // 3. Get the news for the ticker - not sure how to fetch this - might be exposed in API
        // 4. Fetch anything else from the yahoo api that might shed light on the companies performance
        const [quote, history] = await Promise.all([
            market.getQuote(ticker),
            market.getHistory(ticker, range)
        ])
    
        return {
            name: quote.name,
            ticker,
            history,
            quote,
        }
    }, 
    async getAnalysis(ticker: string, range: string): Promise<string> {
        const key = `analysis:${ticker.toUpperCase()}:${range}`
        const cached = await cacheGet<string>(key);
    
        if (cached) {
            console.log(`Cache hit for key: ${key}`);
            return cached.value ? cached.value.toString() : '';
        }
    
        const context = await this.buildMarketContext(ticker, range);
        const analysis = await llm.analyzePerformance(context);
    
        await cacheSet(key, analysis);
        return analysis;
    }
}
