import SwiftUI

struct FocusView: View {
    @ObservedObject var taskStore: TaskStore
    @StateObject private var focusStore = FocusStore()
    @State private var showTaskSelector = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 32) {
                    // Timer Circle
                    TimerCircle(
                        progress: focusStore.progress,
                        timeString: focusStore.timeString,
                        sessionType: focusStore.currentSessionType,
                        timerState: focusStore.timerState
                    )
                    .padding(.top, 20)

                    // Pomodoro indicators
                    pomodoroIndicators

                    // Timer Controls
                    timerControls

                    // Task Selection
                    taskSelection

                    // Today Stats
                    todayStats

                    Spacer(minLength: 40)
                }
                .padding(.horizontal)
            }
            .navigationTitle("Focus")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    if focusStore.timerState != .idle || focusStore.pomodorosCompletedInSession > 0 {
                        Button {
                            Task {
                                await focusStore.stop()
                            }
                        } label: {
                            Text("End")
                                .foregroundStyle(.red)
                        }
                    }
                }
            }
            .sheet(isPresented: $showTaskSelector) {
                TaskSelectorSheet(
                    taskStore: taskStore,
                    selectedTask: $focusStore.selectedTask
                )
            }
            .task {
                await focusStore.fetchSessions()
            }
        }
    }

    // MARK: - Pomodoro Indicators

    private var pomodoroIndicators: some View {
        HStack(spacing: 12) {
            ForEach(0..<4, id: \.self) { index in
                Circle()
                    .fill(index < focusStore.pomodorosCompletedInSession ? Color.orange : Color(.systemGray4))
                    .frame(width: 12, height: 12)
                    .scaleEffect(index < focusStore.pomodorosCompletedInSession ? 1.0 : 0.8)
                    .animation(.spring(response: 0.3), value: focusStore.pomodorosCompletedInSession)
            }
        }
    }

    // MARK: - Timer Controls

    private var timerControls: some View {
        HStack(spacing: 24) {
            // Reset button
            Button {
                withAnimation {
                    focusStore.reset()
                }
            } label: {
                Image(systemName: "arrow.counterclockwise")
                    .font(.title2)
                    .frame(width: 56, height: 56)
                    .background(Color(.systemGray5))
                    .clipShape(Circle())
            }
            .disabled(focusStore.timerState == .idle && focusStore.progress == 0)
            .opacity(focusStore.timerState == .idle && focusStore.progress == 0 ? 0.4 : 1)

            // Play/Pause button
            Button {
                withAnimation(.spring(response: 0.3)) {
                    if focusStore.timerState == .running {
                        focusStore.pause()
                    } else {
                        focusStore.start()
                    }
                }
            } label: {
                Image(systemName: focusStore.timerState == .running ? "pause.fill" : "play.fill")
                    .font(.title)
                    .foregroundStyle(.black)
                    .frame(width: 80, height: 80)
                    .background(
                        focusStore.isOnBreak ? Color.cyan : Color.orange
                    )
                    .clipShape(Circle())
                    .shadow(
                        color: (focusStore.isOnBreak ? Color.cyan : Color.orange).opacity(0.3),
                        radius: 10,
                        y: 4
                    )
            }

            // Skip button
            Button {
                withAnimation {
                    focusStore.skip()
                }
            } label: {
                Image(systemName: "forward.fill")
                    .font(.title2)
                    .frame(width: 56, height: 56)
                    .background(Color(.systemGray5))
                    .clipShape(Circle())
            }
        }
    }

    // MARK: - Task Selection

    private var taskSelection: some View {
        VStack(spacing: 12) {
            Text("Working on")
                .font(.caption)
                .foregroundStyle(.secondary)
                .textCase(.uppercase)

            Button {
                showTaskSelector = true
            } label: {
                HStack {
                    if let task = focusStore.selectedTask {
                        Image(systemName: "checkmark.circle")
                            .foregroundStyle(.orange)
                        Text(task.title)
                            .foregroundStyle(.primary)
                            .lineLimit(1)
                    } else {
                        Image(systemName: "plus.circle")
                            .foregroundStyle(.secondary)
                        Text("Select a task")
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
            }
            .buttonStyle(.plain)
            .disabled(focusStore.timerState != .idle)
            .opacity(focusStore.timerState != .idle ? 0.6 : 1)
        }
    }

    // MARK: - Today Stats

    private var todayStats: some View {
        VStack(spacing: 16) {
            HStack {
                Text("Today")
                    .font(.headline)
                Spacer()
            }

            HStack(spacing: 20) {
                statCard(
                    icon: "flame.fill",
                    value: "\(focusStore.todayStats?.pomodoros ?? 0)",
                    label: "Pomodoros",
                    color: .orange
                )

                statCard(
                    icon: "clock.fill",
                    value: "\(focusStore.todayStats?.focusMinutes ?? 0)",
                    label: "Minutes",
                    color: .blue
                )

                statCard(
                    icon: "checkmark.circle.fill",
                    value: "\(focusStore.todayStats?.sessionsCompleted ?? 0)",
                    label: "Sessions",
                    color: .green
                )
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(16)
    }

    private func statCard(icon: String, value: String, label: String, color: Color) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)

            Text(value)
                .font(.title2)
                .fontWeight(.bold)

            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Preview

#Preview {
    FocusView(taskStore: TaskStore())
        .preferredColorScheme(.dark)
}
