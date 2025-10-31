import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { computed } from 'vue';

export default function useAuth() {
    const store = useAuthStore();

    return {
        currentUser: computed(() => store.currentUser),
        isAuthenticated: computed(() => store.isAuthenticated),
        login: store.login,
        logout: store.logout,
    };
}
