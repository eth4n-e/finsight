import { WebSocketServer, WebSocket } from 'ws';
const clientSubscriptions = new Map();
export function setupWebSocket(server) {
    const wss = new WebSocketServer({ server, path: '/ws/prices' });
    wss.on('connection', (ws) => {
        clientSubscriptions.set(ws, new Set());
        ws.on('message', (raw) => {
            try {
                const msg = JSON.parse(raw.toString());
                if (msg.type === 'subscribe' && Array.isArray(msg.tickers)) {
                    const subs = clientSubscriptions.get(ws);
                    msg.tickers.forEach((t) => subs.add(t.toUpperCase()));
                }
            }
            catch { }
        });
        ws.on('close', () => clientSubscriptions.delete(ws));
    });
    // Simulated price relay — replace with Polygon WebSocket feed
    setInterval(() => {
        clientSubscriptions.forEach((tickers, ws) => {
            if (ws.readyState !== WebSocket.OPEN)
                return;
            tickers.forEach((ticker) => {
                const mockPrice = 100 + Math.random() * 200;
                ws.send(JSON.stringify({
                    ticker,
                    price: parseFloat(mockPrice.toFixed(2)),
                    change: parseFloat((Math.random() * 4 - 2).toFixed(2)),
                    changePct: parseFloat((Math.random() * 2 - 1).toFixed(2)),
                    timestamp: Date.now(),
                }));
            });
        });
    }, 5000);
    console.log('WebSocket server ready at /ws/prices');
}
