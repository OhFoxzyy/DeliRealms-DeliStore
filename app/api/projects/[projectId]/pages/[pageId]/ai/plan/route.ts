import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const bodySchema = z.object({
  prompt: z.string().min(1),
  context: z.object({
    elements: z.array(z.any()),
    theme: z.any(),
    elementCount: z.number(),
  }),
  conversationHistory: z.array(z.any()).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string; pageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { projectId, pageId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await req.json();
    const { prompt, context, conversationHistory } = bodySchema.parse(body);

    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'llama3.2';

    // Create a detailed system prompt for planning
    const systemPrompt = `You are an expert web development AI assistant. Your job is to understand the user's request and create a detailed plan with actionable steps.

Current page context:
- ${context.elementCount} components on the page
- Theme: ${context.theme.name} (${context.theme.palette.primary})
- Existing components: ${context.elements.map((el: any) => el.type).join(', ')}

Analyze the user's request and respond with a JSON object:
{
  "plan": {
    "goal": "Clear description of what the user wants",
    "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
    "risks": ["Optional warnings or notes"]
  },
  "actions": [
    {
      "id": "unique-id",
      "type": "create_component|remove_component|modify_component|create_page|delete_page|modify_theme|modify_styles",
      "description": "What this action does",
      "status": "pending",
      "data": { component data or page data }
    }
  ]
}

Action types:
- create_component: Add new components to the page
- remove_component: Delete existing components
- modify_component: Change component properties
- create_page: Create a new page in the project
- delete_page: Delete an existing page
- modify_theme: Change theme colors
- modify_styles: Update CSS styles

Be specific with descriptions. For components, include the type and position. Always set status to "pending".

Respond with ONLY valid JSON, no markdown.`;

    const response = await fetch(`${ollamaHost}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...(conversationHistory || []).map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: prompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.message?.content?.trim() || '{}';
    
    // Extract JSON from markdown if present
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    
    const result = JSON.parse(jsonStr);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[v0] AI plan error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create plan' },
      { status: 500 }
    );
  }
}
