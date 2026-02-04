import type { PageElement } from '@/lib/page-builder/types';

export function createBasicTemplate(): { elements: PageElement[] } {
  const heroId = `hero-${Date.now()}`;
  const headingId = `heading-${Date.now() + 1}`;
  const textId = `text-${Date.now() + 2}`;

  const elements: PageElement[] = [
    {
      id: heroId,
      type: 'container',
      content: {},
      style: {
        padding: '80px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      },
      children: [
        {
          id: headingId,
          type: 'heading',
          content: {
            text: 'Welcome to your new page',
          },
          style: {
            fontSize: '40px',
            fontWeight: '700',
            marginBottom: '16px',
          },
        },
        {
          id: textId,
          type: 'text',
          content: {
            text: 'Start editing this content in the builder to make it your own.',
          },
          style: {
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#4b5563',
            maxWidth: '640px',
          },
        },
      ],
    },
  ];

  return { elements };
}

