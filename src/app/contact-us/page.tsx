import { Suspense } from 'react';
import { ContactPageContent } from '@/components/contact-us/ContactPageContent';
import ContactPageBuilder from '@/components/contact-us/builder/ContactPageBuilder';
import OrganizationSchema from '@/components/seo/OrganizationSchema';
import { getContactPage, getContactSections, getContactUs } from '@/services/content/contact-us.service';
import { getThemeSettings } from '@/services/ui/theme-settings.service';
import { getBrandingConfig } from '@/services/ui/branding.service';
import { getPageMetadata } from '@/services/content/seo.service';
import { Metadata } from 'next';
import PageSkeleton from '@/components/ui/PageSkeleton';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageMetadata('contact-us');

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

async function ContactUsContent() {
  const [themeSettings, branding, contactPage, contactSections, contactInfo] = await Promise.all([
    getThemeSettings(),
    getBrandingConfig(),
    getContactPage(),
    getContactSections(),
    getContactUs(),
  ]);

  // If there's builder configuration, use the new builder
  if (contactPage?.content && typeof contactPage.content === 'object' && 'sections' in contactPage.content) {
    return (
      <>
        <OrganizationSchema />
        <ContactPageBuilder
          contactPage={contactPage}
          sections={contactSections}
          contactInfo={contactInfo}
          themeSettings={themeSettings ?? null}
          branding={branding ?? null}
        />
      </>
    );
  }

  // Fallback to old rendering
  return (
    <>
      <OrganizationSchema />
      <ContactPageContent
        contactPage={contactPage}
        sections={contactSections}
        contacts={contactInfo}
        themeSettings={themeSettings ?? null}
        branding={branding ?? null}
      />
    </>
  );
}

export default function ContactUs() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ContactUsContent />
    </Suspense>
  );
}

