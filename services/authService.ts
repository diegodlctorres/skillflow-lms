import { User, ServiceResponse } from '../types';

const MOCK_USER: User = {
  id: 'student-1',
  name: 'Alex Dev',
  email: 'alex@skillflow.com',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
};

const simulateNetworkDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(): Promise<ServiceResponse<User>> {
    await simulateNetworkDelay();
    return { data: MOCK_USER, error: null };
  },

  async logout(): Promise<void> {
    await simulateNetworkDelay(200);
  }
};