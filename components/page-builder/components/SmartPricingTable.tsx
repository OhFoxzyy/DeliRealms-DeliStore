import React, { useState } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface SmartPricingTableProps {
  element: PageElement;
}

export function SmartPricingTable({ element }: SmartPricingTableProps) {
  const plans = element.content.plans || [];
  const [billing, setBilling] = useState<'monthly' | 'yearly'>(element.content.defaultBilling || 'monthly');
  const highlightPlanId = element.content.highlightPlanId;
  const comparisonMode = element.content.comparisonMode || false;
  const showSavings = element.content.showSavings !== false;
  
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: comparisonMode ? `auto repeat(${plans.length}, 1fr)` : `repeat(${plans.length}, 1fr)`,
    gap: '24px',
    ...(element.style as React.CSSProperties),
  };

  return (
    <div className="smart-pricing-table-component" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', gap: '8px' }}>
        <button
          onClick={() => setBilling('monthly')}
          style={{
            padding: '8px 16px',
            backgroundColor: billing === 'monthly' ? 'var(--page-primary, #6366f1)' : 'transparent',
            border: '1px solid var(--page-border, #262626)',
            borderRadius: '6px',
            color: billing === 'monthly' ? '#fff' : 'var(--page-text, #e5e5e5)',
            cursor: 'pointer',
          }}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling('yearly')}
          style={{
            padding: '8px 16px',
            backgroundColor: billing === 'yearly' ? 'var(--page-primary, #6366f1)' : 'transparent',
            border: '1px solid var(--page-border, #262626)',
            borderRadius: '6px',
            color: billing === 'yearly' ? '#fff' : 'var(--page-text, #e5e5e5)',
            cursor: 'pointer',
          }}
        >
          Yearly
          {showSavings && <span style={{ fontSize: '12px', marginLeft: '4px' }}>(Save 20%)</span>}
        </button>
      </div>
      <div style={gridStyle}>
        {plans.map((plan: any, index: number) => {
          const isHighlighted = plan.id === highlightPlanId;
          const price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          
          return (
            <div
              key={index}
              style={{
                padding: '32px',
                backgroundColor: isHighlighted ? 'var(--page-primary, rgba(99, 102, 241, 0.1))' : 'var(--page-surface, #171717)',
                border: isHighlighted ? '2px solid var(--page-primary, #6366f1)' : '1px solid var(--page-border, #262626)',
                borderRadius: '12px',
                position: 'relative',
              }}
            >
              {isHighlighted && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '4px 12px', backgroundColor: 'var(--page-primary, #6366f1)', borderRadius: '12px', fontSize: '12px', color: '#fff' }}>
                  Most Popular
                </div>
              )}
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'var(--page-text, #fafafa)' }}>
                {plan.name}
              </h3>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '48px', fontWeight: '700', color: 'var(--page-text, #fafafa)' }}>
                  ${price}
                </span>
                <span style={{ color: 'var(--page-text, #737373)' }}>/{billing === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
                {(plan.features || []).map((feature: string, featIndex: number) => (
                  <li key={featIndex} style={{ padding: '8px 0', color: 'var(--page-text, #a3a3a3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>✓</span> {feature}
                  </li>
                ))}
              </ul>
              <button
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  backgroundColor: isHighlighted ? 'var(--page-primary, #6366f1)' : 'transparent',
                  border: `2px solid ${isHighlighted ? 'var(--page-primary, #6366f1)' : 'var(--page-border, #262626)'}`,
                  borderRadius: '8px',
                  color: isHighlighted ? '#fff' : 'var(--page-text, #e5e5e5)',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                {plan.buttonText || 'Get Started'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
