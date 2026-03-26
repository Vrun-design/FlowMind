import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import trTranslation from './locales/tr/translation.json';
import deTranslation from './locales/de/translation.json';
import frTranslation from './locales/fr/translation.json';
import esTranslation from './locales/es/translation.json';
import zhTranslation from './locales/zh/translation.json';
import jaTranslation from './locales/ja/translation.json';

interface TranslationEntry {
  path: string;
  value: string;
  segments: string[];
}

function lookupTranslationValue(source: unknown, key: string): string | undefined {
  const segments = key.split('.');
  let current: unknown = source;

  for (const segment of segments) {
    if (!current || typeof current !== 'object' || !(segment in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }

  return typeof current === 'string' ? current : undefined;
}

function collectTranslationEntries(source: unknown, prefix = '', entries: TranslationEntry[] = []) {
  if (!source || typeof source !== 'object') {
    return entries;
  }

  for (const [segment, value] of Object.entries(source as Record<string, unknown>)) {
    const nextPath = prefix ? `${prefix}.${segment}` : segment;

    if (typeof value === 'string') {
      entries.push({ path: nextPath, value, segments: nextPath.split('.') });
      continue;
    }

    collectTranslationEntries(value, nextPath, entries);
  }

  return entries;
}

const englishTranslationEntries = collectTranslationEntries(enTranslation);
const warnedMissingKeys = new Set<string>();

function shouldWarnForMissingTranslations(): boolean {
  return typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV);
}

function warnMissingTranslationKey(key: string) {
  if (!shouldWarnForMissingTranslations() || warnedMissingKeys.has(key)) {
    return;
  }

  warnedMissingKeys.add(key);
  console.warn(`[i18n] Missing translation key: "${key}"`);
}

function getCommonEnglishFallback(): string {
  return lookupTranslationValue(enTranslation, 'common.error') ?? 'Error';
}

function countMatchingSuffixSegments(left: string[], right: string[]): number {
  let count = 0;

  while (count < left.length && count < right.length) {
    if (left[left.length - 1 - count] !== right[right.length - 1 - count]) {
      break;
    }
    count += 1;
  }

  return count;
}

function lookupBestEnglishFallbackValue(key: string): string | undefined {
  const requestedSegments = key.split('.');
  let bestMatches: TranslationEntry[] = [];
  let bestScore = 0;
  let bestLengthDelta = Number.POSITIVE_INFINITY;

  for (const entry of englishTranslationEntries) {
    const score = countMatchingSuffixSegments(requestedSegments, entry.segments);
    if (score === 0) {
      continue;
    }

    const lengthDelta = Math.abs(entry.segments.length - requestedSegments.length);

    if (score > bestScore || (score === bestScore && lengthDelta < bestLengthDelta)) {
      bestScore = score;
      bestLengthDelta = lengthDelta;
      bestMatches = [entry];
      continue;
    }

    if (score === bestScore && lengthDelta === bestLengthDelta) {
      bestMatches.push(entry);
    }
  }

  if (bestMatches.length === 0) {
    return undefined;
  }

  const distinctValues = [...new Set(bestMatches.map((entry) => entry.value))];
  if (distinctValues.length === 1) {
    return distinctValues[0];
  }

  bestMatches.sort((left, right) => {
    if (left.segments.length !== right.segments.length) {
      return left.segments.length - right.segments.length;
    }
    return left.path.localeCompare(right.path);
  });

  return bestMatches[0].value;
}

export function getTranslationFallback(key: string): string {
  return (
    lookupTranslationValue(enTranslation, key) ??
    lookupBestEnglishFallbackValue(key) ??
    getCommonEnglishFallback()
  );
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    missingKeyHandler: (_languages, _namespace, key) => warnMissingTranslationKey(key),
    returnNull: false,
    returnEmptyString: false,
    parseMissingKeyHandler: (key) => {
      warnMissingTranslationKey(key);
      return getTranslationFallback(key);
    },
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: enTranslation },
      tr: { translation: trTranslation },
      de: { translation: deTranslation },
      fr: { translation: frTranslation },
      es: { translation: esTranslation },
      zh: { translation: zhTranslation },
      ja: { translation: jaTranslation },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
    },
    load: 'languageOnly',
  });

export default i18n;
