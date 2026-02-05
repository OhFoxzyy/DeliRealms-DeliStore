import React from 'react';
import { 
  Type, 
  Square, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Link as LinkIcon, 
  Minus, 
  CreditCard, 
  Sparkles, 
  LayoutGrid, 
  Box,
  Navigation,
  FileText,
  Layers,
  Grid3x3,
  Columns,
  Badge as BadgeIcon,
  AlertCircle,
  FileEdit,
  FileText as InputIcon,
  FileText as TextareaIcon,
  List,
} from 'lucide-react';
import type { ElementType } from '@/lib/page-builder/types';
import type { ComponentDefinition } from './component-library';

// Import all component files
import { Container } from './components/Container';
import { Heading } from './components/Heading';
import { Text } from './components/Text';
import { Button } from './components/Button';
import { Image } from './components/Image';
import { Video } from './components/Video';
import { Link } from './components/Link';
import { Spacer } from './components/Spacer';
import { Divider } from './components/Divider';
import { Card } from './components/Card';
import { PricingCard } from './components/PricingCard';
import { Hero } from './components/Hero';
import { FeatureGrid } from './components/FeatureGrid';
import { Checkout } from './components/Checkout';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Section } from './components/Section';
import { Grid } from './components/Grid';
import { Column } from './components/Column';
import { Badge } from './components/Badge';
import { Alert } from './components/Alert';
import { Form } from './components/Form';
import { Input } from './components/Input';
import { Textarea } from './components/Textarea';
import { Select } from './components/Select';

export interface ComponentDefinitionWithComponent extends ComponentDefinition {
  Component: React.ComponentType<{ element: any; children?: React.ReactNode }>;
}

function getIcon(key: string): React.ReactNode {
  const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
    box: Box,
    type: Type,
    square: Square,
    image: ImageIcon,
    video: VideoIcon,
    link: LinkIcon,
    minus: Minus,
    'credit-card': CreditCard,
    sparkles: Sparkles,
    'layout-grid': LayoutGrid,
    navigation: Navigation,
    filetext: FileText,
    layers: Layers,
    grid: Grid3x3,
    columns: Columns,
    badge: BadgeIcon,
    alert: AlertCircle,
    form: FileEdit,
    input: InputIcon,
    textarea: TextareaIcon,
    select: List,
  };

  const IconComponent = iconComponents[key];
  if (!IconComponent) return React.createElement(Square, { className: 'h-4 w-4' });
  
  return React.createElement(IconComponent, { className: 'h-4 w-4' });
}

