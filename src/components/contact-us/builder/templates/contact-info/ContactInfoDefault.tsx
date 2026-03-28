import type { IContactInformation } from '@/models';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';

interface ContactInfoDefaultProps {
  contactInfo: IContactInformation[];
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

export default function ContactInfoDefault({
  contactInfo,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: ContactInfoDefaultProps) {
  if (!contactInfo || contactInfo.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'email':
        return <FaEnvelope className="h-5 w-5" style={{ color: primaryColor }} />;
      case 'phone':
        return <FaPhoneAlt className="h-5 w-5" style={{ color: primaryColor }} />;
      case 'address':
        return <FaMapMarkerAlt className="h-5 w-5" style={{ color: primaryColor }} />;
      default:
        return <FaEnvelope className="h-5 w-5" style={{ color: primaryColor }} />;
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
      <div className="mt-8 space-y-6">
        {contactInfo.map((info) => (
          <div key={info.id} className="flex items-start gap-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              {getIcon(info.type)}
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: textColor }}>
                {info.label}
              </h3>
              <p className="mt-1" style={{ color: mutedColor }}>
                {info.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
