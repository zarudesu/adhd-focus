import SwiftUI

struct ProcessModeView: View {
    @ObservedObject var taskStore: TaskStore
    @Environment(\.dismiss) private var dismiss

    @State private var currentIndex = 0
    @State private var showDatePicker = false
    @State private var selectedDate = Date()
    @State private var isProcessing = false
    @State private var isCompleted = false
    @State private var processedCount = 0
    @State private var cardOffset: CGFloat = 0
    @State private var cardOpacity: Double = 1

    private var inboxTasks: [TaskItem] {
        taskStore.inboxTasks
    }

    private var currentTask: TaskItem? {
        guard currentIndex < inboxTasks.count else { return nil }
        return inboxTasks[currentIndex]
    }

    private var totalTasks: Int {
        inboxTasks.count + processedCount
    }

    private var progressText: String {
        let remaining = inboxTasks.count
        if remaining == 0 {
            return "All done!"
        }
        return "\(processedCount + 1) of \(totalTasks)"
    }

    var body: some View {
        ZStack {
            // Background
            Color(.systemBackground)
                .ignoresSafeArea()

            if isCompleted || inboxTasks.isEmpty {
                completionView
            } else {
                processingView
            }
        }
        .sheet(isPresented: $showDatePicker) {
            datePickerSheet
        }
    }

    // MARK: - Processing View

    private var processingView: some View {
        VStack(spacing: 0) {
            // Header
            header

            Spacer()

            // Task Card
            if let task = currentTask {
                taskCard(task)
                    .offset(x: cardOffset)
                    .opacity(cardOpacity)
            }

            Spacer()

            // Action Buttons
            actionButtons
        }
        .padding()
    }

