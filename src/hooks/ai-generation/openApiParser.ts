export interface ParsedEndpoint {
    method: string;
    path: string;
    summary?: string;
    tags: string[];
    requiresAuth: boolean;
}

export interface ParsedSecurityScheme {
    name: string;
    type: string;
}

export interface ParsedApiGroup {
    tag: string;
    description?: string;
    endpoints: ParsedEndpoint[];
}

export interface ParsedOpenApi {
    title: string;
    version: string;
    groups: ParsedApiGroup[];
    securitySchemes: ParsedSecurityScheme[];
    hasGlobalAuth: boolean;
}

type OpenApiDoc = {
    info?: { title?: string; version?: string };
    tags?: Array<{ name?: string; description?: string }>;
    paths?: Record<string, Record<string, {
        summary?: string;
        tags?: string[];
        security?: unknown[];
    }>>;
    components?: { securitySchemes?: Record<string, { type?: string; scheme?: string }> };
    securityDefinitions?: Record<string, { type?: string }>;
    security?: unknown[];
};

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

export function parseOpenApi(specText: string): ParsedOpenApi | null {
    let doc: OpenApiDoc;

    try {
        doc = JSON.parse(specText) as OpenApiDoc;
    } catch {
        return null;
    }

    const title = doc.info?.title ?? 'API';
    const version = doc.info?.version ?? '';

    const securitySchemes: ParsedSecurityScheme[] = Object.entries(
        doc.components?.securitySchemes ?? doc.securityDefinitions ?? {}
    ).map(([name, scheme]) => ({
        name,
        type: scheme.type ?? 'unknown',
    }));

    const hasGlobalAuth = (doc.security?.length ?? 0) > 0;

    const tagDescriptions = new Map<string, string>();
    for (const tag of doc.tags ?? []) {
        if (tag.name) tagDescriptions.set(tag.name, tag.description ?? '');
    }

    const groupMap = new Map<string, ParsedEndpoint[]>();

    for (const [path, pathItem] of Object.entries(doc.paths ?? {})) {
        for (const method of HTTP_METHODS) {
            const op = pathItem[method];
            if (!op) continue;

            const tags = op.tags?.length ? op.tags : ['General'];
            const requiresAuth = (op.security?.length ?? 0) > 0 || hasGlobalAuth;

            const endpoint: ParsedEndpoint = {
                method: method.toUpperCase(),
                path,
                summary: op.summary,
                tags,
                requiresAuth,
            };

            const primaryTag = tags[0];
            if (!groupMap.has(primaryTag)) groupMap.set(primaryTag, []);
            groupMap.get(primaryTag)!.push(endpoint);
        }
    }

    const groups: ParsedApiGroup[] = [];
    for (const [tag, endpoints] of groupMap) {
        groups.push({
            tag,
            description: tagDescriptions.get(tag),
            endpoints,
        });
    }

    return { title, version, groups, securitySchemes, hasGlobalAuth };
}

export function formatOpenApiForPrompt(api: ParsedOpenApi): string {
    const lines: string[] = [
        `API: ${api.title}${api.version ? ` v${api.version}` : ''}`,
        '',
        'RESOURCE GROUPS (use one [system] node per group):',
    ];

    for (const group of api.groups) {
        lines.push(`  ${group.tag}${group.description ? ` — ${group.description}` : ''}`);
        const sample = group.endpoints.slice(0, 3);
        for (const ep of sample) {
            lines.push(`    ${ep.method} ${ep.path}${ep.summary ? ` — ${ep.summary}` : ''}`);
        }
        if (group.endpoints.length > 3) {
            lines.push(`    ... and ${group.endpoints.length - 3} more`);
        }
    }

    if (api.securitySchemes.length > 0) {
        lines.push('');
        lines.push(`AUTH: ${api.securitySchemes.map((s) => `${s.name} (${s.type})`).join(', ')}`);
    }

    return lines.join('\n');
}
