import Groq from "groq-sdk";
import type { Response } from 'express'
import { StockContext } from '../../types/llm'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are a clear, approachable financial educator inside Finsight, a personal finance dashboard. 
When explaining financial topics:
- Use plain language and concrete examples
- Structure responses with a brief intro, key concepts, and a practical takeaway
- Flag when something is simplified or when professional advice is warranted
- Keep explanations focused — around 200-300 words unless the user asks for more
- Never give specific investment recommendations`

// TODO: add instruction like "Leverage news sources and external documents as insight to explain price trends"
const ANALYSIS_PROMPT = `You are a clear, approachable financial educator inside Finsight, a personal finance dashboard.
Your job is to provide an analysis of a stock's performance based on the detailed information provided in your context.
When analyzing a stock's performance:
- Keep explanations focused - around 100-175 words
- Always begin analysis with a high level summary, then dive further into key details and broader trends
- Focus responses on the timeframe provided
- Never give investment recommendations
`

export const llm = {
  async getGroqChatCompletion() {
    return client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Explain the importance of fast language models",
        },
      ],
      model: "openai/gpt-oss-20b",
    });
  },

  async analyzePerformance(context: StockContext): Promise<string> {
    const response = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: ANALYSIS_PROMPT
        },
        {
          role: "user",
          content: `Leverage the following stock details to provide an analysis of the stock's performance: ${JSON.stringify(context)}`
        },
      ],
      model: "openai/gpt-oss-120b",
    })

    return response.choices[0].message.content ?? "No summary today, sorry!";
  }
}

// TODO: modify this function to connect into Qwen
// TODO: visit message streaming when building out library interface which is more chat-like
// export async function streamExplanation(topic: string, res: Response) {
//   res.setHeader('Content-Type', 'text/event-stream')
//   res.setHeader('Cache-Control', 'no-cache')
//   res.setHeader('Connection', 'keep-alive')

//   const stream = client.messages.stream({
//     model: 'claude-sonnet-4-20250514',
//     max_tokens: 1024,
//     system: SYSTEM_PROMPT,
//     messages: [{ role: 'user', content: `Explain: ${topic}` }],
//   })

//   for await (const chunk of stream) {
//     if (
//       chunk.type === 'content_block_delta' &&
//       chunk.delta.type === 'text_delta'
//     ) {
//       res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
//     }
//   }

//   res.write('data: [DONE]\n\n')
//   res.end()
// }
