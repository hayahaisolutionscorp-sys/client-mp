'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card, CardContent } from '@/components/ui/Card';

import DOMPurify from 'isomorphic-dompurify';
import { IAboutUs } from '@/models';

export default function Info({ aboutUs }: { aboutUs: IAboutUs }) {
  return (
    <Tabs defaultValue="welcome" className="mb-16">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger
          value="welcome"
          className="data-[state=active]:bg-[var(--active-tab-bg)] data-[state=active]:text-primary-foreground"
          style={{
            '--active-tab-bg': aboutUs?.tabsBackgroundColor || '#0060df'
          } as React.CSSProperties}
        >
          Welcome
        </TabsTrigger>
        <TabsTrigger
          value="story"
          className="data-[state=active]:bg-[var(--active-tab-bg)] data-[state=active]:text-primary-foreground"
          style={{
            '--active-tab-bg': aboutUs?.tabsBackgroundColor || '#0060df'
          } as React.CSSProperties}
        >
          Our Story
        </TabsTrigger>
        <TabsTrigger
          value="expertise"
          className="data-[state=active]:bg-[var(--active-tab-bg)] data-[state=active]:text-primary-foreground"
          style={{
            '--active-tab-bg': aboutUs?.tabsBackgroundColor || '#0060df'
          } as React.CSSProperties}
        >
          Our Expertise
        </TabsTrigger>
      </TabsList>
      <TabsContent value="welcome">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-2xl font-semibold mb-4">{aboutUs?.welcomeTitle}</h3>
            <p
              className="text-lg"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(aboutUs?.welcomeDescription || '')
              }}
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="story">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-2xl font-semibold mb-4">{aboutUs?.ourStoryTitle}</h3>
            <p
              className="text-lg"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(aboutUs?.ourStoryDescription || '')
              }}
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="expertise">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-2xl font-semibold mb-4">{aboutUs?.ourExpertiseTitle}</h3>
            <p
              className="text-lg"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(aboutUs?.ourExpertiseDescription || '')
              }}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
