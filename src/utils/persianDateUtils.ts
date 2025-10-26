import { format as formatJalali, parse as parseJalali } from 'date-fns-jalali';

export function formatPersianDate(date: Date | string, formatStr: string = 'yyyy/MM/dd'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatJalali(dateObj, formatStr);
}

export function formatPersianDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatJalali(dateObj, 'yyyy/MM/dd - HH:mm');
}

export function getPersianMonthName(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatJalali(dateObj, 'MMMM');
}

export function getPersianDayName(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  return dayNames[dateObj.getDay()];
}

export function persianToGregorian(persianDateStr: string): Date {
  // Convert Persian date string (e.g., "1403/09/15") to Gregorian Date
  try {
    return parseJalali(persianDateStr, 'yyyy/MM/dd', new Date());
  } catch {
    return new Date();
  }
}

export function formatPersianTimeAgo(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'همین الان';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} دقیقه پیش`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ساعت پیش`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} روز پیش`;
  
  return formatPersianDate(dateObj);
}
