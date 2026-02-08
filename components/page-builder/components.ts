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
  Box as BoxIcon,
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
  List as ListIcon,
  BarChart3,
  Quote,
  HelpCircle,
  Image as ImageLogoIcon,
  Megaphone,
  Mail,
  ShoppingBag,
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
import { Stats } from './components/Stats';
import { Testimonial } from './components/Testimonial';
import { Faq } from './components/Faq';
import { LogoCloud } from './components/LogoCloud';
import { CtaBanner } from './components/CtaBanner';
import { Newsletter } from './components/Newsletter';
import { ProductCard } from './components/ProductCard';
import { Stack } from './components/Stack';
import { Box } from './components/Box';
import { Flex } from './components/Flex';
import { Center } from './components/Center';
import { AspectRatio } from './components/AspectRatio';
import { SplitScreen } from './components/SplitScreen';
import { Sidebar } from './components/Sidebar';
import { Masonry } from './components/Masonry';
import { StickyHeader } from './components/StickyHeader';
import { Overlay } from './components/Overlay';
import { RichText } from './components/RichText';
import { CodeBlock } from './components/CodeBlock';
import { Blockquote } from './components/Blockquote';
import { List } from './components/List';
import { Table } from './components/Table';
import { Timeline } from './components/Timeline';
import { Accordion } from './components/Accordion';
import { Tabs } from './components/Tabs';
import { Breadcrumbs } from './components/Breadcrumbs';
import { Pagination } from './components/Pagination';
import { ProgressBar } from './components/ProgressBar';
import { Skeleton } from './components/Skeleton';
import { Tooltip } from './components/Tooltip';
import { Popover } from './components/Popover';
import { Dropdown } from './components/Dropdown';
import { ImageGallery } from './components/ImageGallery';
import { VideoPlayer } from './components/VideoPlayer';
import { AudioPlayer } from './components/AudioPlayer';
import { Carousel } from './components/Carousel';
import { MediaGrid } from './components/MediaGrid';
import { SmartPricingTable } from './components/SmartPricingTable';
import { TestimonialCarousel } from './components/TestimonialCarousel';
import { StickyCTA } from './components/StickyCTA';
import { SmartForm } from './components/SmartForm';
import { AnimatedStats } from './components/AnimatedStats';

export interface ComponentDefinitionWithComponent extends ComponentDefinition {
  Component: React.ComponentType<{ element: any; children?: React.ReactNode }>;
}

