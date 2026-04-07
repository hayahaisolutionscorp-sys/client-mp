import type { IContactInformation } from '@/models';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';

interface ContactInfoCardsProps {
  contactInfo: IContactInformation[];
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
  surfaceAltColor: string;
  textOnSurfaceAlt: string;
}

export default function ContactInfoCards({
  contactInfo,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
  surfaceAltColor,
  textOnSurfaceAlt,
}: ContactInfoCardsProps) {
  if (!contactInfo || contactInfo.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'email':
        return <FaEnvelope className="h-6 w-6" style={{ color: primaryColor }} />;
      case 'phone':
        return <FaPhoneAlt className="h-6 w-6" style={{ color: primaryColor }} />;
      case 'address':
        return <FaMapMarkerAlt className="h-6 w-6" style={{ color: primaryColor }} />;
      default:
        return <FaEnvelope className="h-6 w-6" style={{ color: primaryColor }} />;
    }
  };

  return (
    <section
      className="rounded-[28px] border border-slate-200 px-8 py-10 shadow-sm md:px-12"
      style={{ backgroundColor: surfaceColor, color: textColor }}
    >
      <p
        className="text-xs font-bold uppercase tracking-[0.24em]"
        style={{ color: primaryColor }}
      >
        Get In Touch
      </p>
      <h2 className="mt-4 text-3xl font-bold" style={{ color: textColor }}>
        Contact Information
      </h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contactInfo.map((info) => (
          <div
            key={info.id}
            className="rounded-2xl border border-slate-200 p-6 shadow-sm transition-shadow hover:shadow-md"
            style={{ backgroundColor: surfaceAltColor, color: textOnSurfaceAlt }}
          >
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${primaryColor}30` }}
            >
              {getIcon(info.type)}
            </div>
            <h3 className="text-lg font-semibold" style={{ color: textOnSurfaceAlt }}>
              {info.label}
            </h3>
            <p className="mt-2 text-sm" style={{ color: textOnSurfaceAlt, opacity: 0.8 }}>
              {info.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
