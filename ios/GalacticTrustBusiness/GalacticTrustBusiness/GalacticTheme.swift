import SwiftUI

struct GalacticTheme {
    static let navy = Color(red: 0.025, green: 0.04, blue: 0.19)
    static let deepBlue = Color(red: 0.04, green: 0.08, blue: 0.48)
    static let indigo = Color(red: 0.22, green: 0.16, blue: 0.95)
    static let violet = Color(red: 0.53, green: 0.19, blue: 0.96)
    static let cyan = Color(red: 0.04, green: 0.75, blue: 0.90)
    static let green = Color(red: 0.02, green: 0.68, blue: 0.42)
    static let pink = Color(red: 0.95, green: 0.18, blue: 0.52)
    static let orange = Color(red: 1.00, green: 0.55, blue: 0.12)
    static let page = Color(red: 0.965, green: 0.97, blue: 0.995)

    static let heroGradient = LinearGradient(
        colors: [deepBlue, indigo, violet],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let spaceGradient = LinearGradient(
        colors: [navy, Color(red: 0.06, green: 0.04, blue: 0.34)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

struct GalacticCard<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(18)
            .background(.white)
            .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .stroke(Color.black.opacity(0.035), lineWidth: 1)
            }
            .shadow(color: GalacticTheme.indigo.opacity(0.08), radius: 14, y: 8)
    }
}

struct MetricTile: View {
    let title: String
    let value: String
    let subtitle: String
    let systemImage: String
    let tint: Color

    var body: some View {
        GalacticCard {
            HStack(alignment: .top, spacing: 14) {
                Image(systemName: systemImage)
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(width: 42, height: 42)
                    .background(tint.gradient)
                    .clipShape(RoundedRectangle(cornerRadius: 13, style: .continuous))

                VStack(alignment: .leading, spacing: 5) {
                    Text(title)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                    Text(value)
                        .font(.title3.bold())
                        .foregroundStyle(GalacticTheme.navy)
                        .contentTransition(.numericText())
                    Text(subtitle)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
                Spacer(minLength: 0)
            }
        }
    }
}

struct SectionHeader: View {
    let title: String
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil

    var body: some View {
        HStack {
            Text(title)
                .font(.headline)
                .foregroundStyle(GalacticTheme.navy)
            Spacer()
            if let actionTitle, let action {
                Button(actionTitle, action: action)
                    .font(.caption.weight(.semibold))
            }
        }
    }
}

extension FinancialInsight {
    var color: Color {
        switch severity {
        case .positive: GalacticTheme.green
        case .information: GalacticTheme.indigo
        case .warning: GalacticTheme.orange
        case .critical: GalacticTheme.pink
        }
    }

    var icon: String {
        switch severity {
        case .positive: "arrow.up.right.circle.fill"
        case .information: "sparkles"
        case .warning: "exclamationmark.triangle.fill"
        case .critical: "exclamationmark.octagon.fill"
        }
    }
}
