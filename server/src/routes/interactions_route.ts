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
    const { name: command } = data;
    const userId = req.body.member.user.id;

    if (command === 'note') {
      const subcommand = data.options[0].name;
      const options = data.options[0].options;

      let access_level = Access.PUBLIC;
      let text = '';

      for (const option of options) {
        if (option.name === 'text') text = option.value;
        if (option.value === 'access_level') access_level = option.value;
      }

      if (subcommand === "add") {
        await createNote(userId, text, access_level);
      }

      if (subcommand === "get") {
        await 
      }


      

      

      console.log('note value: ' + text);
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
