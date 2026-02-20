import { getSystemInstruction, ChatMessage, generateDiagramFromChat as generateDiagramFromChatGemini, chatWithDocsGemini } from './geminiService';

export type AIProvider = 'gemini' | 'openai' | 'claude' | 'groq' | 'nvidia' | 'cerebras' | 'mistral' | 'custom';

const PROVIDER_BASE_URLS: Record<string, string> = {
    openai: 'https://api.openai.com/v1',
    groq: 'https://api.groq.com/openai/v1',
    nvidia: 'https://integrate.api.nvidia.com/v1',
    cerebras: 'https://api.cerebras.ai/v1',
    mistral: 'https://api.mistral.ai/v1',
};

const DEFAULT_MODELS: Record<string, string> = {
    gemini: 'gemini-2.5-flash-lite',
    openai: 'gpt-5-mini',
    claude: 'claude-sonnet-4-6',
    groq: 'meta-llama/llama-4-scout-17b-16e-instruct',
    nvidia: 'meta/llama-4-scout-17b-16e-instruct',
    cerebras: 'gpt-oss-120b',
    mistral: 'mistral-medium-latest',
    custom: 'gpt-4o',
};

function getEnvApiKey(provider: AIProvider): string | undefined {
    // Vite uses import.meta.env
    switch (provider) {
        case 'gemini': return import.meta.env.VITE_GEMINI_API_KEY;
        case 'openai': return import.meta.env.VITE_OPENAI_API_KEY;
        case 'claude': return import.meta.env.VITE_CLAUDE_API_KEY;
        case 'groq': return import.meta.env.VITE_GROQ_API_KEY;
        case 'nvidia': return import.meta.env.VITE_NVIDIA_API_KEY;
        case 'cerebras': return import.meta.env.VITE_CEREBRAS_API_KEY;
        case 'mistral': return import.meta.env.VITE_MISTRAL_API_KEY;
        case 'custom': return import.meta.env.VITE_CUSTOM_AI_API_KEY;
        default: return undefined;
    }
}

/** Convert FlowMind chat history to OpenAI-compatible message format */
function historyToMessages(history: ChatMessage[]): { role: string; content: string }[] {
    return history.map(h => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.parts.map(p => p.text || '').join(''),
    }));
}

// --- OpenAI-compatible REST call (used by OpenAI, Groq, NVIDIA, Cerebras, Mistral, Custom) ---
async function callOpenAICompatible(
    baseUrl: string,
    apiKey: string,
    model: string,
    messages: { role: string; content: string }[]
): Promise<string> {
    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.2,
            max_tokens: 4096,
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('No content in response from AI provider.');
    return text;
}

// --- Anthropic Claude REST call ---
async function callClaude(
    apiKey: string,
    model: string,
    messages: { role: string; content: string }[]
): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model,
            system: getSystemInstruction(),
            messages,
            max_tokens: 4096,
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Anthropic API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) throw new Error('No content in Anthropic response.');
    return text;
}

