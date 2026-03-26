import { PROVIDERS, PROVIDER_RISK, type ProviderMeta } from '@/config/aiProviders';
import type { AIProvider, AISettings } from '@/store';

export interface AIReadinessMessage {
  tone: 'info' | 'warning' | 'error';
  title: string;
  detail: string;
}

export interface AIReadinessState {
  canGenerate: boolean;
  blockingIssue: AIReadinessMessage | null;
  advisory: AIReadinessMessage | null;
}

function getProviderMeta(provider: AIProvider): ProviderMeta {
  return PROVIDERS.find((candidate) => candidate.id === provider) ?? PROVIDERS[0];
}

function getProviderAdvisory(provider: AIProvider, providerName: string): AIReadinessMessage {
  if (provider === 'custom') {
    return {
      tone: 'info',
      title: 'Custom endpoint selected',
      detail:
        'Use the exact model ID and an OpenAI-compatible /chat/completions endpoint. Local setups often work without an API key, but hosted gateways may still require one.',
    };
  }

  const risk = PROVIDER_RISK[provider];
  if (risk === 'browser_friendly') {
    return {
      tone: 'info',
      title: `${providerName} is a good browser-first default`,
      detail:
        'This provider usually works well from a local browser session. Keep prompts specific and prefer edits or additions over full-canvas rewrites.',
    };
  }

  if (risk === 'proxy_likely') {
    return {
      tone: 'warning',
      title: `${providerName} often needs a server-side proxy`,
      detail:
        'Browser-originated requests are commonly blocked or rate-limited. If generation fails immediately, route requests through your own backend.',
    };
  }

  return {
    tone: 'warning',
    title: `${providerName} may need extra setup`,
    detail:
      'Some accounts and enterprise policies work fine in-browser, but others require a proxy or custom gateway. If requests fail fast, check your provider policy.',
  };
}

function buildBlockingIssue(providerName: string, detail: string): AIReadinessMessage {
  return {
    tone: 'error',
    title: `${providerName} is not ready yet`,
    detail,
  };
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getAIReadinessState(aiSettings: AISettings): AIReadinessState {
  const provider = aiSettings.provider ?? 'gemini';
  const providerMeta = getProviderMeta(provider);
  const providerName = providerMeta.name;
  const apiKey = aiSettings.apiKey?.trim();
  const model = aiSettings.model?.trim();
  const customBaseUrl = aiSettings.customBaseUrl?.trim();

  if (provider === 'custom') {
    if (!customBaseUrl) {
      return {
        canGenerate: false,
        blockingIssue: buildBlockingIssue(
          providerName,
          'Add a custom base URL before generating. Point it at an OpenAI-compatible endpoint such as Ollama, LM Studio, or your own gateway.',
        ),
        advisory: getProviderAdvisory(provider, providerName),
      };
    }

    if (!isValidHttpUrl(customBaseUrl)) {
      return {
        canGenerate: false,
        blockingIssue: buildBlockingIssue(
          providerName,
          'The custom base URL must be a full http:// or https:// URL, for example http://localhost:11434/v1.',
        ),
        advisory: getProviderAdvisory(provider, providerName),
      };
    }

    if (!model) {
      return {
        canGenerate: false,
        blockingIssue: buildBlockingIssue(
          providerName,
          'Add the exact model ID exposed by your endpoint before generating.',
        ),
        advisory: getProviderAdvisory(provider, providerName),
      };
    }

    return {
      canGenerate: true,
      blockingIssue: null,
      advisory: getProviderAdvisory(provider, providerName),
    };
  }

  if (!apiKey) {
    return {
      canGenerate: false,
      blockingIssue: buildBlockingIssue(
        providerName,
        `Add your ${providerName} API key in Settings before generating.`,
      ),
      advisory: getProviderAdvisory(provider, providerName),
    };
  }

  return {
    canGenerate: true,
    blockingIssue: null,
    advisory: getProviderAdvisory(provider, providerName),
  };
}
