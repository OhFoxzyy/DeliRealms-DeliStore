import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface FooterProps {
  element: PageElement;
}

export function Footer({ element }: FooterProps) {
  const links = element.content.links || [];
  const columns = element.content.columns || [];
  const socialLinks = element.content.socialLinks || [];
  
  const baseStyle: React.CSSProperties = {
    padding: 'clamp(40px, 6vw, 64px) clamp(20px, 4vw, 40px)',
    backgroundColor: 'var(--page-surface, #171717)',
    borderTop: '1px solid var(--page-border, #262626)',
    color: 'var(--page-text, #a3a3a3)',
    ...(element.style as React.CSSProperties),
  };

  return (
    <footer
      style={baseStyle}
      className="footer-component"
      role="contentinfo"
    >
      <style>{`
        .footer-component .footer-grid {
          display: grid;
          grid-template-columns: repeat(${columns.length || 4}, 1fr);
          gap: clamp(24px, 4vw, 48px);
        }
        @media (max-width: 1024px) {
          .footer-component .footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .footer-component .footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
      `}</style>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {columns.length > 0 ? (
          <>
            <div className="footer-grid">
              {columns.map((column: any, index: number) => (
                <div key={index}>
                  {column.title && (
                    <h4
                      style={{
                        fontSize: 'clamp(16px, 2vw, 18px)',
                        fontWeight: '600',
                        marginBottom: 'clamp(16px, 2vw, 20px)',
                        color: 'var(--page-text, #fafafa)',
                      }}
                    >
                      {column.title}
                    </h4>
                  )}
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {(column.links || []).map((link: any, linkIndex: number) => (
                      <li key={linkIndex}>
                        <a
                          href={link.href || '#'}
                          style={{
                            color: 'var(--page-text, #a3a3a3)',
                            textDecoration: 'none',
                            fontSize: 'clamp(14px, 1.5vw, 16px)',
                            transition: 'color 0.2s ease',
                            display: 'inline-block',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--page-primary, #6366f1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--page-text, #a3a3a3)';
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.outline = '2px solid var(--page-primary, #6366f1)';
                            e.currentTarget.style.outlineOffset = '2px';
                            e.currentTarget.style.color = 'var(--page-primary, #6366f1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.outline = 'none';
                            e.currentTarget.style.color = 'var(--page-text, #a3a3a3)';
                          }}
                        >
                          {link.text || `Link ${linkIndex + 1}`}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            {(socialLinks.length > 0 || element.content.copyright) && (
              <div
                style={{
                  marginTop: 'clamp(32px, 5vw, 48px)',
                  paddingTop: 'clamp(24px, 4vw, 32px)',
                  borderTop: '1px solid var(--page-border, #262626)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                {socialLinks.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center',
                    }}
                    role="list"
                    aria-label="Social links"
                  >
                    {socialLinks.map((social: any, index: number) => (
                      <a
                        key={index}
                        href={social.href || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: 'var(--page-text, #a3a3a3)',
                          fontSize: '20px',
                          transition: 'color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--page-primary, #6366f1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--page-text, #a3a3a3)';
                        }}
                        aria-label={social.platform || `Social link ${index + 1}`}
                      >
                        {social.icon || '🔗'}
                      </a>
                    ))}
                  </div>
                )}
                {element.content.copyright && (
                  <p
                    style={{
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      color: 'var(--page-text, #737373)',
                      margin: 0,
                    }}
                  >
                    {element.content.copyright || `© ${new Date().getFullYear()} Your Company`}
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--page-text, #737373)',
              fontSize: 'clamp(14px, 1.5vw, 16px)',
            }}
          >
            {element.content.copyright || `© ${new Date().getFullYear()} Your Company`}
          </div>
        )}
      </div>
    </footer>
  );
}
