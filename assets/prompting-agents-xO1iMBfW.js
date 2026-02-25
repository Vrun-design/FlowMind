const e=`# How to Prompt AI Agents (Cursor, Copilot, ChatGPT)

OpenFlowKit is built to be AI-native. While it includes **Flowpilot** (our built-in AI assistant), you often want to generate diagrams directly inside your IDE using tools like Cursor, GitHub Copilot, or even regular ChatGPT.

To get the best results from any LLM, you need to point them to our syntax rules.

## The Magic Keyword: \`llms.txt\`

The secret to perfect AI generation is our \`llms.txt\` file. We host a machine-readable set of rules that teaches any AI exactly how to write OpenFlow DSL V2 code.

When prompting an AI agent, just include a reference to this file.

### Example Prompt for Cursor IDE
Open your Composer or Chat window and type:

> \`"Read https://openflowkit.com/llms.txt and then generate an architecture diagram showing our Next.js frontend connecting to a Supabase backend."\`

### Example Prompt for ChatGPT
If you are using ChatGPT with web-browsing enabled:

> \`"Go to https://openflowkit.com/llms.txt to learn the OpenFlowKit syntax. Then, write a flowchart detailing an OAuth2 login sequence. Output the result using the \\\`\\\`\\\`openflow code block."\`

## Best Practices for Prompting

Even with the rules, LLMs can sometimes get confused. Here are three tips for perfect diagrams every time:

1. **Be specific about shapes**: Instead of just saying "add a database", say "add a Node with the \`[process]\` type labeled 'Database'". 
2. **Name your connections**: The diagram is much more useful if edges have labels. Example: "Connect the frontend to the backend with the label '|REST API|'".
3. **Use Groups for clarity**: If you have multiple microservices, tell the AI to wrap them in a group: "Put the 'Auth Service' and 'User DB' inside a group called 'Backend Infrastructure'."

[Return to Editor](/#/canvas)
`;export{e as default};
