import { registerPlugin } from '@capacitor/core';

const WidgetBridge = registerPlugin('WidgetBridge');

export const updateWidgetData = async (message) => {
  try {
    // Sync data to the shared App Group container
    await WidgetBridge.setItem({
      key: 'widgetMessage',
      value: message,
      group: 'group.com.amikonamoto.app'
    });
    
    // Refresh the widget to show the new data
    await WidgetBridge.reloadAllTimelines();
    
    console.log('[Widget] Data synced successfully:', message);
  } catch (err) {
    console.error('[Widget] Failed to sync data:', err);
  }
};
