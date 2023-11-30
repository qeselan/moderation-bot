import axios from 'axios';
import { Access } from 'src/enums/Access';

export const createNote = async (
  user: string,
  note: string,
  access: Access
) => {
  console.log('note_service_url: ', process.env.NOTE_SERVICE);
  await axios.post(`${process.env.NOTE_SERVICE}/note`, {
    user_name: user,
    note: note,
    access: access
  });
};
