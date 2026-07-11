import { OHLCVBar, QuoteResult } from './finance'
import { NewsResult } from './news'

export interface StockContext {
    name: string
    ticker: string
    history: OHLCVBar[]
    quote: QuoteResult
    articles: NewsResult[]
}

// TODO: add interface for StockAnalysis