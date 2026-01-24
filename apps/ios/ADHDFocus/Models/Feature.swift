import Foundation

// MARK: - Feature Model

struct Feature: Codable, Identifiable {
    let code: String
    let name: String
    let description: String?
    let icon: String?
    let unlockLevel: Int

    var id: String { code }
}

// MARK: - API Response

struct FeaturesResponse: Codable {
    let level: Int
    let xp: Int
    let unlockedFeatures: [Feature]
    let unlockedCodes: [String]
}

// MARK: - Feature Codes

enum FeatureCode: String, CaseIterable {
    // Navigation features
    case navInbox = "nav_inbox"
    case navProcess = "nav_process"
    case navToday = "nav_today"
    case navScheduled = "nav_scheduled"
    case navProjects = "nav_projects"
    case navCompleted = "nav_completed"
    case navChecklist = "nav_checklist"
    case navQuickActions = "nav_quick_actions"
    case navFocus = "nav_focus"
    case navAchievements = "nav_achievements"
    case navCreatures = "nav_creatures"
    case navStats = "nav_stats"
    case navSettings = "nav_settings"

    // Task features
    case taskPriority = "task_priority"
    case taskEnergy = "task_energy"
    case taskDuration = "task_duration"
    case taskProjects = "task_projects"
    case taskScheduling = "task_scheduling"
    case taskRecurrence = "task_recurrence"

    var displayName: String {
        switch self {
        case .navInbox: return "Inbox"
        case .navProcess: return "Process"
        case .navToday: return "Today"
        case .navScheduled: return "Scheduled"
        case .navProjects: return "Projects"
        case .navCompleted: return "Completed"
        case .navChecklist: return "Checklist"
        case .navQuickActions: return "Quick Actions"
        case .navFocus: return "Focus"
        case .navAchievements: return "Achievements"
        case .navCreatures: return "Creatures"
        case .navStats: return "Statistics"
        case .navSettings: return "Settings"
        case .taskPriority: return "Priority"
        case .taskEnergy: return "Energy Level"
        case .taskDuration: return "Duration"
        case .taskProjects: return "Projects"
        case .taskScheduling: return "Scheduling"
        case .taskRecurrence: return "Recurring Tasks"
        }
    }

    var systemImage: String {
        switch self {
        case .navInbox: return "tray.fill"
        case .navProcess: return "sparkles"
        case .navToday: return "sun.max.fill"
        case .navScheduled: return "calendar"
        case .navProjects: return "folder.fill"
        case .navCompleted: return "checkmark.circle.fill"
        case .navChecklist: return "checklist"
        case .navQuickActions: return "bolt.fill"
        case .navFocus: return "timer"
        case .navAchievements: return "trophy.fill"
        case .navCreatures: return "pawprint.fill"
        case .navStats: return "chart.bar.fill"
        case .navSettings: return "gearshape.fill"
        case .taskPriority: return "flag.fill"
        case .taskEnergy: return "bolt.fill"
        case .taskDuration: return "clock.fill"
        case .taskProjects: return "folder.fill"
        case .taskScheduling: return "calendar"
        case .taskRecurrence: return "repeat"
        }
    }
}
