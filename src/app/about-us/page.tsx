import React from 'react';
import Image from 'next/image';

import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import Info from '@/components/about-us/Info';
import { getAboutUsSection, getCoreValues } from '@/services/content/about-us.service';
import { getPageMetadata } from '@/services/content/seo.service';
import { getThemeSettings } from '@/services/ui/theme-settings.service';
import { Metadata } from 'next';
import { IAboutUs } from '@/models';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageMetadata('about-us');

  return {
    title: seo?.title,
    description: seo?.description,
    keywords: seo?.keywords,
    robots: seo?.robots,
    alternates: seo?.alternates,
    openGraph: seo?.openGraph ? {
      title: seo.openGraph.title || seo.title,
      description: seo.openGraph.description || seo.description,
      images: seo.openGraph.images,
      type: seo.openGraph.type,
      siteName: seo.openGraph.siteName,
      locale: seo.openGraph.locale,
      url: seo.openGraph.url,
    } : undefined,
    twitter: seo?.twitter,
  };
}

export default async function AboutPage() {
  const [hero, welcome, story, expertise, coreValues] = await Promise.all([
    getAboutUsSection('hero'),
    getAboutUsSection('welcome'),
    getAboutUsSection('our_story'),
    getAboutUsSection('our_expertise'),
    getCoreValues(),
  ]);

  const theme = await getThemeSettings();

  const aboutUsData: IAboutUs = {
    id: 0, // Placeholder
    // Hero Section
    imageFilename: hero?.bg_url || '',
    imageLabel: hero?.bg_alt || 'About Us Image',
    imageCaption: hero?.title || 'Meet the Team',

    // Welcome Section
    welcomeTitle: welcome?.title || 'Welcome',
    welcomeDescription: welcome?.description || '',

    // Our Story Section
    ourStoryTitle: story?.title || 'Our Story',
    ourStoryDescription: story?.description || '',

    // Our Expertise Section
    ourExpertiseTitle: expertise?.title || 'Our Expertise',
    ourExpertiseDescription: expertise?.description || '',

    // Defaults / Unused
    ourCoreValues: '[]',
    tabsBackgroundColor: theme?.primary || '#0060df',
  };

  return (
    <div
      className="container mx-auto px-4 py-8 max-w-6xl"
      style={{
        '--primary-color': theme?.primary || '#0060df'
      } as React.CSSProperties}
    >
      <h1 className="text-4xl font-bold mb-12">About Us</h1>

      <div className="mb-16 relative aspect-[2/1] w-full">
        <Image
          src={aboutUsData.imageFilename}
          alt={aboutUsData.imageLabel}
          fill
          priority
          className="rounded-lg shadow-2xl object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-end justify-center pb-8">
          <h2 className="text-3xl font-semibold text-white">{aboutUsData.imageCaption}</h2>
        </div>
      </div>

      <Info aboutUs={aboutUsData} />

      <section className="mb-16 py-12 rounded-xl">
        <h2 className="text-3xl font-semibold mb-8 text-center text-[var(--primary-color)]">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-8 px-4">
          {coreValues.map((value, index) => (
            <Card key={value.id} className="overflow-hidden group">
              <CardContent className="p-6">
                <div className="mb-4 flex justify-center">
                  <div
                    className="h-16 w-16 relative bg-[var(--primary-color)]"
                    style={{
                      maskImage: `url(${value.icon_url})`,
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      maskSize: 'contain',
                      WebkitMaskImage: `url(${value.icon_url})`,
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      WebkitMaskSize: 'contain',
                    }}
                  />
                </div>

                <h3 className="text-xl font-semibold mb-2 text-center group-hover:text-[var(--primary-color)] transition-colors">
                  {value.title}
                </h3>
                <p className="text-center text-gray-600 group-hover:text-gray-800 transition-colors">
                  {value.description}
                </p>
              </CardContent>
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--primary-color)] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
            </Card>
          ))}
        </div>
      </section>


      {/* TODO: Update This to NEXT_PUBLIC_TENANT_NAME or ID Conditional rendering ni BTW */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Ready to revolutionize your logistics?</h2>
        <Link href="/contact-us" passHref>
          <Button variant="default" className="px-6 py-3">
            Get in touch
          </Button>
        </Link>
      </div>

    </div>
  );
}
