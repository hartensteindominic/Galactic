import SwiftUI

@main
struct GalacticTrustBusinessApp: App {
    @StateObject private var store = FinancialStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
                .preferredColorScheme(.light)
        }
    }
}

struct RootView: View {
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    @State private var selection: AppTab = .dashboard

    var body: some View {
        Group {
            if horizontalSizeClass == .regular {
                HStack(spacing: 0) {
                    GalacticSidebar(selection: $selection)
                        .frame(width: 230)
                    destination(for: selection)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
                .background(GalacticTheme.page)
            } else {
                compactShell
                    .onAppear {
                        if !selection.supportsCompactTab {
                            selection = .dashboard
                        }
                    }
            }
        }
        .tint(GalacticTheme.indigo)
    }

    private var compactShell: some View {
        ZStack(alignment: .bottom) {
            ZStack {
                GalacticTheme.page
                GalacticTheme.backgroundGlow

                RadialGradient(
                    colors: [GalacticTheme.violet.opacity(0.065), Color.clear],
                    center: .bottomLeading,
                    startRadius: 12,
                    endRadius: 330
                )
            }
            .ignoresSafeArea()

            compactDestination(for: selection)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding(.bottom, 76)

            GalacticFloatingTabBar(selection: $selection)
                .padding(.horizontal, 12)
                .padding(.bottom, 6)
        }
        .animation(.snappy(duration: 0.28), value: selection)
    }

    @ViewBuilder
    private func compactDestination(for tab: AppTab) -> some View {
        switch tab {
        case .dashboard:
            NavigationStack { DashboardView(selection: $selection) }
        case .transactions:
            NavigationStack { TransactionsView() }
        case .cashFlow:
            NavigationStack { CashFlowView() }
        case .ai:
            NavigationStack { AIManagerView() }
        case .more:
            NavigationStack { MoreView() }
        default:
            NavigationStack { DashboardView(selection: $selection) }
        }
    }

    @ViewBuilder
    private func destination(for tab: AppTab) -> some View {
        switch tab {
        case .dashboard:
            NavigationStack { DashboardView(selection: $selection) }
        case .accounts:
            NavigationStack { BusinessModuleView(kind: .accounts) }
        case .transactions:
            NavigationStack { TransactionsView() }
        case .invoices:
            NavigationStack { InvoicesView() }
        case .expenses:
            NavigationStack { BusinessModuleView(kind: .expenses) }
        case .customers:
            NavigationStack { BusinessModuleView(kind: .customers) }
        case .vendors:
            NavigationStack { BusinessModuleView(kind: .vendors) }
        case .payroll:
            NavigationStack { BusinessModuleView(kind: .payroll) }
        case .cashFlow:
            NavigationStack { CashFlowView() }
        case .reports:
            NavigationStack { BusinessModuleView(kind: .reports) }
        case .budgets:
            NavigationStack { BusinessModuleView(kind: .budgets) }
        case .forecasting:
            NavigationStack { CashFlowView() }
        case .ai:
            NavigationStack { AIManagerView() }
        case .alerts:
            NavigationStack { BusinessModuleView(kind: .alerts) }
        case .settings, .more:
            NavigationStack { MoreView() }
        case .integrations:
            NavigationStack { ImportGuideView() }
        case .help:
            NavigationStack { BusinessModuleView(kind: .help) }
        }
    }
}

private struct GalacticFloatingTabBar: View {
    @Binding var selection: AppTab

    private struct TabItem: Identifiable {
        let tab: AppTab
        let title: String
        let icon: String

        var id: AppTab { tab }
    }

    private let tabs: [TabItem] = [
        TabItem(tab: .dashboard, title: "Home", icon: "house.fill"),
        TabItem(tab: .transactions, title: "Activity", icon: "list.bullet.rectangle.portrait.fill"),
        TabItem(tab: .cashFlow, title: "Cash Flow", icon: "chart.xyaxis.line"),
        TabItem(tab: .ai, title: "AI", icon: "sparkles"),
        TabItem(tab: .more, title: "More", icon: "ellipsis.circle.fill")
    ]

