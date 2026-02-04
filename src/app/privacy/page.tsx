import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy & Cookie Policy",
  description:
    "Privacy policy and cookie information for TuneTapper. Learn how we handle your data and use cookies.",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:py-12">
      <h1 className="text-3xl font-bold lg:text-4xl mb-8">
        Privacy & Cookie Policy
      </h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="lead">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <h2>Introduction</h2>
        <p>
          TuneTapper (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is
          committed to protecting your personal data. This policy explains how
          we collect, use, and protect information when you use our website at
          tunetapper.com.
        </p>

        <h2>What Data We Collect</h2>
        <h3>Information You Provide</h3>
        <p>
          We do not require you to create an account or provide personal
          information to use our tools. If you contact us via email, we will
          retain your email address and message content to respond to your
          inquiry.
        </p>

        <h3>Automatically Collected Information</h3>
        <p>When you use our site, we may collect:</p>
        <ul>
          <li>
            <strong>Usage data:</strong> Pages visited, tools used, time spent
            on site
          </li>
          <li>
            <strong>Device information:</strong> Browser type, operating system,
            screen size
          </li>
          <li>
            <strong>Location data:</strong> Country-level location based on IP
            address
          </li>
        </ul>

        <h2>Cookies and Tracking</h2>
        <h3>What Are Cookies?</h3>
        <p>
          Cookies are small text files stored on your device when you visit a
          website. They help websites remember your preferences and provide
          functionality.
        </p>

        <h3>Cookies We Use</h3>
        <table>
          <thead>
            <tr>
              <th>Cookie Type</th>
              <th>Purpose</th>
              <th>Consent Required</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Essential</td>
              <td>
                Store your cookie consent preference, theme preference
              </td>
              <td>No</td>
            </tr>
            <tr>
              <td>Analytics (Google Analytics)</td>
              <td>
                Understand how visitors use our site to improve it
              </td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Advertising (Google AdSense)</td>
              <td>Display relevant advertisements to support the site</td>
              <td>For personalized ads, yes</td>
            </tr>
          </tbody>
        </table>

        <h3>Your Cookie Choices</h3>
        <p>
          When you first visit our site, we ask for your consent before setting
          analytics and advertising cookies:
        </p>
        <ul>
          <li>
            <strong>If you accept:</strong> We load Google Analytics to track
            usage and Google AdSense with personalized advertising.
          </li>
          <li>
            <strong>If you decline:</strong> We do not load Google Analytics.
            Google AdSense will only show non-personalized, contextual ads (no
            tracking cookies).
          </li>
        </ul>
        <p>
          You can change your preference at any time by clearing your
          browser&apos;s local storage and refreshing the page.
        </p>

        <h2>How We Use Your Data</h2>
        <p>We use collected data to:</p>
        <ul>
          <li>Provide and improve our tools and services</li>
          <li>Understand how visitors use our site</li>
          <li>Display advertisements (personalized or contextual)</li>
          <li>Respond to your inquiries</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2>Third-Party Services</h2>
        <h3>Google Analytics</h3>
        <p>
          If you consent to cookies, we use Google Analytics to understand site
          usage. Google may use this data as described in their{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          .
        </p>

        <h3>Google AdSense</h3>
        <p>
          We display advertisements through Google AdSense to support the site.
          If you consent, ads may be personalized based on your interests. If
          you decline, ads will be contextual (based on page content, not your
          browsing history).
        </p>
        <p>
          Learn more about Google&apos;s advertising practices at{" "}
          <a
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Help
          </a>
          .
        </p>

        <h2>Your Rights</h2>
        <p>
          Depending on your location, you may have rights regarding your
          personal data, including:
        </p>
        <ul>
          <li>Right to access your data</li>
          <li>Right to correct inaccurate data</li>
          <li>Right to delete your data</li>
          <li>Right to restrict or object to processing</li>
          <li>Right to data portability</li>
          <li>Right to withdraw consent</li>
        </ul>
        <p>
          To exercise these rights, please contact us at{" "}
          <a href="mailto:hello@tunetapper.com">hello@tunetapper.com</a>.
        </p>

        <h2>Data Retention</h2>
        <p>
          We retain analytics data for 14 months. Your cookie consent preference
          is stored in your browser&apos;s local storage indefinitely until you
          clear it.
        </p>

        <h2>Children&apos;s Privacy</h2>
        <p>
          Our services are not directed to children under 16. We do not
          knowingly collect personal information from children.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. We will notify you of
          significant changes by updating the &quot;Last updated&quot; date at the top
          of this page.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this policy or our privacy practices,
          please contact us at:
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:hello@tunetapper.com">hello@tunetapper.com</a>
        </p>
      </div>
    </div>
  )
}
