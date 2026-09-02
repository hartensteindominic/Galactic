import SwiftUI

struct ConceptDashboardView: View {
    @EnvironmentObject private var store: FinancialStore
    @Binding var selection: AppTab

    @State private var searchText = ""
    @State private var showingInvoices = false

    private let navy = Color(red: 0.03, green: 0.06, blue: 0.28)
    private let blue = Color(red: 0.18, green: 0.34, blue: 0.98)
    private let cyan = Color(red: 0.05, green: 0.83, blue: 0.88)
    private let violet = Color(red: 0.57, green: 0.24, blue: 0.98)
    private let pink = Color(red: 1.00, green: 0.22, blue: 0.52)
    private let green = Color(red: 0.04, green: 0.75, blue: 0.38)

    var body: some View {
        GeometryReader { proxy in
            ScrollView(showsIndicators: false) {
                VStack(spacing: 12) {
                    header
                    searchRow
                    cashHero
                    quickActions
                    metricGrid
                    aiBrief
                }
                .frame(maxWidth: 560)
                .padding(.horizontal, 14)
                .padding(.top, 10)
                .padding(.bottom, 14)
                .frame(maxWidth: .infinity)
            }
            .background {
                ConceptPastelPageBackground()
                    .ignoresSafeArea()
            }
        }
        .toolbar(.hidden, for: .navigationBar)
        .sheet(isPresented: $showingInvoices) {
            NavigationStack { InvoicesView() }
                .environmentObject(store)
        }
    }

