import { FaMobileAlt } from 'react-icons/fa';
import { MdOutlineMail } from 'react-icons/md';
import ContactUsForm from '@/components/contact-us/ContactUsForm';
import { getContactUs, getContactUsHero } from '@/services/content/contact-us.service';
import { getThemeSettings } from '@/services/ui/theme-settings.service';
import { getPageMetadata } from '@/services/content/seo.service';
import { Metadata } from 'next';

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

export default async function ContactUs() {
  const [themeSettings, contactInfo, contactUsHero] = await Promise.all([
    getThemeSettings(),
    getContactUs(),
    getContactUsHero(),
  ]);

  const phoneNumbers = contactInfo.filter(c => c.type === 'phone' && c.is_active);
  const emails = contactInfo.filter(c => c.type === 'email' && c.is_active);

  const primary = themeSettings?.primary;
  const secondary = themeSettings?.secondary;

  return (
    <section
      className="relative bg-cover bg-no-repeat bg-center min-h-screen flex items-center"
      style={{
        backgroundImage: `url('${contactUsHero?.bg_url || ''}')`,
        '--primary-color': primary,
        '--secondary-color': secondary
      } as React.CSSProperties}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, color-mix(in srgb, var(--primary-color) 80%, transparent), color-mix(in srgb, var(--secondary-color) 80%, transparent))`
        }}
      ></div>

      <div className="container mx-auto p-6 relative z-10">
        {/* Centered Heading */}
        <h1 className="text-2xl font-bold text-white text-center mb-6 sm:text-4xl sm:mb-16">
          {contactUsHero?.title || 'Contact Us'}
        </h1>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Left Side - Contact Info */}
          <div className="space-y-4 text-white sm:space-y-6">
            <h2 className="text-xl font-bold sm:text-2xl text-white">
              {contactUsHero?.subtitle || 'Have Any Questions?'}
            </h2>
            <p className="text-md text-white">{contactUsHero?.description}</p>

            <ul className="space-y-4">
              {phoneNumbers.map(phone => (
                <li key={phone.id} className="flex items-center space-x-4">
                  <FaMobileAlt className="text-2xl text-white" />
                  <h3>{phone.label}: {phone.value}</h3>
                </li>
              ))}

              {emails.map(email => (
                <li key={email.id} className="flex items-center space-x-4">
                  <MdOutlineMail className="text-2xl text-white" />
                  <h3>{email.value}</h3>
                </li>
              ))}
            </ul>
          </div>

          <ContactUsForm />
        </div>
      </div>
    </section>
  );
}
