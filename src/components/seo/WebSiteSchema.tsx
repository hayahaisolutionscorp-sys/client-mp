import { getBrandingConfig } from '@/services/ui/branding.service';
import { getContactUs } from '@/services/content/contact-us.service';

export default async function WebSiteSchema() {
  const [branding, contactInfo] = await Promise.all([
    getBrandingConfig(),
    getContactUs(),
  ]);

  const baseUrl = branding?.domain_name
    ? `https://${branding.domain_name}.com`
    : 'https://hayahai.com';
  const brandName = branding?.brand_name || 'Hayahai';
  const logoUrl = branding?.logo?.light || branding?.logo?.dark || '';

  const socialLinks = contactInfo
    .filter(c => c.is_active && ['facebook', 'instagram', 'twitter', 'linkedin'].includes(c.type))
    .map(c => c.value);

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brandName,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/booking/destination?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brandName,
    url: baseUrl,
    logo: logoUrl
      ? {
          '@type': 'ImageObject',
          url: logoUrl,
        }
      : undefined,
    sameAs: socialLinks.length > 0 ? socialLinks : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}