// --- Primary exported function ---
export async function generateDiagramFromChat(
    history: ChatMessage[],
    newMessage: string,
    currentDSL?: string,
    imageBase64?: string,
    apiKeySetting?: string,
    modelIdSetting?: string,
    provider: AIProvider = 'gemini',
    customBaseUrlSetting?: string
): Promise<string> {
    const apiKey = apiKeySetting || getEnvApiKey(provider);
    if (!apiKey) {
        throw new Error("API Key is missing. Please add it in Settings → Flowpilot AI or in your .env.local file.");
    }

    const modelId = modelIdSetting || (provider === 'custom' ? import.meta.env.VITE_CUSTOM_AI_MODEL : undefined);

    const userPrompt = `User Request: ${newMessage}${currentDSL ? `\n\nCURRENT CONTENT (The user wants to update this):\n${currentDSL}` : ''}\n\nGenerate or update the FlowMind DSL based on this request.`;

    // Gemini uses its own SDK with different prompt structure — delegate directly
    if (provider === 'gemini') {
        return generateDiagramFromChatGemini(history, newMessage, currentDSL, imageBase64, apiKey, modelId);
    }

    // Claude uses Anthropic's message format
    if (provider === 'claude') {
        const messages = [
            ...historyToMessages(history),
            { role: 'user', content: userPrompt },
        ];
        return callClaude(apiKey, modelId || DEFAULT_MODELS.claude, messages);
    }

    // All remaining providers (OpenAI, Groq, NVIDIA, Cerebras, Mistral, Custom) share the OpenAI wire format
    let baseUrl = PROVIDER_BASE_URLS[provider];
    if (provider === 'custom') {
        baseUrl = customBaseUrlSetting || import.meta.env.VITE_CUSTOM_AI_BASE_URL || PROVIDER_BASE_URLS.openai;
    }

    if (!baseUrl) throw new Error(`Unknown provider: ${provider}`);

    const messages = [
        { role: 'system', content: getSystemInstruction() },
        ...historyToMessages(history),
        { role: 'user', content: userPrompt },
    ];

    return callOpenAICompatible(baseUrl, apiKey, modelId || DEFAULT_MODELS[provider] || 'gpt-4o', messages);
}

// --- Chat with Docs Function ---
export async function chatWithDocs(
    history: ChatMessage[],
    newMessage: string,
    docsContext: string,
    apiKeySetting?: string,
    modelIdSetting?: string,
    provider: AIProvider = 'gemini',
    customBaseUrlSetting?: string
): Promise<string> {
    const apiKey = apiKeySetting || getEnvApiKey(provider);
    if (!apiKey) {
        throw new Error("API Key is missing. Please add it in Settings → Flowpilot AI or in your .env.local file.");
    }

    const modelId = modelIdSetting || (provider === 'custom' ? import.meta.env.VITE_CUSTOM_AI_MODEL : undefined);

    if (provider === 'gemini') {
        return chatWithDocsGemini(history, newMessage, docsContext, apiKey, modelId);
    }

    const systemInstruction = `
You are an expert support assistant for OpenFlowKit, a local-first node-based diagramming tool.
Your job is to answer user questions accurately based ONLY on the provided documentation.
Be helpful, concise, and use formatting (bold, code blocks) to make your answers easy to read.
If the answer is not in the documentation, politely inform the user that you don't know based on the current docs.

DOCUMENTATION REPOSITORY:
---
${docsContext}
---
`;

    if (provider === 'claude') {
        const messages = [
            ...historyToMessages(history),
            { role: 'user', content: newMessage },
        ];

        // Custom Claude call since it needs docs in system prompt, but we reuse callClaude logic loosely:
        // Actually, callClaude hardcodes getSystemInstruction(), so let's inline a quick Claude call here for docs.
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: modelId || DEFAULT_MODELS.claude,
                system: systemInstruction,
                messages,
                max_tokens: 4096,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Anthropic API error (${response.status}): ${err}`);
        }

        const data = await response.json();
        const text = data.content?.[0]?.text;
        if (!text) throw new Error('No content in Anthropic response.');
        return text;
    }

    let baseUrl = PROVIDER_BASE_URLS[provider];
    if (provider === 'custom') {
        baseUrl = customBaseUrlSetting || import.meta.env.VITE_CUSTOM_AI_BASE_URL || PROVIDER_BASE_URLS.openai;
    }

    if (!baseUrl) throw new Error(`Unknown provider: ${provider}`);

    const messages = [
        { role: 'system', content: systemInstruction },
        ...historyToMessages(history),
        { role: 'user', content: newMessage },
    ];

    return callOpenAICompatible(baseUrl, apiKey, modelId || DEFAULT_MODELS[provider] || 'gpt-4o', messages);
}

// Re-export for compatibility
export type { ChatMessage };
