import React from 'react';

/**
 * Renders text containing inline code (`code`) or multiline codeblocks (```code```)
 * cleanly with proper monospace formatting and syntax styling.
 */
export function FormattedText({ text, className = '' }) {
  if (!text) return null;

  // Split text by markdown code blocks: ```lang ... ```
  const codeBlockRegex = /```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }

    // Code block
    parts.push({
      type: 'codeblock',
      content: match[1].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  // Trailing text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }

  // Helper to render inline code `...`
  const renderInlineCode = (str, keyPrefix) => {
    const inlineRegex = /`([^`]+)`/g;
    const inlineParts = [];
    let inlineLastIndex = 0;
    let inlineMatch;

    while ((inlineMatch = inlineRegex.exec(str)) !== null) {
      if (inlineMatch.index > inlineLastIndex) {
        inlineParts.push(str.substring(inlineLastIndex, inlineMatch.index));
      }
      inlineParts.push(
        <code key={`${keyPrefix}-${inlineMatch.index}`} className="inline-code">
          {inlineMatch[1]}
        </code>
      );
      inlineLastIndex = inlineMatch.index + inlineMatch[0].length;
    }

    if (inlineLastIndex < str.length) {
      inlineParts.push(str.substring(inlineLastIndex));
    }

    return inlineParts;
  };

  return (
    <div className={`formatted-text-container ${className}`}>
      {parts.map((part, i) => {
        if (part.type === 'codeblock') {
          return (
            <pre key={i} className="quiz-code-block">
              <code>{part.content}</code>
            </pre>
          );
        }

        // Handle text with newlines and inline code
        return (
          <span key={i} style={{ whiteSpace: 'pre-wrap' }}>
            {renderInlineCode(part.content, `p-${i}`)}
          </span>
        );
      })}
    </div>
  );
}
