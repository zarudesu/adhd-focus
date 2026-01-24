import SwiftUI

struct FeatureUnlockModal: View {
    let feature: Feature
    let onDismiss: () -> Void

    @State private var showContent = false
    @State private var showConfetti = false

    var body: some View {
        ZStack {
            // Backdrop
            Color.black.opacity(0.6)
                .ignoresSafeArea()
                .onTapGesture {
                    onDismiss()
                }

            // Modal content
            VStack(spacing: 20) {
                // Icon
                ZStack {
                    Circle()
                        .fill(Color.accentColor.opacity(0.15))
                        .frame(width: 80, height: 80)

                    Image(systemName: iconForFeature(feature.code))
                        .font(.system(size: 36))
                        .foregroundStyle(Color.accentColor)
                        .scaleEffect(showContent ? 1 : 0)
                        .rotationEffect(.degrees(showContent ? 0 : -180))
                        .animation(.spring(response: 0.5, dampingFraction: 0.6).delay(0.2), value: showContent)
                }

                // Text
                VStack(spacing: 8) {
                    Text("You unlocked")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    Text(feature.name)
                        .font(.title2)
                        .fontWeight(.semibold)

                    if let description = feature.description {
                        Text(description)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                    }
                }
                .opacity(showContent ? 1 : 0)
                .offset(y: showContent ? 0 : 20)
                .animation(.easeOut(duration: 0.3).delay(0.3), value: showContent)

                // Button
                Button {
                    onDismiss()
                } label: {
                    Text("Got it!")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.accentColor)
                        .foregroundStyle(.white)
                        .cornerRadius(12)
                }
                .opacity(showContent ? 1 : 0)
                .offset(y: showContent ? 0 : 20)
                .animation(.easeOut(duration: 0.3).delay(0.4), value: showContent)
            }
            .padding(24)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color(.systemBackground))
            )
            .padding(.horizontal, 32)
            .scaleEffect(showContent ? 1 : 0.9)
            .opacity(showContent ? 1 : 0)
            .animation(.spring(response: 0.4, dampingFraction: 0.8), value: showContent)

            // Confetti
            if showConfetti {
                ConfettiView()
                    .allowsHitTesting(false)
            }
        }
        .onAppear {
            showContent = true
            showConfetti = true

            // Hide confetti after animation
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                showConfetti = false
            }
        }
    }

    private func iconForFeature(_ code: String) -> String {
        guard let featureCode = FeatureCode(rawValue: code) else {
            return "sparkles"
        }
        return featureCode.systemImage
    }
}

// MARK: - Simple Confetti View

struct ConfettiView: View {
    @State private var particles: [ConfettiParticle] = []

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                ForEach(particles) { particle in
                    Rectangle()
                        .fill(particle.color)
                        .frame(width: particle.size, height: particle.size)
                        .rotationEffect(.degrees(particle.rotation))
                        .position(particle.position)
                        .opacity(particle.opacity)
                }
            }
            .onAppear {
                createParticles(in: geometry.size)
                animateParticles()
            }
        }
        .ignoresSafeArea()
    }

    private func createParticles(in size: CGSize) {
        let colors: [Color] = [.yellow, .blue, .orange, .green, .pink, .purple]
        particles = (0..<40).map { _ in
            ConfettiParticle(
                position: CGPoint(x: size.width / 2, y: size.height / 2),
                velocity: CGPoint(
                    x: Double.random(in: -200...200),
                    y: Double.random(in: -400...(-100))
                ),
                color: colors.randomElement()!,
                size: CGFloat.random(in: 6...12),
                rotation: Double.random(in: 0...360),
                opacity: 1
            )
        }
    }

    private func animateParticles() {
        Timer.scheduledTimer(withTimeInterval: 0.016, repeats: true) { timer in
            var allFallen = true

            for i in particles.indices {
                particles[i].velocity.y += 15 // gravity
                particles[i].position.x += particles[i].velocity.x * 0.016
                particles[i].position.y += particles[i].velocity.y * 0.016
                particles[i].rotation += Double.random(in: -5...5)

                if particles[i].position.y < UIScreen.main.bounds.height + 100 {
                    allFallen = false
                } else {
                    particles[i].opacity = 0
                }
            }

            if allFallen {
                timer.invalidate()
            }
        }
    }
}

struct ConfettiParticle: Identifiable {
    let id = UUID()
    var position: CGPoint
    var velocity: CGPoint
    let color: Color
    let size: CGFloat
    var rotation: Double
    var opacity: Double
}

#Preview {
    FeatureUnlockModal(
        feature: Feature(
            code: "nav_today",
            name: "Today",
            description: "Focus on what matters today",
            icon: "sun.max.fill",
            unlockLevel: 1
        ),
        onDismiss: {}
    )
}