export const componentsMap: Record<ElementType, ComponentDefinitionWithComponent> = {
  container: {
    type: 'container',
    label: 'Container',
    icon: getIcon('box'),
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
    Component: Container,
  },
  heading: {
    type: 'heading',
    label: 'Heading',
    icon: getIcon('type'),
    category: 'elements',
    defaultContent: { text: 'Heading Text', level: 1 },
    defaultStyle: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#e5e5e5',
      marginBottom: '16px',
    },
    Component: Heading,
  },
  text: {
    type: 'text',
    label: 'Text',
    icon: getIcon('type'),
    category: 'elements',
    defaultContent: { text: 'Your text here' },
    defaultStyle: {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#a3a3a3',
    },
    Component: Text,
  },
  button: {
    type: 'button',
    label: 'Button',
    icon: getIcon('square'),
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
    Component: Button,
  },
  image: {
    type: 'image',
    label: 'Image',
    icon: getIcon('image'),
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
    Component: Image,
  },
  video: {
    type: 'video',
    label: 'Video',
    icon: getIcon('video'),
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
    Component: Video,
  },
  link: {
    type: 'link',
    label: 'Link',
    icon: getIcon('link'),
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
    Component: Link,
  },
  spacer: {
    type: 'spacer',
    label: 'Spacer',
    icon: getIcon('minus'),
    category: 'layout',
    defaultContent: {},
    defaultStyle: {
      height: '40px',
      width: '100%',
    },
    Component: Spacer,
  },
  divider: {
    type: 'divider',
    label: 'Divider',
    icon: getIcon('minus'),
    category: 'layout',
    defaultContent: {},
    defaultStyle: {
      width: '100%',
      height: '1px',
      backgroundColor: '#404040',
      margin: '20px 0',
    },
    Component: Divider,
  },
  card: {
    type: 'card',
    label: 'Card',
    icon: getIcon('square'),
    category: 'elements',
    defaultContent: {
      title: 'Card Title',
      description: 'Card description',
    },
    defaultStyle: {
      padding: '24px',
      backgroundColor: '#1a1a1a',
      border: '1px solid #404040',
      borderRadius: '8px',
    },
    Component: Card,
  },
  'pricing-card': {
    type: 'pricing-card',
    label: 'Pricing Card',
    icon: getIcon('credit-card'),
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
    Component: PricingCard,
  },
  hero: {
    type: 'hero',
    label: 'Hero Section',
    icon: getIcon('sparkles'),
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
    Component: Hero,
  },
  'feature-grid': {
    type: 'feature-grid',
    label: 'Feature Grid',
    icon: getIcon('layout-grid'),
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
    Component: FeatureGrid,
  },
  checkout: {
    type: 'checkout',
    label: 'Checkout Button',
    icon: getIcon('credit-card'),
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
    Component: Checkout,
  },
  navbar: {
    type: 'navbar',
    label: 'Navbar',
    icon: getIcon('navigation'),
    category: 'layout',
    defaultContent: {
      logo: 'Logo',
      links: [
        { text: 'Home', href: '#' },
        { text: 'About', href: '#' },
        { text: 'Contact', href: '#' },
      ],
    },
    defaultStyle: {
      padding: '16px 24px',
      backgroundColor: '#1a1a1a',
      borderBottom: '1px solid #404040',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    Component: Navbar,
  },
  footer: {
    type: 'footer',
    label: 'Footer',
    icon: getIcon('filetext'),
    category: 'layout',
    defaultContent: {
      copyright: `© ${new Date().getFullYear()} Your Company`,
      columns: [],
    },
    defaultStyle: {
      padding: '48px 24px',
      backgroundColor: '#1a1a1a',
      borderTop: '1px solid #404040',
      color: 'var(--muted-foreground)',
    },
    Component: Footer,
  },
  section: {
    type: 'section',
    label: 'Section',
    icon: getIcon('layers'),
    category: 'layout',
    defaultContent: {
      title: 'Section Title',
      subtitle: 'Section subtitle',
    },
    defaultStyle: {
      padding: '60px 20px',
      width: '100%',
    },
    Component: Section,
  },
  grid: {
    type: 'grid',
    label: 'Grid',
    icon: getIcon('grid'),
    category: 'layout',
    defaultContent: {},
    defaultStyle: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
      padding: '20px',
    },
    Component: Grid,
  },
  column: {
    type: 'column',
    label: 'Column',
    icon: getIcon('columns'),
    category: 'layout',
    defaultContent: {},
    defaultStyle: {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    Component: Column,
  },
  badge: {
    type: 'badge',
    label: 'Badge',
    icon: getIcon('badge'),
    category: 'elements',
    defaultContent: {
      text: 'Badge',
    },
    defaultStyle: {
      padding: '4px 12px',
      backgroundColor: '#404040',
      color: '#ffffff',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'inline-block',
    },
    Component: Badge,
  },
  alert: {
    type: 'alert',
    label: 'Alert',
    icon: getIcon('alert'),
    category: 'elements',
    defaultContent: {
      variant: 'info',
      title: 'Alert Title',
      message: 'Alert message',
    },
    defaultStyle: {
      padding: '12px 16px',
      borderRadius: '6px',
    },
    Component: Alert,
  },
  form: {
    type: 'form',
    label: 'Form',
    icon: getIcon('form'),
    category: 'elements',
    defaultContent: {
      action: '#',
      method: 'POST',
      submitText: 'Submit',
    },
    defaultStyle: {
      padding: '24px',
      backgroundColor: '#1a1a1a',
      borderRadius: '8px',
      border: '1px solid #404040',
    },
    Component: Form,
  },
  input: {
    type: 'input',
    label: 'Input',
    icon: getIcon('input'),
    category: 'elements',
    defaultContent: {
      type: 'text',
      label: 'Input Label',
      placeholder: 'Enter text...',
      name: 'input',
      required: false,
    },
    defaultStyle: {},
    Component: Input,
  },
  textarea: {
    type: 'textarea',
    label: 'Textarea',
    icon: getIcon('textarea'),
    category: 'elements',
    defaultContent: {
      label: 'Textarea Label',
      placeholder: 'Enter text...',
      name: 'textarea',
      rows: 4,
      required: false,
    },
    defaultStyle: {},
    Component: Textarea,
  },
  select: {
    type: 'select',
    label: 'Select',
    icon: getIcon('select'),
    category: 'elements',
    defaultContent: {
      label: 'Select Label',
      placeholder: 'Choose an option...',
      name: 'select',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
      required: false,
    },
    defaultStyle: {},
    Component: Select,
  },
};

export const componentList: ComponentDefinitionWithComponent[] = Object.values(componentsMap);

