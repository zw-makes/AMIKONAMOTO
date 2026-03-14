import { LocalNotifications } from '@capacitor/local-notifications';

const NATIVE_NOTIF_ID_KEY = 'native_notif_ids';

/**
 * Native Bridge for Subscription Reminders
 * Ensures notifications work even when the app is closed.
 */
async function initNativeBridge() {
    console.log('[NativeBridge] Initializing...');

    // 1. Request Permissions on Startup
    try {
        const permission = await LocalNotifications.checkPermissions();
        if (permission.display !== 'granted') {
            await LocalNotifications.requestPermissions();
        }
    } catch (e) {
        console.warn('[NativeBridge] Permissions error (likely not on a native device):', e);
    }

    // 2. Wrap the global addNotification function
    const originalAddNotification = window.addNotification;

    window.addNotification = async function (notif) {
        // Call the original in-app notification logic first
        if (originalAddNotification) {
            await originalAddNotification(notif);
        }

        // Only schedule native alerts for 'warning' types (reminders)
        if (notif.type !== 'warning') return;

        // Try to extract date from key: remind-payment-123-2026-03-14
        const parts = notif.key ? notif.key.split('-') : [];
        if (parts.length >= 4) {
            const dateStr = parts.slice(-3).join('-'); // YYYY-MM-DD
            const scheduleDate = new Date(dateStr);
            
            // Try to get preferred time from profile, default to 9 AM
            let preferredHour = 9;
            const profileStr = localStorage.getItem(`profile_${window.currentUser?.id}`);
            if (profileStr) {
                try {
                    const profile = JSON.parse(profileStr);
                    if (profile?.settings?.notificationTime !== undefined) {
                        preferredHour = parseInt(profile.settings.notificationTime);
                    }
                } catch (e) { }
            }

            // Set alert time to preferred hour on the target day
            scheduleDate.setHours(preferredHour, 0, 0, 0);

            // If the date is in the past, don't schedule
            if (scheduleDate.getTime() <= Date.now()) return;

            await scheduleNativeAlert(notif, scheduleDate);
        }
    };
}

async function scheduleNativeAlert(notif, date) {
    try {
        console.log(`[NativeBridge] Scheduling native alert for ${notif.title} on ${date}`);
        
        // Generate a unique numeric ID for Capacitor
        const id = Math.floor(Math.random() * 1000000);

        await LocalNotifications.schedule({
            notifications: [
                {
                    title: notif.title,
                    body: notif.text,
                    id: id,
                    schedule: { at: date },
                    sound: 'default',
                    attachments: notif.domain ? [{ id: 'logo', url: `https://icon.horse/icon/${notif.domain}` }] : [],
                    extra: { key: notif.key }
                }
            ]
        });
    } catch (e) {
        console.error('[NativeBridge] Failed to schedule alert:', e);
    }
}

// Global helper to test notifications
window.testNativeNotification = async function () {
    console.log('[NativeBridge] Test notification button clicked');
    if (window.showToast) window.showToast('Scheduling test... ⏳');

    try {
        const testDate = new Date(Date.now() + 30000); // 30 seconds from now
        await LocalNotifications.schedule({
            notifications: [
                {
                    title: "SubTrack Test 🚀",
                    body: "This is a real native notification! It works even if you close the app.",
                    id: 999123,
                    schedule: { at: testDate },
                    sound: 'default'
                }
            ]
        });

        const msg = "Success! Notification set for 30 seconds from now.\n\nIMPORTANT: Do NOT turn off your phone. Just close the app and wait.";
        console.log('[NativeBridge] ' + msg);
        alert(msg);
    } catch (e) {
        console.error('[NativeBridge] Test failed:', e);
        const errorMsg = "Native test failed. Are you sure you are on a real iPhone?";
        if (window.showToast) window.showToast(errorMsg, 'error');
        alert(errorMsg + "\n\nError: " + e.message);
    }
};

// Auto-init if window exists
if (typeof window !== 'undefined') {
    // Wait for main.js to define addNotification if it hasn't yet
    const checkInterval = setInterval(() => {
        if (window.addNotification) {
            clearInterval(checkInterval);
            initNativeBridge();
        }
    }, 500);
}