    private var header: some View {
        HStack(alignment: .top, spacing: 10) {
            VStack(alignment: .leading, spacing: 5) {
                Text("GALACTIC TRUST • BUSINESS")
                    .font(.system(size: 10, weight: .bold))
                    .tracking(2.1)
                    .foregroundStyle(blue)

                Text("Welcome back,\n\(store.profile.name)")
                    .font(.system(size: 31, weight: .bold, design: .rounded))
                    .foregroundStyle(navy)
                    .lineSpacing(-2)
                    .minimumScaleFactor(0.76)
                    .fixedSize(horizontal: false, vertical: true)

                Text("Your business money, made clear.")
                    .font(.system(size: 15, weight: .medium, design: .rounded))
                    .foregroundStyle(navy.opacity(0.58))
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            GalacticBrandMark(size: 49)
                .padding(.top, 14)
        }
        .padding(.horizontal, 2)
    }

    private var searchRow: some View {
        HStack(spacing: 10) {
            HStack(spacing: 11) {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(navy.opacity(0.68))

                TextField("Search transactions...", text: $searchText)
                    .font(.system(size: 15, weight: .medium, design: .rounded))
                    .foregroundStyle(navy)
                    .textInputAutocapitalization(.never)
                    .submitLabel(.search)
                    .onSubmit { selection = .transactions }
            }
            .padding(.horizontal, 18)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(ConceptGlassBackground(cornerRadius: 27))

            Button { selection = .cashFlow } label: {
                Image(systemName: "calendar")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(navy.opacity(0.72))
                    .frame(width: 52, height: 52)
                    .background(ConceptGlassBackground(cornerRadius: 26))
            }
            .buttonStyle(.plain)

            Button { selection = .transactions } label: {
                Image(systemName: "line.3.horizontal.decrease")
                    .font(.system(size: 17, weight: .bold))
                    .foregroundStyle(navy.opacity(0.72))
                    .frame(width: 52, height: 52)
                    .background(ConceptGlassBackground(cornerRadius: 26))
            }
            .buttonStyle(.plain)
        }
    }

    private var cashHero: some View {
        Button { selection = .cashFlow } label: {
            ZStack {
                ConceptPastelHeroBackground()

                GeometryReader { geo in
                    ConceptMoon()
                        .frame(width: min(geo.size.width * 0.49, 184), height: min(geo.size.width * 0.49, 184))
                        .position(x: geo.size.width * 0.82, y: geo.size.height * 0.58)

                    Circle()
                        .fill(Color.white.opacity(0.86))
                        .frame(width: 48, height: 48)
                        .overlay {
                            Image(systemName: "arrow.up.right")
                                .font(.system(size: 23, weight: .semibold))
                                .foregroundStyle(Color.white)
                        }
                        .background {
                            Circle()
                                .fill(
                                    LinearGradient(
                                        colors: [Color(red: 0.64, green: 0.50, blue: 1.0), Color(red: 0.40, green: 0.78, blue: 1.0)],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                        }
                        .shadow(color: violet.opacity(0.28), radius: 13)
                        .position(x: geo.size.width * 0.91, y: geo.size.height * 0.82)
                }

                VStack(alignment: .leading, spacing: 0) {
                    HStack {
                        Text("RECORDED CASH")
                            .font(.system(size: 10, weight: .bold))
                            .tracking(2.2)
                            .foregroundStyle(navy.opacity(0.78))

                        Spacer()

                        Label("PRIVATE", systemImage: "checkmark.shield.fill")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundStyle(blue)
                    }

                    Text(store.currency(store.balance))
                        .font(.system(size: 37, weight: .bold, design: .rounded))
                        .foregroundStyle(navy)
                        .lineLimit(1)
                        .minimumScaleFactor(0.62)
                        .padding(.top, 11)

                    Text("Your current balance from recorded activity")
                        .font(.system(size: 12, weight: .medium, design: .rounded))
                        .foregroundStyle(navy.opacity(0.63))
                        .padding(.top, 4)

                    Spacer()

                    HStack(spacing: 25) {
                        heroAmount(title: "Money in", value: "+\(store.currency(store.currentMonthIncome))", color: green)

                        Rectangle()
                            .fill(Color.white.opacity(0.72))
                            .frame(width: 1, height: 39)

                        heroAmount(title: "Money out", value: "−\(store.currency(store.currentMonthExpenses))", color: pink)

                        Spacer(minLength: 0)
                    }
                }
                .padding(18)
            }
            .frame(height: 214)
            .clipShape(RoundedRectangle(cornerRadius: 27, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 27, style: .continuous)
                    .stroke(
                        LinearGradient(
                            colors: [Color.white.opacity(0.96), Color(red: 1.0, green: 0.78, blue: 0.88).opacity(0.88), Color(red: 0.54, green: 0.85, blue: 1.0).opacity(0.88)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1.5
                    )
            }
            .shadow(color: Color(red: 0.48, green: 0.42, blue: 0.92).opacity(0.17), radius: 18, y: 9)
            .shadow(color: Color.white.opacity(0.9), radius: 2)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Recorded cash \(store.currency(store.balance)). Open cash flow.")
    }

    private func heroAmount(title: String, value: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(value)
                .font(.system(size: 15, weight: .bold, design: .rounded))
                .foregroundStyle(color)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(title)
                .font(.system(size: 11, weight: .medium, design: .rounded))
                .foregroundStyle(navy.opacity(0.68))
        }
    }

    private var quickActions: some View {
        HStack(spacing: 8) {
            quickAction(title: "Add", icon: "plus", colors: [blue, violet]) {
                selection = .transactions
            }
            quickAction(title: "Invoices", icon: "doc.text.fill", colors: [cyan, Color(red: 0.10, green: 0.90, blue: 0.63)]) {
                showingInvoices = true
            }
            quickAction(title: "Cash Flow", icon: "chart.line.uptrend.xyaxis", colors: [violet, Color(red: 0.73, green: 0.25, blue: 0.98)]) {
                selection = .cashFlow
            }
            quickAction(title: "Ask AI", icon: "sparkles", colors: [pink, Color(red: 1.0, green: 0.42, blue: 0.55)]) {
                selection = .ai
            }
        }
    }

    private func quickAction(title: String, icon: String, colors: [Color], action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 19, weight: .bold))
                    .foregroundStyle(.white)
                    .frame(width: 44, height: 44)
                    .background {
                        Circle()
                            .fill(LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing))
                            .shadow(color: colors.first?.opacity(0.32) ?? .clear, radius: 10, y: 5)
                    }

                Text(title)
                    .font(.system(size: 11, weight: .bold, design: .rounded))
                    .foregroundStyle(navy)
                    .lineLimit(1)
                    .minimumScaleFactor(0.70)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 88)
            .background(ConceptGlassBackground(cornerRadius: 22))
        }
        .buttonStyle(.plain)
    }

