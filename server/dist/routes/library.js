import { Router } from 'express';
// import { streamExplanation } from '../services/llm.js'
const router = Router();
const TOPICS = [
    { id: 'stocks', title: 'Stocks', category: 'Investing', description: 'How equity ownership works' },
    { id: 'etfs', title: 'ETFs', category: 'Investing', description: 'Diversified funds explained' },
    { id: 'bonds', title: 'Bonds', category: 'Fixed Income', description: 'Lending money to earn interest' },
    { id: 'real-estate', title: 'Real estate', category: 'Assets', description: 'Property as an investment' },
    { id: 'compound', title: 'Compound interest', category: 'Fundamentals', description: 'The eighth wonder of the world' },
    { id: 'risk', title: 'Risk & return', category: 'Fundamentals', description: 'Understanding the tradeoff' },
    { id: 'loans', title: 'Loans & debt', category: 'Credit', description: 'Borrowing, rates, and repayment' },
    { id: 'tax', title: 'Tax efficiency', category: 'Tax', description: 'Keeping more of what you earn' },
];
router.get('/topics', (_req, res) => {
    res.json(TOPICS);
});
// router.get('/explain/:topicId', async (req, res) => {
//   const topic = TOPICS.find((t) => t.id === req.params.topicId)
//   if (!topic) return res.status(404).json({ error: 'Topic not found' })
//   await streamExplanation(`${topic.title} — ${topic.description}`, res)
// })
export default router;
