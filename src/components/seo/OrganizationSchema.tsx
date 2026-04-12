import { getBrandingConfig } from '@/services/ui/branding.service';
import { getContactUs } from '@/services/content/contact-us.service';

export default async function OrganizationSchema() {
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

  const phones = contactInfo
    .filter(c => c.is_active && c.type === 'phone')
    .map(c => c.value);

  const emails = contactInfo
    .filter(c => c.is_active && c.type === 'email')
    .map(c => c.value);

  const schema = {
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
    contactPoint: phones.length > 0 || emails.length > 0
      ? [
          ...phones.map(phone => ({
            '@type': 'ContactPoint',
            telephone: phone,
            contactType: 'customer support',
          })),
          ...emails.map(email => ({
            '@type': 'ContactPoint',
            email,
            contactType: 'customer support',
          })),
        ]
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