    private var metricGrid: some View {
        LazyVGrid(
            columns: [GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8)],
            spacing: 8
        ) {
            metricCard(
                title: "Revenue",
                value: store.currency(store.currentMonthIncome),
                status: changeText(revenueChange),
                positive: revenueChange >= 0,
                icon: "arrow.down.left",
                tint: green,
                values: store.monthlyPoints.map(\.income)
            )

            metricCard(
                title: "Expenses",
                value: store.currency(store.currentMonthExpenses),
                status: changeText(expenseChange),
                positive: expenseChange <= 0,
                icon: "arrow.up.right",
                tint: pink,
                values: store.monthlyPoints.map(\.expense)
            )

            metricCard(
                title: "Net profit",
                value: store.currency(store.currentMonthNet),
                status: changeText(netChange),
                positive: netChange >= 0,
                icon: "chart.line.uptrend.xyaxis",
                tint: Color(red: 0.13, green: 0.53, blue: 0.98),
                values: store.monthlyPoints.map { $0.income - $0.expense }
            )

            metricCard(
                title: "Outstanding",
                value: store.currency(store.outstandingInvoices),
                status: store.overdueInvoices.isEmpty ? "All on track" : "\(store.overdueInvoices.count) overdue",
                positive: store.overdueInvoices.isEmpty,
                icon: "doc.text.fill",
                tint: violet,
                values: cumulativeBalancePoints
            )
        }
    }

    private func metricCard(
        title: String,
        value: String,
        status: String,
        positive: Bool,
        icon: String,
        tint: Color,
        values: [Double]
    ) -> some View {
        ZStack(alignment: .bottomTrailing) {
            ConceptGlassBackground(cornerRadius: 20)

            ConceptSparkline(values: values, tint: tint)
                .frame(width: 106, height: 33)
                .padding(.trailing, 10)
                .padding(.bottom, 9)
                .opacity(0.92)

            HStack(alignment: .top, spacing: 10) {
                Image(systemName: icon)
                    .font(.system(size: 17, weight: .bold))
                    .foregroundStyle(.white)
                    .frame(width: 40, height: 40)
                    .background {
                        RoundedRectangle(cornerRadius: 13, style: .continuous)
                            .fill(
                                LinearGradient(
                                    colors: [tint.opacity(0.72), tint],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .shadow(color: tint.opacity(0.28), radius: 8, y: 4)
                    }

                VStack(alignment: .leading, spacing: 3) {
                    Text(title)
                        .font(.system(size: 11, weight: .medium, design: .rounded))
                        .foregroundStyle(navy.opacity(0.68))

                    Text(value)
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundStyle(navy)
                        .lineLimit(1)
                        .minimumScaleFactor(0.68)

                    Spacer(minLength: 0)

                    Text(status)
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundStyle(positive ? green : pink)
                        .lineLimit(1)
                }

                Spacer(minLength: 0)
            }
            .padding(12)
        }
        .frame(height: 100)
    }

    private var aiBrief: some View {
        Button { selection = .ai } label: {
            HStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 7) {
                        Image(systemName: "sparkles")
                            .foregroundStyle(violet)
                        Text("GALACTIC AI BRIEF")
                            .font(.system(size: 10, weight: .bold))
                            .tracking(2.0)
                            .foregroundStyle(blue)
                    }

                    Text(store.insights.first?.title ?? "Your financial brief is ready")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundStyle(navy)
                        .multilineTextAlignment(.leading)
                        .lineLimit(2)

                    HStack(spacing: 7) {
                        Text("Review the numbers")
                        Image(systemName: "arrow.right")
                    }
                    .font(.system(size: 12, weight: .semibold, design: .rounded))
                    .foregroundStyle(blue)
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                GalacticRobot()
                    .frame(width: 88, height: 88)
            }
            .padding(.leading, 16)
            .padding(.trailing, 8)
            .frame(height: 108)
            .background {
                ZStack {
                    RoundedRectangle(cornerRadius: 21, style: .continuous)
                        .fill(Color.white.opacity(0.66))

                    ConceptMiniCosmos()
                        .clipShape(RoundedRectangle(cornerRadius: 21, style: .continuous))
                }
            }
            .overlay {
                RoundedRectangle(cornerRadius: 21, style: .continuous)
                    .stroke(Color.white.opacity(0.90), lineWidth: 1.2)
            }
            .shadow(color: violet.opacity(0.12), radius: 14, y: 7)
        }
        .buttonStyle(.plain)
    }

    private var previousPoint: MonthlyPoint? {
        guard store.monthlyPoints.count >= 2 else { return nil }
        return store.monthlyPoints[store.monthlyPoints.count - 2]
    }

    private var revenueChange: Double {
        percentChange(current: store.currentMonthIncome, previous: previousPoint?.income ?? 0)
    }

    private var expenseChange: Double {
        percentChange(current: store.currentMonthExpenses, previous: previousPoint?.expense ?? 0)
    }

    private var netChange: Double {
        let previousNet = (previousPoint?.income ?? 0) - (previousPoint?.expense ?? 0)
        return percentChange(current: store.currentMonthNet, previous: previousNet)
    }

    private var cumulativeBalancePoints: [Double] {
        var running = max(0, store.balance - store.monthlyPoints.reduce(0) { $0 + ($1.income - $1.expense) })
        return store.monthlyPoints.map { point in
            running += point.income - point.expense
            return running
        }
    }

    private func percentChange(current: Double, previous: Double) -> Double {
        guard abs(previous) > 0.001 else { return current == 0 ? 0 : 100 }
        return ((current - previous) / abs(previous)) * 100
    }

    private func changeText(_ change: Double) -> String {
        let arrow = change >= 0 ? "↑" : "↓"
        return "\(arrow) \(abs(change).formatted(.number.precision(.fractionLength(1))))%"
    }
}

