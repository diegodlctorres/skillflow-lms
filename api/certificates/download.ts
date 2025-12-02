import { VercelRequest, VercelResponse } from '@vercel/node';
import { CertificateController } from '../../src/backend/infrastructure/controllers/CertificateController.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return CertificateController.download(req, res);
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
