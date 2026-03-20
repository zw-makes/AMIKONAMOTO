import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), total: "$0.00")
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), total: fetchTotal())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> ()) {
        let entry = SimpleEntry(date: Date(), total: fetchTotal())
        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
    }

    private func fetchTotal() -> String {
        // MUST match the App Group ID from the native bridge
        let appGroupID = "group.com.subtrack.app"
        let defaults = UserDefaults(suiteName: appGroupID)
        return defaults?.string(forKey: "grandTotal") ?? "$0.00"
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let total: String
}

struct SubTrackWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        ZStack {
            // Dark Glassmorphic background matching SubTrack's style
            Color(red: 0.08, green: 0.08, blue: 0.1)
                .edgesIgnoringSafeArea(.all)

            VStack(alignment: .leading, spacing: 6) {
                // Header row
                HStack(spacing: 5) {
                    Image(systemName: "creditcard.circle.fill")
                        .font(.system(size: 12))
                        .foregroundColor(Color(red: 0.31, green: 0.98, blue: 0.48)) // --accent-green
                    Text("GRAND TOTAL")
                        .font(.system(size: 9, weight: .bold, design: .monospaced))
                        .foregroundColor(.gray)
                }

                // Total amount
                Text(entry.total)
                    .font(.system(size: 22, weight: .black, design: .rounded))
                    .foregroundColor(.white)
                    .minimumScaleFactor(0.5)
                    .lineLimit(1)

                Spacer()

                // Branding footer
                Text("SubTrack")
                    .font(.system(size: 8, weight: .bold, design: .monospaced))
                    .foregroundColor(.gray.opacity(0.4))
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

@main
struct SubTrackWidget: Widget {
    let kind: String = "SubTrackWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            SubTrackWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("SubTrack Summary")
        .description("Your monthly grand total at a glance.")
        .supportedFamilies([
            .systemSmall,           // Home Screen widget
            .accessoryRectangular   // Lock Screen widget (iOS 16+)
        ])
    }
}
