import { Access } from '../enums/Access';

export interface NoteModel {
  user_name: string;
  note: string;
  access: Access;
}
