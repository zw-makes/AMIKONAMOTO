import { LocalNotifications } from '@capacitor/local-notifications';

/**
 * Native Notification Service
 * Specifically for iOS/Android native alerts
 */
export const NativeNotifications = {
    /**
     * Request permissions from the user
     * Must be called before scheduling anything
     */
    async requestPermissions() {
        try {
            const status = await LocalNotifications.requestPermissions();
            console.log('[NativeNotif] Permission status:', status);
            return status.display === 'granted';
        } catch (e) {
            console.error('[NativeNotif] Failed to request permissions:', e);
            return false;
        }
    },

    /**
     * Send an immediate test notification
     */
    async sendTestNotification() {
        const hasPermission = await this.requestPermissions();
        
        if (!hasPermission) {
            alert('Please enable notifications in your iPhone settings to test this feature!');
            return;
        }

        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: "🚀 Test Notification",
                        body: "If you see this, the iOS Bridge is working perfectly! SubTrack is ready for native alerts.",
                        id: 1,
                        schedule: { at: new Date(Date.now() + 1000) }, // 1 second delay
                        sound: null,
                        attachments: null,
                        actionTypeId: "",
                        extra: null
                    }
                ]
            });
            console.log('[NativeNotif] Test notification scheduled');
        } catch (e) {
            console.error('[NativeNotif] Failed to schedule test notification:', e);
            alert('Error: ' + e.message);
        }
    }
};

// Also expose as window for easier debugging
window.NativeNotifications = NativeNotifications;
