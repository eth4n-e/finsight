import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const SYSTEM_PROMPT = `You are a clear, approachable financial educator inside Finsight, a personal finance dashboard. 
When explaining financial topics:
- Use plain language and concrete examples
- Structure responses with a brief intro, key concepts, and a practical takeaway
- Flag when something is simplified or when professional advice is warranted
- Keep explanations focused — around 200-300 words unless the user asks for more
- Never give specific investment recommendations`;
// TODO: modify this function to connect into Qwen
export async function streamExplanation(topic, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const stream = client.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Explain: ${topic}` }],
    });
    for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta') {
            res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
        }
    }
    res.write('data: [DONE]\n\n');
    res.end();
}
