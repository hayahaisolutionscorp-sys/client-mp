export const runtime = "nodejs";
export const maxDuration = 30;

// Knowledge base endpoints are on api-v2 (port 3002), not client-api (port 3000)
const API_V2_URL = process.env.NEXT_PUBLIC_KNOWLEDGE_BASE_API_URL || "http://localhost:3002";

export async function POST(req: Request) {
  console.log("--> /api/chat [Proxy Mode] POST received");
  try {
    const url = new URL(req.url);
    const queryAgentId = url.searchParams.get("agentId");
    const queryTenantId = url.searchParams.get("tenantId");
    const queryScope = url.searchParams.get("scope");

    const body = await req.json();
    console.log("--> Request body:", JSON.stringify(body, null, 2));
    
    const { messages, agentId: bodyAgentId } = body;

    // Prioritize Body, then URL, then default
    const agentId = bodyAgentId || queryAgentId || "default";
    // Default to tenant 1 (localhost) for testing if not specified
    const tenantId = queryTenantId ? parseInt(queryTenantId) : 1;
    const scope = queryScope || undefined;

    // AI SDK v3+ can send in multiple formats depending on version/config
    let query = "";
    
    // Format 1: Direct prompt field (some SDK versions)
    if (body.prompt && typeof body.prompt === 'string') {
      query = body.prompt;
    }
    
    // Format 2: Messages array (most common)
    if (!query && messages && Array.isArray(messages) && messages.length > 0) {
      const lastUserMessage = messages.slice().reverse().find((m: any) => m.role === 'user');
      if (lastUserMessage) {
        // Handle AI SDK v3+ format with parts array
        if (lastUserMessage.parts && Array.isArray(lastUserMessage.parts)) {
          const textPart = lastUserMessage.parts.find((p: any) => p.type === 'text');
          query = textPart?.text || "";
        }
        // Fallback to legacy content field
        if (!query && lastUserMessage.content) {
          query = typeof lastUserMessage.content === 'string' 
            ? lastUserMessage.content 
            : JSON.stringify(lastUserMessage.content);
        }
      }
    }
    
    // Format 3: Direct message/text field (sendMessage format)
    if (!query && body.message) {
      query = typeof body.message === 'string' ? body.message : body.message.text || "";
    }
    if (!query && body.text) {
      query = body.text;
    }

    if (!query) {
      console.error("--> No user message found. Body keys:", Object.keys(body));
      console.error("--> Full body:", JSON.stringify(body, null, 2));
      return new Response("No user message found", { status: 400 });
    }
    
    console.log(`--> Extracted query: "${query.substring(0, 100)}..." for agent: ${agentId}`);

    // Extract conversation history (exclude the current message)
    const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    if (messages && Array.isArray(messages)) {
      // Process all messages except the last one (which is the current query)
      const historyMessages = messages.slice(0, -1);
      for (const msg of historyMessages) {
        const role = msg.role === 'user' ? 'user' : 'assistant';
        let content = '';
        
        // Extract content from parts array (AI SDK v3+)
        if (msg.parts && Array.isArray(msg.parts)) {
          const textPart = msg.parts.find((p: any) => p.type === 'text');
          content = textPart?.text || '';
        }
        // Fallback to content field
        if (!content && msg.content) {
          content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
        }
        
        if (content) {
          history.push({ role, content });
        }
      }
    }
    
    console.log(`--> Conversation history: ${history.length} messages`);
    console.log(`--> Proxying query to ${API_V2_URL}/knowledge-base/chat...`);

    const apiRes = await fetch(`${API_V2_URL}/knowledge-base/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agentId,
        query,
        history,
        tenantId,
        scope,
      })
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("--> API v2 Error:", apiRes.status, errText);
      return new Response(errText, { status: apiRes.status });
    }

    // Get the plain text response
    const responseText = await apiRes.text();
    console.log(`--> Received response (${responseText.length} chars)`);
    
    // Return as plain text for AI SDK compatibility
    return new Response(responseText, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      }
    });

  } catch (error) {
    console.error("--> /api/chat Proxy FAILED:", error);
    return new Response(JSON.stringify({ error: "Proxy Error", details: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
