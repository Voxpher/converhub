import { Router } from 'express';
import { listTools } from '../services/toolRegistry';

const router = Router();

// Public registry of every tool: id, name, category, accepted types, live phase.
router.get('/', (_req, res) => {
  res.json({ tools: listTools() });
});

export default router;
