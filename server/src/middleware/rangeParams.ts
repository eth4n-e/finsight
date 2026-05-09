/*
 * getRangeParams - utility function to get time ranges for stock prices
 */
export function getRangeParams(range = '1M') {
  const to = new Date().toISOString().split('T')[0]
  const from = new Date()

  switch (range) {
    case '1D': from.setDate(from.getDate() - 1); return { from: from.toISOString().split('T')[0], to, multiplier: 5,  timespan: 'minute' }
    case '1W': from.setDate(from.getDate() - 7); return { from: from.toISOString().split('T')[0], to, multiplier: 1,  timespan: 'hour'   }
    case '3M': from.setMonth(from.getMonth() - 3); return { from: from.toISOString().split('T')[0], to, multiplier: 1, timespan: 'day'   }
    case '1Y': from.setFullYear(from.getFullYear() - 1); return { from: from.toISOString().split('T')[0], to, multiplier: 1, timespan: 'day' }
    default:   from.setMonth(from.getMonth() - 1); return { from: from.toISOString().split('T')[0], to, multiplier: 1, timespan: 'day'  }
  }
}
