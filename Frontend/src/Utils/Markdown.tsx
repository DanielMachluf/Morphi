import type { ReactNode } from "react";

// Lightweight markdown-ish renderer used by chat bubbles.
// Supports: fenced code blocks, inline code, **bold**, *italic*, line breaks.
// Intentionally tiny — full markdown libs would add a lot of weight for the chat use-case.

export function renderMarkdown(content: string): ReactNode {
    const parts: ReactNode[] = [];
    const codeBlockRe = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = codeBlockRe.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push(renderInline(content.slice(lastIndex, match.index), `t-${key++}`));
        }
        parts.push(
            <pre key={`c-${key++}`} className="MessageBubble-code">
                <code>{match[2].replace(/\n$/, "")}</code>
            </pre>
        );
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
        parts.push(renderInline(content.slice(lastIndex), `t-${key++}`));
    }

    return parts;
}

// Render inline content, isolating inline-code regions so emphasis markers inside them are preserved.
function renderInline(text: string, key: string): ReactNode {
    const segments: ReactNode[] = [];
    const inlineRe = /`([^`\n]+)`/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let i = 0;

    while ((m = inlineRe.exec(text)) !== null) {
        if (m.index > last) {
            segments.push(formatBoldItalic(text.slice(last, m.index), `${key}-p-${i++}`));
        }
        segments.push(
            <code key={`${key}-ic-${i++}`} className="MessageBubble-inline-code">
                {m[1]}
            </code>
        );
        last = m.index + m[0].length;
    }

    if (last < text.length) {
        segments.push(formatBoldItalic(text.slice(last), `${key}-p-${i++}`));
    }

    return <span key={key}>{segments}</span>;
}

// Apply **bold** then *italic* in a single non-overlapping pass, preserving line breaks.
function formatBoldItalic(text: string, key: string): ReactNode {
    const nodes: ReactNode[] = [];
    const re = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let i = 0;

    while ((m = re.exec(text)) !== null) {
        if (m.index > last) {
            nodes.push(renderLineBreaks(text.slice(last, m.index), `${key}-l-${i++}`));
        }
        if (m[2] !== undefined) {
            nodes.push(<strong key={`${key}-b-${i++}`}>{m[2]}</strong>);
        } else if (m[4] !== undefined) {
            nodes.push(<em key={`${key}-i-${i++}`}>{m[4]}</em>);
        }
        last = m.index + m[0].length;
    }

    if (last < text.length) {
        nodes.push(renderLineBreaks(text.slice(last), `${key}-l-${i++}`));
    }

    return <span key={key}>{nodes}</span>;
}

// Convert raw newlines into <br /> nodes.
function renderLineBreaks(text: string, key: string): ReactNode {
    const lines = text.split("\n");
    return (
        <span key={key}>
            {lines.map((line, idx) => (
                <span key={`${key}-${idx}`}>
                    {line}
                    {idx < lines.length - 1 && <br />}
                </span>
            ))}
        </span>
    );
}
