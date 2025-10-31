import type { AppUser } from '@/types';
import { userAdapterConfig } from '@/config/app.config';

type AdapterConfig = typeof userAdapterConfig;

export function userAdapter(
    apiUser: AppUser,
    config: AdapterConfig = userAdapterConfig
): AppUser {

    const adapted: Partial<AppUser> = {};
    const nameParts = apiUser[config.nameField as keyof AppUser]?.toString().split(config.splitChar) || [];

    for (const rule of config.fields) {
        (adapted as any)[rule.target] = nameParts[rule.index] || rule.fallback || '';
    }

    return apiUser as AppUser;
}