function getIcon(key: string): React.ReactNode {
  const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
    box: BoxIcon,
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
    select: ListIcon,
    'bar-chart': BarChart3,
    quote: Quote,
    'help-circle': HelpCircle,
    'logo-cloud': ImageLogoIcon,
    megaphone: Megaphone,
    mail: Mail,
    'shopping-bag': ShoppingBag,
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
  'container-narrow': {
    type: 'container-narrow',
    label: 'Container (narrow)',
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
      maxWidth: '720px',
      margin: '0 auto',
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
      color: 'var(--page-text, #fafafa)',
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
      color: 'var(--page-text, #a3a3a3)',
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
      backgroundColor: 'var(--page-primary, #6366f1)',
      color: 'var(--page-background, #fff)',
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
      color: 'var(--page-primary, #6366f1)',
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
      backgroundColor: 'var(--page-border, #262626)',
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
      backgroundColor: 'var(--page-surface, #171717)',
      border: '1px solid var(--page-border, #262626)',
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
      backgroundColor: 'var(--page-surface, #171717)',
      border: '1px solid var(--page-border, #262626)',
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
      backgroundColor: 'var(--page-surface, #171717)',
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
      backgroundColor: 'var(--page-primary, #6366f1)',
      color: 'var(--page-background, #fff)',
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
      backgroundColor: 'var(--page-surface, #171717)',
      borderBottom: '1px solid var(--page-border, #262626)',
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
      backgroundColor: 'var(--page-surface, #171717)',
      borderTop: '1px solid var(--page-border, #262626)',
      color: 'var(--page-text, #a3a3a3)',
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
      maxWidth: '100%',
    },
    Component: Section,
  },
  'section-fullbleed': {
    type: 'section-fullbleed',
    label: 'Section (full-bleed)',
    icon: getIcon('layers'),
    category: 'layout',
    defaultContent: {
      title: 'Section Title',
      subtitle: 'Section subtitle',
    },
    defaultStyle: {
      padding: '80px 0',
      width: '100%',
      maxWidth: '100%',
    },
    Component: Section,
  },
  'section-contained': {
    type: 'section-contained',
    label: 'Section (contained)',
    icon: getIcon('layers'),
    category: 'layout',
    defaultContent: {
      title: 'Section Title',
      subtitle: 'Section subtitle',
    },
    defaultStyle: {
      padding: '60px 20px',
      width: '100%',
      maxWidth: '1280px',
      margin: '0 auto',
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
      backgroundColor: 'var(--page-primary, #6366f1)',
      color: 'var(--page-background, #fff)',
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
      backgroundColor: 'var(--page-surface, #171717)',
      borderRadius: '8px',
      border: '1px solid var(--page-border, #262626)',
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
  stats: {
    type: 'stats',
    label: 'Stats Block',
    icon: getIcon('bar-chart'),
    category: 'elements',
    defaultContent: {
      items: [
        { value: '10k+', label: 'Customers' },
        { value: '99%', label: 'Uptime' },
        { value: '24/7', label: 'Support' },
      ],
    },
    defaultStyle: {
      padding: '32px 0',
      display: 'flex',
      justifyContent: 'center',
    },
    Component: Stats,
  },
  testimonial: {
    type: 'testimonial',
    label: 'Testimonial Card',
    icon: getIcon('quote'),
    category: 'elements',
    defaultContent: {
      quote: 'This product changed how we work. Highly recommend.',
      author: 'Jane Doe',
      role: 'Customer',
    },
    defaultStyle: {
      maxWidth: '640px',
    },
    Component: Testimonial,
  },
  faq: {
    type: 'faq',
    label: 'FAQ Accordion',
    icon: getIcon('help-circle'),
    category: 'elements',
    defaultContent: {
      title: 'Frequently asked questions',
      items: [
        { question: 'How do I get started?', answer: 'Sign up and follow the onboarding steps.' },
        { question: 'What payment methods do you accept?', answer: 'We accept all major cards and PayPal.' },
        { question: 'Can I cancel anytime?', answer: 'Yes, cancel from your account settings.' },
      ],
    },
    defaultStyle: {
      maxWidth: '640px',
    },
    Component: Faq,
  },
  'logo-cloud': {
    type: 'logo-cloud',
    label: 'Logo Cloud',
    icon: getIcon('logo-cloud'),
    category: 'elements',
    defaultContent: {
      title: 'Trusted by teams everywhere',
      logos: [
        { name: 'Company 1', url: 'https://placehold.co/120x40/262626/737373?text=Logo+1' },
        { name: 'Company 2', url: 'https://placehold.co/120x40/262626/737373?text=Logo+2' },
        { name: 'Company 3', url: 'https://placehold.co/120x40/262626/737373?text=Logo+3' },
        { name: 'Company 4', url: 'https://placehold.co/120x40/262626/737373?text=Logo+4' },
      ],
    },
    defaultStyle: {
      padding: '40px 0',
    },
    Component: LogoCloud,
  },
  'cta-banner': {
    type: 'cta-banner',
    label: 'CTA Banner',
    icon: getIcon('megaphone'),
    category: 'elements',
    defaultContent: {
      heading: 'Ready to get started?',
      subtext: 'Join thousands of satisfied customers today.',
      buttonText: 'Get started',
      buttonHref: '#',
    },
    defaultStyle: {},
    Component: CtaBanner,
  },
  newsletter: {
    type: 'newsletter',
    label: 'Newsletter Signup',
    icon: getIcon('mail'),
    category: 'elements',
    defaultContent: {
      title: 'Subscribe to our newsletter',
      description: 'Get the latest updates and offers.',
      placeholder: 'Enter your email',
      buttonText: 'Subscribe',
    },
    defaultStyle: {
      maxWidth: '480px',
    },
    Component: Newsletter,
  },
  'product-card': {
    type: 'product-card',
    label: 'Product Card',
    icon: getIcon('shopping-bag'),
    category: 'ecommerce',
    defaultContent: {
      title: 'Product name',
      price: '$29',
      imageSrc: 'https://placehold.co/400x300/171717/404040?text=Product',
      imageAlt: 'Product',
      buttonText: 'Add to cart',
      buttonHref: '#',
    },
    defaultStyle: {
      maxWidth: '320px',
    },
    Component: ProductCard,
  },
  // Layout Components
  stack: {
    type: 'stack',
    label: 'Stack',
    icon: getIcon('layers'),
    category: 'layout',
    defaultContent: { direction: 'column', gap: '16px' },
    defaultStyle: { display: 'flex', flexDirection: 'column', gap: '16px' },
    Component: Stack,
  },
  box: {
    type: 'box',
    label: 'Box',
    icon: getIcon('box'),
    category: 'layout',
    defaultContent: {},
    defaultStyle: { padding: '16px' },
    Component: Box,
  },
  flex: {
    type: 'flex',
    label: 'Flex',
    icon: getIcon('grid'),
    category: 'layout',
    defaultContent: { direction: 'row', gap: '16px' },
    defaultStyle: { display: 'flex', flexDirection: 'row', gap: '16px' },
    Component: Flex,
  },
  center: {
    type: 'center',
    label: 'Center',
    icon: getIcon('box'),
    category: 'layout',
    defaultContent: {},
    defaultStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    Component: Center,
  },
  'aspect-ratio': {
    type: 'aspect-ratio',
    label: 'Aspect Ratio',
    icon: getIcon('image'),
    category: 'layout',
    defaultContent: { ratio: '16/9' },
    defaultStyle: { position: 'relative', width: '100%' },
    Component: AspectRatio,
  },
  'split-screen': {
    type: 'split-screen',
    label: 'Split Screen',
    icon: getIcon('grid'),
    category: 'layout',
    defaultContent: { ratio: '50/50' },
    defaultStyle: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' },
    Component: SplitScreen,
  },
  sidebar: {
    type: 'sidebar',
    label: 'Sidebar',
    icon: getIcon('navigation'),
    category: 'layout',
    defaultContent: { position: 'left', width: '250px', showToggle: true },
    defaultStyle: { position: 'fixed', width: '250px', height: '100%' },
    Component: Sidebar,
  },
  masonry: {
    type: 'masonry',
    label: 'Masonry',
    icon: getIcon('grid'),
    category: 'layout',
    defaultContent: { columns: 3, gap: '16px' },
    defaultStyle: { display: 'grid', gap: '16px' },
    Component: Masonry,
  },
  'sticky-header': {
    type: 'sticky-header',
    label: 'Sticky Header',
    icon: getIcon('navigation'),
    category: 'layout',
    defaultContent: { threshold: 100 },
    defaultStyle: { position: 'sticky', top: 0, zIndex: 1000 },
    Component: StickyHeader,
  },
  overlay: {
    type: 'overlay',
    label: 'Overlay',
    icon: getIcon('square'),
    category: 'layout',
    defaultContent: { isOpen: true, showBackdrop: true },
    defaultStyle: { position: 'fixed', zIndex: 9999 },
    Component: Overlay,
  },
  // Content Components
  'rich-text': {
    type: 'rich-text',
    label: 'Rich Text',
    icon: getIcon('filetext'),
    category: 'elements',
    defaultContent: { html: '<p>Rich text content</p>' },
    defaultStyle: { fontSize: '16px', lineHeight: '1.6' },
    Component: RichText,
  },
  'code-block': {
    type: 'code-block',
    label: 'Code Block',
    icon: getIcon('filetext'),
    category: 'elements',
    defaultContent: { code: 'console.log("Hello");', language: 'javascript' },
    defaultStyle: { backgroundColor: '#0a0a0a', padding: '16px', borderRadius: '8px' },
    Component: CodeBlock,
  },
  blockquote: {
    type: 'blockquote',
    label: 'Blockquote',
    icon: getIcon('quote'),
    category: 'elements',
    defaultContent: { quote: 'Quote text', author: 'Author Name' },
    defaultStyle: { borderLeft: '4px solid var(--page-primary)', paddingLeft: '24px' },
    Component: Blockquote,
  },
  list: {
    type: 'list',
    label: 'List',
    icon: getIcon('list'),
    category: 'elements',
    defaultContent: { items: ['Item 1', 'Item 2', 'Item 3'], ordered: false },
    defaultStyle: { paddingLeft: '24px' },
    Component: List,
  },
  table: {
    type: 'table',
    label: 'Table',
    icon: getIcon('grid'),
    category: 'elements',
    defaultContent: { headers: ['Header 1', 'Header 2'], rows: [['Cell 1', 'Cell 2']] },
    defaultStyle: { width: '100%', borderCollapse: 'collapse' },
    Component: Table,
  },
  timeline: {
    type: 'timeline',
    label: 'Timeline',
    icon: getIcon('list'),
    category: 'elements',
    defaultContent: { items: [{ date: '2024', title: 'Event', description: 'Description' }] },
    defaultStyle: { position: 'relative', paddingLeft: '32px' },
    Component: Timeline,
  },
  accordion: {
    type: 'accordion',
    label: 'Accordion',
    icon: getIcon('help-circle'),
    category: 'elements',
    defaultContent: { items: [{ title: 'Item 1', content: 'Content' }], allowMultiple: false },
    defaultStyle: { width: '100%' },
    Component: Accordion,
  },
  tabs: {
    type: 'tabs',
    label: 'Tabs',
    icon: getIcon('filetext'),
    category: 'elements',
    defaultContent: { tabs: [{ label: 'Tab 1', content: 'Content' }] },
    defaultStyle: { width: '100%' },
    Component: Tabs,
  },
  breadcrumbs: {
    type: 'breadcrumbs',
    label: 'Breadcrumbs',
    icon: getIcon('navigation'),
    category: 'elements',
    defaultContent: { items: [{ label: 'Home', href: '/' }, { label: 'Current' }] },
    defaultStyle: { display: 'flex', gap: '8px' },
    Component: Breadcrumbs,
  },
  pagination: {
    type: 'pagination',
    label: 'Pagination',
    icon: getIcon('list'),
    category: 'elements',
    defaultContent: { currentPage: 1, totalPages: 10 },
    defaultStyle: { display: 'flex', gap: '8px' },
    Component: Pagination,
  },
  'progress-bar': {
    type: 'progress-bar',
    label: 'Progress Bar',
    icon: getIcon('bar-chart'),
    category: 'elements',
    defaultContent: { value: 50, showLabel: true },
    defaultStyle: { width: '100%', height: '8px' },
    Component: ProgressBar,
  },
  skeleton: {
    type: 'skeleton',
    label: 'Skeleton',
    icon: getIcon('square'),
    category: 'elements',
    defaultContent: { variant: 'text', width: '100%', height: '20px' },
    defaultStyle: { backgroundColor: '#171717', borderRadius: '4px' },
    Component: Skeleton,
  },
  tooltip: {
    type: 'tooltip',
    label: 'Tooltip',
    icon: getIcon('help-circle'),
    category: 'elements',
    defaultContent: { text: 'Tooltip text', position: 'top' },
    defaultStyle: {},
    Component: Tooltip,
  },
  popover: {
    type: 'popover',
    label: 'Popover',
    icon: getIcon('square'),
    category: 'elements',
    defaultContent: { content: 'Popover content' },
    defaultStyle: {},
    Component: Popover,
  },
  dropdown: {
    type: 'dropdown',
    label: 'Dropdown',
    icon: getIcon('list'),
    category: 'elements',
    defaultContent: { label: 'Menu', items: [{ label: 'Item 1', href: '#' }] },
    defaultStyle: {},
    Component: Dropdown,
  },
  // Media Components
  'image-gallery': {
    type: 'image-gallery',
    label: 'Image Gallery',
    icon: getIcon('image'),
    category: 'elements',
    defaultContent: { images: [], columns: 3 },
    defaultStyle: { display: 'grid', gap: '16px' },
    Component: ImageGallery,
  },
  'video-player': {
    type: 'video-player',
    label: 'Video Player',
    icon: getIcon('video'),
    category: 'elements',
    defaultContent: { src: '', controls: true },
    defaultStyle: { width: '100%' },
    Component: VideoPlayer,
  },
  'audio-player': {
    type: 'audio-player',
    label: 'Audio Player',
    icon: getIcon('video'),
    category: 'elements',
    defaultContent: { src: '', title: 'Audio' },
    defaultStyle: { padding: '16px' },
    Component: AudioPlayer,
  },
  carousel: {
    type: 'carousel',
    label: 'Carousel',
    icon: getIcon('image'),
    category: 'elements',
    defaultContent: { items: [], autoPlay: false, interval: 5000 },
    defaultStyle: { position: 'relative', overflow: 'hidden' },
    Component: Carousel,
  },
  'media-grid': {
    type: 'media-grid',
    label: 'Media Grid',
    icon: getIcon('grid'),
    category: 'elements',
    defaultContent: { items: [], columns: 3 },
    defaultStyle: { display: 'grid', gap: '16px' },
    Component: MediaGrid,
  },
  // Smart Sections
  'smart-pricing-table': {
    type: 'smart-pricing-table',
    label: 'Smart Pricing Table',
    icon: getIcon('credit-card'),
    category: 'ecommerce',
    defaultContent: { plans: [], defaultBilling: 'monthly' },
    defaultStyle: { display: 'grid', gap: '24px' },
    Component: SmartPricingTable,
  },
  'testimonial-carousel': {
    type: 'testimonial-carousel',
    label: 'Testimonial Carousel',
    icon: getIcon('quote'),
    category: 'elements',
    defaultContent: { source: 'static', testimonials: [], autoPlay: false },
    defaultStyle: { padding: '40px' },
    Component: TestimonialCarousel,
  },
  'sticky-cta': {
    type: 'sticky-cta',
    label: 'Sticky CTA',
    icon: getIcon('megaphone'),
    category: 'elements',
    defaultContent: { triggerScrollPercent: 30, position: 'bottom', dismissible: true },
    defaultStyle: { position: 'fixed', zIndex: 1000 },
    Component: StickyCTA,
  },
  'smart-form': {
    type: 'smart-form',
    label: 'Smart Form',
    icon: getIcon('form'),
    category: 'elements',
    defaultContent: { actionType: 'webhook', actionUrl: '', submitText: 'Submit' },
    defaultStyle: { padding: '24px' },
    Component: SmartForm,
  },
  'animated-stats': {
    type: 'animated-stats',
    label: 'Animated Stats',
    icon: getIcon('bar-chart'),
    category: 'elements',
    defaultContent: { stats: [{ value: 100, label: 'Stat' }], animationType: 'countUp' },
    defaultStyle: { display: 'grid', gap: '32px' },
    Component: AnimatedStats,
  },
};

export const componentList: ComponentDefinitionWithComponent[] = Object.values(componentsMap);

