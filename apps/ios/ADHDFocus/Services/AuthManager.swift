import Foundation
import SwiftUI

@MainActor
class AuthManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    init() {
        // Check if we have a saved token
        if api.authToken != nil {
            Task {
                await checkAuth()
            }
        }
    }

    func checkAuth() async {
        guard api.authToken != nil else {
            isAuthenticated = false
            return
        }

        isLoading = true
        defer { isLoading = false }

        do {
            let user = try await api.getProfile()
            self.currentUser = user
            self.isAuthenticated = true
        } catch {
            // Token might be expired
            self.isAuthenticated = false
            self.currentUser = nil
            api.logout()
        }
    }

    func login(email: String, password: String) async -> Bool {
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let response = try await api.login(email: email, password: password)
            self.currentUser = response.user
            self.isAuthenticated = true
            return true
        } catch let apiError as APIError {
            self.error = apiError.localizedDescription
            return false
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }

    func register(email: String, password: String, name: String?) async -> Bool {
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let response = try await api.register(email: email, password: password, name: name)
            self.currentUser = response.user
            self.isAuthenticated = true
            return true
        } catch let apiError as APIError {
            self.error = apiError.localizedDescription
            return false
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }

    func logout() {
        api.logout()
        isAuthenticated = false
        currentUser = nil
    }
}
