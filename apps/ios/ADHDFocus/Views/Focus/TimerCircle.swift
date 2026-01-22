import SwiftUI

struct TimerCircle: View {
    let progress: Double
    let timeString: String
    let sessionType: SessionType
    let timerState: TimerState

    private let lineWidth: CGFloat = 12
    private let circleSize: CGFloat = 280

    var body: some View {
        ZStack {
            // Background circle
            Circle()
                .stroke(
                    Color(sessionType == .work ? .systemGray5 : .systemGray4),
                    lineWidth: lineWidth
                )
                .frame(width: circleSize, height: circleSize)

            // Progress circle
            Circle()
                .trim(from: 0, to: progress)
                .stroke(
                    progressGradient,
                    style: StrokeStyle(
                        lineWidth: lineWidth,
                        lineCap: .round
                    )
                )
                .frame(width: circleSize, height: circleSize)
                .rotationEffect(.degrees(-90))
                .animation(.linear(duration: 0.5), value: progress)

            // Center content
            VStack(spacing: 8) {
                // Time remaining
                Text(timeString)
                    .font(.system(size: 72, weight: .thin, design: .rounded))
                    .monospacedDigit()
                    .foregroundStyle(timeColor)
                    .contentTransition(.numericText())
                    .animation(.easeInOut, value: timeString)

                // Session type label
                Text(sessionType.displayName)
                    .font(.title3)
                    .fontWeight(.medium)
                    .foregroundStyle(.secondary)

                // State indicator
                if timerState == .paused {
                    HStack(spacing: 4) {
                        Image(systemName: "pause.fill")
                            .font(.caption)
                        Text("Paused")
                            .font(.caption)
                            .fontWeight(.medium)
                    }
                    .foregroundStyle(.orange)
                    .padding(.top, 4)
                }
            }
        }
    }

    private var progressGradient: AngularGradient {
        let colors: [Color] = sessionType == .work
            ? [.orange, .red, .pink]
            : [.blue, .cyan, .teal]

        return AngularGradient(
            gradient: Gradient(colors: colors),
            center: .center,
            startAngle: .degrees(0),
            endAngle: .degrees(360 * progress)
        )
    }

    private var timeColor: Color {
        switch timerState {
        case .idle:
            return .primary
        case .running:
            return sessionType == .work ? .orange : .cyan
        case .paused:
            return .orange
        }
    }
}

// MARK: - Preview

#Preview("Work - Running") {
    TimerCircle(
        progress: 0.35,
        timeString: "16:15",
        sessionType: .work,
        timerState: .running
    )
    .preferredColorScheme(.dark)
}

#Preview("Break - Paused") {
    TimerCircle(
        progress: 0.7,
        timeString: "01:30",
        sessionType: .shortBreak,
        timerState: .paused
    )
    .preferredColorScheme(.dark)
}

#Preview("Idle") {
    TimerCircle(
        progress: 0,
        timeString: "25:00",
        sessionType: .work,
        timerState: .idle
    )
    .preferredColorScheme(.dark)
}
