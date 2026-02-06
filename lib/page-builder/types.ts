export type ElementType = 
  | 'container'
  | 'container-narrow'
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
  | 'section-fullbleed'
  | 'section-contained'
  | 'grid'
  | 'column'
  | 'badge'
  | 'alert'
  | 'form'
  | 'input'
  | 'textarea'
  | 'select'
  | 'stats'
  | 'testimonial'
  | 'faq'
  | 'logo-cloud'
  | 'cta-banner'
  | 'newsletter'
  | 'product-card';

/**
 * Simple theme model for the page builder.
 * This is intentionally generic and stored under PageData.globalStyles
 * for backwards compatibility with existing saved pages.
 */
export interface PageThemePalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

export interface PageThemeGradient {
  id: string;
  label: string;
  value: string; // e.g. "linear-gradient(135deg, #6366f1, #ec4899)"
}

export interface PageTheme {
  id: string;
  name: string;
  palette: PageThemePalette;
  gradients?: PageThemeGradient[];
}

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
  /**
   * Optional gradient background expressed as a CSS linear-gradient string.
   * When set, this should visually override backgroundColor.
   */
  backgroundGradient?: string;
  borderColor?: string;
  
  // Border
  border?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderRadius?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  
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
  /**
   * globalStyles.theme is used by the visual page builder
   * while keeping the old shape compatible with existing content.
   */
  globalStyles?: {
    theme?: PageTheme;
    // Allow other keys without breaking older data.
    [key: string]: any;
  };
}
