import 'dotenv/config';
import { InstallGlobalCommands } from './src/utils';

// Command containing options
const CHALLENGE_COMMAND = {
  name: 'note',
  description: 'add or get notes',
  options: [
    {
      name: 'add',
      description: 'add note',
      type: 1,
      options: [
        {
          type: 3,
          name: 'text',
          description: 'Enter your note'
        },
        {
          type: 3,
          name: 'access_level',
          description: 'Pick access level',
          choices: [
            {
              name: 'public',
              value: 'PUBLIC'
            },
            {
              name: 'private',
              value: 'PRIVATE'
            }
          ]
        }
      ]
    },
    {
      name: 'get',
      description: 'get note',
      type: 1,
      options: [
        {
          type: 3,
          name: 'access_level',
          description: 'Pick access level',
          choices: [
            {
              name: 'public',
              value: 'PUBLIC'
            },
            {
              name: 'private',
              value: 'PRIVATE'
            }
          ]
        }
      ]
    }
  ]
};

InstallGlobalCommands(process.env.APP_ID, [CHALLENGE_COMMAND]);
