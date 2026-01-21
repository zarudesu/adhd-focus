import SwiftUI

struct AddTaskSheet: View {
    @ObservedObject var taskStore: TaskStore
    var defaultStatus: TaskStatus = .inbox

    @Environment(\.dismiss) var dismiss
    @State private var title = ""
    @State private var isCreating = false
    @FocusState private var isFocused: Bool

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                TextField("What needs to be done?", text: $title, axis: .vertical)
                    .font(.title3)
                    .lineLimit(3...6)
                    .focused($isFocused)
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(12)
                    .padding(.horizontal)

                Spacer()

                // Quick add hint
                Text("Press Return or tap Add to create task")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(.top)
            .navigationTitle("Add Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .primaryAction) {
                    Button {
                        createTask()
                    } label: {
                        if isCreating {
                            ProgressView()
                        } else {
                            Text("Add")
                                .fontWeight(.semibold)
                        }
                    }
                    .disabled(title.trimmingCharacters(in: .whitespaces).isEmpty || isCreating)
                }
            }
            .onAppear {
                isFocused = true
            }
            .onSubmit {
                createTask()
            }
        }
        .presentationDetents([.medium])
    }

    private func createTask() {
        let trimmedTitle = title.trimmingCharacters(in: .whitespaces)
        guard !trimmedTitle.isEmpty else { return }

        isCreating = true
        Task {
            let success = await taskStore.createTask(title: trimmedTitle, status: defaultStatus)
            if success {
                dismiss()
            }
            isCreating = false
        }
    }
}

#Preview {
    AddTaskSheet(taskStore: TaskStore())
}
