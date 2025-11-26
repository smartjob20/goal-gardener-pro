import jsPDF from 'jspdf';
import { AppState } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

// رنگ‌های تم Deep Breath
const COLORS = {
  primary: [59, 130, 246], // آبی اقیانوسی
  accent: [147, 197, 253], // آبی روشن
  secondary: [148, 163, 184], // خاکستری آبی
  success: [34, 197, 94], // سبز
  warning: [251, 191, 36], // زرد
  error: [239, 68, 68], // قرمز
  text: [30, 41, 59], // متن اصلی
  textLight: [100, 116, 139], // متن کمرنگ
  background: [248, 250, 252], // پس‌زمینه
  border: [226, 232, 240] // خط جداکننده
};

// راست‌چین کردن متن فارسی
const addPersianText = (doc: jsPDF, text: string, x: number, y: number, options?: any) => {
  doc.text(text.split('').reverse().join(''), x, y, { align: 'right', ...options });
};

// اضافه کردن هدر صفحه
const addPageHeader = (doc: jsPDF, pageWidth: number, pageNumber: number) => {
  // پس‌زمینه گرادیانت هدر
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // لوگو و عنوان
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  addPersianText(doc, '🌊 Deep Breath', pageWidth - 15, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(240, 240, 240);
  addPersianText(doc, 'گزارش جامع عملکرد', pageWidth - 15, 28);
  
  // شماره صفحه در گوشه چپ
  doc.setFontSize(9);
  doc.setTextColor(240, 240, 240);
  doc.text(`صفحه ${pageNumber}`, 15, 20);
};

// اضافه کردن فوتر صفحه
const addPageFooter = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
  // خط جداکننده
  doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
  doc.setLineWidth(0.5);
  doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
  
  // تاریخ تولید گزارش
  doc.setFontSize(8);
  doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
  addPersianText(doc, `تاریخ تولید: ${format(new Date(), 'yyyy/MM/dd - HH:mm')}`, pageWidth - 15, pageHeight - 12);
  
  // لوگو کوچک
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text('Deep Breath Pro', 15, pageHeight - 12);
};

// اضافه کردن بخش با عنوان
const addSection = (doc: jsPDF, title: string, y: number, pageWidth: number, icon?: string) => {
  // پس‌زمینه بخش
  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.roundedRect(15, y - 5, pageWidth - 30, 12, 2, 2, 'F');
  
  // عنوان
  doc.setFontSize(14);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  const titleText = icon ? `${icon} ${title}` : title;
  addPersianText(doc, titleText, pageWidth - 20, y + 3);
  
  return y + 15;
};

// اضافه کردن آیتم آماری
const addStatItem = (doc: jsPDF, label: string, value: string, x: number, y: number, color: number[]) => {
  // کادر آیتم
  doc.setFillColor(color[0], color[1], color[2]);
  doc.roundedRect(x, y, 55, 18, 2, 2, 'F');
  
  // مقدار
  doc.setFontSize(18);
  doc.setTextColor(color[0], color[1], color[2]);
  addPersianText(doc, value, x + 52, y + 10);
  
  // برچسب
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
  addPersianText(doc, label, x + 52, y + 16);
};

// اضافه کردن نوار پیشرفت
const addProgressBar = (doc: jsPDF, label: string, percentage: number, x: number, y: number, width: number) => {
  // برچسب و درصد
  doc.setFontSize(10);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  addPersianText(doc, label, x + width, y);
  
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  addPersianText(doc, `${percentage.toFixed(1)}%`, x + 15, y);
  
  // پس‌زمینه نوار
  doc.setFillColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
  doc.roundedRect(x, y + 3, width, 5, 2, 2, 'F');
  
  // نوار پیشرفت
  const progressWidth = (width * percentage) / 100;
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.roundedRect(x, y + 3, progressWidth, 5, 2, 2, 'F');
};

