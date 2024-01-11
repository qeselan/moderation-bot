import { Request, Response } from 'express';
import { getNotesByUserName, insertNote } from '../repository/NoteRepository';

export const getNotes = async (req: Request, res: Response) => {
  const user_name = req.query.user;
  const notes = await getNotesByUserName(user_name);
  res.status(200).send({ notes });
};

export const createNote = async (req: Request, res: Response) => {
  const { user_name, note, access } = req.body;
  const created_note = await insertNote(user_name, note, access);
  res.status(201).send({ note: created_note });
};
