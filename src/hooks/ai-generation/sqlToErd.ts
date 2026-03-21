export function buildSqlToErdPrompt(sql: string): string {
    return `Analyze the following SQL DDL (CREATE TABLE statements) and generate a clean Entity-Relationship Diagram.

Guidelines:
- Create one node per table using [entity] node type (or [system] if entity is unavailable)
- Label each node with the table name
- Add a compact attribute list inside the node body (primary keys, foreign keys, key columns)
- Draw edges between tables that share a foreign key relationship
- Label edges with the FK column name and cardinality (e.g. "1:N", "N:M")
- Group related tables into [section] containers where it makes semantic sense (e.g. "User Domain", "Order Domain")
- Use icons where appropriate (e.g. 🗄 for tables, 🔑 for PK columns)

SQL DDL:
\`\`\`sql
${sql}
\`\`\``;
}
