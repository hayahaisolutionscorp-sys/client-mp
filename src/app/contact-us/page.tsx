import { FaMobileAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { MdOutlineMail } from 'react-icons/md';
import { CONTACT_US_IMAGES } from 'constants/storage';
import { hexToRgb } from 'helpers/theme.helpers';
import ContactUsForm from '@/components/contact-us/ContactUsForm';
import { getContactUs, getContactUsByShippingLineId, getThemeSettingsByShippingLineId } from '@/services';
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
  // TODO: Update ni sha
  const contactUs = await getContactUsByShippingLineId(3);
  const themeSettings = await getThemeSettingsByShippingLineId(3);
  const contactInfo = await getContactUs();

  const phoneNumbers = contactInfo.filter(c => c.type === 'phone' && c.is_active);
  const emails = contactInfo.filter(c => c.type === 'email' && c.is_active);

  return (
    <section
      className="relative bg-cover bg-no-repeat bg-center min-h-screen flex items-center"
      style={{
        // backgroundImage: `url('${CONTACT_US_IMAGES}${contactUs?.shippingLineId}/${contactUs?.backgroundImageFilename}')`
        backgroundImage: `url('${contactUs?.backgroundImageFilename}')`
      }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-[rgba(var(--bg-color),1)]/80 to-[rgba(var(--bg-color),1)]/80"
        style={
          {
            '--bg-color': hexToRgb(themeSettings?.backgroundColor || '#23abff')
          } as React.CSSProperties
        }
      ></div>

      <div className="container mx-auto p-6 relative z-10">
        {/* Centered Heading */}
        <h1 className="text-2xl font-bold text-white text-center mb-6 sm:text-4xl sm:mb-16">Contact Us</h1>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Left Side - Contact Info */}
          <div className="space-y-4 text-white sm:space-y-6">
            <h2 className="text-xl font-bold sm:text-2xl">{contactUs?.headingText}</h2>
            <p className="text-md text-white">{contactUs?.headingDescription}</p>

            <ul className="space-y-4">
              {phoneNumbers.map(phone => (
                <li key={phone.id} className="flex items-center space-x-4">
                  <FaMobileAlt className="text-2xl" />
                  <h3>{phone.label}: {phone.value}</h3>
                </li>
              ))}

              {emails.map(email => (
                <li key={email.id} className="flex items-center space-x-4">
                  <MdOutlineMail className="text-2xl" />
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