private struct ConceptGlassBackground: View {
    let cornerRadius: CGFloat

    var body: some View {
        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
            .fill(Color.white.opacity(0.76))
            .overlay {
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [Color.white.opacity(0.38), Color(red: 0.96, green: 0.94, blue: 1.0).opacity(0.18)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            }
            .overlay {
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(Color.white.opacity(0.95), lineWidth: 1.15)
            }
            .shadow(color: Color(red: 0.43, green: 0.39, blue: 0.72).opacity(0.10), radius: 12, y: 6)
    }
}

private struct ConceptPastelPageBackground: View {
    var body: some View {
        GeometryReader { proxy in
            ZStack {
                LinearGradient(
                    colors: [
                        Color(red: 0.99, green: 0.97, blue: 1.0),
                        Color(red: 1.0, green: 0.95, blue: 0.91),
                        Color(red: 0.98, green: 0.93, blue: 1.0),
                        Color(red: 0.92, green: 0.96, blue: 1.0)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )

                RadialGradient(
                    colors: [Color(red: 1.0, green: 0.72, blue: 0.74).opacity(0.34), .clear],
                    center: .topTrailing,
                    startRadius: 10,
                    endRadius: proxy.size.width * 0.9
                )

                RadialGradient(
                    colors: [Color(red: 0.58, green: 0.70, blue: 1.0).opacity(0.28), .clear],
                    center: .bottomLeading,
                    startRadius: 10,
                    endRadius: proxy.size.width * 0.95
                )

                ConceptStars(count: 30, opacity: 0.68)
            }
        }
    }
}

private struct ConceptPastelHeroBackground: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 1.0, green: 0.90, blue: 0.75),
                    Color(red: 1.0, green: 0.76, blue: 0.85),
                    Color(red: 0.76, green: 0.69, blue: 1.0),
                    Color(red: 0.55, green: 0.88, blue: 1.0)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            RadialGradient(
                colors: [Color.white.opacity(0.72), .clear],
                center: .topLeading,
                startRadius: 0,
                endRadius: 170
            )

            RadialGradient(
                colors: [Color(red: 0.93, green: 0.45, blue: 1.0).opacity(0.35), .clear],
                center: .bottomTrailing,
                startRadius: 0,
                endRadius: 190
            )

            ConceptStars(count: 22, opacity: 0.82)
        }
    }
}

private struct ConceptMiniCosmos: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.clear, Color(red: 0.86, green: 0.73, blue: 1.0).opacity(0.24), Color(red: 0.52, green: 0.84, blue: 1.0).opacity(0.20)],
                startPoint: .leading,
                endPoint: .trailing
            )
            ConceptStars(count: 14, opacity: 0.72)
        }
    }
}

private struct ConceptStars: View {
    let count: Int
    let opacity: Double

