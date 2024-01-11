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

const getDbConfig = async () => {
  let secretValue;
  if (process.env.NODE_ENV === 'production') {
    secretValue = await getSecretValue('rds/postgres-instance');
  } else {
    secretValue = {
      password: process.env.DB_PASSWORD,
      username: process.env.DB_USER,
      host: process.env.RDS_HOST
    };
  }
  return secretValue;
};

const init = async () => {
  const { password, username, host } = await getDbConfig();
  client = new Client({
    host: host,
    user: username,
    database: 'note_service',
    password: password,
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
