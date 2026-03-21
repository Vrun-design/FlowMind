export function buildOpenApiToSequencePrompt(spec: string): string {
    return `Analyze the following OpenAPI / Swagger specification and generate a sequence diagram showing the main API flows.

Guidelines:
- Create actor nodes for: Client, API Gateway (if present), each tagged service or controller grouping
- For each major endpoint group, show the request/response sequence as directed edges
- Label edges with HTTP method + path (e.g. "POST /users"), status codes on responses
- Show authentication steps where security schemes are defined (e.g. Bearer token exchange)
- Group related endpoints into [section] containers by resource/tag
- Keep it high-level: show 5-10 key flows, not every endpoint

OPENAPI SPEC:
\`\`\`
${spec}
\`\`\``;
}
