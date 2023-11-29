import { Client } from 'pg';

let client: Client = undefined;

export const DBClient = async () => {
  if (!client) {
    client = new Client({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT)
    });
    await client.connect();
  }
  return client;
};
