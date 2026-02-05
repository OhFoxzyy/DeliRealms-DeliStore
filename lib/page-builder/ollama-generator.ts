import type { PageElement } from './types';
import { componentsMap } from '@/components/page-builder/components';

const COMPONENT_TYPES = Object.keys(componentsMap).join(', ');

const SYSTEM_PROMPT = `You are a page layout generator. Given a user prompt, you output a JSON array of page elements.

Available component types: ${COMPONENT_TYPES}

Each element must have: id (string, unique like "heading-1"), type (one of the available types), content (object with type-specific fields), style (object with CSS-like properties), and optionally children (for container type).

Content fields by type:
- heading: { text, level? (1-6) }
- text: { text }
- button: { text, href }
- image: { src, alt }
- link: { text, href, target }
- container: {} (use children array for nested elements)
- divider: {}
- spacer: {}
- card: { title?, description? }
- hero: { heading, subheading, buttonText, buttonHref }
- pricing-card: { title, price, period, features (string[]), buttonText, buttonHref }
- feature-grid: { features: [{ title, description }] }
- checkout: { text, provider }
- video: { src }
- navbar: { logo, links: [{ text, href }] }
- footer: { copyright?, columns?: [{ title, links: [{ text, href }] }] }
- section: { title?, subtitle? }
- grid: {} (use children array)
- column: {} (use children array)
- badge: { text }
- alert: { variant (info|success|warning|error), title?, message }
- form: { action?, method?, submitText? }
- input: { type?, label?, placeholder?, name?, required? }
- textarea: { label?, placeholder?, name?, rows?, required? }
- select: { label?, placeholder?, name?, options: [{ value, label }], required? }

Style can include: fontSize, fontWeight, color, backgroundColor, padding, margin, display, flexDirection, gap, width, height, borderRadius, border, etc.

Respond with ONLY valid JSON array, no markdown or explanation.`;

export async function generatePageElementsWithOllama(
  prompt: string,
  ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434'
): Promise<PageElement[]> {
  const model = process.env.OLLAMA_MODEL || 'llama3.2';
  const response = await fetch(`${ollamaHost}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
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
  const validTypes = Object.keys(componentsMap);
  
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    let type = String(item?.type || 'text').toLowerCase();
    
    // Validate and normalize type
    if (!validTypes.includes(type)) {
      // Try to map common variations
      if (type === 'h1' || type === 'h2' || type === 'h3' || type === 'h4' || type === 'h5' || type === 'h6') {
        type = 'heading';
      } else if (type === 'p' || type === 'paragraph') {
        type = 'text';
      } else if (type === 'a' || type === 'anchor') {
        type = 'link';
      } else if (type === 'img') {
        type = 'image';
      } else if (type === 'hr' || type === 'horizontal-rule') {
        type = 'divider';
      } else {
        // Default to text if unknown
        type = 'text';
      }
    }
    
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
