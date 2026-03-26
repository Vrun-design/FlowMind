import { formatSchemaForPrompt, parseSqlDdl } from './sqlParser';

export function buildSqlToErdPrompt(sql: string): string {
    const schema = parseSqlDdl(sql);
    const structuredSchema = formatSchemaForPrompt(schema);

    const schemaSection = structuredSchema
        ? structuredSchema
        : `SQL DDL (parse directly):\n\`\`\`sql\n${sql}\n\`\`\``;

    return `Generate a clean Entity-Relationship Diagram from the following schema.

${schemaSection}

Rules:
- Create exactly one [entity] node per table — use the exact table name as the label
- List the key columns inside the node body (PK first, then FKs, then up to 3 other columns — omit the rest)
- Draw one directed edge per foreign key relationship; label it with the FK column and cardinality (1:1, 1:N, or N:M)
- Group related tables into [section] containers where it makes semantic sense (e.g. "User Domain", "Commerce")
- Do NOT invent tables, columns, or relationships that are not in the schema above
- Keep labels concise — table names as-is, column names as-is`;
}
