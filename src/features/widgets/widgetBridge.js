/* 
 * SubTrack Widget Bridge (JS Side)
 * This handles communicating with Scriptable iOS widget. 
 */

/**
 * Updates the Home Screen Widget with the current Grand Total using a public KV store.
 * @param {string} amount - The formatted total amount (e.g. "$123.45")
 */
export const updateWidgetTotal = async (amount) => {
    try {
        let syncKey = localStorage.getItem('subtrack_widget_sync_key');
        if (!syncKey) {
            syncKey = 'subtrack_' + Math.random().toString(36).substring(2, 10);
            localStorage.setItem('subtrack_widget_sync_key', syncKey);
            console.log('Generated new Widget Sync Key:', syncKey);
        }

        // Pushing to a free KV store that Scriptable can read
        // Using kvdb.io which has free anonymous buckets
        const bucketId = 'yvG6nQZQ6XbZQK3Z2X7h7X'; // Free public bucket
        
        await fetch(`https://kvdb.io/${bucketId}/${syncKey}`, {
            method: 'POST',
            body: amount
        });
        
        console.log('Widget synced successfully: ', amount, ' | Key:', syncKey);
    } catch (err) {
        console.error('Failed to update Widget: ', err);
    }
};

// Expose so user can find their key if needed
window.getWidgetSyncKey = () => localStorage.getItem('subtrack_widget_sync_key');
