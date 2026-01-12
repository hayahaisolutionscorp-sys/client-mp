"use client";

import { useState, useEffect } from "react";
import ContentSidebar from "@/components/shared/ContentSidebar";
import TipTapRenderer from "@/components/shared/TipTapRenderer";
import { getPrivacyPolicy } from "@/services/content/privacy-policy.service";

export default function PrivacyPolicyContent() {
    const [title, setTitle] = useState("Privacy Policy");
    const [content, setContent] = useState<any>(null);

    useEffect(() => {
        const fetchPrivacyPolicy = async () => {
            const data = await getPrivacyPolicy();
            if (data) {
                setTitle(data.title);
                setContent(data.content);
            }
        };

        fetchPrivacyPolicy();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br sm:px-4 md:px-8 lg:px-10 lg:pb-64">
            <div className="flex flex-col md:flex-row sm:pt-2 md:pt-4 lg:pt-6">
                {/* Sidebar */}
                <ContentSidebar content={content} />

                {/* Main Content */}
                <main className="flex-1 px-8">
                    <h1 className="mb-8 text-3xl font-bold">{title}</h1>
                    {content && (
                        <TipTapRenderer content={content} />
                    )}
                </main>
            </div>
        </div>
    );
}