    var body: some View {
        GeometryReader { proxy in
            ForEach(0..<count, id: \.self) { index in
                let x = CGFloat((index * 37 + 11) % 97) / 100
                let y = CGFloat((index * 53 + 7) % 93) / 100
                let size = CGFloat(1 + (index % 3))

                Circle()
                    .fill(Color.white.opacity(index.isMultiple(of: 4) ? opacity : opacity * 0.58))
                    .frame(width: size, height: size)
                    .shadow(color: Color.white.opacity(opacity * 0.8), radius: index.isMultiple(of: 4) ? 3 : 1)
                    .position(x: proxy.size.width * x, y: proxy.size.height * y)
            }
        }
        .allowsHitTesting(false)
    }
}

private struct ConceptMoon: View {
    var body: some View {
        GeometryReader { proxy in
            let s = min(proxy.size.width, proxy.size.height)

            ZStack {
                Circle()
                    .fill(Color.white.opacity(0.62))
                    .frame(width: s * 1.16, height: s * 1.16)
                    .blur(radius: s * 0.09)

                Ellipse()
                    .stroke(
                        LinearGradient(
                            colors: [Color.white.opacity(0.9), Color(red: 1.0, green: 0.72, blue: 0.95), Color(red: 0.47, green: 0.85, blue: 1.0)],
                            startPoint: .leading,
                            endPoint: .trailing
                        ),
                        lineWidth: max(2.5, s * 0.028)
                    )
                    .frame(width: s * 1.18, height: s * 0.38)
                    .rotationEffect(.degrees(-17))
                    .shadow(color: Color.white.opacity(0.8), radius: 7)

                Circle()
                    .fill(
                        LinearGradient(
                            colors: [
                                Color(red: 1.0, green: 0.92, blue: 0.83),
                                Color(red: 0.98, green: 0.74, blue: 0.84),
                                Color(red: 0.65, green: 0.58, blue: 0.98),
                                Color(red: 0.34, green: 0.52, blue: 0.95)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay {
                        RadialGradient(
                            colors: [Color.white.opacity(0.56), Color.clear],
                            center: UnitPoint(x: 0.29, y: 0.22),
                            startRadius: 0,
                            endRadius: s * 0.42
                        )
                        .clipShape(Circle())
                    }
                    .shadow(color: Color(red: 0.57, green: 0.66, blue: 1.0).opacity(0.52), radius: 18)

                ForEach(0..<14, id: \.self) { index in
                    let crater = s * CGFloat(0.035 + Double(index % 4) * 0.012)
                    Circle()
                        .fill(Color(red: 0.32, green: 0.30, blue: 0.63).opacity(0.18))
                        .overlay {
                            Circle()
                                .stroke(Color.white.opacity(0.18), lineWidth: 0.7)
                        }
                        .frame(width: crater, height: crater)
                        .position(
                            x: s * CGFloat(0.22 + Double((index * 31) % 58) / 100.0),
                            y: s * CGFloat(0.18 + Double((index * 47) % 62) / 100.0)
                        )
                }
            }
            .frame(width: s, height: s)
        }
        .accessibilityHidden(true)
    }
}

private struct ConceptSparkline: View {
    let values: [Double]
    let tint: Color

    var body: some View {
        GeometryReader { proxy in
            let points = pathPoints(in: proxy.size)

            ZStack(alignment: .topLeading) {
                if points.count > 1 {
                    Path { path in
                        path.move(to: points[0])
                        for point in points.dropFirst() {
                            path.addLine(to: point)
                        }
                    }
                    .stroke(tint.opacity(0.92), style: StrokeStyle(lineWidth: 2.2, lineCap: .round, lineJoin: .round))

                    if let last = points.last {
                        Circle()
                            .fill(tint)
                            .frame(width: 7, height: 7)
                            .overlay { Circle().stroke(Color.white, lineWidth: 1) }
                            .position(last)
                    }
                }
            }
        }
        .accessibilityHidden(true)
    }

    private func pathPoints(in size: CGSize) -> [CGPoint] {
        guard values.count > 1 else { return [] }
        let low = values.min() ?? 0
        let high = values.max() ?? 1
        let span = max(high - low, 0.001)

        return values.enumerated().map { index, value in
            let x = CGFloat(index) / CGFloat(values.count - 1) * size.width
            let normalized = (value - low) / span
            let y = size.height - CGFloat(normalized) * (size.height - 4) - 2
            return CGPoint(x: x, y: y)
        }
    }
}