export const generatePDFReport = async (state: AppState) => {
  try {
    toast.info('⏳ در حال تولید گزارش جامع...');
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentY = 45;
    let pageNumber = 1;

    // ========== صفحه اول: نمای کلی ==========
    addPageHeader(doc, pageWidth, pageNumber);
    
    // تاریخ و اطلاعات کلی
    doc.setFontSize(11);
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    addPersianText(doc, `📅 تاریخ: ${format(new Date(), 'yyyy/MM/dd')}`, pageWidth - 20, currentY);
    currentY += 8;
    addPersianText(doc, `👤 کاربر: ${state.user.name}`, pageWidth - 20, currentY);
    currentY += 15;

    // آمار کلیدی در 4 ستون
    currentY = addSection(doc, 'خلاصه عملکرد', currentY, pageWidth, '📊');
    
    const stats = [
      { label: 'سطح', value: state.user.level.toString(), color: COLORS.primary },
      { label: 'XP', value: state.user.xp.toString(), color: COLORS.warning },
      { label: 'وظایف تکمیل شده', value: state.tasks.filter(t => t.completed).length.toString(), color: COLORS.success },
      { label: 'استریک فعلی', value: `${state.habits.length > 0 ? Math.max(...state.habits.map(h => h.currentStreak)) : 0} روز`, color: COLORS.error }
    ];

    let statX = 20;
    stats.forEach((stat, index) => {
      if (index > 0 && index % 3 === 0) {
        currentY += 22;
        statX = 20;
      }
      addStatItem(doc, stat.label, stat.value, statX, currentY, stat.color);
      statX += 60;
    });
    currentY += 30;

    // آمار تکمیلی
    const completedTasks = state.tasks.filter(t => t.completed).length;
    const totalTasks = state.tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const activeHabits = state.habits.filter(h => h.isActive).length;
    const totalHabits = state.habits.length;
    const habitRate = totalHabits > 0 ? (activeHabits / totalHabits) * 100 : 0;

    addProgressBar(doc, 'نرخ تکمیل وظایف', completionRate, 20, currentY, pageWidth - 40);
    currentY += 15;
    addProgressBar(doc, 'عادت‌های فعال', habitRate, 20, currentY, pageWidth - 40);
    currentY += 15;
    addProgressBar(doc, 'میانگین پیشرفت اهداف', state.goals.reduce((sum, g) => sum + g.progress, 0) / (state.goals.length || 1), 20, currentY, pageWidth - 40);
    currentY += 25;

    // ========== وظایف ==========
    if (state.tasks.length > 0) {
      if (currentY > pageHeight - 60) {
        doc.addPage();
        pageNumber++;
        addPageHeader(doc, pageWidth, pageNumber);
        currentY = 45;
      }

      currentY = addSection(doc, `وظایف (${state.tasks.length})`, currentY, pageWidth, '✅');

      // آمار وظایف
      const pendingTasks = totalTasks - completedTasks;
      const highPriority = state.tasks.filter(t => t.priority === 'high').length;
      const totalXP = state.tasks.filter(t => t.completed).reduce((sum, t) => sum + t.xpReward, 0);

      doc.setFontSize(10);
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      addPersianText(doc, `• انجام شده: ${completedTasks} | در انتظار: ${pendingTasks} | اولویت بالا: ${highPriority}`, pageWidth - 20, currentY);
      currentY += 6;
      addPersianText(doc, `• XP کسب شده: ${totalXP} | نرخ تکمیل: ${completionRate.toFixed(1)}%`, pageWidth - 20, currentY);
      currentY += 12;

      // دسته‌بندی وظایف
      const categoryLabels: { [key: string]: string } = {
        work: 'کار 💼',
        study: 'مطالعه 📚',
        health: 'سلامت 💪',
        personal: 'شخصی 👤',
        project: 'پروژه 🚀'
      };

      const tasksByCategory: { [key: string]: number } = {};
      state.tasks.forEach(task => {
        tasksByCategory[task.category] = (tasksByCategory[task.category] || 0) + 1;
      });

      doc.setFontSize(9);
      doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
      addPersianText(doc, 'توزیع دسته‌بندی:', pageWidth - 20, currentY);
      currentY += 6;

      Object.entries(tasksByCategory).forEach(([category, count]) => {
        const label = categoryLabels[category] || category;
        const percentage = (count / totalTasks) * 100;
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
        addPersianText(doc, `${label}: ${count} وظیفه (${percentage.toFixed(1)}%)`, pageWidth - 25, currentY);
        currentY += 5;
      });

      currentY += 8;

      // لیست وظایف (10 مورد اخیر)
      doc.setFontSize(8);
      doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
      addPersianText(doc, 'وظایف اخیر:', pageWidth - 20, currentY);
      currentY += 5;

      const recentTasks = state.tasks.slice(0, 10);
      recentTasks.forEach((task) => {
        if (currentY > pageHeight - 35) {
          addPageFooter(doc, pageWidth, pageHeight);
          doc.addPage();
          pageNumber++;
          addPageHeader(doc, pageWidth, pageNumber);
          currentY = 45;
        }

        const status = task.completed ? '✓' : '○';
        const priorityIcon = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
        
        doc.setFontSize(9);
        const color = task.completed ? COLORS.success : COLORS.text;
        doc.setTextColor(color[0], color[1], color[2]);
        addPersianText(doc, `${status} ${priorityIcon} ${task.title}`, pageWidth - 25, currentY);
        currentY += 5;
      });

      if (state.tasks.length > 10) {
        doc.setFontSize(8);
        doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
        addPersianText(doc, `... و ${state.tasks.length - 10} وظیفه دیگر`, pageWidth - 25, currentY);
        currentY += 5;
      }
    }

    currentY += 15;

    // ========== عادت‌ها ==========
    if (state.habits.length > 0) {
      if (currentY > pageHeight - 60) {
        addPageFooter(doc, pageWidth, pageHeight);
        doc.addPage();
        pageNumber++;
        addPageHeader(doc, pageWidth, pageNumber);
        currentY = 45;
      }

      currentY = addSection(doc, `عادت‌ها (${state.habits.length})`, currentY, pageWidth, '🔥');

      // آمار عادت‌ها
      const totalCompletions = state.habits.reduce((sum, h) => sum + h.completedDates.length, 0);
      const bestStreak = Math.max(...state.habits.map(h => h.longestStreak), 0);
      const avgStreak = state.habits.reduce((sum, h) => sum + h.currentStreak, 0) / (state.habits.length || 1);

      doc.setFontSize(10);
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      addPersianText(doc, `• عادت‌های فعال: ${activeHabits} | کل انجام‌ها: ${totalCompletions}`, pageWidth - 20, currentY);
      currentY += 6;
      addPersianText(doc, `• بهترین استریک: ${bestStreak} روز | میانگین استریک: ${avgStreak.toFixed(1)} روز`, pageWidth - 20, currentY);
      currentY += 12;

      // دسته‌بندی عادت‌ها
      const habitCategoryLabels: { [key: string]: string } = {
        health: 'سلامت 💪',
        fitness: 'ورزش 🏃',
        nutrition: 'تغذیه 🥗',
        productivity: 'بهره‌وری 📈',
        learning: 'یادگیری 📖',
        mindfulness: 'آرامش 🧘',
        social: 'اجتماعی 👥',
        creativity: 'خلاقیت 🎨',
        finance: 'مالی 💰',
        relationship: 'روابط ❤️'
      };

      const habitsByCategory: { [key: string]: number } = {};
      state.habits.forEach(habit => {
        habitsByCategory[habit.category] = (habitsByCategory[habit.category] || 0) + 1;
      });

      doc.setFontSize(9);
      doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
      addPersianText(doc, 'توزیع دسته‌بندی:', pageWidth - 20, currentY);
      currentY += 6;

      Object.entries(habitsByCategory).forEach(([category, count]) => {
        const label = habitCategoryLabels[category] || category;
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
        addPersianText(doc, `${label}: ${count} عادت`, pageWidth - 25, currentY);
        currentY += 5;
      });

      currentY += 8;

      // لیست عادت‌ها
      doc.setFontSize(8);
      doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
      addPersianText(doc, 'عادت‌های شما:', pageWidth - 20, currentY);
      currentY += 5;

      state.habits.forEach((habit) => {
        if (currentY > pageHeight - 35) {
          addPageFooter(doc, pageWidth, pageHeight);
          doc.addPage();
          pageNumber++;
          addPageHeader(doc, pageWidth, pageNumber);
          currentY = 45;
        }

        const status = habit.isActive ? '🔥' : '💤';
        const frequency = habit.frequency === 'daily' ? 'روزانه' : habit.frequency === 'weekly' ? 'هفتگی' : 'ماهانه';
        
        doc.setFontSize(9);
        const color = habit.isActive ? COLORS.primary : COLORS.textLight;
        doc.setTextColor(color[0], color[1], color[2]);
        addPersianText(doc, `${status} ${habit.title} - استریک: ${habit.currentStreak} روز (${frequency})`, pageWidth - 25, currentY);
        currentY += 5;
      });
    }

    currentY += 15;

    // ========== اهداف ==========
    if (state.goals.length > 0) {
      if (currentY > pageHeight - 60) {
        addPageFooter(doc, pageWidth, pageHeight);
        doc.addPage();
        pageNumber++;
        addPageHeader(doc, pageWidth, pageNumber);
        currentY = 45;
      }

      currentY = addSection(doc, `اهداف (${state.goals.length})`, currentY, pageWidth, '🎯');

      // آمار اهداف
      const completedGoals = state.goals.filter(g => g.status === 'completed').length;
      const activeGoals = state.goals.filter(g => g.status === 'active').length;
      const avgProgress = state.goals.reduce((sum, g) => sum + g.progress, 0) / (state.goals.length || 1);

      doc.setFontSize(10);
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      addPersianText(doc, `• تکمیل شده: ${completedGoals} | فعال: ${activeGoals} | متوقف شده: ${state.goals.length - completedGoals - activeGoals}`, pageWidth - 20, currentY);
      currentY += 6;
      addPersianText(doc, `• میانگین پیشرفت: ${avgProgress.toFixed(1)}%`, pageWidth - 20, currentY);
      currentY += 12;

      // لیست اهداف
      state.goals.forEach((goal) => {
        if (currentY > pageHeight - 35) {
          addPageFooter(doc, pageWidth, pageHeight);
          doc.addPage();
          pageNumber++;
          addPageHeader(doc, pageWidth, pageNumber);
          currentY = 45;
        }

        const statusIcon = goal.status === 'completed' ? '✓' : goal.status === 'active' ? '⏳' : '⏸';
        
        doc.setFontSize(9);
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
        addPersianText(doc, `${statusIcon} ${goal.title}`, pageWidth - 25, currentY);
        currentY += 4;
        
        addProgressBar(doc, '', goal.progress, 25, currentY, pageWidth - 50);
        currentY += 10;
      });
    }

    currentY += 15;

    // ========== برنامه‌ریزی ==========
    if (state.plans.length > 0) {
      if (currentY > pageHeight - 60) {
        addPageFooter(doc, pageWidth, pageHeight);
        doc.addPage();
        pageNumber++;
        addPageHeader(doc, pageWidth, pageNumber);
        currentY = 45;
      }

      currentY = addSection(doc, `برنامه‌های ${state.plans.length}`, currentY, pageWidth, '📅');

      const activePlans = state.plans.filter(p => p.status === 'active').length;
      const completedPlans = state.plans.filter(p => p.status === 'completed').length;

      doc.setFontSize(10);
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      addPersianText(doc, `• فعال: ${activePlans} | تکمیل شده: ${completedPlans}`, pageWidth - 20, currentY);
      currentY += 12;

      state.plans.slice(0, 8).forEach((plan) => {
        if (currentY > pageHeight - 35) {
          addPageFooter(doc, pageWidth, pageHeight);
          doc.addPage();
          pageNumber++;
          addPageHeader(doc, pageWidth, pageNumber);
          currentY = 45;
        }

        const typeIcon = '📅';
        
        doc.setFontSize(9);
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
        addPersianText(doc, `${typeIcon} ${plan.title} - ${plan.progress}%`, pageWidth - 25, currentY);
        currentY += 5;
      });
    }

    currentY += 15;

    // ========== جلسات تمرکز ==========
    if (state.focusSessions && state.focusSessions.length > 0) {
      if (currentY > pageHeight - 60) {
        addPageFooter(doc, pageWidth, pageHeight);
        doc.addPage();
        pageNumber++;
        addPageHeader(doc, pageWidth, pageNumber);
        currentY = 45;
      }

      currentY = addSection(doc, 'جلسات تمرکز', currentY, pageWidth, '⏱');

      const completedSessions = state.focusSessions.filter(s => s.completed).length;
      const totalFocusTime = state.focusSessions.reduce((sum, s) => sum + s.duration, 0);
      const avgDuration = totalFocusTime / (completedSessions || 1);

      doc.setFontSize(10);
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      addPersianText(doc, `• کل جلسات: ${completedSessions} | مجموع زمان: ${totalFocusTime} دقیقه`, pageWidth - 20, currentY);
      currentY += 6;
      addPersianText(doc, `• میانگین هر جلسه: ${avgDuration.toFixed(1)} دقیقه`, pageWidth - 20, currentY);
      currentY += 10;
    }

    currentY += 10;

    // ========== پاداش‌ها ==========
    if (state.rewards.length > 0) {
      if (currentY > pageHeight - 60) {
        addPageFooter(doc, pageWidth, pageHeight);
        doc.addPage();
        pageNumber++;
        addPageHeader(doc, pageWidth, pageNumber);
        currentY = 45;
      }

      currentY = addSection(doc, `پاداش‌ها (${state.rewards.length})`, currentY, pageWidth, '🎁');

      const claimedRewards = state.rewards.filter(r => r.status === 'claimed').length;
      const availableRewards = state.rewards.filter(r => r.status === 'available').length;
      const totalXPCost = 0;

      doc.setFontSize(10);
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      addPersianText(doc, `• دریافت شده: ${claimedRewards} | آماده دریافت: ${availableRewards}`, pageWidth - 20, currentY);
      currentY += 6;
      addPersianText(doc, `• XP صرف شده: ${totalXPCost}`, pageWidth - 20, currentY);
      currentY += 12;

      state.rewards.slice(0, 8).forEach((reward) => {
        if (currentY > pageHeight - 35) {
          addPageFooter(doc, pageWidth, pageHeight);
          doc.addPage();
          pageNumber++;
          addPageHeader(doc, pageWidth, pageNumber);
          currentY = 45;
        }

        const statusText = reward.status === 'claimed' ? '✓ دریافت شده' : reward.status === 'available' ? '⭐ آماده' : '🔒 قفل';
        
        doc.setFontSize(9);
        const color = reward.status === 'claimed' ? COLORS.success : COLORS.text;
        doc.setTextColor(color[0], color[1], color[2]);
        addPersianText(doc, `${statusText} ${reward.title}`, pageWidth - 25, currentY);
        currentY += 5;
      });
    }

    currentY += 15;

    // ========== دستاوردها ==========
    if (state.achievements.length > 0) {
      if (currentY > pageHeight - 60) {
        addPageFooter(doc, pageWidth, pageHeight);
        doc.addPage();
        pageNumber++;
        addPageHeader(doc, pageWidth, pageNumber);
        currentY = 45;
      }

      currentY = addSection(doc, 'دستاوردها', currentY, pageWidth, '🏆');

      const unlockedAchievements = state.achievements.filter(a => a.unlocked).length;
      const totalAchievementXP = state.achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0);

      doc.setFontSize(10);
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      addPersianText(doc, `• باز شده: ${unlockedAchievements} از ${state.achievements.length}`, pageWidth - 20, currentY);
      currentY += 6;
      addPersianText(doc, `• XP کسب شده: ${totalAchievementXP}`, pageWidth - 20, currentY);
      currentY += 12;

      const unlockedList = state.achievements.filter(a => a.unlocked);
      unlockedList.forEach((achievement) => {
        if (currentY > pageHeight - 35) {
          addPageFooter(doc, pageWidth, pageHeight);
          doc.addPage();
          pageNumber++;
          addPageHeader(doc, pageWidth, pageNumber);
          currentY = 45;
        }

        doc.setFontSize(9);
        doc.setTextColor(COLORS.warning[0], COLORS.warning[1], COLORS.warning[2]);
        addPersianText(doc, `🏆 ${achievement.title} (+${achievement.xpReward} XP)`, pageWidth - 25, currentY);
        currentY += 5;
      });
    }

    // ========== صفحه خلاصه نهایی ==========
    addPageFooter(doc, pageWidth, pageHeight);
    doc.addPage();
    pageNumber++;
    addPageHeader(doc, pageWidth, pageNumber);
    currentY = 45;

    currentY = addSection(doc, 'خلاصه نهایی', currentY, pageWidth, '📈');

    // جمع‌بندی کلی
    const completedGoals = state.goals.filter(g => g.status === 'completed').length;
    const activeGoals = state.goals.filter(g => g.status === 'active').length;
    const unlockedAchievements = state.achievements.filter(a => a.unlocked).length;
    const claimedRewards = state.rewards.filter(r => r.status === 'claimed').length;

    doc.setFontSize(11);
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    addPersianText(doc, 'عملکرد کلی شما در Deep Breath:', pageWidth - 20, currentY);
    currentY += 10;

    const summaryStats = [
      { icon: '✅', label: 'وظایف تکمیل شده', value: completedTasks },
      { icon: '🔥', label: 'عادت‌های فعال', value: activeHabits },
      { icon: '🎯', label: 'اهداف در حال انجام', value: activeGoals },
      { icon: '⚡', label: 'مجموع XP', value: state.user.xp },
      { icon: '🏆', label: 'دستاوردهای باز شده', value: unlockedAchievements },
      { icon: '🎁', label: 'پاداش‌های دریافتی', value: claimedRewards }
    ];

    summaryStats.forEach((stat) => {
      doc.setFontSize(10);
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      addPersianText(doc, `${stat.icon} ${stat.label}: ${stat.value}`, pageWidth - 25, currentY);
      currentY += 7;
    });

    currentY += 10;

    // پیام انگیزشی
    doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
    doc.roundedRect(20, currentY, pageWidth - 40, 30, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    addPersianText(doc, '💪 با Deep Breath، هر روز بهتر از دیروز!', pageWidth / 2, currentY + 12, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    addPersianText(doc, 'به مسیر رشد و پیشرفت خود ادامه دهید', pageWidth / 2, currentY + 20, { align: 'center' });

    // فوتر صفحه آخر
    addPageFooter(doc, pageWidth, pageHeight);

    // ذخیره فایل
    const fileName = `DeepBreath-Report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
    doc.save(fileName);
    
    toast.success('✅ گزارش جامع با موفقیت ذخیره شد!', {
      description: `فایل "${fileName}" آماده است`,
      duration: 4000
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('❌ خطا در تولید گزارش PDF', {
      description: 'لطفاً دوباره تلاش کنید'
    });
  }
};
