import { hexToRgb } from 'helpers/theme.helpers';
import { useThemeSettings } from '@/hooks/theme-settings';
import { useSearchParams } from 'next/navigation';

export default function ErrorMessage({ errorCode }: { errorCode?: number }) {
  const themeSettings = useThemeSettings();

  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const isFromOj = from === 'oceanJet';

  if (errorCode === 404) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-4 text-center">
        <p className="text-sm sm:text-base text-gray-700">
          {isFromOj ? (
            <>Payment successful. Please wait 15 minutes to 1 hour for confirmation. Thank you.</>
          ) : (
            <>
              Your booking is currently being processed. Please try again after a few minutes or if it takes more than
              an hour&nbsp;
            </>
          )}
          <a
            href="mailto:it@ayahay.com?subject=Booking Processing"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-customText bg-transparent border border-[rgba(var(--border-color),1)] rounded hover:bg-[rgba(var(--bg-color),1)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[rgba(var(--border-color),1)] focus:ring-offset-2 transition-colors duration-200"
            style={
              {
                '--border-color': hexToRgb(themeSettings?.accent || '#8C1F21'),
                '--bg-color': hexToRgb('#FFFFFF')
              } as React.CSSProperties
            }
          >
            Contact us for assistance
          </a>
          .
        </p>
      </div>
    );
  } else if (errorCode === 403) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-4 text-center">
        <p className="text-sm sm:text-base text-gray-700">
          You do not have permission to access this booking. Please&nbsp;
          <a
            href="mailto:it@ayahay.com?subject=Booking Processing"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-customText bg-transparent border border-[rgba(var(--border-color),1)] rounded hover:bg-[rgba(var(--bg-color),1)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[rgba(var(--border-color),1)] focus:ring-offset-2 transition-colors duration-200"
            style={
              {
                '--border-color': hexToRgb(themeSettings?.accent || '#8C1F21'),
                '--bg-color': hexToRgb('#FFFFFF')
              } as React.CSSProperties
            }
          >
            Contact us for assistance
          </a>
          .
        </p>
      </div>
    );
  } else if (errorCode === 500) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-4 text-center">
        <p className="text-sm sm:text-base text-gray-700">
          An unexpected error occurred. Please refresh the page or&nbsp;
          <a
            href="mailto:it@ayahay.com?subject=Booking Processing"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-customText bg-transparent border border-[rgba(var(--border-color),1)] rounded hover:bg-[rgba(var(--bg-color),1)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[rgba(var(--border-color),1)] focus:ring-offset-2 transition-colors duration-200"
            style={
              {
                '--border-color': hexToRgb(themeSettings?.accent || '#8C1F21'),
                '--bg-color': hexToRgb('#FFFFFF')
              } as React.CSSProperties
            }
          >
            Contact us for assistance
          </a>
          .
        </p>
      </div>
    );
  }
  return null;
}
