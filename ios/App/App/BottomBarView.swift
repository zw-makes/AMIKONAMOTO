import SwiftUI

struct BottomBarView: View {
    var body: some View {
        VStack {
            Spacer()
            
            // The split controls row
            HStack(spacing: 12) {
                // Main Feature Buttons Pill
                HStack(spacing: 0) {
                    FeatureButton(icon: "magnifyingglass")
                    FeatureButton(icon: "list.bullet")
                    FeatureButton(icon: "star")
                    FeatureButton(text: "S") // AI Assistant
                }
                .padding(.horizontal, 8)
                .frame(height: 60)
                .background(.ultraThinMaterial) // Real iOS Liquid Glass
                .cornerRadius(20)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color.white.opacity(0.1), lineWidth: 0.5)
                )
                .shadow(color: Color.black.opacity(0.3), radius: 20, x: 0, y: 10)
                
                // Classic White Add Button
                Button(action: {
                    // Trigger Add Subscription
                }) {
                    Image(systemName: "plus")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.black)
                        .frame(width: 60, height: 60)
                        .background(Color.white)
                        .cornerRadius(20)
                        .shadow(color: Color.white.opacity(0.2), radius: 10)
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 10) // Safe area handled by parent or Spacer
        }
        .edgesIgnoringSafeArea(.bottom)
    }
}

struct FeatureButton: View {
    var icon: String? = nil
    var text: String? = nil
    
    var body: some View {
        Button(action: {
            // Action
        }) {
            Group {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 22))
                } else if let text = text {
                    Text(text)
                        .font(.custom("Orbitron-Black", size: 22)) // Assuming font is available
                }
            }
            .foregroundColor(.white.opacity(0.85))
            .frame(maxWidth: .infinity)
            .frame(height: 50)
        }
    }
}

struct BottomBarView_Previews: PreviewProvider {
    static var previews: some View {
        ZStack {
            Color.black.edgesIgnoringSafeArea(.all)
            BottomBarView()
        }
    }
}
