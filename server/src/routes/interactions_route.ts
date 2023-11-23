import { InteractionResponseType, InteractionType } from 'discord-interactions';
import express, { Request, Response } from 'express';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { type, id, data } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }
});

export default router;
