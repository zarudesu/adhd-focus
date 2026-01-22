import SwiftUI

@main
struct ADHDFocusApp: App {
    @StateObject private var authManager = AuthManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .preferredColorScheme(.dark)
        }
    }
}
