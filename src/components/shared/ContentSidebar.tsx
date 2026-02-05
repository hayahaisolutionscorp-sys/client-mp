'use client'

import { useState, useEffect } from 'react'
import { useThemeSettings } from '@/hooks/theme-settings'

interface HeadingItem {
    id: string;
    title: string;
    level: number;
}

interface ContentSidebarProps {
    content: any; // TipTap JSON content
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

// Helper function to extract headings from TipTap JSON content
function extractHeadingsFromTipTap(content: any): HeadingItem[] {
    if (!content || !content.content) return [];

    const headings: HeadingItem[] = [];

    for (const node of content.content) {
        // Extract level 1 or level 2 headings (API may use either)
        if (node.type === 'heading' && (node.attrs?.level === 1 || node.attrs?.level === 2)) {
            const text = extractTextFromNode(node);
            if (text) {
                headings.push({
                    id: generateId(text),
                    title: text,
                    level: node.attrs.level
                });
            }
        }
    }

    return headings;
}

export default function ContentSidebar({ content, className }: ContentSidebarProps) {
    const [activeSection, setActiveSection] = useState('')
    const [headings, setHeadings] = useState<HeadingItem[]>([])
    const themeSettings = useThemeSettings()

    useEffect(() => {
        if (content) {
            const extractedHeadings = extractHeadingsFromTipTap(content);
            setHeadings(extractedHeadings);
            if (extractedHeadings.length > 0 && !activeSection) {
                setActiveSection(extractedHeadings[0].id);
            }
        }
    }, [content, activeSection]);

    useEffect(() => {
        const handleScroll = () => {
            for (const heading of headings) {
                const element = document.getElementById(heading.id)
                if (element) {
                    const rect = element.getBoundingClientRect()
                    if (rect.top <= 100 && rect.bottom >= 100) {
                        setActiveSection(heading.id)
                        break
                    }
                }
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [headings])

    const scrollToSection = (sectionId: string) => {
        setActiveSection(sectionId)
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    return (
        <div className={`hidden md:block md:w-64 h-screen sticky top-0 items-center overflow-y-auto ${className || ''}`}>
            <nav className="w-full pb-8">
                <ul className="space-y-2">
                    {headings.map((heading) => (
                        <li key={heading.id}>
                            <button
                                onClick={() => scrollToSection(heading.id)}
                                className={`w-full rounded-md px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 hover:text-customText/80 ${activeSection === heading.id
                                    ? 'text-white'
                                    : 'text-customText/80'
                                    }`}
                                style={{
                                    backgroundColor: activeSection === heading.id ? themeSettings?.primaryColor : undefined
                                }}
                            >
                                {heading.title}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    )
}