    private var header: some View {
        HStack {
            Button {
                dismiss()
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .font(.title2)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            // Progress indicator
            VStack(spacing: 4) {
                Text("Processing Inbox")
                    .font(.headline)

                Text(progressText)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            // Placeholder for balance
            Image(systemName: "xmark.circle.fill")
                .font(.title2)
                .foregroundStyle(.clear)
        }
        .padding(.bottom, 20)
    }

    private func taskCard(_ task: TaskItem) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // Title
            Text(task.title)
                .font(.title2)
                .fontWeight(.semibold)
                .multilineTextAlignment(.leading)
                .frame(maxWidth: .infinity, alignment: .leading)

            // Description if present
            if let description = task.description, !description.isEmpty {
                Text(description)
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            Spacer()

            // Metadata
            HStack(spacing: 12) {
                if let priority = task.priority {
                    priorityBadge(priority)
                }

                if let energy = task.energyRequired {
                    energyBadge(energy)
                }

                if let minutes = task.estimatedMinutes {
                    Label("\(minutes) min", systemImage: "clock")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            // Created date
            HStack {
                Image(systemName: "calendar.badge.clock")
                    .foregroundStyle(.tertiary)

                Text("Added \(formattedDate(task.createdAt))")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity, minHeight: 280)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color(.secondarySystemBackground))
                .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
        )
    }

    private var actionButtons: some View {
        VStack(spacing: 16) {
            // Primary actions row
            HStack(spacing: 16) {
                // Today button
                actionButton(
                    title: "Today",
                    icon: "sun.max.fill",
                    color: .orange
                ) {
                    await handleMoveToToday()
                }

                // Schedule button
                actionButton(
                    title: "Schedule",
                    icon: "calendar",
                    color: .blue
                ) {
                    showDatePicker = true
                }
            }

            HStack(spacing: 16) {
                // Delete button
                actionButton(
                    title: "Delete",
                    icon: "trash.fill",
                    color: .red
                ) {
                    await handleDelete()
                }

                // Skip button
                actionButton(
                    title: "Skip",
                    icon: "arrow.right",
                    color: .gray
                ) {
                    await handleSkip()
                }
            }
        }
        .padding(.top, 20)
        .disabled(isProcessing)
    }

    private func actionButton(
        title: String,
        icon: String,
        color: Color,
        action: @escaping () async -> Void
    ) -> some View {
        Button {
            Task {
                await action()
            }
        } label: {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title2)

                Text(title)
                    .font(.caption)
                    .fontWeight(.medium)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(color.opacity(0.15))
            .foregroundStyle(color)
            .cornerRadius(12)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Date Picker Sheet

    private var datePickerSheet: some View {
        NavigationStack {
            VStack(spacing: 20) {
                DatePicker(
                    "Schedule for",
                    selection: $selectedDate,
                    in: Date()...,
                    displayedComponents: .date
                )
                .datePickerStyle(.graphical)
                .padding()

                Button {
                    showDatePicker = false
                    Task {
                        await handleSchedule()
                    }
                } label: {
                    Text("Schedule")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.accentColor)
                        .foregroundStyle(.white)
                        .cornerRadius(12)
                }
                .padding(.horizontal)

                Spacer()
            }
            .navigationTitle("Pick a Date")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        showDatePicker = false
                    }
                }
            }
        }
        .presentationDetents([.medium])
    }

    // MARK: - Completion View

    private var completionView: some View {
        VStack(spacing: 24) {
            Spacer()

            // Celebration animation
            ZStack {
                Circle()
                    .fill(Color.green.opacity(0.1))
                    .frame(width: 120, height: 120)

                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 80))
                    .foregroundStyle(.green)
            }

            Text("All done!")
                .font(.largeTitle)
                .fontWeight(.bold)

            if processedCount > 0 {
                Text("You processed \(processedCount) task\(processedCount == 1 ? "" : "s")")
                    .font(.title3)
                    .foregroundStyle(.secondary)
            } else {
                Text("Your inbox is empty")
                    .font(.title3)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Button {
                dismiss()
            } label: {
                Text("Done")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.accentColor)
                    .foregroundStyle(.white)
                    .cornerRadius(12)
            }
            .padding(.horizontal, 40)
            .padding(.bottom, 40)
        }
        .confettiCannon()
    }

    // MARK: - Actions

    private func handleMoveToToday() async {
        guard let task = currentTask else { return }
        isProcessing = true

        let success = await taskStore.moveToToday(id: task.id)
        if success {
            await animateToNext()
        }

        isProcessing = false
    }

    private func handleSchedule() async {
        guard let task = currentTask else { return }
        isProcessing = true

        let success = await taskStore.moveToScheduled(id: task.id, date: selectedDate)
        if success {
            await animateToNext()
        }

        // Reset date picker
        selectedDate = Date()
        isProcessing = false
    }

    private func handleDelete() async {
        guard let task = currentTask else { return }
        isProcessing = true

        let success = await taskStore.deleteTask(id: task.id)
        if success {
            await animateToNext()
        }

        isProcessing = false
    }

    private func handleSkip() async {
        // For skip, we just move to next without incrementing processed count
        isProcessing = true

        // Move to next task in list (wrap around if needed)
        withAnimation(.easeInOut(duration: 0.3)) {
            cardOffset = -400
            cardOpacity = 0
        }

        try? await Task.sleep(nanoseconds: 300_000_000)

        // Reset card position for next task
        cardOffset = 400
        withAnimation(.easeInOut(duration: 0.3)) {
            cardOffset = 0
            cardOpacity = 1
        }

        // Move to next index (with wrap-around)
        if inboxTasks.count > 1 {
            currentIndex = (currentIndex + 1) % inboxTasks.count
        }

        isProcessing = false
    }

    private func animateToNext() async {
        processedCount += 1

        // Animate card out
        withAnimation(.easeInOut(duration: 0.3)) {
            cardOffset = -400
            cardOpacity = 0
        }

        try? await Task.sleep(nanoseconds: 300_000_000)

        // Check if we have more tasks
        if inboxTasks.isEmpty {
            withAnimation(.easeInOut(duration: 0.5)) {
                isCompleted = true
            }
        } else {
            // Reset index if needed (task was removed from array)
            if currentIndex >= inboxTasks.count {
                currentIndex = 0
            }

            // Animate next card in
            cardOffset = 400
            withAnimation(.easeInOut(duration: 0.3)) {
                cardOffset = 0
                cardOpacity = 1
            }
        }
    }

    // MARK: - Helpers

    private func formattedDate(_ isoString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        guard let date = formatter.date(from: isoString) else {
            // Try without fractional seconds
            formatter.formatOptions = [.withInternetDateTime]
            guard let date = formatter.date(from: isoString) else {
                return isoString
            }
            return formatRelativeDate(date)
        }

        return formatRelativeDate(date)
    }

    private func formatRelativeDate(_ date: Date) -> String {
        let calendar = Calendar.current

        if calendar.isDateInToday(date) {
            return "today"
        } else if calendar.isDateInYesterday(date) {
            return "yesterday"
        } else {
            let formatter = DateFormatter()
            formatter.dateStyle = .medium
            formatter.timeStyle = .none
            return formatter.string(from: date)
        }
    }

    private func priorityBadge(_ priority: TaskPriority) -> some View {
        let (color, text): (Color, String) = switch priority {
        case .must: (.red, "Must")
        case .should: (.orange, "Should")
        case .want: (.blue, "Want")
        case .someday: (.gray, "Someday")
        }

        return Text(text)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color.opacity(0.15))
            .foregroundStyle(color)
            .cornerRadius(6)
    }

    private func energyBadge(_ energy: EnergyLevel) -> some View {
        let (icon, text): (String, String) = switch energy {
        case .low: ("battery.25", "Low")
        case .medium: ("battery.50", "Med")
        case .high: ("battery.100", "High")
        }

        return Label(text, systemImage: icon)
            .font(.caption)
            .foregroundStyle(.secondary)
    }
}

