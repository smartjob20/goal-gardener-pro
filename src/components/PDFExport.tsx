import jsPDF from 'jspdf';
import { AppState } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

// راست‌چین کردن متن فارسی در PDF
const addPersianText = (doc: jsPDF, text: string, x: number, y: number, options?: any) => {
  doc.text(text.split('').reverse().join(''), x, y, { align: 'right', ...options });
};

export const generatePDFReport = async (state: AppState) => {
  try {
    toast.info('در حال ایجاد گزارش PDF...');
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let currentY = margin;

    // عنوان اصلی
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246);
    addPersianText(doc, 'گزارش جامع عملکرد', pageWidth - margin, currentY);
    
    currentY += 10;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    addPersianText(doc, `تاریخ: ${format(new Date(), 'yyyy/MM/dd')}`, pageWidth - margin, currentY);
    
    currentY += 15;

    // خط جداکننده
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;

    // اطلاعات کاربر
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    addPersianText(doc, 'اطلاعات کاربر', pageWidth - margin, currentY);
    currentY += 8;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    addPersianText(doc, `نام: ${state.user.name}`, pageWidth - margin, currentY);
    currentY += 6;
    addPersianText(doc, `سطح: ${state.user.level}`, pageWidth - margin, currentY);
    currentY += 6;
    addPersianText(doc, `XP: ${state.user.xp}`, pageWidth - margin, currentY);
    currentY += 6;
    addPersianText(doc, `تعداد وظایف تکمیل شده: ${state.user.totalTasksCompleted}`, pageWidth - margin, currentY);
    currentY += 6;
    addPersianText(doc, `مجموع زمان تمرکز: ${state.user.totalFocusTime} دقیقه`, pageWidth - margin, currentY);
    currentY += 6;
    addPersianText(doc, `بهترین استریک: ${state.user.longestStreak} روز`, pageWidth - margin, currentY);
    
    currentY += 15;

    // وظایف
    if (state.tasks.length > 0) {
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = margin;
      }

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      addPersianText(doc, `وظایف (${state.tasks.length})`, pageWidth - margin, currentY);
      currentY += 8;

      const completedTasks = state.tasks.filter(t => t.completed).length;
      const pendingTasks = state.tasks.length - completedTasks;
      
      doc.setFontSize(11);
      addPersianText(doc, `تکمیل شده: ${completedTasks}`, pageWidth - margin, currentY);
      currentY += 6;
      addPersianText(doc, `در انتظار: ${pendingTasks}`, pageWidth - margin, currentY);
      currentY += 6;
      addPersianText(doc, `نرخ تکمیل: ${((completedTasks / state.tasks.length) * 100).toFixed(1)}%`, pageWidth - margin, currentY);
      currentY += 10;

      // لیست وظایف (5 مورد اول)
      doc.setFontSize(10);
      const tasksToShow = state.tasks.slice(0, 5);
      tasksToShow.forEach((task, index) => {
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = margin;
        }
        const status = task.completed ? '✓' : '○';
        addPersianText(doc, `${status} ${task.title}`, pageWidth - margin - 5, currentY);
        currentY += 6;
      });

      if (state.tasks.length > 5) {
        addPersianText(doc, `... و ${state.tasks.length - 5} وظیفه دیگر`, pageWidth - margin - 5, currentY);
        currentY += 6;
      }
    }

    currentY += 10;

    // عادت‌ها
    if (state.habits.length > 0) {
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = margin;
      }

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      addPersianText(doc, `عادت‌ها (${state.habits.length})`, pageWidth - margin, currentY);
      currentY += 8;

      const activeHabits = state.habits.filter(h => h.isActive).length;
      const totalCompletions = state.habits.reduce((sum, h) => sum + h.completedDates.length, 0);
      const bestStreak = Math.max(...state.habits.map(h => h.longestStreak), 0);

      doc.setFontSize(11);
      addPersianText(doc, `عادت‌های فعال: ${activeHabits}`, pageWidth - margin, currentY);
      currentY += 6;
      addPersianText(doc, `مجموع انجام عادت: ${totalCompletions}`, pageWidth - margin, currentY);
      currentY += 6;
      addPersianText(doc, `بهترین استریک: ${bestStreak} روز`, pageWidth - margin, currentY);
      currentY += 10;

      // لیست عادت‌ها (5 مورد اول)
      doc.setFontSize(10);
      const habitsToShow = state.habits.slice(0, 5);
      habitsToShow.forEach((habit, index) => {
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = margin;
        }
        addPersianText(doc, `${habit.title} - استریک: ${habit.currentStreak} روز`, pageWidth - margin - 5, currentY);
        currentY += 6;
      });

      if (state.habits.length > 5) {
        addPersianText(doc, `... و ${state.habits.length - 5} عادت دیگر`, pageWidth - margin - 5, currentY);
        currentY += 6;
      }
    }

    currentY += 10;

    // اهداف
    if (state.goals.length > 0) {
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = margin;
      }

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      addPersianText(doc, `اهداف (${state.goals.length})`, pageWidth - margin, currentY);
      currentY += 8;

      const completedGoals = state.goals.filter(g => g.status === 'completed').length;
      const activeGoals = state.goals.filter(g => g.status === 'active').length;
      const avgProgress = state.goals.reduce((sum, g) => sum + g.progress, 0) / state.goals.length;

      doc.setFontSize(11);
      addPersianText(doc, `تکمیل شده: ${completedGoals}`, pageWidth - margin, currentY);
      currentY += 6;
      addPersianText(doc, `فعال: ${activeGoals}`, pageWidth - margin, currentY);
      currentY += 6;
      addPersianText(doc, `میانگین پیشرفت: ${avgProgress.toFixed(1)}%`, pageWidth - margin, currentY);
      currentY += 10;

      // لیست اهداف (5 مورد اول)
      doc.setFontSize(10);
      const goalsToShow = state.goals.slice(0, 5);
      goalsToShow.forEach((goal, index) => {
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = margin;
        }
        addPersianText(doc, `${goal.title} - ${goal.progress}%`, pageWidth - margin - 5, currentY);
        currentY += 6;
      });

      if (state.goals.length > 5) {
        addPersianText(doc, `... و ${state.goals.length - 5} هدف دیگر`, pageWidth - margin - 5, currentY);
        currentY += 6;
      }
    }

    currentY += 10;

    // برنامه‌ها
    if (state.plans.length > 0) {
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = margin;
      }

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      addPersianText(doc, `برنامه‌ها (${state.plans.length})`, pageWidth - margin, currentY);
      currentY += 8;

      const activePlans = state.plans.filter(p => p.status === 'active').length;
      const completedPlans = state.plans.filter(p => p.status === 'completed').length;

      doc.setFontSize(11);
      addPersianText(doc, `فعال: ${activePlans}`, pageWidth - margin, currentY);
      currentY += 6;
      addPersianText(doc, `تکمیل شده: ${completedPlans}`, pageWidth - margin, currentY);
      currentY += 10;

      // لیست برنامه‌ها (5 مورد اول)
      doc.setFontSize(10);
      const plansToShow = state.plans.slice(0, 5);
      plansToShow.forEach((plan, index) => {
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = margin;
        }
        addPersianText(doc, `${plan.title} - ${plan.progress}%`, pageWidth - margin - 5, currentY);
        currentY += 6;
      });

      if (state.plans.length > 5) {
        addPersianText(doc, `... و ${state.plans.length - 5} برنامه دیگر`, pageWidth - margin - 5, currentY);
        currentY += 6;
      }
    }

    currentY += 10;

    // پاداش‌ها
    if (state.rewards.length > 0) {
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = margin;
      }

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      addPersianText(doc, `پاداش‌ها (${state.rewards.length})`, pageWidth - margin, currentY);
      currentY += 8;

      const claimedRewards = state.rewards.filter(r => r.status === 'claimed').length;
      const availableRewards = state.rewards.filter(r => r.status === 'available').length;

      doc.setFontSize(11);
      addPersianText(doc, `دریافت شده: ${claimedRewards}`, pageWidth - margin, currentY);
      currentY += 6;
      addPersianText(doc, `آماده دریافت: ${availableRewards}`, pageWidth - margin, currentY);
      currentY += 10;

      // لیست پاداش‌ها (5 مورد اول)
      doc.setFontSize(10);
      const rewardsToShow = state.rewards.slice(0, 5);
      rewardsToShow.forEach((reward, index) => {
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = margin;
        }
        const statusText = reward.status === 'claimed' ? 'دریافت شده' : reward.status === 'available' ? 'آماده' : 'قفل';
        addPersianText(doc, `${reward.title} - ${statusText}`, pageWidth - margin - 5, currentY);
        currentY += 6;
      });

      if (state.rewards.length > 5) {
        addPersianText(doc, `... و ${state.rewards.length - 5} پاداش دیگر`, pageWidth - margin - 5, currentY);
        currentY += 6;
      }
    }

    currentY += 10;

    // دستاوردها
    if (state.achievements.length > 0) {
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = margin;
      }

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      addPersianText(doc, 'دستاوردها', pageWidth - margin, currentY);
      currentY += 8;

      const unlockedAchievements = state.achievements.filter(a => a.unlocked).length;
      const totalXP = state.achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0);

      doc.setFontSize(11);
      addPersianText(doc, `باز شده: ${unlockedAchievements} از ${state.achievements.length}`, pageWidth - margin, currentY);
      currentY += 6;
      addPersianText(doc, `XP کسب شده از دستاوردها: ${totalXP}`, pageWidth - margin, currentY);
      currentY += 10;

      // لیست دستاوردهای باز شده
      doc.setFontSize(10);
      const unlockedList = state.achievements.filter(a => a.unlocked);
      unlockedList.forEach((achievement, index) => {
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = margin;
        }
        addPersianText(doc, `✓ ${achievement.title}`, pageWidth - margin - 5, currentY);
        currentY += 6;
      });
    }

    // فوتر
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      addPersianText(doc, `صفحه ${i} از ${totalPages}`, pageWidth - margin, pageHeight - 10);
      addPersianText(doc, 'TimeManager Pro - گزارش جامع عملکرد', pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // ذخیره فایل
    const fileName = `گزارش-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.pdf`;
    doc.save(fileName);
    
    toast.success('گزارش PDF با موفقیت ذخیره شد! 📄');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('خطا در ایجاد گزارش PDF');
  }
};
