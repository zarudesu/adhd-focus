import Foundation
import SwiftUI
import UserNotifications
import AVFoundation

@MainActor
class FocusStore: ObservableObject {
    // MARK: - Timer State

    @Published var timerState: TimerState = .idle
    @Published var currentSessionType: SessionType = .work
    @Published var timeRemaining: Int = 25 * 60 // seconds
    @Published var totalDuration: Int = 25 * 60 // seconds

    // MARK: - Session Tracking

    @Published var currentSession: FocusSession?
    @Published var selectedTask: TaskItem?
    @Published var pomodorosCompletedInSession: Int = 0

    // MARK: - Stats

    @Published var todayStats: TodayFocusStats?
    @Published var totalStats: TotalFocusStats?
    @Published var sessions: [FocusSession] = []

    // MARK: - Loading State

    @Published var isLoading = false
    @Published var error: String?

    // MARK: - Timer Configuration

    var workDuration: Int = 25 // minutes
    var shortBreakDuration: Int = 5
    var longBreakDuration: Int = 15
    var pomodorosUntilLongBreak: Int = 4

    // MARK: - Private

    private var timer: Timer?
    private let api = APIClient.shared
    private var audioPlayer: AVAudioPlayer?

    // MARK: - Computed Properties

    var progress: Double {
        guard totalDuration > 0 else { return 0 }
        return Double(totalDuration - timeRemaining) / Double(totalDuration)
    }

    var timeString: String {
        let minutes = timeRemaining / 60
        let seconds = timeRemaining % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }

    var isOnBreak: Bool {
        currentSessionType != .work
    }

    // MARK: - Initialization

    init() {
        requestNotificationPermission()
        setupAudio()
    }

    // MARK: - Timer Actions

    func start() {
        switch timerState {
        case .idle:
            // Start new timer
            startNewSession()
        case .paused:
            // Resume paused timer
            resumeTimer()
        case .running:
            // Already running
            break
        }
    }

    func pause() {
        guard timerState == .running else { return }
        timerState = .paused
        timer?.invalidate()
        timer = nil
    }

    func reset() {
        timer?.invalidate()
        timer = nil
        timerState = .idle

        // Reset to current session type duration
        let duration = getDuration(for: currentSessionType)
        totalDuration = duration * 60
        timeRemaining = totalDuration
    }

    func skip() {
        // Complete current segment and move to next
        timer?.invalidate()
        timer = nil

        if currentSessionType == .work {
            // Was working - save the pomodoro
            pomodorosCompletedInSession += 1
        }

        moveToNextPhase()
    }

    func stop() async {
        timer?.invalidate()
        timer = nil
        timerState = .idle

        // Save session if we completed any pomodoros
        if let session = currentSession, pomodorosCompletedInSession > 0 {
            await completeSession(session)
        }

        // Reset everything
        currentSession = nil
        pomodorosCompletedInSession = 0
        currentSessionType = .work
        totalDuration = workDuration * 60
        timeRemaining = totalDuration
    }

    // MARK: - Task Selection

    func selectTask(_ task: TaskItem?) {
        selectedTask = task
    }

    // MARK: - Private Timer Methods

    private func startNewSession() {
        let duration = getDuration(for: currentSessionType)
        totalDuration = duration * 60
        timeRemaining = totalDuration
        timerState = .running

        // Create API session if starting work
        if currentSessionType == .work && currentSession == nil {
            Task {
                await createSessionOnServer()
            }
        }

        startTimer()
    }

    private func resumeTimer() {
        timerState = .running
        startTimer()
    }

    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.tick()
            }
        }
    }

    private func tick() {
        guard timerState == .running else { return }

        if timeRemaining > 0 {
            timeRemaining -= 1
        } else {
            // Timer completed
            timerCompleted()
        }
    }

    private func timerCompleted() {
        timer?.invalidate()
        timer = nil

        // Play sound and haptic
        playCompletionSound()
        triggerHapticFeedback()

        // Send notification
        sendNotification()

        if currentSessionType == .work {
            // Completed a pomodoro
            pomodorosCompletedInSession += 1
        }

        moveToNextPhase()
    }

    private func moveToNextPhase() {
        if currentSessionType == .work {
            // Decide break type
            if pomodorosCompletedInSession % pomodorosUntilLongBreak == 0 && pomodorosCompletedInSession > 0 {
                currentSessionType = .longBreak
            } else {
                currentSessionType = .shortBreak
            }
        } else {
            // Break finished, back to work
            currentSessionType = .work
        }

        // Setup next timer
        let duration = getDuration(for: currentSessionType)
        totalDuration = duration * 60
        timeRemaining = totalDuration
        timerState = .idle
    }

    private func getDuration(for type: SessionType) -> Int {
        switch type {
        case .work: return workDuration
        case .shortBreak: return shortBreakDuration
        case .longBreak: return longBreakDuration
        }
    }

    // MARK: - API Methods

    func fetchSessions() async {
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let response = try await api.getFocusSessions()
            self.sessions = response.sessions
            self.todayStats = response.todayStats
            self.totalStats = response.totalStats
        } catch {
            self.error = error.localizedDescription
        }
    }

    private func createSessionOnServer() async {
        do {
            let input = CreateSessionInput(taskId: selectedTask?.id)
            let session = try await api.createFocusSession(input)
            self.currentSession = session
        } catch {
            self.error = error.localizedDescription
        }
    }

    private func completeSession(_ session: FocusSession) async {
        let input = UpdateSessionInput(
            completed: true,
            pomodoros: pomodorosCompletedInSession,
            durationMinutes: pomodorosCompletedInSession * workDuration
        )

        do {
            _ = try await api.updateFocusSession(id: session.id, input)
            // Refresh stats
            await fetchSessions()
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: - Notifications

    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { _, _ in }
    }

    private func sendNotification() {
        let content = UNMutableNotificationContent()

        if currentSessionType == .work {
            content.title = "Pomodoro Complete!"
            content.body = "Great work! Time for a break."
        } else {
            content.title = "Break Over"
            content.body = "Ready to focus again?"
        }

        content.sound = .default

        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: nil
        )

        UNUserNotificationCenter.current().add(request)
    }

    // MARK: - Audio

    private func setupAudio() {
        // Configure audio session for background playback
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
        try? AVAudioSession.sharedInstance().setActive(true)
    }

    private func playCompletionSound() {
        // Use system sound
        AudioServicesPlaySystemSound(1007) // Standard notification sound
    }

    // MARK: - Haptics

    private func triggerHapticFeedback() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }
}
