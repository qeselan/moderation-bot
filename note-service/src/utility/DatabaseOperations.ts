import { DBClient } from './DatabaseClient';

export const executeQuery = async (query: string, values: unknown[]) => {
  const client = await DBClient();
  const result = await client.query(query, values);
  return result;
};
