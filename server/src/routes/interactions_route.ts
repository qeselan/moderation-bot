import { InteractionResponseType, InteractionType } from 'discord-interactions';
import express, { Request, Response } from 'express';
import { createNote } from '../api/note_service';
import { Access } from '../enums/Access';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { type, id, data } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    let note = '';
    let access_level = Access.PUBLIC;
    const inputs = data.options[0].options;
    for (const input of inputs) {
      if (input.name === 'note') note = input.value;
      if (input.name === 'access_level') access_level = input.value;
    }

    if (name === 'note') {
      const userId = req.body.member.user.id;

      await createNote(userId, note, access_level);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Note created`
        }
      });
    }
  }
});

export default router;
