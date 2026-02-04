export type ComponentCategory = 'layout' | 'elements' | 'ecommerce';

export interface ComponentPreset {
  type: string;
  name: string;
  label: string;
  category: ComponentCategory;
  icon: string | null;
  defaultContent: any;
  defaultStyle: any;
}

/**
 * Built‑in component presets that can be seeded into the database
 * and also used as a fallback in the page builder.
 *
 * These intentionally avoid React/JSX so they can be shared
 * between server (API) and client code.
 */
export const builtinComponentPresets: ComponentPreset[] = [
  {
    type: 'container',
    name: 'Container',
    label: 'Container',
    icon: 'box',
    category: 'layout',
    defaultContent: {},
    defaultStyle: {
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      gap: '10px',
      backgroundColor: 'transparent',
      borderRadius: '8px',
    },
  },
  {
    type: 'heading',
    name: 'Heading',
    label: 'Heading',
    icon: 'type',
    category: 'elements',
    defaultContent: { text: 'Heading Text' },
    defaultStyle: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#e5e5e5',
      marginBottom: '16px',
    },
  },
  {
    type: 'text',
    name: 'Text',
    label: 'Text',
    icon: 'type',
    category: 'elements',
    defaultContent: { text: 'Your text here' },
    defaultStyle: {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#a3a3a3',
    },
  },
  {
    type: 'button',
    name: 'Button',
    label: 'Button',
    icon: 'square',
    category: 'elements',
    defaultContent: { text: 'Click me', href: '#' },
    defaultStyle: {
      padding: '12px 24px',
      backgroundColor: '#000000',
      color: '#ffffff',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      textAlign: 'center',
    },
  },
  {
    type: 'image',
    name: 'Image',
    label: 'Image',
    icon: 'image',
    category: 'elements',
    defaultContent: {
      src: 'https://placehold.co/600x400',
      alt: 'Placeholder image',
    },
    defaultStyle: {
      width: '100%',
      height: 'auto',
      borderRadius: '8px',
    },
  },
  {
    type: 'video',
    name: 'Video',
    label: 'Video',
    icon: 'video',
    category: 'elements',
    defaultContent: {
      src: '',
      placeholder: 'Video URL',
    },
    defaultStyle: {
      width: '100%',
      height: 'auto',
      borderRadius: '8px',
    },
  },
  {
    type: 'link',
    name: 'Link',
    label: 'Link',
    icon: 'link',
    category: 'elements',
    defaultContent: {
      text: 'Click here',
      href: '#',
      target: '_self',
    },
    defaultStyle: {
      color: '#0070f3',
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  },
  {
    type: 'divider',
    name: 'Divider',
    label: 'Divider',
    icon: 'minus',
    category: 'layout',
    defaultContent: {},
    defaultStyle: {
      width: '100%',
      height: '1px',
      backgroundColor: '#404040',
      margin: '20px 0',
    },
  },
  {
    type: 'hero',
    name: 'Hero Section',
    label: 'Hero Section',
    icon: 'sparkles',
    category: 'layout',
    defaultContent: {
      heading: 'Welcome to our store',
      subheading: 'Discover amazing products',
      buttonText: 'Shop Now',
      buttonHref: '#',
    },
    defaultStyle: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px',
      backgroundColor: '#1a1a1a',
      textAlign: 'center',
    },
  },
  {
    type: 'pricing-card',
    name: 'Pricing Card',
    label: 'Pricing Card',
    icon: 'credit-card',
    category: 'ecommerce',
    defaultContent: {
      title: 'Pro Plan',
      price: '$29',
      period: '/month',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      buttonText: 'Get Started',
      buttonHref: '#',
    },
    defaultStyle: {
      padding: '32px',
      backgroundColor: '#1a1a1a',
      border: '1px solid #404040',
      borderRadius: '12px',
      textAlign: 'center',
    },
  },
  {
    type: 'checkout',
    name: 'Checkout Button',
    label: 'Checkout Button',
    icon: 'credit-card',
    category: 'ecommerce',
    defaultContent: {
      text: 'Checkout with Stripe',
      provider: 'stripe',
    },
    defaultStyle: {
      padding: '12px 32px',
      backgroundColor: '#6366f1',
      color: '#ffffff',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
    },
  },
  {
    type: 'feature-grid',
    name: 'Feature Grid',
    label: 'Feature Grid',
    icon: 'layout-grid',
    category: 'layout',
    defaultContent: {
      features: [
        { title: 'Feature 1', description: 'Description 1' },
        { title: 'Feature 2', description: 'Description 2' },
        { title: 'Feature 3', description: 'Description 3' },
      ],
    },
    defaultStyle: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      padding: '40px 0',
    },
  },
];

