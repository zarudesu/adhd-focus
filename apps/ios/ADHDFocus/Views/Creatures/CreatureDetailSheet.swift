import SwiftUI

struct CreatureDetailSheet: View {
    let creature: Creature
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Large emoji
                    Text(creature.emoji)
                        .font(.system(size: 120))
                        .padding(.top, 20)

                    // Name and rarity
                    VStack(spacing: 8) {
                        Text(creature.name)
                            .font(.title.bold())

                        RarityBadge(rarity: creature.displayRarity)
                    }

                    // Description/lore
                    if let description = creature.description, !description.isEmpty {
                        Text(description)
                            .font(.body)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 24)
                    }

                    // Stats card
                    statsCard

                    Spacer(minLength: 40)
                }
                .padding()
            }
            .background(backgroundGradient)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }

    private var statsCard: some View {
        VStack(spacing: 16) {
            // Discovery date
            if let date = creature.formattedCaughtDate {
                HStack {
                    Image(systemName: "calendar")
                        .foregroundStyle(.secondary)
                    Text("Discovered on \(date)")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }

            // Count
            if creature.count > 1 {
                HStack {
                    Image(systemName: "number")
                        .foregroundStyle(.secondary)
                    Text("Encountered \(creature.count) times")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }

            // XP multiplier
            if let multiplier = creature.xpMultiplier, multiplier != 1.0 {
                HStack {
                    Image(systemName: "sparkles")
                        .foregroundStyle(.yellow)
                    Text("XP Bonus: \(String(format: "%.1f", multiplier))x")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    private var backgroundGradient: some View {
        LinearGradient(
            colors: [
                rarityColor.opacity(0.1),
                Color(.systemBackground)
            ],
            startPoint: .top,
            endPoint: .center
        )
        .ignoresSafeArea()
    }

    private var rarityColor: Color {
        switch creature.displayRarity {
        case .common: return .gray
        case .uncommon: return .green
        case .rare: return .blue
        case .legendary: return .purple
        case .mythic: return .orange
        case .secret: return .pink
        }
    }
}

// MARK: - Spawn Result Sheet

struct SpawnResultSheet: View {
    let creature: SpawnedCreature
    let isNew: Bool
    let onDismiss: () -> Void

    @State private var showContent = false
    @State private var sparkleRotation = 0.0

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Sparkle animation
            ZStack {
                // Background sparkles
                ForEach(0..<8, id: \.self) { index in
                    Image(systemName: "sparkle")
                        .font(.title)
                        .foregroundStyle(rarityColor.opacity(0.6))
                        .offset(
                            x: cos(Double(index) * .pi / 4 + sparkleRotation) * 80,
                            y: sin(Double(index) * .pi / 4 + sparkleRotation) * 80
                        )
                }

                // Creature emoji
                Text(creature.emoji)
                    .font(.system(size: 100))
                    .scaleEffect(showContent ? 1 : 0)
                    .animation(.spring(response: 0.5, dampingFraction: 0.6), value: showContent)
            }

            // Title
            VStack(spacing: 8) {
                Text(isNew ? "New Discovery!" : "Found Again!")
                    .font(.title2.bold())
                    .foregroundStyle(isNew ? .primary : .secondary)

                Text(creature.name)
                    .font(.largeTitle.bold())

                RarityBadge(rarity: creature.rarity ?? .common)
            }
            .opacity(showContent ? 1 : 0)
            .animation(.easeIn.delay(0.3), value: showContent)

            // Description
            if let description = creature.description {
                Text(description)
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
                    .opacity(showContent ? 1 : 0)
                    .animation(.easeIn.delay(0.5), value: showContent)
            }

            Spacer()

            // Dismiss button
            Button {
                onDismiss()
            } label: {
                Text("Awesome!")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(rarityColor)
                    .foregroundStyle(.white)
                    .cornerRadius(12)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 24)
            .opacity(showContent ? 1 : 0)
            .animation(.easeIn.delay(0.7), value: showContent)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(
            LinearGradient(
                colors: [
                    rarityColor.opacity(0.2),
                    Color(.systemBackground)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        )
        .onAppear {
            withAnimation {
                showContent = true
            }
            // Start sparkle rotation
            withAnimation(.linear(duration: 8).repeatForever(autoreverses: false)) {
                sparkleRotation = .pi * 2
            }
        }
        .interactiveDismissDisabled()
    }

    private var rarityColor: Color {
        switch creature.rarity ?? .common {
        case .common: return .gray
        case .uncommon: return .green
        case .rare: return .blue
        case .legendary: return .purple
        case .mythic: return .orange
        case .secret: return .pink
        }
    }
}

// MARK: - Preview

#Preview("Detail Sheet") {
    CreatureDetailSheet(
        creature: Creature(
            id: "1",
            code: "whisp",
            name: "Whisp",
            emoji: "\u{1F431}",
            description: "A tiny, mischievous spirit that loves to play with loose papers and untied shoelaces.",
            rarity: .common,
            isCaught: true,
            count: 3,
            firstCaughtAt: "2024-01-15T10:30:00Z",
            xpMultiplier: 1.0
        )
    )
}

#Preview("Spawn Result - New") {
    SpawnResultSheet(
        creature: SpawnedCreature(
            id: "1",
            code: "phoenix",
            name: "Phoenix",
            emoji: "\u{1F426}",
            description: "A legendary bird of fire that rises from its own ashes.",
            rarity: .legendary,
            xpMultiplier: 2.0
        ),
        isNew: true,
        onDismiss: {}
    )
}
