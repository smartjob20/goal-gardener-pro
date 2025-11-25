import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Haptic feedback utility for premium mobile UX
 */

export const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'): Promise<void> => {
  try {
    switch (type) {
      case 'light':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'success':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case 'warning':
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      case 'error':
        await Haptics.notification({ type: NotificationType.Error });
        break;
    }
  } catch (error) {
    // Haptics might not be available on all platforms
    console.log('Haptics not available:', error);
  }
};

/**
 * Breathing haptic pattern for milestone celebrations
 */
export const breathingHaptic = async (): Promise<void> => {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
    setTimeout(async () => {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }, 300);
    setTimeout(async () => {
      await Haptics.impact({ style: ImpactStyle.Light });
    }, 600);
  } catch (error) {
    console.log('Haptics not available:', error);
  }
};
