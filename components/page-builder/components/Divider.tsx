import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface DividerProps {
  element: PageElement;
}

export function Divider({ element }: DividerProps) {
  return <hr style={element.style as React.CSSProperties} />;
}
