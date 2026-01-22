import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var email = ""
    @State private var password = ""
    @State private var showSignup = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Spacer()

                // Logo/Title
                VStack(spacing: 8) {
                    Image(systemName: "brain.head.profile")
                        .font(.system(size: 60))
                        .foregroundStyle(.primary)

                    Text("ADHD Focus")
                        .font(.largeTitle)
                        .fontWeight(.bold)

                    Text("Beat your 8 seconds")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                // Form
                VStack(spacing: 16) {
                    TextField("Email", text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .textFieldStyle(.roundedBorder)

                    SecureField("Password", text: $password)
                        .textContentType(.password)
                        .textFieldStyle(.roundedBorder)

                    if let error = authManager.error {
                        Text(error)
                            .font(.caption)
                            .foregroundStyle(.red)
                    }

                    Button(action: login) {
                        HStack {
                            if authManager.isLoading {
                                ProgressView()
                                    .tint(.white)
                            }
                            Text("Sign In")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.accentColor)
                        .foregroundStyle(.white)
                        .cornerRadius(12)
                    }
                    .disabled(authManager.isLoading || email.isEmpty || password.isEmpty)
                }
                .padding(.horizontal)

                // Sign up link
                Button("Don't have an account? Sign up") {
                    showSignup = true
                }
                .font(.subheadline)

                Spacer()
            }
            .padding()
            .sheet(isPresented: $showSignup) {
                SignupView()
            }
        }
    }

    private func login() {
        Task {
            await authManager.login(email: email, password: password)
        }
    }
}

#Preview {
    LoginView()
        .environmentObject(AuthManager())
}
