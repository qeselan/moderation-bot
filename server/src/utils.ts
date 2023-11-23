import { verifyKey } from 'discord-interactions';
import { Request, Response } from 'express';

export function VerifyDiscordRequest(clientKey: string) {
  return function (req: Request, res: Response, buf: Buffer, encoding: string) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');
      throw new Error('Bad request signature');
    }
  };
}
