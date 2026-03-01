import { LegalPageLayout } from '@/components/layout/LegalPageLayout';

export const metadata = {
  title: 'Terms of Service',
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <p><strong>Last updated:</strong> March 1, 2026</p>

      <h2>1. About the Service</h2>
      <p>
        beatyour8 (&quot;we&quot;, &quot;our&quot;, &quot;the Service&quot;) is a task management application
        designed for people with ADHD. The Service is provided as-is for personal productivity use.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 16 years old to create an account and use the Service.
        By registering, you confirm that you meet this age requirement.
      </p>

      <h2>3. Your Account</h2>
      <p>
        You are responsible for maintaining the security of your account credentials.
        You agree not to share your password or API keys with unauthorized parties.
        Notify us immediately if you suspect unauthorized access.
      </p>

      <h2>4. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any illegal purpose</li>
        <li>Attempt to gain unauthorized access to the Service or its systems</li>
        <li>Interfere with the Service&apos;s operation or other users&apos; access</li>
        <li>Use automated tools to scrape or overload the Service</li>
        <li>Upload malicious content or code</li>
      </ul>

      <h2>5. Your Content</h2>
      <p>
        You retain ownership of all content you create (tasks, projects, notes, wiki pages).
        We do not claim any intellectual property rights over your content.
        You grant us a limited license to store and display your content solely to operate the Service.
      </p>

      <h2>6. API Access</h2>
      <p>
        API keys provide programmatic access to your data. You are responsible for
        securing your API keys. We may rate-limit API requests to ensure fair usage.
        Abuse of the API may result in key revocation or account suspension.
      </p>

      <h2>7. AI Features</h2>
      <p>
        The Service includes optional AI-powered features (task suggestions, decomposition, brain dump).
        These features process your task content through third-party AI services (Google Gemini).
        AI suggestions are provided as-is and should not be relied upon as professional advice.
      </p>

      <h2>8. Service Availability</h2>
      <p>
        We strive to keep the Service available but do not guarantee uninterrupted access.
        We may modify, suspend, or discontinue features with reasonable notice.
        We are not liable for any data loss — please maintain your own backups of important information.
      </p>

      <h2>9. Disclaimer of Warranties</h2>
      <p>
        THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
        We do not warrant that the Service will be error-free, secure, or uninterrupted.
        The Service is not a substitute for professional medical or mental health advice.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, we shall not be liable for any indirect,
        incidental, special, or consequential damages arising from your use of the Service,
        including loss of data, revenue, or business opportunities.
      </p>

      <h2>11. Termination</h2>
      <p>
        You may delete your account at any time. We may suspend or terminate accounts
        that violate these terms. Upon termination, your data will be deleted within 30 days.
      </p>

      <h2>12. Changes to Terms</h2>
      <p>
        We may update these terms from time to time. Continued use of the Service after
        changes constitutes acceptance. Material changes will be communicated via the Service.
      </p>

      <h2>13. Contact</h2>
      <p>
        For questions about these terms, contact us at{' '}
        <a href="mailto:support@beatyour8.com">support@beatyour8.com</a>.
      </p>
    </LegalPageLayout>
  );
}
