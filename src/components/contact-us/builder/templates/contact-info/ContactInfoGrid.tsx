import type { IContactInformation } from '@/models';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';

interface ContactInfoGridProps {
  contactInfo: IContactInformation[];
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

export default function ContactInfoGrid({
  contactInfo,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: ContactInfoGridProps) {
  if (!contactInfo || contactInfo.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'email':
        return <FaEnvelope className="h-5 w-5 text-white" />;
      case 'phone':
        return <FaPhoneAlt className="h-5 w-5 text-white" />;
      case 'address':
        return <FaMapMarkerAlt className="h-5 w-5 text-white" />;
      default:
        return <FaEnvelope className="h-5 w-5 text-white" />;
    }
  };

  return (
    <section
      className="rounded-[28px] border-2 px-8 py-10 shadow-md md:px-12"
      style={{ backgroundColor: surfaceColor, borderColor: primaryColor, color: textColor }}
    >
      <div className="mb-8 text-center">
        <p
          className="text-xs font-bold uppercase tracking-[0.24em]"
          style={{ color: primaryColor }}
        >
          Get In Touch
        </p>
        <h2 className="mt-4 text-3xl font-bold" style={{ color: textColor }}>
          Contact Information
        </h2>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {contactInfo.map((info) => (
          <div key={info.id} className="text-center">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              {getIcon(info.type)}
            </div>
            <h3 className="text-lg font-semibold" style={{ color: textColor }}>
              {info.label}
            </h3>
            <p className="mt-2" style={{ color: mutedColor }}>
              {info.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
