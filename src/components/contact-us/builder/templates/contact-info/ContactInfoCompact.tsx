import type { IContactInformation } from '@/models';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';

interface ContactInfoCompactProps {
  contactInfo: IContactInformation[];
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

export default function ContactInfoCompact({
  contactInfo,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: ContactInfoCompactProps) {
  if (!contactInfo || contactInfo.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'email':
        return <FaEnvelope className="h-4 w-4" style={{ color: primaryColor }} />;
      case 'phone':
        return <FaPhoneAlt className="h-4 w-4" style={{ color: primaryColor }} />;
      case 'address':
        return <FaMapMarkerAlt className="h-4 w-4" style={{ color: primaryColor }} />;
      default:
        return <FaEnvelope className="h-4 w-4" style={{ color: primaryColor }} />;
    }
  };

  return (
    <section
      className="rounded-[28px] border border-slate-200 px-6 py-6 shadow-sm"
      style={{ backgroundColor: surfaceColor, color: textColor }}
    >
      <div className="flex flex-wrap items-center gap-6 md:gap-10">
        {contactInfo.map((info) => (
          <div key={info.id} className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              {getIcon(info.type)}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: mutedColor }}>
                {info.label}
              </p>
              <p className="mt-0.5 text-sm font-semibold" style={{ color: textColor }}>
                {info.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
