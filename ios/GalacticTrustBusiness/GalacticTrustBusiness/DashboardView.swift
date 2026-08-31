import SwiftUI
import Charts

struct DashboardView: View {
    @EnvironmentObject private var store: FinancialStore
    @Binding var selection: AppTab
    @State private var showingAddIncome = false
    @State private var showingAddExpense = false
    @State private var selectedInsight: FinancialInsight?

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                welcomeHeader
                balanceHero
                quickActions
                metrics
                aiBrief
                spendingCard
                activityCard
                invoiceCard
                privacyNote
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 28)
        }
        .background(GalacticTheme.page.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .sheet(isPresented: $showingAddIncome) {
            AddTransactionView(defaultKind: .income)
        }
        .sheet(isPresented: $showingAddExpense) {
            AddTransactionView(defaultKind: .expense)
        }
        .sheet(item: $selectedInsight) { insight in
            InsightEvidenceView(insight: insight)
        }
    }

    private var welcomeHeader: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Welcome back")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)
                Text(store.profile.name)
                    .font(.title2.bold())
                    .foregroundStyle(GalacticTheme.navy)
            }
            Spacer()
            Button {
                selection = .ai
            } label: {
                Image(systemName: "sparkles")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(width: 44, height: 44)
                    .background(GalacticTheme.heroGradient)
                    .clipShape(Circle())
            }
            .accessibilityLabel("Open AI financial manager")
        }
        .padding(.top, 12)
    }

    private var balanceHero: some View {
        ZStack(alignment: .topLeading) {
            GalacticTheme.heroGradient

            Circle()
                .fill(Color.cyan.opacity(0.38))
                .frame(width: 160, height: 160)
                .blur(radius: 2)
                .offset(x: 205, y: 92)

            Ellipse()
                .stroke(Color.pink.opacity(0.65), lineWidth: 16)
                .frame(width: 230, height: 72)
                .rotationEffect(.degrees(-18))
                .offset(x: 175, y: 137)

            Circle()
                .fill(Color.white.opacity(0.92))
                .frame(width: 5, height: 5)
                .offset(x: 292, y: 32)

            Circle()
                .fill(Color.white.opacity(0.8))
                .frame(width: 3, height: 3)
                .offset(x: 330, y: 65)

            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 7) {
                    Text("Business cash balance")
                    Image(systemName: "eye.fill")
                        .font(.caption2)
                }
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.white.opacity(0.9))

                Text(store.currency(store.balance))
                    .font(.system(size: 36, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
                    .minimumScaleFactor(0.72)
                    .lineLimit(1)

                HStack(spacing: 8) {
                    Image(systemName: store.currentMonthNet >= 0 ? "arrow.up.right" : "arrow.down.right")
                    Text("\(store.currency(store.currentMonthNet)) net this month")
                }
                .font(.caption.weight(.semibold))
                .foregroundStyle(store.currentMonthNet >= 0 ? Color.mint : Color.yellow)
                .padding(.horizontal, 10)
                .padding(.vertical, 7)
                .background(Color.black.opacity(0.18))
                .clipShape(Capsule())
            }
            .padding(22)
        }
        .frame(height: 205)
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        .shadow(color: GalacticTheme.indigo.opacity(0.24), radius: 18, y: 10)
    }

    private var quickActions: some View {
        HStack(spacing: 10) {
            quickAction("Income", icon: "plus", tint: GalacticTheme.green) { showingAddIncome = true }
            quickAction("Expense", icon: "minus", tint: GalacticTheme.pink) { showingAddExpense = true }
            quickAction("Invoices", icon: "doc.text.fill", tint: GalacticTheme.violet) { }
            quickAction("Ask AI", icon: "sparkles", tint: GalacticTheme.indigo) { selection = .ai }
        }
    }

    private func quickAction(_ title: String, icon: String, tint: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 7) {
                Image(systemName: icon)
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(width: 38, height: 38)
                    .background(tint.gradient)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                Text(title)
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(GalacticTheme.navy)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 11)
            .background(.white)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .shadow(color: GalacticTheme.indigo.opacity(0.06), radius: 8, y: 4)
        }
        .buttonStyle(.plain)
    }

    private var metrics: some View {
        LazyVGrid(columns: columns, spacing: 12) {
            MetricTile(
                title: "Money received",
                value: store.currency(store.currentMonthIncome),
                subtitle: "This month",
                systemImage: "arrow.down.left",
                tint: GalacticTheme.green
            )
            MetricTile(
                title: "Money spent",
                value: store.currency(store.currentMonthExpenses),
                subtitle: "This month",
                systemImage: "arrow.up.right",
                tint: GalacticTheme.pink
            )
            MetricTile(
                title: "Net cash flow",
                value: store.currency(store.currentMonthNet),
                subtitle: "Income minus expenses",
                systemImage: "chart.line.uptrend.xyaxis",
                tint: GalacticTheme.indigo
            )
            MetricTile(
                title: "Receivables",
                value: store.currency(store.outstandingInvoices),
                subtitle: "Unpaid invoices",
                systemImage: "doc.text.fill",
                tint: GalacticTheme.violet
            )
        }
    }

    private var aiBrief: some View {
        GalacticCard {
            VStack(alignment: .leading, spacing: 14) {
                HStack {
                    Label("AI Financial Brief", systemImage: "sparkles")
                        .font(.headline)
                        .foregroundStyle(GalacticTheme.navy)
                    Spacer()
                    Button("Ask AI") { selection = .ai }
                        .font(.caption.weight(.semibold))
                }

                if store.insights.isEmpty {
                    Text("Add or import transactions and Galactic AI will surface meaningful changes here.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(store.insights.prefix(4)) { insight in
                        Button {
                            selectedInsight = insight
                        } label: {
                            HStack(alignment: .top, spacing: 12) {
                                Image(systemName: insight.icon)
                                    .foregroundStyle(insight.color)
                                    .frame(width: 34, height: 34)
                                    .background(insight.color.opacity(0.12))
                                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

                                VStack(alignment: .leading, spacing: 3) {
                                    Text(insight.title)
                                        .font(.subheadline.bold())
                                        .foregroundStyle(GalacticTheme.navy)
                                        .multilineTextAlignment(.leading)
                                    Text(insight.detail)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                        .multilineTextAlignment(.leading)
                                        .lineLimit(2)
                                }
                                Spacer(minLength: 2)
                                Image(systemName: "chevron.right")
                                    .font(.caption.bold())
                                    .foregroundStyle(.tertiary)
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private var spendingCard: some View {
        GalacticCard {
            VStack(alignment: .leading, spacing: 14) {
                SectionHeader(title: "Spending breakdown", actionTitle: "Cash Flow") {
                    selection = .cashFlow
                }

                if store.expenseByCategory.isEmpty {
                    ContentUnavailableView("No expenses yet", systemImage: "chart.pie")
                        .frame(height: 170)
                } else {
                    HStack(spacing: 16) {
                        Chart(store.expenseByCategory) { item in
                            SectorMark(
                                angle: .value("Amount", item.amount),
                                innerRadius: .ratio(0.62),
                                angularInset: 2
                            )
                            .cornerRadius(5)
                            .foregroundStyle(categoryColor(item.category))
                        }
                        .chartLegend(.hidden)
                        .frame(width: 145, height: 145)
                        .overlay {
                            VStack(spacing: 2) {
                                Text(store.currency(store.currentMonthExpenses))
                                    .font(.caption.bold())
                                    .minimumScaleFactor(0.7)
                                Text("spent")
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                            }
                        }

                        VStack(alignment: .leading, spacing: 8) {
                            ForEach(store.expenseByCategory.prefix(5)) { item in
                                HStack(spacing: 7) {
                                    Circle()
                                        .fill(categoryColor(item.category))
                                        .frame(width: 8, height: 8)
                                    Text(item.category.rawValue)
                                        .font(.caption2)
                                        .lineLimit(1)
                                    Spacer()
                                    Text(store.currency(item.amount))
                                        .font(.caption2.weight(.semibold))
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private var activityCard: some View {
        GalacticCard {
            VStack(alignment: .leading, spacing: 8) {
                SectionHeader(title: "Recent activity", actionTitle: "View all") {
                    selection = .transactions
                }

                ForEach(store.transactions.prefix(6)) { transaction in
                    HStack(spacing: 11) {
                        Image(systemName: transaction.kind == .income ? "arrow.down.left" : "arrow.up.right")
                            .font(.caption.bold())
                            .foregroundStyle(transaction.kind == .income ? GalacticTheme.green : GalacticTheme.indigo)
                            .frame(width: 34, height: 34)
                            .background((transaction.kind == .income ? GalacticTheme.green : GalacticTheme.indigo).opacity(0.11))
                            .clipShape(Circle())

                        VStack(alignment: .leading, spacing: 2) {
                            Text(transaction.merchant)
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(GalacticTheme.navy)
                                .lineLimit(1)
                            Text(transaction.category.rawValue)
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 2) {
                            Text((transaction.kind == .income ? "+" : "−") + store.currency(transaction.amount))
                                .font(.subheadline.bold())
                                .foregroundStyle(transaction.kind == .income ? GalacticTheme.green : GalacticTheme.navy)
                            Text(transaction.date, style: .date)
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 5)
                    if transaction.id != store.transactions.prefix(6).last?.id {
                        Divider().opacity(0.45)
                    }
                }
            }
        }
    }

    private var invoiceCard: some View {
        GalacticCard {
            VStack(alignment: .leading, spacing: 12) {
                SectionHeader(title: "Outstanding invoices")
                if store.invoices.filter({ $0.status != .paid }).isEmpty {
                    Text("No outstanding invoices")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(store.invoices.filter { $0.status != .paid }.prefix(4)) { invoice in
                        HStack {
                            VStack(alignment: .leading, spacing: 3) {
                                Text(invoice.client)
                                    .font(.subheadline.bold())
                                Text("\(invoice.invoiceNumber) • Due \(invoice.dueDate.formatted(date: .abbreviated, time: .omitted))")
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            VStack(alignment: .trailing, spacing: 4) {
                                Text(store.currency(invoice.amount))
                                    .font(.subheadline.bold())
                                Text(invoice.status.rawValue)
                                    .font(.caption2.weight(.bold))
                                    .foregroundStyle(invoice.status == .overdue ? GalacticTheme.pink : GalacticTheme.indigo)
                            }
                        }
                    }
                }
            }
        }
    }

    private var privacyNote: some View {
        HStack(alignment: .top, spacing: 9) {
            Image(systemName: "lock.shield.fill")
                .foregroundStyle(GalacticTheme.indigo)
            Text("This App Store build analyzes the financial records you add or import on this device. Galactic AI is read-only and does not send payments or move money.")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(6)
    }

    private func categoryColor(_ category: FinanceCategory) -> Color {
        switch category {
        case .payroll: GalacticTheme.violet
        case .software: GalacticTheme.indigo
        case .marketing: GalacticTheme.pink
        case .office: GalacticTheme.orange
        case .rentUtilities: GalacticTheme.cyan
        case .travel: .teal
        case .taxes: .brown
        case .fees: .gray
        case .sales: GalacticTheme.green
        case .services: .mint
        case .other: .secondary
        }
    }
}

struct InsightEvidenceView: View {
    @EnvironmentObject private var store: FinancialStore
    @Environment(\.dismiss) private var dismiss
    let insight: FinancialInsight

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Label(insight.title, systemImage: insight.icon)
                        .font(.headline)
                        .foregroundStyle(insight.color)
                    Text(insight.detail)
                        .font(.subheadline)
                }

                Section("Evidence") {
                    let evidence = store.evidence(for: insight)
                    if evidence.isEmpty {
                        Text("This insight is based on invoice status or aggregate financial totals.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(evidence) { item in
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(item.merchant).font(.subheadline.bold())
                                    Text(item.date, style: .date).font(.caption).foregroundStyle(.secondary)
                                }
                                Spacer()
                                Text((item.kind == .income ? "+" : "−") + store.currency(item.amount))
                                    .font(.subheadline.weight(.semibold))
                            }
                        }
                    }
                }
            }
            .navigationTitle("AI Evidence")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}
