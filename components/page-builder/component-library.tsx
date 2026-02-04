"use client";

import { Type, Square, Image, Video, Link as LinkIcon, Minus, CreditCard, Sparkles, LayoutGrid, Box } from 'lucide-react';
import type { ElementType } from '@/lib/page-builder/types';

export interface ComponentDefinition {
  type: ElementType;
  label: string;
  icon: React.ReactNode;
  category: 'layout' | 'elements' | 'ecommerce';
  defaultContent: any;
  defaultStyle: any;
}

export const componentLibrary: ComponentDefinition[] = [
  {
    type: 'container',
    label: 'Container',
    icon: <Box className="h-4 w-4" />,
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
    label: 'Heading',
    icon: <Type className="h-4 w-4" />,
    category: 'elements',
    defaultContent: { text: 'Heading Text' },
    defaultStyle: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '16px',
    },
  },
  {
    type: 'text',
    label: 'Text',
    icon: <Type className="h-4 w-4" />,
    category: 'elements',
    defaultContent: { text: 'Your text here' },
    defaultStyle: {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#333333',
    },
  },
  {
    type: 'button',
    label: 'Button',
    icon: <Square className="h-4 w-4" />,
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
    label: 'Image',
    icon: <Image className="h-4 w-4" />,
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
    label: 'Video',
    icon: <Video className="h-4 w-4" />,
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
    label: 'Link',
    icon: <LinkIcon className="h-4 w-4" />,
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
    label: 'Divider',
    icon: <Minus className="h-4 w-4" />,
    category: 'layout',
    defaultContent: {},
    defaultStyle: {
      width: '100%',
      height: '1px',
      backgroundColor: '#e5e7eb',
      margin: '20px 0',
    },
  },
  {
    type: 'hero',
    label: 'Hero Section',
    icon: <Sparkles className="h-4 w-4" />,
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
      backgroundColor: '#f9fafb',
      textAlign: 'center',
    },
  },
  {
    type: 'pricing-card',
    label: 'Pricing Card',
    icon: <CreditCard className="h-4 w-4" />,
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
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      textAlign: 'center',
    },
  },
  {
    type: 'checkout',
    label: 'Checkout Button',
    icon: <CreditCard className="h-4 w-4" />,
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
    label: 'Feature Grid',
    icon: <LayoutGrid className="h-4 w-4" />,
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
