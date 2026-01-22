import Foundation
import Security

enum APIError: Error, LocalizedError {
    case invalidURL
    case noData
    case decodingError(Error)
    case serverError(Int, String?)
    case networkError(Error)
    case unauthorized

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .noData:
            return "No data received"
        case .decodingError(let error):
            return "Decoding error: \(error.localizedDescription)"
        case .serverError(let code, let message):
            return "Server error \(code): \(message ?? "Unknown")"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .unauthorized:
            return "Unauthorized - please login again"
        }
    }
}

@MainActor
class APIClient: ObservableObject {
    static let shared = APIClient()

    private let baseURL = "https://beatyour8.com/api"
    private let session: URLSession

    @Published var authToken: String? {
        didSet {
            if let token = authToken {
                KeychainHelper.save(token, forKey: "authToken")
            } else {
                KeychainHelper.delete(forKey: "authToken")
            }
        }
    }

    init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        self.session = URLSession(configuration: config)

        // Load saved token
        self.authToken = KeychainHelper.load(forKey: "authToken")
    }

    // MARK: - Generic Request

    func request<T: Decodable>(
        _ endpoint: String,
        method: String = "GET",
        body: (any Encodable)? = nil
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            let encoder = JSONEncoder()
            // API accepts camelCase
            request.httpBody = try encoder.encode(body)
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.noData
        }

        if httpResponse.statusCode == 401 {
            throw APIError.unauthorized
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            let message = String(data: data, encoding: .utf8)
            throw APIError.serverError(httpResponse.statusCode, message)
        }

        let decoder = JSONDecoder()
        // API returns camelCase

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }

    // MARK: - Tasks

    func getTasks() async throws -> [TaskItem] {
        try await request("/tasks")
    }

    func createTask(_ input: CreateTaskInput) async throws -> TaskItem {
        try await request("/tasks", method: "POST", body: input)
    }

    func updateTask(id: String, _ input: UpdateTaskInput) async throws -> TaskItem {
        try await request("/tasks/\(id)", method: "PATCH", body: input)
    }

    func deleteTask(id: String) async throws -> EmptyResponse {
        try await request("/tasks/\(id)", method: "DELETE")
    }

    func completeTask(id: String) async throws -> CompleteTaskResponse {
        try await request("/tasks/\(id)", method: "PATCH", body: ["status": "done"])
    }

    func uncompleteTask(id: String) async throws -> TaskItem {
        try await request("/tasks/\(id)", method: "PATCH", body: ["status": "inbox"])
    }

    // MARK: - Projects

    func getProjects() async throws -> [Project] {
        try await request("/projects")
    }

    func createProject(_ input: CreateProjectInput) async throws -> Project {
        try await request("/projects", method: "POST", body: input)
    }

    func updateProject(id: String, _ input: UpdateProjectInput) async throws -> Project {
        try await request("/projects/\(id)", method: "PATCH", body: input)
    }

    func deleteProject(id: String) async throws -> EmptyResponse {
        try await request("/projects/\(id)", method: "DELETE")
    }

    // MARK: - Focus Sessions

    func getFocusSessions() async throws -> FocusSessionsResponse {
        try await request("/focus/sessions")
    }

    func createFocusSession(_ input: CreateSessionInput) async throws -> FocusSession {
        try await request("/focus/sessions", method: "POST", body: input)
    }

    func updateFocusSession(id: String, _ input: UpdateSessionInput) async throws -> FocusSession {
        try await request("/focus/sessions/\(id)", method: "PATCH", body: input)
    }

    // MARK: - Auth

    func login(email: String, password: String) async throws -> AuthResponse {
        let input = LoginInput(email: email, password: password)
        let response: AuthResponse = try await request("/mobile/auth/login", method: "POST", body: input)
        if let token = response.token {
            self.authToken = token
        }
        return response
    }

    func register(email: String, password: String, name: String?) async throws -> AuthResponse {
        let input = RegisterInput(email: email, password: password, name: name)
        // Register first, then auto-login
        let _: RegisterResponse = try await request("/auth/register", method: "POST", body: input)
        // Now login to get token
        return try await login(email: email, password: password)
    }

    func logout() {
        self.authToken = nil
    }

    func getProfile() async throws -> User {
        try await request("/profile")
    }

    // MARK: - Achievements

    func getAchievements() async throws -> AchievementsResponse {
        try await request("/gamification/achievements")
    }

    // MARK: - Stats

    func getStats(days: Int = 7) async throws -> StatsAPIResponse {
        try await request("/stats?days=\(days)")
    }

    func getGamificationStats() async throws -> GamificationStatsResponse {
        try await request("/gamification/stats")
    }

    // MARK: - Creatures

    func getCreatures() async throws -> CreaturesResponse {
        try await request("/gamification/creatures")
    }

    func spawnCreature() async throws -> SpawnCreatureResponse {
        try await request("/gamification/creatures/spawn", method: "POST", body: ["onTaskComplete": true])
    }
}

// MARK: - Response Types

struct EmptyResponse: Codable {}

struct CompleteTaskResponse: Codable {
    let task: TaskItem
    let xpAwarded: Int?
    let levelUp: Bool?
    let newLevel: Int?
}

// MARK: - Keychain Helper

class KeychainHelper {
    static func save(_ value: String, forKey key: String) {
        guard let data = value.data(using: .utf8) else { return }

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]

        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    static func load(forKey key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        SecItemCopyMatching(query as CFDictionary, &result)

        guard let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    static func delete(forKey key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]
        SecItemDelete(query as CFDictionary)
    }
}
