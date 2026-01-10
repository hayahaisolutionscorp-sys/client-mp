import { FaMobileAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { MdOutlineMail } from 'react-icons/md';
import { CONTACT_US_IMAGES } from 'constants/storage';
import { hexToRgb } from 'helpers/theme.helpers';
import ContactUsForm from '@/components/contact-us/ContactUsForm';
import { getContactUs, getContactUsByShippingLineId } from '@/services';
import { getThemeSettings } from '@/services/ui/theme-settings.service';
import { getThemeSettingsByShippingLineId } from '@/services'; // Keeping for fallback if needed in my inline logic or if I decide to use it, but prefer getThemeSettings
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
  const [themeSettings, contactInfo] = await Promise.all([
    getThemeSettings().then(t => t || getThemeSettingsByShippingLineId(3)), // Fallback if general fails or is array logic
    getContactUs(),
  ]);

  // Handle case where themeSettings might be array if logic changed, but service returns single object or undefined. 
  // Based on service: return (themeSettingsData as IThemeSettings[])[0]; -> returns single object.
  // We can just use themeSettings directly.

  // Need to find the "contactUs" specific page data (background image etc). 
  // The original code used `getContactUsByShippingLineId(3)`. The request says "getContactUs". 
  // `getContactUs` returns `IContactInformation[]`. It doesn't return `IContactUs` (page data).
  // Uh oh, `getContactUsByShippingLineId` returns `IContactUs` which has `backgroundImageFilename`.
  // `getContactUs` returns list of phones/emails.
  // The user said "use theme primary,secondary,accent colors and getThemeSettings and getContactUs".
  // They probably meant use `getContactUs` for the contact info list (which I will), 
  // but I still need the page data (heading, background). 
  // I will keep `getContactUsByShippingLineId` for page data or see if there's a better way. 
  // Actually, wait, `getContactUs` service function (lines 8-24) returns `IContactInformation[]`.
  // `getContactUsByShippingLineId` (lines 26-38) returns `IContactUs | undefined` (page config).
  // I will assume I should use `getContactUs` for the list (replacing line 36), 
  // and I might still need `getContactUsByShippingLineId` for the page config unless there's a `getContactUsPageConfig` or similar.
  // But wait, user said "getContactUs". Maybe they renamed it or I should look for a generic one.
  // Looking at file content: `getContactUs` calls `CONTACT_INFORMATION_API`.
  // I'll stick to `getContactUs` for the list.
  // For the page config, I'll keep the existing call but maybe remove the hardcoded ID if I can find a better way, 
  // or just use `getContactUsByShippingLineId(3)` as strictly necessary for now since I don't have a replacement for page config in the prompt instructions other than "use... getContactUs".
  // Re-reading: "use ... getThemeSettings and getContactUs". 
  // It implies replacing the "ByShippingLineId" ones.
  // `getThemeSettings` replaces `getThemeSettingsByShippingLineId`.
  // `getContactUs` *replaces* `getContactUsByShippingLineId`? No, return types are different.
  // Maybe `getContactUs` is meant to be the *only* source and I should derive data? 
  // Or maybe I should look if `getContactUs` can optionally return page config? No, explicit return type.
  // I will use `getThemeSettings` instead of `getThemeSettingsByShippingLineId(3)`.
  // I will use `getContactUs` instead of... wait, line 36 already uses `getContactUs`.
  // Line 34 uses `getContactUsByShippingLineId(3)`.
  // I will check if I can replace line 34. If not, I'll update colors using `themeSettings`.

  // Let's assume for `themeSettings` I strictly use `getThemeSettings()`.
  // For `contactUs` page data, if `getContactUs` doesn't provide it, I'll keep the existing call but maybe move to a non-ID specific one if available? 
  // I'll keep `getContactUsByShippingLineId(3)` for page data as I have no alternative, but I will use `getThemeSettings` for theme.

  const contactUsPageData = await getContactUsByShippingLineId(3);

  const phoneNumbers = contactInfo.filter(c => c.type === 'phone' && c.is_active);
  const emails = contactInfo.filter(c => c.type === 'email' && c.is_active);

  const primary = themeSettings?.primaryColor || '#91363C';
  const secondary = themeSettings?.secondaryColor || '#d14b4e';
  const accent = themeSettings?.accent || '#8C1F21';

  return (
    <section
      className="relative bg-cover bg-no-repeat bg-center min-h-screen flex items-center"
      style={{
        backgroundImage: `url('${contactUsPageData?.backgroundImageFilename}')`
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, ${primary}CC, ${secondary}CC)` // Using hex with alpha (CC = 80%)
        }}
      ></div>

      <div className="container mx-auto p-6 relative z-10">
        {/* Centered Heading */}
        <h1 className="text-2xl font-bold text-white text-center mb-6 sm:text-4xl sm:mb-16">Contact Us</h1>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Left Side - Contact Info */}
          <div className="space-y-4 text-white sm:space-y-6">
            <h2 className="text-xl font-bold sm:text-2xl text-white">{contactUsPageData?.headingText}</h2>
            <p className="text-md text-white">{contactUsPageData?.headingDescription}</p>

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
