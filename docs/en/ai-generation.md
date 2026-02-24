

FlowMind leverages Google's **Gemini 2.0 Flash** model to understand natural language and convert it into structural diagrams.

## How it Works

1.  **Intent Analysis**: The AI analyzes your prompt to understand the *goal* (e.g., "Login Flow") and the *actors* (User, Server, Database).
2.  **Structural Generation**: It constructs a valid FlowMind DSL JSON object representing the nodes and connections.
3.  **Layout Optimization**: The engine applies smart layout algorithms to ensure the generated graph is readable.

## Best Practices for Prompts

To get the best results, be specific about the **steps** and the **outcome**.

### ❌ Too Vague
> "Make a system diagram."

### ✅ Good
> "Create a high-level system architecture for an e-commerce platform. Include a Web App, API Gateway, User Service, Product Service, and a shared PostgreSQL database."

### ✅ Better (Process Flow)
> "Draw a flowchart for a user password reset process. Start with 'User clicks forgot password', check if email exists. If yes, send distinct token. If no, show error. End with 'User enters new password'."

## Editing AI Results

AI generation is a starting point, not the end. You can always:
*   Add missing steps manaully.
*   Renaming nodes for clarity.
*   Regenerating specific sections (Coming Soon).

## 🔑 Bring Your Own Key (BYOK)

By default, FlowMind uses a shared API key with limited quotas. For heavy usage, privacy, or to use your own billing, you can bring your own **Gemini API Key**.

1.  Go to **Google AI Studio** and [Get an API Key](https://aistudio.google.com/app/apikey).
2.  In FlowMind, open **Settings** (Gear Icon) or click on any **Brand Kit**.
3.  Navigate to the **AI** tab.
4.  Paste your key into the secure input field.

> [!NOTE]
> Your key is stored locally in your browser's `localStorage` and is never sent to our servers. It is strictly used for client-side API calls to Google.
