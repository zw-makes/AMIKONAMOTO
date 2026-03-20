/* 
 * SubTrack Widget Bridge (JS Side)
 * This handles communicating with your native iOS widget. 
 */
import { registerPlugin } from '@capacitor/core';

// Define the native bridge interface
const AppGroupManager = registerPlugin('AppGroupManager');

/**
 * Updates the Home Screen Widget with the current Grand Total.
 * @param {string} amount - The formatted total amount (e.g. "$123.45")
 */
export const updateWidgetTotal = async (amount) => {
    try {
        await AppGroupManager.saveTotal({ total: amount });
        console.log('Widget updated successfully: ', amount);
    } catch (err) {
        console.error('Failed to update Widget: ', err);
    }
};
