import { FaMobileAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { MdOutlineMail } from 'react-icons/md';
import { CONTACT_US_IMAGES } from 'constants/storage';
import { hexToRgb } from 'helpers/theme.helpers';
import ContactUsForm from '@/components/contact-us/ContactUsForm';
import { getContactUsByShippingLineId, getThemeSettingsByShippingLineId } from '@/services';
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
  const shippingLineId = parseInt(process.env.NEXT_PUBLIC_SHIPPING_LINE_ID || '3');
  const contactUs = await getContactUsByShippingLineId(shippingLineId);
  const themeSettings = await getThemeSettingsByShippingLineId(shippingLineId);

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
              {contactUs?.contactNumber && (
                <li className="flex items-center space-x-4">
                  <FaMobileAlt className="text-2xl" />
                  <h3>{contactUs.contactNumber}</h3>
                </li>
              )}

              {contactUs?.email && (
                <li className="flex items-center space-x-4">
                  <MdOutlineMail className="text-2xl" />
                  <h3>{contactUs.email}</h3>
                </li>
              )}

              {contactUs?.address && (
                <li className="flex items-center space-x-4">
                  <FaMapMarkerAlt className="text-2xl" />
                  <h3>{contactUs.address}</h3>
                </li>
              )}
            </ul>
          </div>

          <ContactUsForm />
        </div>
      </div>
    </section>
  );
}
