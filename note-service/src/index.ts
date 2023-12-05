import express from 'express';
import 'dotenv/config';

import NotesRoute from './routes/notes_route';

const app = express();
const port = 4000;

app.use((req, res, next) => {
  console.log('REQUEST RECEIVED');
  next();
});

app.get('/health', (req, res) => {
  res.status(200).send('Health check successful.');
});

app.use(express.json());

app.use('/note', NotesRoute);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
