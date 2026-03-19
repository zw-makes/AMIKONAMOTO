import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), message: "AMIKONAMOTO")
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), message: "AMIKONAMOTO")
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        // Access shared data via App Group
        let sharedDefaults = UserDefaults(suiteName: "group.com.amikonamoto.app")
        let message = sharedDefaults?.string(forKey: "widgetMessage") ?? "Welcome!"

        let entry = SimpleEntry(date: Date(), message: message)
        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let message: String
}

struct WidgetExtensionEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        VStack {
            Text("AMIKONAMOTO")
                .font(.headline)
                .foregroundColor(.blue)
            Text(entry.message)
                .font(.body)
                .padding(.top, 4)
        }
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

struct WidgetExtension: Widget {
    let kind: String = "WidgetExtension"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            WidgetExtensionEntryView(entry: entry)
        }
        .configurationDisplayName("AMIKONAMOTO Widget")
        .description("Keep track of your subscriptions.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

#Preview(as: .systemSmall) {
    WidgetExtension()
} settlement: {
    SimpleEntry(date: .now, message: "AMIKONAMOTO")
}
