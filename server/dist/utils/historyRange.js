/** Preset ranges accepted by `GET /api/stocks/:ticker/history?range=` */
export const HISTORY_RANGES = ['1D', '1W', '1M', '3M', '1Y'];
export function isHistoryRange(value) {
    return HISTORY_RANGES.includes(value.toUpperCase());
}
/**
 * Maps UI range presets to Yahoo `chart()` window + granularity.
 */
export function resolveChartWindow(range) {
    const period2 = new Date();
    const days = (n) => new Date(period2.getTime() - n * 24 * 60 * 60 * 1000);
    switch (range) {
        case '1D':
            return { period1: days(7), period2, interval: '5m' };
        case '1W':
            return { period1: days(10), period2, interval: '1h' };
        case '1M':
            return { period1: days(45), period2, interval: '1d' };
        case '3M':
            return { period1: days(100), period2, interval: '1d' };
        case '1Y':
            return { period1: days(400), period2, interval: '1wk' };
        default: {
            const _exhaustive = range;
            return _exhaustive;
        }
    }
}
