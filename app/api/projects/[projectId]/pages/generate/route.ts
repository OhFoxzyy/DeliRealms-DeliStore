import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { generatePageElementsWithOllama } from '@/lib/page-builder/ollama-generator';
import { z } from 'zod';

const prisma = new PrismaClient();

const bodySchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  context: z.object({
    elements: z.array(z.any()).optional(),
    theme: z.any().optional(),
    elementCount: z.number().optional(),
  }).optional(),
  conversationHistory: z.array(z.any()).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { projectId } = await params;

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

    // Detect intent from the prompt
    const lowerPrompt = prompt.toLowerCase();
    
    // Theme generation detection
    if (lowerPrompt.includes('theme') || lowerPrompt.includes('color scheme') || lowerPrompt.includes('design system')) {
      const theme = await generateThemeWithOllama(prompt, context);
      return NextResponse.json({ 
        theme, 
        message: `I've created a new "${theme.name}" theme with custom colors and gradients.` 
      });
    }
    
    // Check if user needs clarification
    if (lowerPrompt.length < 15 || lowerPrompt.split(' ').length < 3) {
      return NextResponse.json({
        question: "Could you provide more details? For example:\n- What type of section do you want? (hero, features, pricing)\n- What style? (modern, minimal, bold)\n- Any specific colors or content?"
      });
    }

    // Check if user wants a custom component
    if (lowerPrompt.includes('custom') && (lowerPrompt.includes('component') || lowerPrompt.includes('card') || lowerPrompt.includes('section'))) {
      const customComponent = await generateCustomComponentWithOllama(prompt, context);
      return NextResponse.json({
        customComponent,
        message: `I've created a custom ${customComponent.type} component for you!`
      });
    }

    // Standard component generation
    const elements = await generatePageElementsWithOllama(prompt, context, conversationHistory);

    return NextResponse.json({ 
      elements,
      message: `I've added ${elements.length} component(s) to your page.`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Ollama generate error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate page',
      },
      { status: 500 }
    );
  }
}

async function generateThemeWithOllama(prompt: string, context: any) {
  const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'llama3.2';
  
  const systemPrompt = `You are a design system generator. Create a color theme based on the user's description.
  
Output a JSON object with this structure:
{
  "id": "unique-id",
  "name": "Theme Name",
  "palette": {
    "primary": "#hexcolor",
    "secondary": "#hexcolor",
    "accent": "#hexcolor",
    "background": "#hexcolor",
    "surface": "#hexcolor",
    "text": "#hexcolor"
  },
  "gradients": [
    {
      "id": "gradient-id",
      "label": "Gradient Name",
      "value": "linear-gradient(135deg, #color1, #color2)"
    }
  ]
}

Respond with ONLY valid JSON, no markdown.`;

  const response = await fetch(`${ollamaHost}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
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
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : content;
  
  return JSON.parse(jsonStr);
}

async function generateCustomComponentWithOllama(prompt: string, context: any) {
  const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'llama3.2';
  
  const systemPrompt = `You are a custom component generator. Create a unique component based on the user's description.

Output a JSON object representing a component with nested structure:
{
  "type": "container",
  "content": {},
  "style": { CSS properties },
  "children": [ nested components ]
}

Be creative with the layout and styling. Use multiple nested children for complex components.

Respond with ONLY valid JSON, no markdown.`;

  const response = await fetch(`${ollamaHost}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${prompt}\n\nContext: ${JSON.stringify(context || {})}` },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.message?.content?.trim() || '{}';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : content;
  
  return JSON.parse(jsonStr);
}
