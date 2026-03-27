export interface OnboardingImportOption {
  id: 'mermaid' | 'sql' | 'openapi' | 'json-openflow';
  label: string;
  description: string;
}

export const RECOMMENDED_STARTER_TEMPLATE_LABELS = [
  'CI/CD release train',
  'AWS event-driven API',
  'API handoff sequence',
  'Engineering strategy mind map',
] as const;

export const RECOMMENDED_IMPORT_OPTIONS: OnboardingImportOption[] = [
  {
    id: 'mermaid',
    label: 'Mermaid',
    description: 'Paste a flowchart, state, class, ER, or sequence diagram.',
  },
  {
    id: 'sql',
    label: 'SQL',
    description: 'Turn DDL into an editable ER diagram.',
  },
  {
    id: 'openapi',
    label: 'OpenAPI',
    description: 'Generate a sequence or API flow from a spec.',
  },
  {
    id: 'json-openflow',
    label: 'JSON / OpenFlow',
    description: 'Reopen a saved workspace or portable DSL file.',
  },
];

export const RECOMMENDED_BUILDER_PROMPTS = [
  'Generate a microservices checkout architecture with API Gateway, auth, orders, payments, Redis, and Postgres.',
  'Model a CI/CD pipeline from pull request to canary release with rollback checks.',
  'Create a sequence diagram for an API request that validates auth, calls a worker, and stores the result.',
] as const;
