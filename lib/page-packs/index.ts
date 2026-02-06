import type { PageElement } from '@/lib/page-builder/types';

export interface PagePack {
  id: string;
  name: string;
  description: string;
  elements: PageElement[];
}

function regenerateIds(el: PageElement, prefix: string): PageElement {
  const newId = `${el.type}-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    ...el,
    id: newId,
    children: el.children?.map((c) => regenerateIds(c, prefix)),
  };
}

export function clonePackElements(elements: PageElement[]): PageElement[] {
  const prefix = String(Date.now());
  return elements.map((el, i) => regenerateIds(el, `${prefix}-${i}`));
}

const productListingPack: PagePack = {
  id: 'product-listing',
  name: 'Product listing',
  description: 'Hero, features grid, and CTA for a product or store.',
  elements: [
    {
      id: 'hero-1',
      type: 'hero',
      content: {
        heading: 'Your product name',
        subheading: 'A short tagline that describes your product.',
        buttonText: 'Get started',
        buttonHref: '#',
      },
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        backgroundColor: 'var(--page-surface)',
        textAlign: 'center',
      },
    },
    {
      id: 'fg-1',
      type: 'feature-grid',
      content: {
        features: [
          { title: 'Feature one', description: 'Brief description of the first feature.' },
          { title: 'Feature two', description: 'Brief description of the second feature.' },
          { title: 'Feature three', description: 'Brief description of the third feature.' },
        ],
      },
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        padding: '40px 20px',
      },
    },
    {
      id: 'cta-1',
      type: 'section',
      content: { title: 'Ready to start?', subtitle: 'Join today.' },
      style: { padding: '60px 20px', width: '100%', textAlign: 'center' },
      children: [],
    },
  ],
};

const landingPack: PagePack = {
  id: 'landing',
  name: 'Landing page',
  description: 'Navbar, hero, features, pricing, and footer.',
  elements: [
    {
      id: 'nav-1',
      type: 'navbar',
      content: {
        logo: 'Logo',
        links: [
          { text: 'Features', href: '#features' },
          { text: 'Pricing', href: '#pricing' },
          { text: 'Contact', href: '#contact' },
        ],
      },
      style: {
        padding: '16px 24px',
        backgroundColor: 'var(--page-surface)',
        borderBottom: '1px solid var(--page-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
    },
    {
      id: 'hero-lp',
      type: 'hero',
      content: {
        heading: 'Build something great',
        subheading: 'The best way to get started.',
        buttonText: 'Start free trial',
        buttonHref: '#',
      },
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        textAlign: 'center',
      },
    },
    {
      id: 'fg-lp',
      type: 'feature-grid',
      content: {
        features: [
          { title: 'Fast', description: 'Built for speed.' },
          { title: 'Simple', description: 'Easy to use.' },
          { title: 'Reliable', description: 'Always available.' },
        ],
      },
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        padding: '60px 20px',
      },
    },
    {
      id: 'footer-lp',
      type: 'footer',
      content: { copyright: `© ${new Date().getFullYear()} Your Company`, columns: [] },
      style: {
        padding: '48px 24px',
        backgroundColor: 'var(--page-surface)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        color: 'var(--page-text)',
      },
    },
  ],
};

const checkoutFlowPack: PagePack = {
  id: 'checkout-flow',
  name: 'Checkout flow',
  description: 'Product section and checkout button for a simple store.',
  elements: [
    {
      id: 'sec-checkout',
      type: 'section',
      content: { title: 'Complete your purchase', subtitle: 'Secure checkout.' },
      style: { padding: '60px 20px', width: '100%', maxWidth: '640px', margin: '0 auto' },
      children: [
        {
          id: 'checkout-btn',
          type: 'checkout',
          content: { text: 'Checkout with Stripe', provider: 'stripe' },
          style: {
            padding: '12px 32px',
            backgroundColor: 'var(--page-primary)',
            color: 'var(--page-background)',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            border: 'none',
          },
        },
      ],
    },
  ],
};

const docsPack: PagePack = {
  id: 'docs-style',
  name: 'Docs-style layout',
  description: 'Section with title and content area for documentation.',
  elements: [
    {
      id: 'doc-sec',
      type: 'section-contained',
      content: {
        title: 'Documentation',
        subtitle: 'Learn how to get started.',
      },
      style: {
        padding: '60px 20px',
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
      },
      children: [
        {
          id: 'doc-text',
          type: 'text',
          content: {
            text: 'Add your documentation content here. You can edit this text in the builder.',
          },
          style: { fontSize: '16px', lineHeight: '1.7' },
        },
      ],
    },
  ],
};

const minimalPack: PagePack = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Simple hero and one section.',
  elements: [
    {
      id: 'min-hero',
      type: 'hero',
      content: {
        heading: 'Welcome',
        subheading: 'Edit this in the page builder.',
        buttonText: 'Learn more',
        buttonHref: '#',
      },
      style: {
        padding: '120px 20px',
        textAlign: 'center',
      },
    },
  ],
};

export const pagePacks: PagePack[] = [
  landingPack,
  productListingPack,
  checkoutFlowPack,
  docsPack,
  minimalPack,
];

export function listPagePacks(): PagePack[] {
  return pagePacks;
}
