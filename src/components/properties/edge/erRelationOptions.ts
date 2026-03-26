import type { ERRelationToken } from '@/lib/relationSemantics';

export const ER_RELATION_OPTIONS: Array<{ id: ERRelationToken; label: string }> = [
  { id: '||--||', label: 'One to one' },
  { id: '||--o{', label: 'One to zero or many' },
  { id: '||--|{', label: 'One to one or many' },
  { id: '}o--||', label: 'Zero or many to one' },
  { id: '}|--||', label: 'One or many to one' },
  { id: '}o..o{', label: 'Zero or many to zero or many' },
  { id: '}|..|{', label: 'One or many to one or many' },
  { id: '}o--o{', label: 'Zero or many to zero or many (solid)' },
  { id: '}|--|{', label: 'One or many to one or many (solid)' },
  { id: '}o..||', label: 'Zero or many to one (optional)' },
  { id: '}|..||', label: 'One or many to one (optional)' },
  { id: '||..o{', label: 'One to zero or many (optional)' },
  { id: '||..|{', label: 'One to one or many (optional)' },
] as const;
