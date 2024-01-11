import { NoteModel } from '../models/NoteModel';
import { executeQuery } from '../utility/DatabaseOperations';

export const getNotesByUserName = async (user_name: string) => {
  const queryString =
    'SELECT user_name, note, access FROM notes WHERE user_name=$1';
  const values = [user_name];
  const result = await executeQuery(queryString, values);
  return result.rows as NoteModel[];
};

export const insertNote = async (
  user_name: string,
  note: string,
  access: string
) => {
  const queryString =
    'INSERT INTO notes(user_name, note, access) VALUES($1,$2,$3) RETURNING *';
  const values = [user_name, note, access];
  const result = await executeQuery(queryString, values);
  console.log('created new note with values: ' + values);
  if (result.rowCount < 1) {
    throw new Error("Note can't be created!");
  }
  return result.rows[0] as NoteModel;
};
