import type { PageElement } from './types';

function escapeJsxText(text: string): string {
  return text.replace(/`/g, '\\`');
}

function renderElements(elements: PageElement[]): string {
  if (!Array.isArray(elements)) return '';

  return elements
    .map((el) => {
      const style = el.style || {};
      const styleEntries = Object.entries(style);
      const styleProp =
        styleEntries.length > 0
          ? `{${JSON.stringify(style)}}`
          : '{}';

      switch (el.type) {
        case 'heading': {
          const level = 1;
          const text = escapeJsxText(el.content?.text ?? '');
          return `<h${level} style=${styleProp}>${text}</h${level}>`;
        }
        case 'text': {
          const text = escapeJsxText(el.content?.text ?? '');
          return `<p style=${styleProp}>${text}</p>`;
        }
        case 'button': {
          const text = escapeJsxText(el.content?.text ?? 'Button');
          return `<button style=${styleProp}>${text}</button>`;
        }
        case 'image': {
          const src = el.content?.src ?? '';
          const alt = escapeJsxText(el.content?.alt ?? '');
          return `<img src="${src}" alt="${alt}" style=${styleProp} />`;
        }
        case 'container': {
          const children = renderElements(el.children ?? []);
          return `<div style=${styleProp}>
        ${children}
      </div>`;
        }
        default:
          return '';
      }
    })
    .join('\n');
}

export function generatePageCodeFromElements(elements: PageElement[]): string {
  const body = renderElements(elements);

  return `export default function Page() {
  return (
    <main style={{ minHeight: '100vh' }}>
      ${body}
    </main>
  );
}
`;
}

