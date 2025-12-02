import { VercelRequest, VercelResponse } from '@vercel/node';
import { UserController } from '../src/backend/infrastructure/controllers/UserController.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return UserController.syncUser(req, res);
}
