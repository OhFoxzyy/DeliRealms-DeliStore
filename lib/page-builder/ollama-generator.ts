import type { PageElement } from './types';
import { builtinComponentPresets } from './component-presets';

const COMPONENT_TYPES = builtinComponentPresets.map((p) => p.type).join(', ');

const SYSTEM_PROMPT = `You are a page layout generator. Given a user prompt, you output a JSON array of page elements.

Available component types: ${COMPONENT_TYPES}

Each element must have: id (string, unique like "heading-1"), type (one of the available types), content (object with type-specific fields), style (object with CSS-like properties), and optionally children (for container type).

Content fields by type:
- heading: { text }
- text: { text }
- button: { text, href }
- image: { src, alt }
- link: { text, href, target }
- container: {} (use children array for nested elements)
- divider: {}
- hero: { heading, subheading, buttonText, buttonHref }
- pricing-card: { title, price, period, features (string[]), buttonText, buttonHref }
- feature-grid: { features: [{ title, description }] }
- checkout: { text, provider }
- video: { src }

Style can include: fontSize, fontWeight, color, backgroundColor, padding, margin, display, flexDirection, gap, etc.

Respond with ONLY valid JSON array, no markdown or explanation.`;

export async function generatePageElementsWithOllama(
  prompt: string,
  ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434'
): Promise<PageElement[]> {
  const response = await fetch(`${ollamaHost}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { message?: { content?: string } };
  const content = data.message?.content?.trim() || '';

  let parsed: unknown;
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('Failed to parse Ollama response as JSON');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Ollama response is not an array');
  }

  return normalizeElements(parsed as Record<string, unknown>[]);
}

function normalizeElements(raw: Record<string, unknown>[]): PageElement[] {
  const result: PageElement[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    const type = String(item?.type || 'text');
    const id = String(item?.id || `${type}-${Date.now()}-${i}`);
    const content = (item?.content as Record<string, unknown>) || {};
    const style = (item?.style as Record<string, string>) || {};
    const children = Array.isArray(item?.children)
      ? normalizeElements(item.children as Record<string, unknown>[])
      : undefined;

    result.push({
      id,
      type: type as PageElement['type'],
      content,
      style,
      ...(children?.length ? { children } : {}),
    });
  }
  return result;
}
