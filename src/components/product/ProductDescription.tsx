'use client';

import * as React from 'react';

interface DescriptionProps {
  html: string;
}

function stripUnsafeTags(raw: string): string {
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/ on\w+="[^"]*"/gi, '')
    .replace(/ on\w+='[^']*'/gi, '')
    .replace(/ javascript:/gi, '');
}

export function ProductDescription({ html }: DescriptionProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [isLong, setIsLong] = React.useState(false);
  const [sanitized, setSanitized] = React.useState('');
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!html || !html.trim() || html === '<p></p>') {
      React.startTransition(() => { setSanitized(''); });
      return;
    }
    import('dompurify').then((mod) => {
      const clean = mod.default.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'span'],
        ALLOWED_ATTR: ['class'],
      });
      React.startTransition(() => { setSanitized(clean); });
    });
  }, [html]);

  React.useEffect(() => {
    if (contentRef.current) {
      setIsLong(contentRef.current.scrollHeight > 130);
    }
  }, [sanitized]);

  if (!sanitized) return null;

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className="prose prose-sm max-w-none text-muted-foreground leading-relaxed
          prose-p:my-1.5 prose-li:my-0.5
          prose-ul:my-2 prose-ol:my-2
          prose-strong:text-foreground prose-strong:font-semibold
          prose-em:italic"
        style={{
          maxHeight: !expanded && isLong ? '130px' : undefined,
          overflow: !expanded && isLong ? 'hidden' : undefined,
        }}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />

      {/* Fade overlay when collapsed */}
      {!expanded && isLong && (
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      )}

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm font-medium text-[#C9A84C] hover:text-[#b89a42] transition-colors"
        >
          {expanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </div>
  );
}
