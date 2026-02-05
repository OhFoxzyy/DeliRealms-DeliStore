export type ElementType = 
  | 'container'
  | 'heading'
  | 'text'
  | 'button'
  | 'image'
  | 'video'
  | 'link'
  | 'spacer'
  | 'divider'
  | 'card'
  | 'pricing-card'
  | 'hero'
  | 'feature-grid'
  | 'checkout'
  | 'navbar'
  | 'footer'
  | 'section'
  | 'grid'
  | 'column'
  | 'badge'
  | 'alert'
  | 'form'
  | 'input'
  | 'textarea'
  | 'select';

export interface ElementStyle {
  // Layout
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  minWidth?: string;
  minHeight?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  
  // Flexbox
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  flexWrap?: string;
  
  // Grid
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridGap?: string;
  
  // Typography
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: string;
  textDecoration?: string;
  textTransform?: string;
  
  // Colors
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  
  // Border
  border?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderRadius?: string;
  
  // Effects
  opacity?: string;
  boxShadow?: string;
  
  // Position
  position?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: string;
  
  // Other
  overflow?: string;
  cursor?: string;
  transition?: string;
  visibility?: string;
}

export interface ElementContent {
  text?: string;
  html?: string;
  src?: string;
  alt?: string;
  href?: string;
  target?: string;
  placeholder?: string;
  [key: string]: any;
}

export interface PageElement {
  id: string;
  type: ElementType;
  content: ElementContent;
  style: ElementStyle;
  className?: string;
  children?: PageElement[];
}

export interface PageData {
  elements: PageElement[];
  globalStyles?: Record<string, any>;
}
