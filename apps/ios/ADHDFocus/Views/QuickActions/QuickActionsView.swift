import SwiftUI

struct QuickActionsView: View {
    @ObservedObject var taskStore: TaskStore
    @Environment(\.dismiss) private var dismiss

    // Timer state
    @State private var remainingSeconds: Int = 120 // 2 minutes
    @State private var isTimerRunning = true
    @State private var timerFinished = false

    // Input state
    @State private var taskInput = ""
    @State private var capturedTasks: [CapturedTask] = []
    @FocusState private var isInputFocused: Bool

    // Timer
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    private let totalSeconds: Int = 120

    struct CapturedTask: Identifiable {
        let id = UUID()
        let title: String
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if timerFinished {
                    summaryView
                } else {
                    captureView
                }
            }
            .navigationTitle("Quick Capture")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
        .onReceive(timer) { _ in
            guard isTimerRunning && remainingSeconds > 0 else { return }
            remainingSeconds -= 1

            // Haptic pulse every 30 seconds
            if remainingSeconds > 0 && remainingSeconds % 30 == 0 {
                let generator = UIImpactFeedbackGenerator(style: .medium)
                generator.impactOccurred()
            }

            // Timer finished
            if remainingSeconds == 0 {
                finishCapture()
            }
        }
        .onAppear {
            // Focus input immediately
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                isInputFocused = true
            }
        }
    }

    // MARK: - Capture View

    private var captureView: some View {
        VStack(spacing: 0) {
            // Timer section
            timerSection
                .padding(.vertical, 24)

            // Input section
            inputSection
                .padding(.horizontal)
                .padding(.bottom, 16)

            Divider()

            // Captured tasks list
            if capturedTasks.isEmpty {
                Spacer()
                emptyState
                Spacer()
            } else {
                tasksList
            }

            // Task count
            Text("\(capturedTasks.count) task\(capturedTasks.count == 1 ? "" : "s") captured")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .padding(.bottom, 16)
        }
    }

    private var timerSection: some View {
        VStack(spacing: 12) {
            // Timer display
            HStack(spacing: 8) {
                Image(systemName: "timer")
                    .font(.title2)
                Text(formattedTime)
                    .font(.system(size: 36, weight: .bold, design: .monospaced))
                Text("remaining")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .foregroundStyle(timerColor)

            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    // Background track
                    RoundedRectangle(cornerRadius: 6)
                        .fill(Color(.systemGray5))
                        .frame(height: 12)

                    // Progress fill
                    RoundedRectangle(cornerRadius: 6)
                        .fill(timerColor.gradient)
                        .frame(width: progressWidth(for: geometry.size.width), height: 12)
                        .animation(.linear(duration: 1), value: remainingSeconds)
                }
            }
            .frame(height: 12)
            .padding(.horizontal, 32)
        }
    }

    private var inputSection: some View {
        HStack(spacing: 12) {
            TextField("Type a task...", text: $taskInput)
                .textFieldStyle(.roundedBorder)
                .font(.body)
                .focused($isInputFocused)
                .submitLabel(.done)
                .onSubmit {
                    addTask()
                }

            Button {
                addTask()
            } label: {
                Image(systemName: "plus.circle.fill")
                    .font(.title)
                    .foregroundStyle(taskInput.isEmpty ? Color.secondary : Color.accentColor)
            }
            .disabled(taskInput.trimmingCharacters(in: .whitespaces).isEmpty)
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "brain.head.profile")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)

            Text("Brain dump time!")
                .font(.headline)

            Text("Type whatever comes to mind.\nNo thinking, just capturing.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }

    private var tasksList: some View {
        List {
            ForEach(capturedTasks.reversed()) { task in
                HStack(spacing: 12) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                    Text(task.title)
                        .font(.body)
                }
                .listRowBackground(Color(.secondarySystemBackground))
            }
        }
        .listStyle(.plain)
    }

    // MARK: - Summary View

    private var summaryView: some View {
        VStack(spacing: 32) {
            Spacer()

            // Celebration
            VStack(spacing: 16) {
                Image(systemName: "party.popper.fill")
                    .font(.system(size: 64))
                    .foregroundStyle(.orange)

                Text("Time's up!")
                    .font(.largeTitle)
                    .fontWeight(.bold)

                Text("You captured \(capturedTasks.count) task\(capturedTasks.count == 1 ? "" : "s")!")
                    .font(.title2)
                    .foregroundStyle(.secondary)
            }

            // Task summary
            if !capturedTasks.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(capturedTasks.prefix(5)) { task in
                        HStack(spacing: 12) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(.green)
                            Text(task.title)
                                .font(.body)
                                .lineLimit(1)
                        }
                    }
                    if capturedTasks.count > 5 {
                        Text("... and \(capturedTasks.count - 5) more")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(.secondarySystemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .padding(.horizontal)
            }

            Spacer()

            // Actions
            VStack(spacing: 12) {
                Button {
                    restartCapture()
                } label: {
                    Label("Capture More", systemImage: "arrow.counterclockwise")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.accentColor)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                Button {
                    dismiss()
                } label: {
                    Text("Done")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(.secondarySystemBackground))
                        .foregroundStyle(.primary)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 32)
        }
    }

    // MARK: - Helpers

    private var formattedTime: String {
        let minutes = remainingSeconds / 60
        let seconds = remainingSeconds % 60
        return String(format: "%d:%02d", minutes, seconds)
    }

    private var timerColor: Color {
        if remainingSeconds <= 10 {
            return .red
        } else if remainingSeconds <= 30 {
            return .orange
        }
        return .accentColor
    }

    private func progressWidth(for totalWidth: CGFloat) -> CGFloat {
        let progress = CGFloat(remainingSeconds) / CGFloat(totalSeconds)
        return totalWidth * progress
    }

    private func addTask() {
        let trimmedTitle = taskInput.trimmingCharacters(in: .whitespaces)
        guard !trimmedTitle.isEmpty else { return }

        // Add to local list immediately for responsiveness
        capturedTasks.append(CapturedTask(title: trimmedTitle))

        // Haptic feedback
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.impactOccurred()

        // Create task via API
        Task {
            _ = await taskStore.createTask(title: trimmedTitle, status: .inbox)
        }

        // Clear input and keep focus
        taskInput = ""
        isInputFocused = true
    }

    private func finishCapture() {
        isTimerRunning = false
        timerFinished = true
        isInputFocused = false

        // Celebration haptic
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }

    private func restartCapture() {
        remainingSeconds = totalSeconds
        isTimerRunning = true
        timerFinished = false
        capturedTasks = []

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            isInputFocused = true
        }
    }
}

#Preview {
    QuickActionsView(taskStore: TaskStore())
}
