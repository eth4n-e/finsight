/** Preset ranges accepted by `GET /api/stocks/:ticker/history?range=` */
export const HISTORY_RANGES = ['1D', '1W', '1M', '3M', '1Y', '2Y', '5Y'];
export function isHistoryRange(value) {
    return HISTORY_RANGES.includes(value.toUpperCase());
}
export function validateHistoryRange(value) {
    const raw = typeof value === 'string' ? value : '1M';
    const range = raw.toUpperCase();
    if (!isHistoryRange(range)) {
        return { status: false, range: "" };
    }
    return { status: true, range };
}
/**
 * Maps range presets to Yahoo `chart()` window + granularity.
 */
export function resolveChartWindow(range) {
    const period2 = new Date();
    // input: An integer representing # of days to wind back
    // output: ms since Unix Epoch
    const daysPrior = (n) => new Date(period2.getTime() - n * 24 * 60 * 60 * 1000);
    switch (range) {
        case '1D':
            return { period1: daysPrior(1), period2, interval: '15m' };
        case '1W':
            return { period1: daysPrior(10), period2, interval: '90m' };
        case '1M':
            return { period1: daysPrior(35), period2, interval: '1d' };
        case '3M':
            return { period1: daysPrior(95), period2, interval: '1wk' };
        case '1Y':
            return { period1: daysPrior(370), period2, interval: '1wk' };
        case '2Y':
            return { period1: daysPrior(740), period2, interval: '1mo' };
        case '5Y':
            return { period1: daysPrior(1850), period2, interval: '1mo' };
        default: {
            const _exhaustive = range;
            return _exhaustive;
        }
    }
}
