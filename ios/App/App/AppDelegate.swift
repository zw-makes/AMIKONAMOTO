import UIKit
import Capacitor
import SwiftUI

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        
        // Wait for the window to be ready, then inject SwiftUI Bottom Bar
        DispatchQueue.main.async {
            var bridgeVC: CAPBridgeViewController? = self.window?.rootViewController as? CAPBridgeViewController
            
            // If it's inside a Nav Controller, find the bridge
            if bridgeVC == nil {
                if let nav = self.window?.rootViewController as? UINavigationController {
                    bridgeVC = nav.viewControllers.first as? CAPBridgeViewController
                }
            }

            if let bridge = bridgeVC {
                let bottomBarView = BottomBarView(bridge: bridge)
                let hostingController = UIHostingController(rootView: bottomBarView)
                
                // Set background to clear so we only see the bar
                hostingController.view.backgroundColor = .clear
                
                // Add as child
                rootVC.addChild(hostingController)
                rootVC.view.addSubview(hostingController.view)
                hostingController.didMove(toParent: rootVC)
                
                // Layout constraints for the bottom bar
                hostingController.view.translatesAutoresizingMaskIntoConstraints = false
                NSLayoutConstraint.activate([
                    hostingController.view.leadingAnchor.constraint(equalTo: rootVC.view.leadingAnchor),
                    hostingController.view.trailingAnchor.constraint(equalTo: rootVC.view.trailingAnchor),
                    hostingController.view.bottomAnchor.constraint(equalTo: rootVC.view.bottomAnchor),
                    hostingController.view.heightAnchor.constraint(equalToConstant: 120) // Adjust height as needed
                ])
            }
        }
        
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

// --- NATIVE LIQUID GLASS BOTTOM BAR ---
struct BottomBarView: View {
    @Namespace private var glassNamespace
    var bridge: CAPBridgeViewController?

    var body: some View {
        VStack {
            Spacer()
            
            GlassEffectContainer(spacing: 12) {
                HStack(spacing: 0) {
                    FeatureButton(icon: "magnifyingglass", action: "document.getElementById('search-btn').click()", bridge: bridge)
                    FeatureButton(icon: "list.bullet", action: "window.toggleListView()", bridge: bridge)
                    FeatureButton(icon: "star", action: "document.getElementById('star-mode-btn').click()", bridge: bridge)
                    FeatureButton(text: "S", action: "document.getElementById('ai-analyst-btn').click()", bridge: bridge)
                }
                .padding(.horizontal, 8)
                .frame(height: 60)
                .glassEffect(.regular, in: .rect(cornerRadius: 20))
                .glassEffectID("main-dock", in: glassNamespace)
                .interactive()
                
                Button(action: {
                    bridge?.webView?.evaluateJavaScript("document.getElementById('add-sub-btn').click()", completionHandler: nil)
                    if let haptics = bridge?.webView?.evaluateJavaScript("window.HapticsService.medium()", completionHandler: nil) {}
                }) {
                    Image(systemName: "plus")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.black)
                        .frame(width: 60, height: 60)
                        .background(Color.white)
                        .cornerRadius(20)
                }
                .glassEffectUnion(id: "main-dock", in: glassNamespace)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 20)
        }
        .edgesIgnoringSafeArea(.bottom)
    }
}

struct FeatureButton: View {
    var icon: String? = nil
    var text: String? = nil
    var action: String
    var bridge: CAPBridgeViewController?
    
    var body: some View {
        Button(action: {
            bridge?.webView?.evaluateJavaScript(action, completionHandler: nil)
            // Optional: Trigger a light haptic pulse
            bridge?.webView?.evaluateJavaScript("window.HapticsService.light()", completionHandler: nil)
        }) {
            Group {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 22))
                } else if let text = text {
                    Text(text)
                        .font(.system(size: 22, weight: .black))
                }
            }
            .foregroundColor(.white.opacity(0.85))
            .frame(maxWidth: .infinity)
            .frame(height: 50)
        }
    }
}
