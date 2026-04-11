import { describe, expect, it } from 'vitest';
import {
  canRecoverMermaidSource,
  isMermaidLayoutRecoveryRecommended,
} from './recoveryPresentation';

describe('recoveryPresentation', () => {
  it('treats degraded Mermaid layout modes as recovery-worthy', () => {
    expect(isMermaidLayoutRecoveryRecommended('mermaid_preserved_partial')).toBe(true);
    expect(isMermaidLayoutRecoveryRecommended('mermaid_partial')).toBe(true);
    expect(isMermaidLayoutRecoveryRecommended('elk_fallback')).toBe(true);
    expect(isMermaidLayoutRecoveryRecommended('mermaid_exact')).toBe(false);
    expect(isMermaidLayoutRecoveryRecommended(undefined)).toBe(false);
  });

  it('allows Mermaid source recovery for editable_full imports when layout fidelity degraded', () => {
    expect(
      canRecoverMermaidSource({
        originalSource: 'flowchart LR\nA-->B',
        importState: 'editable_full',
        layoutMode: 'mermaid_preserved_partial',
      })
    ).toBe(true);
  });

  it('does not allow Mermaid source recovery for exact editable_full imports', () => {
    expect(
      canRecoverMermaidSource({
        originalSource: 'flowchart LR\nA-->B',
        importState: 'editable_full',
        layoutMode: 'mermaid_exact',
      })
    ).toBe(false);
  });
});
