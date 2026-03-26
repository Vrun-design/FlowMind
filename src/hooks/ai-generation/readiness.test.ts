import { describe, expect, it } from 'vitest';
import { getAIReadinessState } from './readiness';

const DEFAULT_STORAGE_MODE = 'local' as const;

describe('getAIReadinessState', () => {
  it('blocks hosted providers when the API key is missing', () => {
    const readiness = getAIReadinessState({
      provider: 'openai',
      storageMode: DEFAULT_STORAGE_MODE,
      model: 'gpt-5-mini',
    });

    expect(readiness.canGenerate).toBe(false);
    expect(readiness.blockingIssue?.detail).toContain('OpenAI API key');
    expect(readiness.advisory?.title).toContain('OpenAI');
  });

  it('blocks custom providers when the base URL is invalid', () => {
    const readiness = getAIReadinessState({
      provider: 'custom',
      storageMode: DEFAULT_STORAGE_MODE,
      model: 'llama3.1',
      customBaseUrl: 'localhost:11434/v1',
    });

    expect(readiness.canGenerate).toBe(false);
    expect(readiness.blockingIssue?.detail).toContain('http:// or https://');
  });

  it('allows browser-friendly providers when required config exists', () => {
    const readiness = getAIReadinessState({
      provider: 'gemini',
      storageMode: DEFAULT_STORAGE_MODE,
      apiKey: 'AIza-test',
    });

    expect(readiness.canGenerate).toBe(true);
    expect(readiness.blockingIssue).toBeNull();
    expect(readiness.advisory?.title).toContain('browser-first default');
  });

  it('allows custom endpoints with a valid URL and model', () => {
    const readiness = getAIReadinessState({
      provider: 'custom',
      storageMode: DEFAULT_STORAGE_MODE,
      customBaseUrl: 'http://localhost:11434/v1',
      model: 'llama3.1',
    });

    expect(readiness.canGenerate).toBe(true);
    expect(readiness.blockingIssue).toBeNull();
    expect(readiness.advisory?.title).toBe('Custom endpoint selected');
  });
});
