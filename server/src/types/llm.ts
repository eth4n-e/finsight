import { OHLCVBar, QuoteResult } from './finance'

export interface StockContext {
    name: string
    ticker: string
    history: OHLCVBar[]
    quote: QuoteResult
}

// TODO: add interface for StockAnalysis