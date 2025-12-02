import { supabase } from '../src/infrastructure/supabase';
import { User, LoginCredentials } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No user data returned');
    }

    return {
      id: data.user.id,
      name: data.user.user_metadata.full_name || data.user.email?.split('@')[0] || 'Usuario',
      email: data.user.email || '',
      avatarUrl: data.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
    };
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async register(credentials: LoginCredentials): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No user data returned');
    }

    const user: User = {
      id: data.user.id,
      name: data.user.email?.split('@')[0] || 'Usuario',
      email: data.user.email || '',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
    };

    return user;
  },

  async syncUser(user: User): Promise<void> {
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
    } catch (error) {
      console.error('Failed to sync user:', error);
      // Don't throw, just log. We don't want to block login if sync fails temporarily.
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return null;

    return {
      id: session.user.id,
      name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Usuario',
      email: session.user.email || '',
      avatarUrl: session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`,
    };
  }
};