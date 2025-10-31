import { defineStore } from 'pinia';
import { apiClient } from '@/api/apiClient';
import { db } from '@/services/indexedDB';
import { deriveKeyPBKDF2, genSaltB64 } from '@/utils/crypto';

const LOCAL_KEY = 'app_current_user';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        currentUser: JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null') as any | null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.currentUser,
    },
    actions: {
        privateSaveCurrentUser(user: any | null) {
            this.currentUser = user;
            if (user) localStorage.setItem(LOCAL_KEY, JSON.stringify(user));
            else localStorage.removeItem(LOCAL_KEY);
        },

        async onlineLogin(username: string, password: string) {

            const res = await apiClient.postDecrypted('/login', { username, password });
            const body = res || {};
            const user = body.data || body.user || body;
            if (!user) throw new Error('Invalid login response');

            if (body.success === false) return false;

            const userObj = { id: user.id, username: user.username, email: user.email, name: user.name };
            this.privateSaveCurrentUser(userObj);

            try {
                const salt = genSaltB64(16);
                const derived = await deriveKeyPBKDF2(password, salt, 120000, 32);
                await db.put('users', {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    firstName: user.name?.split(' ')[0] || '',
                    lastName: user.name?.split(' ').slice(1).join(' ') || '',
                    offline: { salt, derived } // offline verification blob
                });
            } catch (e) {
                console.warn('Failed to cache offline verification material', e);
            }
            return true;
        },

        async offlineLogin(username: string, password: string) {
            const all = await db.getAll('users');
            const user = (all || []).find((u: any) =>
                (u.username && u.username === username) ||
                (u.email && u.email === username) ||
                (u.username && username.includes(u.username.slice(0, 2)))
            );
            if (!user || !user.offline) return false;
            const { salt, derived } = user.offline;
            try {
                const candidate = await deriveKeyPBKDF2(password, salt, 120000, 32);
                if (candidate === derived) {
                    this.privateSaveCurrentUser({ id: user.id, username: user.username, email: user.email, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() });
                    return true;
                }
                return false;
            } catch (e) {
                console.warn('Offline derive failed', e);
                return false;
            }
        },

        async login({ username, password }: { username: string; password: string }) {
            try {
                if (navigator.onLine) {
                    const ok = await this.onlineLogin(username, password);
                    if (ok) return true;
                    return false;
                } else {
                    return await this.offlineLogin(username, password);
                }
            } catch (err) {
                try {
                    return await this.offlineLogin(username, password);
                } catch (e) {
                    throw e;
                }
            }
        },

        logout() {
            this.privateSaveCurrentUser(null);
        }
    }
});
