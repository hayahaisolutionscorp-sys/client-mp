'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Heading from '@tiptap/extension-heading';
import { useMemo } from 'react';

interface TipTapRendererProps {
    content: string | object;
    className?: string;
}

// Helper function to generate id from heading text
function generateId(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();
}

// Helper function to extract text from TipTap content node
function extractTextFromNode(node: any): string {
    if (!node) return '';
    if (node.type === 'text') return node.text || '';
    if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractTextFromNode).join('');
    }
    return '';
}

// Helper function to add IDs to heading nodes in TipTap content
function addIdsToHeadings(content: any): any {
    if (!content || typeof content !== 'object') return content;

    if (content.type === 'heading') {
        const text = extractTextFromNode(content);
        const id = generateId(text);
        return {
            ...content,
            attrs: {
                ...content.attrs,
                id
            }
        };
    }

    if (content.content && Array.isArray(content.content)) {
        return {
            ...content,
            content: content.content.map(addIdsToHeadings)
        };
    }

    return content;
}

// Custom Heading extension that supports ID attribute
const HeadingWithId = Heading.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            id: {
                default: null,
                parseHTML: element => element.getAttribute('id'),
                renderHTML: attributes => {
                    if (!attributes.id) {
                        return {};
                    }
                    return { id: attributes.id };
                },
            },
        };
    },
});

export default function TipTapRenderer({ content, className = '' }: TipTapRendererProps) {
    const parsedContent = useMemo(() => {
        let parsed;
        // If content is already an object, use it directly
        if (typeof content === 'object' && content !== null) {
            parsed = content;
        } else {
            // If content is a string, try to parse it as JSON
            try {
                parsed = JSON.parse(content as string);
            } catch {
                // If parsing fails, wrap plain text in a paragraph
                parsed = {
                    type: 'doc',
                    content: [
                        {
                            type: 'paragraph',
                            content: [{ type: 'text', text: content }]
                        }
                    ]
                };
            }
        }
        // Add IDs to all headings
        return addIdsToHeadings(parsed);
    }, [content]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false, // Disable default heading to use our custom one
            }),
            HeadingWithId.configure({
                levels: [1, 2, 3, 4, 5, 6],
            }),
            Link.configure({
                openOnClick: true,
                HTMLAttributes: {
                    class: 'text-blue-600 hover:text-blue-800 underline',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
            }),
        ],
        content: parsedContent,
        editable: false,
        immediatelyRender: false,
    });

    if (!editor) {
        return null;
    }

    return (
        <div className={`tiptap-renderer prose prose-sm max-w-none ${className}`}>
            <EditorContent editor={editor} />
        </div>
    );
}

