import type { VercelRequest, VercelResponse } from '@vercel/node';

import { handler } from '../handler';
import { config } from './config';

export default async function (req: VercelRequest, res: VercelResponse) {
  return handler(req, res, config);
}
