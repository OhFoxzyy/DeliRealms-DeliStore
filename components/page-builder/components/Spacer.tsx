import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface SpacerProps {
  element: PageElement;
}

export function Spacer({ element }: SpacerProps) {
  return (
    <div style={element.style as React.CSSProperties} />
  );
}
