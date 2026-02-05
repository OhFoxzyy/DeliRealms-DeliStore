import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface CheckoutProps {
  element: PageElement;
}

export function Checkout({ element }: CheckoutProps) {
  return (
    <button style={element.style as React.CSSProperties}>
      {element.content.text || 'Checkout with Stripe'}
    </button>
  );
}
