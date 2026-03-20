import Foundation
import Capacitor
import WidgetKit

/**
 * AppGroupManager Plugin
 * This bridges the gap between your JS code and the iOS Widget.
 */
@objc(AppGroupManager)
public class AppGroupManager: CAPPlugin {
    // This MUST match the App Group ID you'll set up in Apple's portal
    let appGroupID = "group.com.subtrack.app"
    
    @objc func saveTotal(_ call: CAPPluginCall) {
        guard let total = call.getString("total") else {
            call.reject("Must provide a total amount.")
            return
        }
        
        // Write to Shared UserDefaults
        if let sharedDefaults = UserDefaults(suiteName: appGroupID) {
            sharedDefaults.set(total, forKey: "grandTotal")
            sharedDefaults.synchronize()
            
            // This forces the home screen widget to reload immediately
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
            
            call.resolve([
                "message": "Total saved to Widget: \(total)"
            ])
        } else {
            call.reject("Could not access Shared App Group.")
        }
    }
}
