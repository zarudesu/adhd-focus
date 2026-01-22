import SwiftUI

struct AddHabitSheet: View {
    @ObservedObject var habitStore: HabitStore

    @Environment(\.dismiss) var dismiss
    @State private var title = ""
    @State private var selectedTimeOfDay: TimeOfDay = .anytime
    @State private var isCreating = false
    @FocusState private var isFocused: Bool

    private let displayTimeOfDays: [TimeOfDay] = [.morning, .afternoon, .evening, .anytime]

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Title input
                VStack(alignment: .leading, spacing: 8) {
                    Text("Habit Name")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundStyle(.secondary)

                    TextField("e.g., Drink water, Exercise, Read", text: $title, axis: .vertical)
                        .font(.title3)
                        .lineLimit(2...4)
                        .focused($isFocused)
                        .padding()
                        .background(Color(.secondarySystemBackground))
                        .cornerRadius(12)
                }
                .padding(.horizontal)

                // Time of day picker
                VStack(alignment: .leading, spacing: 8) {
                    Text("Time of Day")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundStyle(.secondary)
                        .padding(.horizontal)

                    Picker("Time of Day", selection: $selectedTimeOfDay) {
                        ForEach(displayTimeOfDays, id: \.self) { time in
                            Label(time.displayName, systemImage: time.icon)
                                .tag(time)
                        }
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal)
                }

                // Time of day description
                HStack(spacing: 8) {
                    Image(systemName: selectedTimeOfDay.icon)
                        .foregroundStyle(.secondary)
                    Text(timeOfDayDescription)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(.horizontal)

                Spacer()

                // Create button
                Button {
                    createHabit()
                } label: {
                    HStack {
                        if isCreating {
                            ProgressView()
                                .tint(.white)
                        } else {
                            Image(systemName: "plus.circle.fill")
                            Text("Add Habit")
                        }
                    }
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(title.trimmingCharacters(in: .whitespaces).isEmpty ? Color.gray : Color.accentColor)
                    .foregroundStyle(.white)
                    .cornerRadius(12)
                }
                .disabled(title.trimmingCharacters(in: .whitespaces).isEmpty || isCreating)
                .padding(.horizontal)
                .padding(.bottom)
            }
            .padding(.top)
            .navigationTitle("New Habit")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                isFocused = true
            }
            .onSubmit {
                createHabit()
            }
        }
        .presentationDetents([.medium])
    }

    private var timeOfDayDescription: String {
        switch selectedTimeOfDay {
        case .morning:
            return "Best for starting your day right"
        case .afternoon:
            return "Perfect for midday routines"
        case .evening:
            return "Wind down with evening habits"
        case .night:
            return "Late night rituals"
        case .anytime:
            return "Complete anytime during the day"
        }
    }

    private func createHabit() {
        let trimmedTitle = title.trimmingCharacters(in: .whitespaces)
        guard !trimmedTitle.isEmpty else { return }

        isCreating = true
        Task {
            let success = await habitStore.createHabit(
                name: trimmedTitle,
                timeOfDay: selectedTimeOfDay
            )
            if success {
                dismiss()
            }
            isCreating = false
        }
    }
}

#Preview {
    AddHabitSheet(habitStore: HabitStore())
}
