import UIKit
import Capacitor
import SwiftUI

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var didInjectBottomBar = false

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        
        // Inject SwiftUI Bottom Bar once the real root VC exists (storyboard/Capacitor can set it after launch).
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(tryInjectBottomBar),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )
        DispatchQueue.main.async { [weak self] in self?.tryInjectBottomBar() }
        
        return true
    }

    @objc private func tryInjectBottomBar() {
        guard !didInjectBottomBar else { return }
        guard let window = resolvedWindow() else { return }
        guard let rootViewController = window.rootViewController else { return }
        guard let bridgeVC = findBridgeViewController(in: rootViewController) else { return }

        // Host on the root container so it's visible even if the bridge is embedded (nav/tab/etc).
        let hostVC = rootViewController
        let bottomBarView = BottomBarView(bridge: bridgeVC)
        let hostingController = UIHostingController(rootView: bottomBarView)
        hostingController.view.backgroundColor = .clear

        hostVC.addChild(hostingController)
        hostVC.view.addSubview(hostingController.view)
        hostingController.didMove(toParent: hostVC)

        hostingController.view.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            hostingController.view.leadingAnchor.constraint(equalTo: hostVC.view.leadingAnchor),
            hostingController.view.trailingAnchor.constraint(equalTo: hostVC.view.trailingAnchor),
            hostingController.view.bottomAnchor.constraint(equalTo: hostVC.view.safeAreaLayoutGuide.bottomAnchor),
            hostingController.view.heightAnchor.constraint(equalToConstant: 120)
        ])

        didInjectBottomBar = true
    }

    private func resolvedWindow() -> UIWindow? {
        if let window { return window }
        return UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first(where: { $0.isKeyWindow })
    }

    private func findBridgeViewController(in root: UIViewController) -> CAPBridgeViewController? {
        if let bridge = root as? CAPBridgeViewController { return bridge }
        if let nav = root as? UINavigationController {
            for vc in nav.viewControllers {
                if let found = findBridgeViewController(in: vc) { return found }
            }
        }
        if let tab = root as? UITabBarController {
            for vc in tab.viewControllers ?? [] {
                if let found = findBridgeViewController(in: vc) { return found }
            }
        }
        if let presented = root.presentedViewController, let found = findBridgeViewController(in: presented) {
            return found
        }
        for child in root.children {
            if let found = findBridgeViewController(in: child) { return found }
        }
        return nil
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
    var bridge: CAPBridgeViewController?

    var body: some View {
        VStack {
            Spacer()
            
            HStack(spacing: 12) {
                // Main Feature Dock
                dock
                
                // Add Button
                addButton
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 20)
        }
    }

    @ViewBuilder
    private var dock: some View {
        let content = HStack(spacing: 0) {
            FeatureButton(icon: "magnifyingglass", action: "document.getElementById('search-btn').click()", bridge: bridge)
            FeatureButton(icon: "list.bullet", action: "window.toggleListView()", bridge: bridge)
            FeatureButton(icon: "star", action: "document.getElementById('star-mode-btn').click()", bridge: bridge)
            FeatureButton(assetImageName: "SublifyLogo", action: "document.getElementById('ai-analyst-btn').click()", bridge: bridge)
        }
        .padding(.horizontal, 8)
        .frame(height: 60)

        if #available(iOS 26.0, *) {
            GlassEffectContainer {
                content
                    .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            }
        } else {
            content
                .background(NativeBlurView(style: .systemUltraThinMaterial))
                .cornerRadius(20)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color.white.opacity(0.15), lineWidth: 0.5)
                )
                .shadow(color: Color.black.opacity(0.4), radius: 25, x: 0, y: 15)
        }
    }

    @ViewBuilder
    private var addButton: some View {
        let action = {
            bridge?.webView?.evaluateJavaScript("document.getElementById('add-sub-btn').click()", completionHandler: nil)
            bridge?.webView?.evaluateJavaScript("window.HapticsService.medium()", completionHandler: nil)
        }

        if #available(iOS 26.0, *) {
            Button(action: action) {
                Image(systemName: "plus")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundStyle(.black.opacity(0.85))
                    .frame(width: 60, height: 60)
            }
            .glassEffect(.clear.tint(.white.opacity(0.85)), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .stroke(.white.opacity(0.38), lineWidth: 1)
            )
        } else {
            Button(action: action) {
                Image(systemName: "plus")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(.black)
                    .frame(width: 60, height: 60)
                    .background(Color.white)
                    .cornerRadius(20)
                    .shadow(color: Color.white.opacity(0.2), radius: 10)
            }
        }
    }
}

// Failsafe Native Blur Engine
struct NativeBlurView: UIViewRepresentable {
    var style: UIBlurEffect.Style
    func makeUIView(context: Context) -> UIVisualEffectView {
        return UIVisualEffectView(effect: UIBlurEffect(style: style))
    }
    func updateUIView(_ uiView: UIVisualEffectView, context: Context) {
        uiView.effect = UIBlurEffect(style: style)
    }
}

struct FeatureButton: View {
    var icon: String? = nil
    var text: String? = nil
    var assetImageName: String? = nil
    var action: String
    var bridge: CAPBridgeViewController?
    
    var body: some View {
        Button(action: {
            bridge?.webView?.evaluateJavaScript(action, completionHandler: nil)
            bridge?.webView?.evaluateJavaScript("window.HapticsService.light()", completionHandler: nil)
        }) {
            Group {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 22))
                } else if let text = text {
                    Text(text)
                        .font(.system(size: 22, weight: .black))
                } else if let assetImageName = assetImageName {
                    Image(assetImageName)
                        .resizable()
                        .scaledToFit()
                        .renderingMode(.original)
                        .frame(width: 22, height: 22)
                }
            }
            .foregroundColor(.white.opacity(0.85))
            .frame(maxWidth: .infinity)
            .frame(height: 50)
        }
    }
}
