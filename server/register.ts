import 'dotenv/config';
import { InstallGlobalCommands } from './src/utils';

// Command containing options
const CHALLENGE_COMMAND = {
  name: 'note',
  description: 'Add or access notes.',
  options: [
    {
      name: 'add',
      description: 'add note',
      type: 1,
      options: [
        {
          type: 3,
          name: 'note',
          description: 'Enter your note'
        },
        {
          type: 3,
          name: 'access_level',
          description: 'Pick access level'
        }
      ]
    },
    {
      name: 'access',
      description: 'access note',
      type: 1,
      options: [
        {
          type: 3,
          name: 'access_level',
          description: 'Pick access level'
        }
      ]
    }
  ]
};

InstallGlobalCommands(process.env.APP_ID, [CHALLENGE_COMMAND]);
