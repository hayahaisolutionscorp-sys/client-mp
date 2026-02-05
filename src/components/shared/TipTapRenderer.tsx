'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Heading from '@tiptap/extension-heading';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useMemo, useEffect } from 'react';
import {
    FaBold,
    FaItalic,
    FaUnderline,
    FaStrikethrough,
    FaListUl,
    FaListOl,
    FaAlignLeft,
    FaAlignCenter,
    FaAlignRight,
    FaAlignJustify,
    FaUndo,
    FaRedo
} from 'react-icons/fa';

import { Heading1, Heading2, Heading3 } from 'lucide-react';

interface TipTapRendererProps {
    content: string | object;
    className?: string;
    isEditable?: boolean;
    onChange?: (content: any) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="border border-gray-200 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-1 mb-2 items-center">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                title="Bold"
            >
                <FaBold size={14} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                title="Italic"
            >
                <FaItalic size={14} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={!editor.can().chain().focus().toggleUnderline().run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                title="Underline"
            >
                <FaUnderline size={14} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                title="Strikethrough"
            >
                <FaStrikethrough size={14} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                title="Heading 1"
            >
                <Heading1 size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                title="Heading 2"
            >
                <Heading2 size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                title="Heading 3"
            >
                <Heading3 size={16} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

            <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                title="Align Left"
            >
                <FaAlignLeft size={14} />
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                title="Align Center"
            >
                <FaAlignCenter size={14} />
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                title="Align Right"
            >
                <FaAlignRight size={14} />
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                title="Justify"
            >
                <FaAlignJustify size={14} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                title="Bullet List"
            >
                <FaListUl size={14} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
                title="Ordered List"
            >
                <FaListOl size={14} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

            <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"
                title="Undo"
            >
                <FaUndo size={14} />
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"
                title="Redo"
            >
                <FaRedo size={14} />
            </button>
        </div>
    );
};

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

export default function TipTapRenderer({ content, className = '', isEditable = false, onChange }: TipTapRendererProps) {
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
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: parsedContent,
        editable: isEditable,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getJSON());
        },
    });

    useEffect(() => {
        if (editor && parsedContent && !editor.isFocused) {
            editor.commands.setContent(parsedContent);
        }
    }, [editor, parsedContent]);

    if (!editor) {
        return null;
    }

    return (
        <div className={`tiptap-renderer prose prose-sm max-w-none ${className}`}>
            {isEditable && <MenuBar editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    );
}

