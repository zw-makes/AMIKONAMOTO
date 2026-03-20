export const updateWidgetData = async (message) => {
  try {
    let syncKey = localStorage.getItem('subtrack_widget_sync_key');
    if (!syncKey) {
        syncKey = 'subtrack_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('subtrack_widget_sync_key', syncKey);
    }

    // Using a free anonymous bucket
    const bucketId = 'yvG6nQZQ6XbZQK3Z2X7h7X'; 
    
    await fetch(`https://kvdb.io/${bucketId}/${syncKey}`, {
        method: 'POST',
        body: message
    });
    
    console.log('[Widget] Data synced successfully:', message, ' | Key:', syncKey);
  } catch (err) {
    console.error('[Widget] Failed to sync data:', err);
  }
};

window.getWidgetSyncKey = () => localStorage.getItem('subtrack_widget_sync_key');
