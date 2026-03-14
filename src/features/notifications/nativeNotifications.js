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
                        id: Math.floor(Math.random() * 100000),
                        schedule: { at: new Date(Date.now() + 1000) }, // Back to 1s for better UX now that it works
                        sound: null,
                    }
                ]
            });
            console.log('[NativeNotif] Test notification scheduled');
        } catch (e) {
            console.error('[NativeNotif] Failed to schedule test notification:', e);
            alert('Error: ' + e.message);
        }
    },

    /**
     * Cancel all existing scheduled notifications
     */
    async cancelAll() {
        try {
            const pending = await LocalNotifications.getPending();
            if (pending.notifications.length > 0) {
                await LocalNotifications.cancel(pending);
                console.log(`[NativeNotif] Cancelled ${pending.notifications.length} pending notifications`);
            }
        } catch (e) {
            console.error('[NativeNotif] Failed to cancel notifications:', e);
        }
    },

    /**
     * Schedule multiple reminders at once
     * @param {Array} reminders - Array of { title, body, date, id }
     */
    async scheduleReminders(reminders) {
        if (reminders.length === 0) return;

        const hasPermission = await this.requestPermissions();
        if (!hasPermission) return;

        try {
            // Cancel old ones first to avoid duplicates
            await this.cancelAll();

            const notifications = reminders.map(r => ({
                id: r.id || Math.floor(Math.random() * 1000000),
                title: r.title,
                body: r.body,
                schedule: { at: r.date },
                sound: null,
            }));

            await LocalNotifications.schedule({ notifications });
            console.log(`[NativeNotif] Scheduled ${notifications.length} native reminders`);
        } catch (e) {
            console.error('[NativeNotif] Failed to schedule reminders:', e);
        }
    }
};

// Also expose as window for easier debugging
window.NativeNotifications = NativeNotifications;
