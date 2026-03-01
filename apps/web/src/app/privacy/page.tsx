import { LegalPageLayout } from '@/components/layout/LegalPageLayout';

export const metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <p><strong>Last updated:</strong> March 1, 2026</p>

      <h2>1. Data Controller</h2>
      <p>
        beatyour8 (&quot;we&quot;, &quot;our&quot;) operates the task management service at beatyour8.com.
        For privacy inquiries, contact us at{' '}
        <a href="mailto:privacy@beatyour8.com">privacy@beatyour8.com</a>.
      </p>

      <h2>2. Data We Collect</h2>

      <h3>Account Data</h3>
      <ul>
        <li>Email address (for authentication)</li>
        <li>Name (optional, for display)</li>
        <li>Hashed password (never stored in plain text)</li>
      </ul>

      <h3>Usage Data</h3>
      <ul>
        <li>Tasks, projects, wiki pages, and habits you create</li>
        <li>Focus session data (duration, completion)</li>
        <li>Gamification progress (XP, level, achievements, streaks)</li>
        <li>Feature usage and preferences</li>
      </ul>

      <h3>Technical Data</h3>
      <ul>
        <li>IP address (for rate limiting and security)</li>
        <li>Browser type and version</li>
        <li>Device information</li>
        <li>Authentication tokens</li>
      </ul>

      <h2>3. Legal Basis (GDPR Art. 6)</h2>
      <ul>
        <li><strong>Contract performance</strong> — processing your tasks and account data to provide the Service</li>
        <li><strong>Legitimate interest</strong> — security, fraud prevention, service improvement</li>
        <li><strong>Consent</strong> — optional analytics and preference cookies</li>
      </ul>

      <h2>4. Cookies</h2>
      <table>
        <thead>
          <tr><th>Cookie</th><th>Purpose</th><th>Type</th><th>Duration</th></tr>
        </thead>
        <tbody>
          <tr><td>authjs.session-token</td><td>Authentication session</td><td>Necessary</td><td>30 days</td></tr>
          <tr><td>authjs.csrf-token</td><td>CSRF protection</td><td>Necessary</td><td>Session</td></tr>
          <tr><td>cookie-consent</td><td>Cookie preferences</td><td>Necessary</td><td>1 year</td></tr>
        </tbody>
      </table>
      <p>
        You can manage cookie preferences through the cookie consent banner or your browser settings.
      </p>

      <h2>5. Data Retention</h2>
      <ul>
        <li><strong>Account data</strong> — retained while your account is active</li>
        <li><strong>Task data</strong> — retained while your account is active</li>
        <li><strong>Deleted data</strong> — permanently removed within 30 days of account deletion</li>
        <li><strong>Technical logs</strong> — automatically purged after 90 days</li>
      </ul>

      <h2>6. Data Sharing</h2>
      <p>We do not sell your personal data. We share data only with:</p>
      <ul>
        <li><strong>Google Gemini</strong> — task content sent for AI features (suggestions, decomposition). Only task titles and descriptions are sent, not your account information.</li>
        <li><strong>Infrastructure providers</strong> — hosting and database services required to operate the Service</li>
      </ul>

      <h2>7. Your Rights (GDPR)</h2>
      <p>If you are in the EU/EEA, you have the right to:</p>
      <ul>
        <li><strong>Access</strong> — request a copy of your personal data</li>
        <li><strong>Rectification</strong> — correct inaccurate data</li>
        <li><strong>Erasure</strong> — request deletion of your data (&quot;right to be forgotten&quot;)</li>
        <li><strong>Portability</strong> — receive your data in a structured format</li>
        <li><strong>Restriction</strong> — limit how we process your data</li>
        <li><strong>Object</strong> — object to processing based on legitimate interest</li>
        <li><strong>Withdraw consent</strong> — withdraw consent for optional cookies at any time</li>
      </ul>
      <p>
        To exercise these rights, email{' '}
        <a href="mailto:privacy@beatyour8.com">privacy@beatyour8.com</a>.
        We will respond within 30 days.
      </p>

      <h2>8. Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect your data:
      </p>
      <ul>
        <li>Passwords are hashed with bcrypt</li>
        <li>API keys are stored as hashes, never in plain text</li>
        <li>All connections use HTTPS/TLS encryption</li>
        <li>Rate limiting protects against abuse</li>
        <li>PII is sanitized from server logs</li>
      </ul>

      <h2>9. Children</h2>
      <p>
        The Service is not intended for children under 16. We do not knowingly collect
        data from children under 16. If you believe a child has provided us with personal data,
        please contact us.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. We will notify you of material changes
        through the Service. Your continued use constitutes acceptance of the updated policy.
      </p>

      <h2>11. Contact</h2>
      <p>
        For privacy questions or to exercise your rights:{' '}
        <a href="mailto:privacy@beatyour8.com">privacy@beatyour8.com</a>
      </p>
    </LegalPageLayout>
  );
}
