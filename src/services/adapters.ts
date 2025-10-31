export type UserRaw = { id: number; name?: string; email?: string; passwordHash?: string; [k: string]: any };
export type UserAdapted = { id: number; firstName?: string; lastName?: string; email?: string; passwordHash?: string; [k: string]: any };

type AdapterFn = (raw: UserRaw) => UserAdapted;

class AdapterRegistry {
  private adapters = new Map<string, AdapterFn>();
  register(name: string, fn: AdapterFn) { this.adapters.set(name, fn); }
  get(name: string) { return this.adapters.get(name); }
  adapt(name: string, raw: UserRaw) {
    const fn = this.get(name);
    if (!fn) throw new Error(`Adapter ${name} not registered`);
    return fn(raw);
  }
}
export const adapterRegistry = new AdapterRegistry();

adapterRegistry.register('nameSplit', (raw) => {
  const adapted: any = { ...raw };
  if (raw.name) {
    const parts = raw.name.trim().split(/\s+/);
    adapted.firstName = parts[0] || '';
    adapted.lastName = parts.slice(1).join(' ') || '';
    delete adapted.name;
  } else {
    adapted.firstName = raw.firstName || '';
    adapted.lastName = raw.lastName || '';
  }
  return adapted;
});
