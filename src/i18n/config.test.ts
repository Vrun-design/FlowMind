import { describe, expect, it } from 'vitest';
import { getTranslationFallback } from './config';

describe('getTranslationFallback', () => {
  it('returns the English translation when the key exists', () => {
    expect(getTranslationFallback('properties.title')).toBe('Properties');
  });

  it('falls back to stable English copy instead of humanized key labels', () => {
    expect(getTranslationFallback('propertiesPanel.someMissingKey')).toBe('Error');
    expect(getTranslationFallback('toolbar.add_blank_shape')).toBe('Error');
  });

  it('recovers a unique English leaf key when the caller uses the wrong path', () => {
    expect(getTranslationFallback('privacyMessage')).toBe('Your diagrams stay with you and do not reach our servers.');
  });

  it('recovers English copy from the best matching key suffix', () => {
    expect(getTranslationFallback('ai.privacyTitle')).toBe('Privacy & Encryption');
  });

  it('prefers English text over prettified labels for non-ambiguous partial keys', () => {
    expect(getTranslationFallback('toast.reconnected')).toBe('Realtime collaboration restored.');
  });
});
