import Foundation

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

    private func request<T: Decodable>(
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
            encoder.keyEncodingStrategy = .convertToSnakeCase
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
        decoder.keyDecodingStrategy = .convertFromSnakeCase

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }

    // MARK: - Tasks

    func getTasks() async throws -> [Task] {
        try await request("/tasks")
    }

    func createTask(_ input: CreateTaskInput) async throws -> Task {
        try await request("/tasks", method: "POST", body: input)
    }

    func updateTask(id: String, _ input: UpdateTaskInput) async throws -> Task {
        try await request("/tasks/\(id)", method: "PATCH", body: input)
    }

    func deleteTask(id: String) async throws -> EmptyResponse {
        try await request("/tasks/\(id)", method: "DELETE")
    }

    func completeTask(id: String) async throws -> CompleteTaskResponse {
        try await request("/tasks/\(id)", method: "PATCH", body: ["status": "done"])
    }

    func uncompleteTask(id: String) async throws -> Task {
        try await request("/tasks/\(id)", method: "PATCH", body: ["status": "inbox"])
    }

    // MARK: - Projects

    func getProjects() async throws -> [Project] {
        try await request("/projects")
    }

    func createProject(_ input: CreateProjectInput) async throws -> Project {
        try await request("/projects", method: "POST", body: input)
    }

    // MARK: - Auth

    func login(email: String, password: String) async throws -> AuthResponse {
        let input = LoginInput(email: email, password: password)
        let response: AuthResponse = try await request("/auth/login", method: "POST", body: input)
        if let token = response.token {
            self.authToken = token
        }
        return response
    }

    func register(email: String, password: String, name: String?) async throws -> AuthResponse {
        let input = RegisterInput(email: email, password: password, name: name)
        let response: AuthResponse = try await request("/auth/register", method: "POST", body: input)
        if let token = response.token {
            self.authToken = token
        }
        return response
    }

    func logout() {
        self.authToken = nil
    }

    func getProfile() async throws -> User {
        try await request("/profile")
    }
}

// MARK: - Response Types

struct EmptyResponse: Codable {}

struct CompleteTaskResponse: Codable {
    let task: Task
    let xpAwarded: Int?
    let levelUp: Bool?
    let newLevel: Int?

    enum CodingKeys: String, CodingKey {
        case task
        case xpAwarded = "xp_awarded"
        case levelUp = "level_up"
        case newLevel = "new_level"
    }
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
