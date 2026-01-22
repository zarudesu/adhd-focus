import Foundation

enum CreatureRarity: String, Codable, CaseIterable {
    case common
    case uncommon
    case rare
    case legendary
    case mythic
    case secret

    var displayName: String {
        rawValue.capitalized
    }

    var color: String {
        switch self {
        case .common: return "gray"
        case .uncommon: return "green"
        case .rare: return "blue"
        case .legendary: return "purple"
        case .mythic: return "orange"
        case .secret: return "pink"
        }
    }

    var sortOrder: Int {
        switch self {
        case .common: return 0
        case .uncommon: return 1
        case .rare: return 2
        case .legendary: return 3
        case .mythic: return 4
        case .secret: return 5
        }
    }
}

struct Creature: Identifiable, Codable {
    let id: String
    let code: String
    let name: String
    let emoji: String
    let description: String?
    let rarity: CreatureRarity?
    let isCaught: Bool
    let count: Int
    let firstCaughtAt: String?
    let xpMultiplier: Double?

    var displayRarity: CreatureRarity {
        rarity ?? .common
    }

    var formattedCaughtDate: String? {
        guard let dateString = firstCaughtAt else { return nil }

        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateStyle = .medium
            displayFormatter.timeStyle = .none
            return displayFormatter.string(from: date)
        }

        // Try without fractional seconds
        formatter.formatOptions = [.withInternetDateTime]
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateStyle = .medium
            displayFormatter.timeStyle = .none
            return displayFormatter.string(from: date)
        }

        return nil
    }
}

struct CreatureStats: Codable {
    let total: Int
    let caught: Int
    let totalCreaturesCaught: Int
    let byRarity: [String: RarityStats]

    struct RarityStats: Codable {
        let total: Int
        let caught: Int
    }
}

struct CreaturesResponse: Codable {
    let creatures: [Creature]
    let stats: CreatureStats
}

struct SpawnCreatureResponse: Codable {
    let creature: SpawnedCreature?
    let isNew: Bool?
    let newCount: Int?
    let reason: String?
}

struct SpawnedCreature: Codable {
    let id: String
    let code: String
    let name: String
    let emoji: String
    let description: String?
    let rarity: CreatureRarity?
    let xpMultiplier: Double?
}
