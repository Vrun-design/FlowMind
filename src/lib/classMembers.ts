export type ClassVisibility = 'public' | 'private' | 'protected' | 'package';

export interface ParsedClassMember {
  visibility: ClassVisibility;
  symbol: '+' | '-' | '#' | '~';
  signature: string;
}

const VISIBILITY_TO_SYMBOL: Record<ClassVisibility, ParsedClassMember['symbol']> = {
  public: '+',
  private: '-',
  protected: '#',
  package: '~',
};

const SYMBOL_TO_VISIBILITY: Record<ParsedClassMember['symbol'], ClassVisibility> = {
  '+': 'public',
  '-': 'private',
  '#': 'protected',
  '~': 'package',
};

export function parseClassMember(input: string): ParsedClassMember {
  const trimmed = input.trim();
  const firstCharacter = trimmed.charAt(0) as ParsedClassMember['symbol'];
  if (firstCharacter in SYMBOL_TO_VISIBILITY) {
    return {
      visibility: SYMBOL_TO_VISIBILITY[firstCharacter],
      symbol: firstCharacter,
      signature: trimmed.slice(1).trim(),
    };
  }

  return {
    visibility: 'public',
    symbol: '+',
    signature: trimmed,
  };
}

export function stringifyClassMember(member: ParsedClassMember): string {
  const signature = member.signature.trim();
  const symbol = VISIBILITY_TO_SYMBOL[member.visibility];
  return signature ? `${symbol} ${signature}` : symbol;
}

export function getClassVisibilityTone(visibility: ClassVisibility): string {
  switch (visibility) {
    case 'private':
      return 'text-rose-500';
    case 'protected':
      return 'text-amber-500';
    case 'package':
      return 'text-violet-500';
    case 'public':
    default:
      return 'text-emerald-500';
  }
}
