import { Client } from 'pg';

import {
  GetSecretValueCommand,
  GetSecretValueCommandInput,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager';

let client: Client = undefined;

const secrets = new SecretsManagerClient({
  region: 'us-east-1'
});

const getSecretValue = async (secretId: string) => {
  const params: GetSecretValueCommandInput = {
    SecretId: secretId
  };

  const command = new GetSecretValueCommand(params);

  const { SecretString } = await secrets.send(command);

  if (!SecretString) throw new Error('SecretString is empty');

  return JSON.parse(SecretString);
};

// export const DBClient = async () => {
//   if (!client) {
//     client = new Client({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       database: process.env.DB_NAME,
//       password: process.env.DB_PASSWORD,
//       port: parseInt(process.env.DB_PORT)
//     });
//     await client.connect();
//   }
//   return client;
// };

const init = async () => {
  const { password, username, host } = await getSecretValue(
    'rds/postgres-instance'
  );
  client = new Client({
    host: process.env.RDS_HOST || host,
    user: process.env.DB_USER || username,
    database: process.env.DB_NAME || 'note_service',
    password: process.env.DB_PASSWORD || password,
    port: 5432
  });
  console.log('Connecting to DB...');
  await client.connect();
  console.log('Connected');
};

export const DBClient = async () => {
  if (!client) {
    await init();
  }
  return client;
};
