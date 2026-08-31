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
    @State private var selection: AppTab = .dashboard

    var body: some View {
        TabView(selection: $selection) {
            NavigationStack { DashboardView(selection: $selection) }
                .tabItem { Label("Home", systemImage: "sparkles.rectangle.stack.fill") }
                .tag(AppTab.dashboard)

            NavigationStack { TransactionsView() }
                .tabItem { Label("Transactions", systemImage: "list.bullet.rectangle.portrait.fill") }
                .tag(AppTab.transactions)

            NavigationStack { CashFlowView() }
                .tabItem { Label("Cash Flow", systemImage: "chart.xyaxis.line") }
                .tag(AppTab.cashFlow)

            NavigationStack { AIManagerView() }
                .tabItem { Label("AI", systemImage: "sparkles") }
                .tag(AppTab.ai)

            NavigationStack { MoreView() }
                .tabItem { Label("More", systemImage: "ellipsis.circle.fill") }
                .tag(AppTab.more)
        }
        .tint(GalacticTheme.indigo)
    }
}

enum AppTab: Hashable {
    case dashboard, transactions, cashFlow, ai, more
}
