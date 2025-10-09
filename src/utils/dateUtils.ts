// Date utility functions

export const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fa-IR');
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} دقیقه`;
  if (mins === 0) return `${hours} ساعت`;
  return `${hours} ساعت و ${mins} دقیقه`;
};

export const isToday = (date: string): boolean => {
  return date === getTodayString();
};

export const isThisWeek = (date: string): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  return checkDate >= weekStart;
};

export const getWeekDays = (): string[] => {
  const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
  return days;
};

export const calculateStreak = (dates: string[]): number => {
  if (dates.length === 0) return 0;
  
  const sortedDates = dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  let currentDate = new Date();
  
  for (const dateStr of sortedDates) {
    const date = new Date(dateStr);
    const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
      currentDate = date;
    } else {
      break;
    }
  }
  
  return streak;
};

export const getGreeting = (): { text: string; emoji: string } => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return { text: 'صبح بخیر', emoji: '🌅' };
  if (hour >= 12 && hour < 17) return { text: 'ظهر بخیر', emoji: '☀️' };
  if (hour >= 17 && hour < 20) return { text: 'عصر بخیر', emoji: '🌇' };
  return { text: 'شب بخیر', emoji: '🌙' };
};

export const getMotivationalQuote = (): string => {
  const quotes = [
    'هر روز یک فرصت جدید است! 🌟',
    'موفقیت حاصل تلاش مداوم است 💪',
    'شما می‌توانید به اهدافتان برسید! 🎯',
    'امروز بهترین روز برای شروع است 🚀',
    'پیشرفت هر روزه کلید موفقیت است 📈',
    'باور داشته باشید و تلاش کنید! ⭐',
    'آینده متعلق به کسانی است که به رویاهایشان ایمان دارند 🌈',
    'یک قدم کوچک بهتر از هیچ است 👣',
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export const daysUntil = (targetDate: string): number => {
  const target = new Date(targetDate);
  const today = new Date();
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const formatTimeAgo = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'همین الان';
  if (diffMins < 60) return `${diffMins} دقیقه پیش`;
  if (diffHours < 24) return `${diffHours} ساعت پیش`;
  if (diffDays < 7) return `${diffDays} روز پیش`;
  return formatDate(date);
};
