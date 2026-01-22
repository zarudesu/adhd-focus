import Foundation
import SwiftUI

struct Project: Identifiable, Codable {
    let id: String
    var name: String
    var description: String?
    var emoji: String?
    var color: String?
    var archived: Bool
    var taskCount: Int?
    var completedCount: Int?
    var createdAt: String
    var updatedAt: String

    // Computed property for progress
    var progress: Double {
        guard let total = taskCount, total > 0 else { return 0 }
        return Double(completedCount ?? 0) / Double(total)
    }

    // Convert hex color string to SwiftUI Color
    var swiftUIColor: Color {
        guard let hex = color else { return .blue }
        return Color(hex: hex)
    }
}

struct CreateProjectInput: Codable {
    var name: String
    var description: String?
    var emoji: String?
    var color: String?
}

struct UpdateProjectInput: Codable {
    var name: String?
    var description: String?
    var emoji: String?
    var color: String?
    var archived: Bool?
}

// Extension to create Color from hex string
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 99, 102, 241) // Default indigo #6366f1
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