// MARK: - Confetti View Modifier

struct ConfettiModifier: ViewModifier {
    @State private var showConfetti = false
    @State private var confettiPieces: [ConfettiPiece] = []

    func body(content: Content) -> some View {
        content
            .onAppear {
                generateConfetti()
                withAnimation {
                    showConfetti = true
                }
            }
            .overlay {
                if showConfetti {
                    GeometryReader { geometry in
                        ForEach(confettiPieces) { piece in
                            ConfettiPieceView(piece: piece, containerSize: geometry.size)
                        }
                    }
                    .allowsHitTesting(false)
                }
            }
    }

    private func generateConfetti() {
        confettiPieces = (0..<50).map { _ in
            ConfettiPiece(
                color: [Color.red, .orange, .yellow, .green, .blue, .purple, .pink].randomElement()!,
                x: CGFloat.random(in: 0...1),
                delay: Double.random(in: 0...0.5)
            )
        }
    }
}

struct ConfettiPiece: Identifiable {
    let id = UUID()
    let color: Color
    let x: CGFloat
    let delay: Double
}

struct ConfettiPieceView: View {
    let piece: ConfettiPiece
    let containerSize: CGSize

    @State private var yOffset: CGFloat = -50
    @State private var rotation: Double = 0
    @State private var opacity: Double = 1

    var body: some View {
        Rectangle()
            .fill(piece.color)
            .frame(width: 8, height: 12)
            .rotationEffect(.degrees(rotation))
            .opacity(opacity)
            .position(x: piece.x * containerSize.width, y: yOffset)
            .onAppear {
                withAnimation(
                    .easeIn(duration: 2)
                    .delay(piece.delay)
                ) {
                    yOffset = containerSize.height + 50
                    rotation = Double.random(in: 180...720)
                }
                withAnimation(
                    .easeIn(duration: 1)
                    .delay(piece.delay + 1)
                ) {
                    opacity = 0
                }
            }
    }
}

extension View {
    func confettiCannon() -> some View {
        modifier(ConfettiModifier())
    }
}

#Preview {
    ProcessModeView(taskStore: TaskStore())
}
