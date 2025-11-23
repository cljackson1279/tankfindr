import { Card } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: November 23, 2025</p>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-700 mb-4">
            TankFindr ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our septic tank location service, including our website, mobile applications, and related services (collectively, the "Service").
          </p>
          <p className="text-gray-700">
            By using TankFindr, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Personal Information</h3>
          <p className="text-gray-700 mb-3">When you use TankFindr, we may collect the following personal information:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li><strong>Account Information:</strong> Email address, password, name, and company name (for Pro accounts)</li>
            <li><strong>Payment Information:</strong> Billing address and payment details (processed securely through Stripe)</li>
            <li><strong>Contact Information:</strong> Email address for report delivery and customer support</li>
            <li><strong>Property Addresses:</strong> Addresses you search for septic tank locations</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Usage Information</h3>
          <p className="text-gray-700 mb-3">We automatically collect certain information about your use of the Service:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li><strong>Search History:</strong> Addresses searched, GPS coordinates, and lookup results</li>
            <li><strong>Usage Data:</strong> Number of lookups performed, features used, and subscription tier</li>
            <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
            <li><strong>Log Data:</strong> Access times, pages viewed, and actions taken within the Service</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Location Data</h3>
          <p className="text-gray-700">
            We collect GPS coordinates and geographic information related to the properties you search. This data is essential for providing septic tank location services and is stored securely in our database.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
          <p className="text-gray-700 mb-3">We use the information we collect for the following purposes:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Service Delivery:</strong> To provide septic tank location reports and Pro dashboard features</li>
            <li><strong>Account Management:</strong> To create and manage your account, process payments, and track usage</li>
            <li><strong>Customer Support:</strong> To respond to your inquiries and provide technical assistance</li>
            <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our algorithms and data quality</li>
            <li><strong>Billing and Payments:</strong> To process subscription fees and one-time report purchases</li>
            <li><strong>Fraud Prevention:</strong> To detect and prevent abuse, scraping, and unauthorized access</li>
            <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
            <li><strong>Communications:</strong> To send service updates, subscription notifications, and important announcements</li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sources</h2>
          <p className="text-gray-700 mb-4">
            TankFindr aggregates septic system data from publicly available government sources, including:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>County GIS databases and mapping systems</li>
            <li>State environmental health departments</li>
            <li>Public permit records and onsite wastewater system registries</li>
            <li>Municipal planning and zoning databases</li>
          </ul>
          <p className="text-gray-700">
            All septic system data is obtained from official government sources that are publicly accessible. We do not collect or store private property information beyond what is publicly available.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
          <p className="text-gray-700 mb-4">
            We do not sell, rent, or trade your personal information to third parties. We may share your information only in the following circumstances:
          </p>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Service Providers</h3>
          <p className="text-gray-700 mb-4">
            We work with trusted third-party service providers who assist us in operating our Service:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li><strong>Stripe:</strong> Payment processing and subscription management</li>
            <li><strong>Supabase:</strong> Database hosting and authentication</li>
            <li><strong>Vercel:</strong> Website hosting and deployment</li>
            <li><strong>Mapbox:</strong> Mapping and geocoding services</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Legal Requirements</h3>
          <p className="text-gray-700 mb-4">
            We may disclose your information if required by law or in response to valid legal processes, including:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Compliance with court orders, subpoenas, or legal proceedings</li>
            <li>Protection of our rights, property, or safety</li>
            <li>Investigation of fraud, security issues, or technical problems</li>
            <li>Enforcement of our Terms of Service</li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement industry-standard security measures to protect your information:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li><strong>Encryption:</strong> All data transmitted between your device and our servers is encrypted using SSL/TLS</li>
            <li><strong>Secure Storage:</strong> Personal information is stored in encrypted databases with access controls</li>
            <li><strong>Payment Security:</strong> Payment information is processed through PCI-compliant Stripe infrastructure</li>
            <li><strong>Access Controls:</strong> Limited employee access to personal data on a need-to-know basis</li>
            <li><strong>Monitoring:</strong> Continuous monitoring for unauthorized access and security threats</li>
          </ul>
          <p className="text-gray-700">
            While we strive to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
          <p className="text-gray-700 mb-4">
            We retain your information for as long as necessary to provide our Service and comply with legal obligations:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Account Data:</strong> Retained while your account is active and for 90 days after deletion</li>
            <li><strong>Search History:</strong> Pro users' job history retained indefinitely; free users' history retained for 30 days</li>
            <li><strong>Payment Records:</strong> Retained for 7 years for tax and accounting purposes</li>
            <li><strong>Usage Logs:</strong> Retained for 12 months for security and analytics purposes</li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights and Choices</h2>
          <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Access and Portability</h3>
          <p className="text-gray-700 mb-3">
            You can access your account information and search history through your Pro dashboard. You may request a copy of your data by contacting support@tankfindr.com.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Correction</h3>
          <p className="text-gray-700 mb-3">
            You can update your account information at any time through your account settings.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Deletion</h3>
          <p className="text-gray-700 mb-3">
            You may request deletion of your account and associated data by contacting support@tankfindr.com. Note that we may retain certain information as required by law or for legitimate business purposes.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Marketing Communications</h3>
          <p className="text-gray-700">
            You can opt out of marketing emails by clicking the "unsubscribe" link in any marketing email. You will continue to receive transactional emails related to your account and purchases.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar tracking technologies to enhance your experience:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Service</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
          </ul>
          <p className="text-gray-700">
            You can control cookies through your browser settings, but disabling cookies may limit your ability to use certain features.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
          <p className="text-gray-700">
            TankFindr is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately at support@tankfindr.com.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of the Service after changes become effective constitutes acceptance of the revised Privacy Policy.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <strong>Email:</strong> support@tankfindr.com
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
