import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface PaginationProps {
  element: PageElement;
}

export function Pagination({ element }: PaginationProps) {
  const currentPage = element.content.currentPage || 1;
  const totalPages = element.content.totalPages || 10;
  const onPageChange = element.content.onPageChange;
  
  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
    ...(element.style as React.CSSProperties),
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 12px',
    backgroundColor: 'var(--page-surface, #171717)',
    border: '1px solid var(--page-border, #262626)',
    borderRadius: '6px',
    color: 'var(--page-text, #e5e5e5)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'var(--page-primary, #6366f1)',
    borderColor: 'var(--page-primary, #6366f1)',
    color: '#ffffff',
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.slice(
    Math.max(0, currentPage - 2),
    Math.min(totalPages, currentPage + 3)
  );

  return (
    <nav
      style={baseStyle}
      className="pagination-component"
      role="navigation"
      aria-label="Pagination"
    >
      <button
        style={buttonStyle}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        «
      </button>
      {visiblePages.map((page) => (
        <button
          key={page}
          style={page === currentPage ? activeButtonStyle : buttonStyle}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      <button
        style={buttonStyle}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        »
      </button>
    </nav>
  );
}
