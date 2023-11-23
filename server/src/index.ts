import express from 'express';
import 'dotenv/config';
import { VerifyDiscordRequest } from './utils';
import InteractionsRoute from './routes/interactions_route';

const app = express();
const port = 3000;

app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.use('/interactions', InteractionsRoute);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
