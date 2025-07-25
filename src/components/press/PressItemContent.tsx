"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Video,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VideoEmbed } from "@/components/press/VideoEmbed";
import { colors } from "@/lib/colors";

import { useThemeSettings } from "@/hooks/theme-settings";
import { IPress } from "@/models";

interface PressItemContentProps {
  pressItem: IPress & {
    formattedDate: string;
  };
}

export function PressItemContent({ pressItem }: PressItemContentProps) {
  const themeSettings = useThemeSettings();

  return (
    <div
      className="min-h-screen px-4 sm:px-6 py-8 sm:py-12 pb-32 sm:pb-60"
      style={{
        background: `linear-gradient(180deg, ${colors.primaryLight}1A 0%, ${colors.background} 100%)`,
      }}
    >
      <div className="max-w-6xl mx-auto">
        <Link
          href="/press"
          className="inline-flex items-center mb-6 sm:mb-8 text-primary hover:text-primary-dark transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
          Back to Press Releases
        </Link>

        <Card className="border-none shadow-xl rounded-xl">
          <CardHeader
            className="p-6 sm:p-8 text-white rounded-xl rounded-b-none"
            style={{ backgroundColor: themeSettings?.backgroundColor }}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="px-3 sm:px-4 py-1 border rounded-full bg-white/20 text-xs sm:text-sm">
                {pressItem.category}
              </span>
              {pressItem.type.toLowerCase() === "video" ? (
                <Video className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {pressItem.title}
            </h1>
            <p className="flex items-center text-white/80 text-sm sm:text-base">
              <Calendar className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              {pressItem.formattedDate}
            </p>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <div className="prose max-w-none mb-6 sm:mb-8">
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                {pressItem.content}
              </p>
            </div>

            {pressItem.videoUrl && <VideoEmbed url={pressItem.videoUrl} />}

            {pressItem.articleUrl && (
              <Button variant="default">
                <a
                  href={pressItem.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white text-sm sm:text-base"
                  style={{ backgroundColor: "transparent" }}
                >
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    Read full article on LinkedIn
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
