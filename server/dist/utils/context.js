import { market } from '../services/yahooFinance.js';
export async function buildMarketContext(ticker, range) {
    // TODO:
    // 3. Get the news for the ticker - not sure how to fetch this - might be exposed in API
    // 4. Fetch anything else from the yahoo api that might shed light on the companies performance
    const [quote, history] = await Promise.all([
        market.getQuote(ticker),
        market.getHistory(ticker, range)
    ]);
    return {
        name: quote.name,
        ticker,
        history,
        quote,
    };
}
