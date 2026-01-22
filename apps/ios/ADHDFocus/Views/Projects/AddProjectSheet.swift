import SwiftUI

struct AddProjectSheet: View {
    @ObservedObject var projectStore: ProjectStore

    @Environment(\.dismiss) var dismiss
    @State private var name = ""
    @State private var selectedEmoji = ""
    @State private var selectedColor = "#6366f1"
    @State private var description = ""
    @State private var isCreating = false
    @FocusState private var isNameFocused: Bool

    var body: some View {
        NavigationStack {
            Form {
                Section("Project Name") {
                    TextField("Enter project name", text: $name)
                        .focused($isNameFocused)
                }

                Section("Emoji") {
                    EmojiPicker(selectedEmoji: $selectedEmoji)
                }

                Section("Color") {
                    ColorPicker(selectedColor: $selectedColor)
                }

                Section("Description (Optional)") {
                    TextField("Add a description...", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                }
            }
            .navigationTitle("New Project")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .primaryAction) {
                    Button {
                        createProject()
                    } label: {
                        if isCreating {
                            ProgressView()
                        } else {
                            Text("Create")
                                .fontWeight(.semibold)
                        }
                    }
                    .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || isCreating)
                }
            }
            .onAppear {
                isNameFocused = true
            }
        }
    }

    private func createProject() {
        let trimmedName = name.trimmingCharacters(in: .whitespaces)
        guard !trimmedName.isEmpty else { return }

        isCreating = true
        Task {
            let project = await projectStore.createProject(
                name: trimmedName,
                emoji: selectedEmoji.isEmpty ? nil : selectedEmoji,
                color: selectedColor,
                description: description.isEmpty ? nil : description
            )
            if project != nil {
                dismiss()
            }
            isCreating = false
        }
    }
}

// MARK: - Emoji Picker

struct EmojiPicker: View {
    @Binding var selectedEmoji: String

    private let emojis = [
        "rocket", "sparkles", "star", "heart", "flame", "bolt",
        "target", "book", "briefcase", "house", "car", "plane",
        "gift", "bell", "camera", "music", "sun", "moon",
        "leaf", "drop", "bug", "gear", "link", "flag"
    ]

    // Map SF Symbol names to actual emojis for display
    private let emojiMap: [String: String] = [
        "rocket": "\u{1F680}",
        "sparkles": "\u{2728}",
        "star": "\u{2B50}",
        "heart": "\u{2764}\u{FE0F}",
        "flame": "\u{1F525}",
        "bolt": "\u{26A1}",
        "target": "\u{1F3AF}",
        "book": "\u{1F4D6}",
        "briefcase": "\u{1F4BC}",
        "house": "\u{1F3E0}",
        "car": "\u{1F697}",
        "plane": "\u{2708}\u{FE0F}",
        "gift": "\u{1F381}",
        "bell": "\u{1F514}",
        "camera": "\u{1F4F7}",
        "music": "\u{1F3B5}",
        "sun": "\u{2600}\u{FE0F}",
        "moon": "\u{1F319}",
        "leaf": "\u{1F343}",
        "drop": "\u{1F4A7}",
        "bug": "\u{1F41B}",
        "gear": "\u{2699}\u{FE0F}",
        "link": "\u{1F517}",
        "flag": "\u{1F3C1}"
    ]

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 8), count: 6)

    var body: some View {
        LazyVGrid(columns: columns, spacing: 8) {
            // Empty option
            Button {
                selectedEmoji = ""
            } label: {
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(selectedEmoji.isEmpty ? Color.accentColor.opacity(0.2) : Color(.secondarySystemBackground))
                        .frame(width: 44, height: 44)

                    Image(systemName: "xmark")
                        .font(.title3)
                        .foregroundStyle(selectedEmoji.isEmpty ? .primary : .secondary)
                }
            }
            .buttonStyle(.plain)

            ForEach(emojis, id: \.self) { emoji in
                let displayEmoji = emojiMap[emoji] ?? emoji
                Button {
                    selectedEmoji = displayEmoji
                } label: {
                    ZStack {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(selectedEmoji == displayEmoji ? Color.accentColor.opacity(0.2) : Color(.secondarySystemBackground))
                            .frame(width: 44, height: 44)

                        Text(displayEmoji)
                            .font(.title2)
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Color Picker

struct ColorPicker: View {
    @Binding var selectedColor: String

    private let colors: [(name: String, hex: String)] = [
        ("Red", "#ef4444"),
        ("Orange", "#f97316"),
        ("Yellow", "#eab308"),
        ("Green", "#22c55e"),
        ("Teal", "#14b8a6"),
        ("Blue", "#3b82f6"),
        ("Indigo", "#6366f1"),
        ("Purple", "#a855f7"),
        ("Pink", "#ec4899"),
        ("Gray", "#6b7280")
    ]

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 12), count: 5)

    var body: some View {
        LazyVGrid(columns: columns, spacing: 12) {
            ForEach(colors, id: \.hex) { color in
                Button {
                    selectedColor = color.hex
                } label: {
                    ZStack {
                        Circle()
                            .fill(Color(hex: color.hex))
                            .frame(width: 40, height: 40)

                        if selectedColor == color.hex {
                            Circle()
                                .strokeBorder(.white, lineWidth: 2)
                                .frame(width: 32, height: 32)

                            Image(systemName: "checkmark")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundStyle(.white)
                        }
                    }
                }
                .buttonStyle(.plain)
                .accessibilityLabel(color.name)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    AddProjectSheet(projectStore: ProjectStore())
}
