'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Video, FileText, Calendar } from 'lucide-react';

import { IPress } from '@/models';

interface PressListProps {
    themeSettings: any;
    press: IPress[];
}

export default function PressList({ themeSettings, press }: PressListProps) {

    return (
        <div className="min-h-screen bg-[#F8FCFF] px-4 sm:px-6 py-8 sm:py-12">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: themeSettings?.primary || '#23abff' }}>Press Releases</h1>
                    <p className="text-gray-600">Stay updated with the latest news and announcements from Ayahay</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {press.map((item) => (
                        <Link
                            key={item.id}
                            href={`/press/${item.id}`}
                            className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-between gap-2 mb-4">
                                    <FileText className="w-5 h-5" style={{ color: themeSettings?.primary || '#23abff' }} />
                                    {/* Category removed from schema, maybe use 'News' or generic label if needed, or remove badge */}
                                    {/* <div
                                        className="px-3 py-1 border rounded-full text-xs bg-[rgba(var(--bg-color),0.1)] text-[rgba(var(--bg-color),1)]"
                                        style={
                                            {
                                                '--bg-color': hexToRgb(themeSettings?.backgroundColor || '#23abff')
                                            } as React.CSSProperties
                                        }
                                    >
                                        News
                                    </div> */}
                                </div>

                                <h2 className="text-xl font-semibold mb-3">{item.title}</h2>
                                <div className="flex items-center text-gray-500 text-sm mb-4">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {new Date(item.publish_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                                <div className="mt-4">
                                    <Button variant="default" className="w-full py-2">
                                        Read More
                                    </Button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
