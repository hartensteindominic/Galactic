import SwiftUI

struct GalacticTheme {
    static let navy = Color(red: 0.018, green: 0.026, blue: 0.16)
    static let deepBlue = Color(red: 0.025, green: 0.07, blue: 0.47)
    static let indigo = Color(red: 0.20, green: 0.15, blue: 0.96)
    static let violet = Color(red: 0.52, green: 0.18, blue: 0.98)
    static let cyan = Color(red: 0.02, green: 0.78, blue: 0.94)
    static let green = Color(red: 0.02, green: 0.72, blue: 0.46)
    static let pink = Color(red: 0.98, green: 0.21, blue: 0.48)
    static let orange = Color(red: 1.00, green: 0.55, blue: 0.12)
    static let blue = Color(red: 0.08, green: 0.39, blue: 0.96)
    static let teal = Color(red: 0.02, green: 0.64, blue: 0.67)

    // A very light cosmic canvas keeps financial data easy to read while making
    // the app feel more playful and unmistakably Galactic Trust.
    static let page = Color(red: 0.958, green: 0.966, blue: 1.0)
    static let panel = Color.white
    static let softPanel = Color(red: 0.976, green: 0.980, blue: 1.0)
    static let mutedText = Color(red: 0.29, green: 0.31, blue: 0.45)
    static let divider = Color(red: 0.865, green: 0.875, blue: 0.95)

    static let heroGradient = LinearGradient(
        colors: [
            Color(red: 0.005, green: 0.055, blue: 0.62),
            indigo,
            violet,
            cyan.opacity(0.82)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let accentGradient = LinearGradient(
        colors: [indigo, violet, cyan],
        startPoint: .leading,
        endPoint: .trailing
    )

    static let glassGradient = LinearGradient(
        colors: [
            Color.white.opacity(0.98),
            Color.white.opacity(0.92),
            Color(red: 0.95, green: 0.96, blue: 1.0).opacity(0.96)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let cardBorderGradient = LinearGradient(
        colors: [
            Color.white.opacity(0.92),
            indigo.opacity(0.18),
            cyan.opacity(0.14),
            violet.opacity(0.16)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let spaceGradient = LinearGradient(
        colors: [
            Color(red: 0.006, green: 0.012, blue: 0.09),
            navy,
            Color(red: 0.055, green: 0.025, blue: 0.30),
            deepBlue.opacity(0.96)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let sidebarGradient = LinearGradient(
        colors: [
            Color(red: 0.008, green: 0.016, blue: 0.11),
            Color(red: 0.035, green: 0.025, blue: 0.27),
            Color(red: 0.025, green: 0.065, blue: 0.35)
        ],
        startPoint: .top,
        endPoint: .bottom
    )

    static let backgroundGlow = RadialGradient(
        colors: [
            cyan.opacity(0.12),
            violet.opacity(0.10),
            indigo.opacity(0.055),
            Color.clear
        ],
        center: .topTrailing,
        startRadius: 8,
        endRadius: 610
    )
}

struct GalacticCard<Content: View>: View {
    let content: Content
    var padding: CGFloat = 18
    var radius: CGFloat = 22

    init(padding: CGFloat = 18, radius: CGFloat = 22, @ViewBuilder content: () -> Content) {
        self.padding = padding
        self.radius = radius
        self.content = content()
    }

    var body: some View {
        content
            .padding(padding)
            .background {
                ZStack {
                    GalacticTheme.glassGradient

                    RadialGradient(
                        colors: [GalacticTheme.cyan.opacity(0.055), Color.clear],
                        center: .topTrailing,
                        startRadius: 0,
                        endRadius: 190
                    )

                    RadialGradient(
                        colors: [GalacticTheme.violet.opacity(0.045), Color.clear],
                        center: .bottomLeading,
                        startRadius: 0,
                        endRadius: 170
                    )
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .stroke(GalacticTheme.cardBorderGradient, lineWidth: 1.15)
            }
            .shadow(color: GalacticTheme.indigo.opacity(0.10), radius: 22, y: 10)
            .shadow(color: GalacticTheme.cyan.opacity(0.055), radius: 8, y: 2)
    }
}

struct MetricTile: View {
    let title: String
    let value: String
    let subtitle: String
    let systemImage: String
    let tint: Color

    var body: some View {
        GalacticCard(padding: 16, radius: 20) {
            HStack(alignment: .top, spacing: 13) {
                Image(systemName: systemImage)
                    .font(.subheadline.bold())
                    .symbolRenderingMode(.hierarchical)
                    .foregroundStyle(.white)
                    .frame(width: 42, height: 42)
                    .background {
                        RoundedRectangle(cornerRadius: 13, style: .continuous)
                            .fill(tint.gradient)
                    }
                    .overlay {
                        RoundedRectangle(cornerRadius: 13, style: .continuous)
                            .stroke(Color.white.opacity(0.34), lineWidth: 0.8)
                    }
                    .shadow(color: tint.opacity(0.30), radius: 10, y: 5)

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(GalacticTheme.mutedText)
                    Text(value)
                        .font(.title3.bold())
                        .foregroundStyle(GalacticTheme.navy)
                        .contentTransition(.numericText())
                        .minimumScaleFactor(0.72)
                        .lineLimit(1)
                    Text(subtitle)
                        .font(.caption2)
                        .foregroundStyle(GalacticTheme.mutedText)
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
            HStack(spacing: 7) {
                Circle()
                    .fill(GalacticTheme.accentGradient)
                    .frame(width: 7, height: 7)
                    .shadow(color: GalacticTheme.cyan.opacity(0.40), radius: 4)

                Text(title)
                    .font(.headline)
                    .foregroundStyle(GalacticTheme.navy)
            }

            Spacer()

            if let actionTitle, let action {
                Button(actionTitle, action: action)
                    .font(.caption.weight(.bold))
                    .foregroundStyle(GalacticTheme.indigo)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(GalacticTheme.indigo.opacity(0.075))
                    .clipShape(Capsule())
            }
        }
    }
}

extension FinancialInsight {
    var color: Color {
        switch severity {
        case .positive: GalacticTheme.green
        case .information: GalacticTheme.blue
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
