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
            compactDestination(for: selection)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding(.bottom, 72)

            GalacticFloatingTabBar(selection: $selection)
                .padding(.horizontal, 14)
                .padding(.bottom, 6)
        }
        .background(GalacticTheme.page.ignoresSafeArea())
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
        HStack(spacing: 4) {
            ForEach(tabs) { item in
                Button {
                    withAnimation(.snappy(duration: 0.24)) {
                        selection = item.tab
                    }
                } label: {
                    VStack(spacing: 4) {
                        Image(systemName: item.icon)
                            .font(.system(size: 17, weight: .semibold))
                            .symbolEffect(.bounce, value: selection == item.tab)

                        Text(item.title)
                            .font(.system(size: 9.5, weight: .semibold, design: .rounded))
                            .lineLimit(1)
                            .minimumScaleFactor(0.72)
                    }
                    .foregroundStyle(selection == item.tab ? Color.white : Color.white.opacity(0.68))
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background {
                        if selection == item.tab {
                            RoundedRectangle(cornerRadius: 13, style: .continuous)
                                .fill(GalacticTheme.heroGradient)
                                .shadow(color: GalacticTheme.indigo.opacity(0.48), radius: 11, y: 5)
                        }
                    }
                    .contentShape(RoundedRectangle(cornerRadius: 13, style: .continuous))
                }
                .buttonStyle(.plain)
                .accessibilityLabel(item.title)
                .accessibilityAddTraits(selection == item.tab ? .isSelected : [])
            }
        }
        .padding(6)
        .background {
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(GalacticTheme.sidebarGradient)
                .overlay {
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .stroke(Color.white.opacity(0.10), lineWidth: 1)
                }
                .shadow(color: GalacticTheme.navy.opacity(0.28), radius: 20, y: 10)
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
