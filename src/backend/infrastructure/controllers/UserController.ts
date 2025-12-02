import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../prisma.js';

export class UserController {
  static async syncUser(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id, email, name, avatarUrl } = req.body;

    if (!id || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Check if user exists with same email but different ID
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== id) {
        // Strategy: We trust Supabase Auth as the source of truth for ID.
        // If an old user exists with this email (e.g. from seed data), we should probably update their ID
        // OR delete the old record. Updating ID cascades to foreign keys which is good if supported,
        // but Prisma doesn't support changing ID easily if it's a foreign key target without cascade setup in DB.
        // For now, let's delete the old user to allow the new one to be created.
        // WARNING: This deletes old data. In a real prod app, we might want to merge or migrate.
        console.warn(`Deleting existing user ${existingUser.id} with email ${email} to allow sync of new user ${id}`);
        
        // Delete related records first if cascade delete is not set up in DB
        // (Assuming Enrollments are the main thing)
        await prisma.enrollment.deleteMany({
          where: { studentId: existingUser.id }
        });
        
        await prisma.user.delete({
          where: { id: existingUser.id }
        });
      }

      const user = await prisma.user.upsert({
        where: { id },
        update: {
          email,
          name: name || email.split('@')[0],
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        },
        create: {
          id,
          email,
          name: name || email.split('@')[0],
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        },
      });

      res.status(200).json({ data: user, error: null });
    } catch (error: any) {
      console.error('Error syncing user:', error);
      res.status(500).json({ data: null, error: error.message || 'Internal Server Error' });
    }
  }
}
