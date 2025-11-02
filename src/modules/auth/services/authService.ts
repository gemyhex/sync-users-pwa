import type { ApiClient } from '@/api/apiClient';
import { apiClient } from '@/api/apiClient';
import { userSyncService } from '@/services/userSync';
import { db } from '@/services/indexedDB';
import * as bcrypt from 'bcryptjs';

export interface Credentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export class AuthService {
  private api: ApiClient;

  constructor(apiClientInstance = apiClient) {
    this.api = apiClientInstance;
  }

  /**
   * Try to login online first. If that fails due to network / server error,
   * try offline login against cached users in IndexedDB.
   *
   * Returns: { user, source: 'online'|'offline' }
   */
  async login(creds: Credentials): Promise<{ user: AuthUser; source: 'online' | 'offline' }> {
    // normalize identifier
    const identifier = creds.username.trim();

    try {
      const res = await this.api.postDecrypted<any>('/auth/login', {
        username: identifier,
        password: creds.password,
      });

      const userFromApi: any = res?.user ?? res;
      if (userFromApi) {
        try { await userSyncService.fetchAndStoreAllPages?.(); } catch { /* ignore */ }
        return { user: this.adaptUser(userFromApi), source: 'online' };
      }

      throw new Error('Unexpected login response');
    } catch (onlineErr) {
      console.warn('[AuthService] Online login failed, trying offline', onlineErr);
    }

    // Offline fallback: find credential in local IDB 'users' store
    try {
      // Our db wrapper provides get/getAll; find by email or username
      const users = await db.getAll('users'); // returns array
      const match = (users || []).find((u: any) => {
        if (!u) return false;
        const uname = String(u.username || '').toLowerCase();
        const email = String(u.email || '').toLowerCase();
        const iden = identifier.toLowerCase();
        return uname === iden || email === iden;
      });

      if (!match) throw new Error('No offline user found');

      // bcrypt compare (bcryptjs)
      const passwordHash = match.password; // your cached bcrypt hash
      if (!passwordHash) throw new Error('No password hash stored for offline user');

      const passwordMatches = bcrypt.compareSync(creds.password, passwordHash);
      if (!passwordMatches) throw new Error('Offline password mismatch');

      // success
      return { user: this.adaptUser(match), source: 'offline' };
    } catch (offlineErr) {
      console.error('[AuthService] Offline login failed:', offlineErr);
      throw new Error('Login failed (online + offline)');
    }
  }

  async logout() {
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): AuthUser | null {
    const s = localStorage.getItem('currentUser');
    return s ? JSON.parse(s) : null;
  }

  setCurrentUser(user: AuthUser) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private adaptUser(u: any): AuthUser {
    return {
      id: u.id,
      username: u.username,
      firstName: u.firstName ?? u.name?.split?.(' ')?.[0] ?? '',
      lastName: u.lastName ?? (u.name ? u.name.split(' ').slice(1).join(' ') : ''),
      email: u.email,
      ...u,
    };
  }
}

export const authService = new AuthService(apiClient);
export default authService;
