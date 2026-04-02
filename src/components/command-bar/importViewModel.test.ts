import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import {
  createLanguageOptions,
  getFileAcceptValue,
  getImportAiActionLabel,
  getImportCategoryDefinition,
  getImportCategoryLabel,
  getImportPlaceholders,
  getInfraFormatOptions,
  IMPORT_CATEGORY_DEFINITIONS,
} from './importViewModel';

const t = ((key: string, fallback?: string) => fallback ?? key) as TFunction<
  'translation',
  undefined
>;

describe('importViewModel', () => {
  it('returns translated category labels from the shared definitions', () => {
    expect(getImportCategoryLabel(t, 'infra')).toBe('Infra');
    expect(getImportCategoryDefinition('infra').hasNative).toBe(true);
    expect(IMPORT_CATEGORY_DEFINITIONS.some((definition) => definition.id === 'mermaid')).toBe(
      false
    );
    // sql, openapi, codebase are hidden behind feature flags (default off)
    expect(IMPORT_CATEGORY_DEFINITIONS.some((definition) => definition.id === 'sql')).toBe(false);
    expect(IMPORT_CATEGORY_DEFINITIONS.some((definition) => definition.id === 'codebase')).toBe(
      false
    );
  });

  it('builds placeholders and options for the import view controls', () => {
    const placeholders = getImportPlaceholders(t);
    const infraOptions = getInfraFormatOptions(t);
    const languageOptions = createLanguageOptions();

    expect(placeholders.sql).toContain('CREATE TABLE');
    expect(placeholders.codebase).toBe('');
    expect(infraOptions.map((option) => option.value)).toEqual([
      'terraform-state',
      'kubernetes',
      'docker-compose',
    ]);
    expect(languageOptions.some((option) => option.value === 'typescript')).toBe(true);
  });

  it('exposes category-specific AI labels and file accept values', () => {
    expect(getImportAiActionLabel(t, 'sql')).toBe('Generate ERD (AI)');
    expect(getImportAiActionLabel(t, 'code')).toBe('Analyze Architecture');
    expect(getFileAcceptValue('sql')).toBe('.sql,.txt');
    expect(getFileAcceptValue('codebase')).toBeNull();
  });
});
