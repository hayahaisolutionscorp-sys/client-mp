"use client";

import { PrivacyPolicyService } from "@/services";
import { useState, useEffect, useMemo, useCallback } from "react";

export default function PrivacyPolicyContent() {
    const [activeSection, setActiveSection] = useState("introduction");
    const [isMobile, setIsMobile] = useState(false);

    const shippingLineId = Number(process.env.NEXT_PUBLIC_SHIPPING_LINE_ID || 3);

    type ContentItem = {
        type: "paragraph" | "heading";
        text: string;
    };

    type PolicySection = {
        id: string;
        title: string;
        content: string | ContentItem[];
    };

    const defaultPolicySections: PolicySection[] = useMemo(() => [
        {
            id: "introduction",
            title: "Privacy Policy",
            content: [
                { type: "paragraph", text: "Effective Date: January 1, 2024" },
                {
                    type: "paragraph",
                    text: "Welcome to Ayahay. Your privacy is important to us, and we are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.",
                },
            ],
        },
        {
            id: "information-we-collect",
            title: "1. Information We Collect",
            content: `We may collect the following types of information:
● Personal Information: This includes your name, contact information, and payment details.
● Transaction Information: Information related to transactions you conduct on the Marketplace.
● User Content: Any content you create, upload, or share on the Marketplace, such as product listings and reviews.
● Device and Usage Information: Information about your device and how you use our services.`,
        },
        {
            id: "how-we-use-your-information",
            title: "2. How We Use Your Information",
            content: `We use your information for various purposes, including:
● Facilitating transactions and providing customer support.
● Personalizing your experience and improving our services.
● Communicating with you about updates, promotions, and account-related matters.`,
        },
        {
            id: "sharing-your-information",
            title: "3. Sharing Your Information",
            content: `We may share your information with:
● Sellers (shipping line) involved in your transactions.
● Service providers who help us deliver our services.
● Legal authorities when required to comply with the law.`,
        },
        {
            id: "security",
            title: "4. Security",
            content: `We employ reasonable security measures to protect your data. However, no method of transmission over the internet is entirely secure, and we cannot guarantee the absolute security of your data.`,
        },
        {
            id: "your-choices",
            title: "5. Your Choices",
            content: `You can control how your information is used by:
● Reviewing and editing your account settings.
● Managing your communication preferences.`,
        },
        {
            id: "childrens-privacy",
            title: "6. Children's Privacy",
            content: `Our services are not intended for children under the age of 13. We do not knowingly collect data from individuals under 13 years of age.`,
        },
        {
            id: "updates-to-policy",
            title: "7. Updates to this Privacy Policy",
            content: `We may update this Privacy Policy to reflect changes in our practices. We will notify you of any material changes by posting the updated policy on our website.`,
        },
        {
            id: "contact-us",
            title: "8. Contact Us",
            content: `If you have any questions or concerns about this Privacy Policy or your data, please contact us at admin@ayahay.com.`,
        },
    ], []);

    const [policySections, setPolicySections] = useState<PolicySection[]>(defaultPolicySections);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        const fetchPrivacyPolicy = async () => {
            try {
                const data = await PrivacyPolicyService.getByShippingLineId(shippingLineId);

                if (Array.isArray(data) && data.length > 0) {
                    setPolicySections(
                        data.map((item) => ({
                            id: item.titleId,
                            title: item.title,
                            content: item.content,
                        }))
                    );
                } else {
                    setPolicySections(defaultPolicySections);
                }
            } catch (error) {
                console.warn(
                    "Falling back to default privacy policy content due to fetch failure:",
                    error
                );
                setPolicySections(defaultPolicySections);
            }
        };

        fetchPrivacyPolicy();
    }, [shippingLineId, defaultPolicySections]);

    const scrollToSection = useCallback((sectionId: string) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, []);

    const renderContent = (content: string | ContentItem[]) => {
        if (typeof content === "string") {
            return (
                <div className="leading-relaxed whitespace-pre-line">{content}</div>
            );
        }
        return content.map((item, index) => {
            switch (item.type) {
                case "heading":
                    return (
                        <h3 key={index} className="font-semibold mt-4 mb-1">
                            {item.text}
                        </h3>
                    );
                case "paragraph":
                    return (
                        <p key={index} className="leading-relaxed mb-4">
                            {item.text}
                        </p>
                    );
                default:
                    return null;
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br sm:px-4 md:px-8 lg:px-10 lg:pb-64">
            <div className="flex flex-col md:flex-row sm:pt-2 md:pt-4 lg:pt-6">
                {/* Sidebar Navigation */}
                <div
                    className={`w-full md:w-64 ${isMobile ? "" : "h-screen sticky top-0 items-center overflow-y-auto"
                        }`}
                >
                    <nav className="w-full pb-8">
                        <ul className="space-y-2">
                            {policySections.map((section) => (
                                <li key={section.id}>
                                    <button
                                        onClick={() => scrollToSection(section.id)}
                                        className={`w-full rounded-md px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 hover:text-customText/80 ${activeSection === section.id
                                                ? "bg-customBlue text-white"
                                                : "text-customText/80"
                                            }`}
                                    >
                                        {section.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* Main Content */}
                <main className="flex-1 px-8">
                    <h1 className="mb-8 text-3xl font-bold">Privacy Policy</h1>
                    {policySections.map((section) => (
                        <div key={section.id} id={section.id} className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                            <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {renderContent(section.content)}
                            </div>
                        </div>
                    ))}
                </main>
            </div>
        </div>
    );
}
