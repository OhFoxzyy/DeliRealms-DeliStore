'use client';

import React, { useState } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface SmartFormProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function SmartForm({ element, children }: SmartFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const actionType = element.content.actionType || 'webhook';
  const actionUrl = element.content.actionUrl || '';
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    try {
      let response;
      
      switch (actionType) {
        case 'webhook':
          response = await fetch(actionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          break;
        case 'email':
          response = await fetch('/api/forms/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'email', url: actionUrl, data }),
          });
          break;
        case 'zapier':
        case 'discord':
        case 'api':
          response = await fetch(actionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          break;
        default:
          throw new Error('Invalid action type');
      }
      
      if (response.ok) {
        setSubmitStatus('success');
        e.currentTarget.reset();
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '24px',
        backgroundColor: 'var(--page-surface, #171717)',
        borderRadius: '12px',
        border: '1px solid var(--page-border, #262626)',
        ...(element.style as React.CSSProperties),
      }}
      className="smart-form-component"
      aria-label={element.content.ariaLabel || 'Form'}
    >
      {children}
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '12px 24px',
          backgroundColor: 'var(--page-primary, #6366f1)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          opacity: isSubmitting ? 0.6 : 1,
          marginTop: '16px',
        }}
      >
        {isSubmitting ? 'Submitting...' : (element.content.submitText || 'Submit')}
      </button>
      {submitStatus === 'success' && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', color: '#10b981' }}>
          {element.content.successMessage || 'Form submitted successfully!'}
        </div>
      )}
      {submitStatus === 'error' && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', color: '#ef4444' }}>
          {element.content.errorMessage || 'Failed to submit form. Please try again.'}
        </div>
      )}
    </form>
  );
}