    var body: some View {
        HStack(spacing: 3) {
            ForEach(tabs) { item in
                let isSelected = selection == item.tab

                Button {
                    withAnimation(.snappy(duration: 0.24)) {
                        selection = item.tab
                    }
                } label: {
                    VStack(spacing: 3) {
                        ZStack {
                            if isSelected {
                                Circle()
                                    .fill(GalacticTheme.heroGradient)
                                    .frame(width: 31, height: 31)
                                    .overlay {
                                        Circle()
                                            .stroke(Color.white.opacity(0.34), lineWidth: 0.8)
                                    }
                                    .shadow(color: GalacticTheme.cyan.opacity(0.30), radius: 8)
                                    .shadow(color: GalacticTheme.violet.opacity(0.36), radius: 12)
                            }

                            Image(systemName: item.icon)
                                .font(.system(size: isSelected ? 15 : 17, weight: .semibold))
                                .symbolRenderingMode(.hierarchical)
                                .symbolEffect(.bounce, value: isSelected)
                        }
                        .frame(height: 31)

                        Text(item.title)
                            .font(.system(size: 9.5, weight: isSelected ? .bold : .semibold, design: .rounded))
                            .lineLimit(1)
                            .minimumScaleFactor(0.72)

                        Capsule()
                            .fill(isSelected ? AnyShapeStyle(GalacticTheme.accentGradient) : AnyShapeStyle(Color.clear))
                            .frame(width: isSelected ? 18 : 4, height: 2)
                            .shadow(color: isSelected ? GalacticTheme.cyan.opacity(0.55) : .clear, radius: 4)
                    }
                    .foregroundStyle(isSelected ? Color.white : Color.white.opacity(0.62))
                    .frame(maxWidth: .infinity)
                    .frame(height: 55)
                    .background {
                        if isSelected {
                            RoundedRectangle(cornerRadius: 15, style: .continuous)
                                .fill(Color.white.opacity(0.075))
                                .overlay {
                                    RoundedRectangle(cornerRadius: 15, style: .continuous)
                                        .stroke(Color.white.opacity(0.08), lineWidth: 0.8)
                                }
                        }
                    }
                    .contentShape(RoundedRectangle(cornerRadius: 15, style: .continuous))
                }
                .buttonStyle(.plain)
                .accessibilityLabel(item.title)
                .accessibilityAddTraits(isSelected ? .isSelected : [])
            }
        }
        .padding(5)
        .background {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(GalacticTheme.sidebarGradient)
                .overlay {
                    ZStack {
                        RadialGradient(
                            colors: [GalacticTheme.indigo.opacity(0.24), Color.clear],
                            center: .topLeading,
                            startRadius: 0,
                            endRadius: 180
                        )

                        RadialGradient(
                            colors: [GalacticTheme.cyan.opacity(0.16), Color.clear],
                            center: .bottomTrailing,
                            startRadius: 0,
                            endRadius: 180
                        )
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                }
                .overlay {
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .stroke(
                            LinearGradient(
                                colors: [Color.white.opacity(0.24), GalacticTheme.cyan.opacity(0.16), GalacticTheme.violet.opacity(0.18)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1
                        )
                }
                .shadow(color: GalacticTheme.navy.opacity(0.38), radius: 22, y: 11)
                .shadow(color: GalacticTheme.indigo.opacity(0.12), radius: 8, y: 2)
        }
    }
}

enum AppTab: Hashable {
    case dashboard
    case accounts
    case transactions
    case invoices
    case expenses
    case customers
    case vendors
    case payroll
    case cashFlow
    case reports
    case budgets
    case forecasting
    case ai
    case alerts
    case settings
    case integrations
    case help
    case more

    var supportsCompactTab: Bool {
        switch self {
        case .dashboard, .transactions, .cashFlow, .ai, .more:
            true
        default:
            false
        }
    }
}
