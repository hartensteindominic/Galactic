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
                .padding(.bottom, 76)

            GalacticFloatingTabBar(selection: $selection)
                .padding(.horizontal, 10)
                .padding(.bottom, 8)
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

    private let tabs: [(AppTab, String, String)] = [
        (.dashboard, "Home", "house.fill"),
        (.transactions, "Activity", "list.bullet.rectangle.portrait.fill"),
        (.cashFlow, "Cash Flow", "chart.xyaxis.line"),
        (.ai, "AI", "sparkles"),
        (.more, "More", "ellipsis.circle.fill")
    ]

    var body: some View {
        HStack(spacing: 5) {
            ForEach(tabs, id: \.0) { tab, title, icon in
                Button {
                    withAnimation(.snappy(duration: 0.24)) {
                        selection = tab
                    }
                } label: {
                    VStack(spacing: 4) {
                        Image(systemName: icon)
                            .font(.system(size: 17, weight: .semibold))
                            .symbolEffect(.bounce, value: selection == tab)

                        Text(title)
                            .font(.system(size: 9.5, weight: .semibold, design: .rounded))
                            .lineLimit(1)
                            .minimumScaleFactor(0.72)
                    }
                    .foregroundStyle(selection == tab ? Color.white : Color.white.opacity(0.68))
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background {
                        if selection == tab {
                            RoundedRectangle(cornerRadius: 13, style: .continuous)
                                .fill(GalacticTheme.heroGradient)
                                .shadow(color: GalacticTheme.indigo.opacity(0.48), radius: 11, y: 5)
                                .matchedGeometryEffectPlaceholder(id: "selected-tab")
                        }
                    }
                    .contentShape(RoundedRectangle(cornerRadius: 13, style: .continuous))
                }
                .buttonStyle(.plain)
                .accessibilityLabel(title)
                .accessibilityAddTraits(selection == tab ? .isSelected : [])
            }
        }
        .padding(6)
        .background {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(GalacticTheme.sidebarGradient)
                .overlay {
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .stroke(Color.white.opacity(0.10), lineWidth: 1)
                }
                .shadow(color: GalacticTheme.navy.opacity(0.34), radius: 24, y: 12)
        }
    }
}

private extension View {
    @ViewBuilder
    func matchedGeometryEffectPlaceholder(id: String) -> some View {
        self
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
