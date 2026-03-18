import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * HapticsService - Standardized haptic feedback for SubTrack
 */
export const HapticsService = {
  // Light impact (for small UI interactions, switches, micro-taps)
  light: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Fallback to web vibration if supported
      if (navigator.vibrate) navigator.vibrate(10);
    }
  },

  // Medium impact (for modal openings, toggling important states)
  medium: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate(20);
    }
  },

  // Heavy impact (for deletions or destructive actions)
  heavy: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate([30, 10, 30]);
    }
  },

  // Selection change (tick feeling when scrolling or filtering)
  selection: async () => {
    try {
      await Haptics.selectionChanged();
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate(5);
    }
  },

  // Success notification (Double tap feeling for completed actions)
  success: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate([15, 30, 15]);
    }
  },

  // Warning notification
  warning: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate([50, 20, 50]);
    }
  },

  // Error notification
  error: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  }
};

// Global expose for non-module files
window.HapticsService = HapticsService; 
