export function createId(prefix?: string): string {
    const id = crypto.randomUUID();
    return prefix ? `${prefix}-${id}` : id;
}

