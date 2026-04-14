import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

export function getFullDate(date: string, monthName?: boolean): string {
  if (!date || !dayjs(date).isValid()) return '';
  const format = monthName ? 'MMMM D, YYYY' : 'M/D/YYYY';
  return dayjs(date).format(format);
}

export function computeAge(birthday: string): number {
  if (!birthday || !dayjs(birthday).isValid()) return 0;
  return dayjs().diff(dayjs(birthday), 'year');
}

export function computeBirthday(age: number, birthday?: string): string {
  const now = dayjs();
  const birthYear = now.year() - age;
  const birthDate = birthday && dayjs(birthday).isValid()
    ? dayjs(birthday).format('M/D')
    : '01/01';
  return `${birthDate}/${birthYear}`;
}

export function toPhilippinesTime(dateIso: string, format: string): string {
  if (!dateIso || !dayjs(dateIso).isValid()) return '';
  return dayjs(dateIso).tz('Asia/Shanghai').format(format);
}

export function toCanonicalDate(value: string | Date | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    // Keep already canonical dates untouched.
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    if (!dayjs(trimmed).isValid()) {
      return null;
    }

    return dayjs(trimmed).tz('Asia/Shanghai').format('YYYY-MM-DD');
  }

  if (!dayjs(value).isValid()) {
    return null;
  }

  return dayjs(value).tz('Asia/Shanghai').format('YYYY-MM-DD');
}

export function getDefaultDOB(): string {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 40); // Subtract 40 years

  // Convert to Philippine time using `toPhilippinesTime`
  return toPhilippinesTime(today.toISOString(), "YYYY-MM-DD");
}

export function fromNow(dateIso: string): string {
  if (!dateIso || !dayjs(dateIso).isValid()) return '';
  return dayjs(dateIso).fromNow();
}

export function computeDuration12HrFormat(startTime: string, endTime: string): string {
  const tz = 'Asia/Shanghai';
  if (!startTime || !endTime || !dayjs(startTime).isValid() || !dayjs(endTime).isValid()) return '';
  
  const start = dayjs(startTime).tz(tz);
  const end = dayjs(endTime).tz(tz);
  
  // Calculate the duration in hours and minutes
  const durationHours = end.diff(start, 'hour');
  const durationMinutes = end.diff(start, 'minute') % 60;
  
  // Format the times in 12-hour format
  const startFormatted = start.format('hh:mm A');
  const endFormatted = end.format('hh:mm A');
  
  return `${startFormatted} - ${endFormatted} (${durationHours} hr${durationHours !== 1 ? 's' : ''} ${durationMinutes} min)`;
}

export function isValidTripDates(departureDate: string, returnDate: string): boolean {
  if (!departureDate || !returnDate) return false;
  if (!dayjs(departureDate).isValid() || !dayjs(returnDate).isValid()) throw new Error("Invalid date format.");
  
  // Convert both dates to Philippine Time (Asia/Shanghai)
  const depDatePH = dayjs(departureDate).tz('Asia/Shanghai');
  const retDatePH = dayjs(returnDate).tz('Asia/Shanghai');

  // Check if departureDate is STRICTLY before returnDate (departureDate < returnDate)
  if (depDatePH.isAfter(retDatePH)) {
    const errorMessage = "Departure Date must be strictly before Return Date. Please check the trips date and time.";
    throw new Error(errorMessage); // Throw the error with the message
  }

  return true; // If no errors, return true
}