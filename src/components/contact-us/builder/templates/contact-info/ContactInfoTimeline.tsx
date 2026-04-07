import type { IContactInformation } from '@/models';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';

interface ContactInfoTimelineProps {
  contactInfo: IContactInformation[];
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}

export default function ContactInfoTimeline({
  contactInfo,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: ContactInfoTimelineProps) {
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
      <div className="relative mt-8 space-y-8 border-l-4 pl-8" style={{ borderColor: `${primaryColor}30` }}>
        {contactInfo.map((info, index) => (
          <div key={info.id} className="relative">
            <div
              className="absolute -left-[2.6rem] flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              {getIcon(info.type)}
            </div>
            <div>
              <h3 className="text-xl font-semibold" style={{ color: textColor }}>
                {info.label}
              </h3>
              <p className="mt-2 text-base" style={{ color: mutedColor }}>
                {info.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
