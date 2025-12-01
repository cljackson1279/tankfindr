import { Card } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
        <p className="text-gray-600 mb-8">Last Updated: November 23, 2025</p>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
          <p className="text-gray-700 mb-4">
            These Terms and Conditions ("Terms") govern your access to and use of TankFindr's website, services, and applications (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
          </p>
          <p className="text-gray-700">
            If you do not agree to these Terms, you may not access or use the Service. We reserve the right to modify these Terms at any time, and your continued use of the Service constitutes acceptance of any changes.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Description of Service</h2>
          <p className="text-gray-700 mb-4">
            TankFindr provides septic tank location services using publicly available government data from county GIS systems, state environmental agencies, and municipal records. Our Service includes:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Free Widget:</strong> Basic septic system classification checks</li>
            <li><strong>Property Reports:</strong> Detailed one-time reports with GPS coordinates and system information ($19)</li>
            <li><strong>Inspector Pro:</strong> Unlimited septic system reports for home inspectors ($79/month)</li>
            <li><strong>TankFindr Pro Subscriptions:</strong> Recurring access for septic professionals with job history tracking (Starter, Pro, Enterprise tiers)</li>
            <li><strong>Coverage Information:</strong> Transparency about data availability by county and state</li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Registration and Security</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Account Creation</h3>
          <p className="text-gray-700 mb-4">
            To access certain features, you must create an account. You agree to:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and update your information to keep it accurate and current</li>
            <li>Maintain the security of your password and account credentials</li>
            <li>Notify us immediately of any unauthorized access to your account</li>
            <li>Accept responsibility for all activities that occur under your account</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Restrictions</h3>
          <p className="text-gray-700 mb-3">You may not:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Create multiple accounts to circumvent usage limits</li>
            <li>Share your account credentials with others</li>
            <li>Use another person's account without permission</li>
            <li>Create accounts using automated means or false information</li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription Plans and Billing</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Subscription Tiers</h3>
          <p className="text-gray-700 mb-4">TankFindr offers the following subscription plans:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li><strong>Inspector Pro ($79/month):</strong> Unlimited septic system reports for home inspectors</li>
            <li><strong>TankFindr Pro - Starter ($99/month):</strong> 300 lookups per month</li>
            <li><strong>TankFindr Pro - Pro ($249/month):</strong> 1,500 lookups per month</li>
            <li><strong>TankFindr Pro - Enterprise ($599/month):</strong> Unlimited lookups (subject to fair use policy)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Billing and Payment</h3>
          <p className="text-gray-700 mb-4">By subscribing to a paid plan, you agree that:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>Subscriptions automatically renew on a monthly basis</li>
            <li>You authorize us to charge your payment method on each renewal date</li>
            <li>Prices are subject to change with 30 days' notice</li>
            <li>All payments are processed securely through Stripe</li>
            <li>Fees are non-refundable except as required by law or stated in our refund policy</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Usage Limits</h3>
          <p className="text-gray-700 mb-4">
            Each subscription tier includes a monthly lookup limit. If you exceed your limit:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>Starter and Pro: Additional lookups will be blocked until the next billing cycle or upgrade</li>
            <li>Enterprise: Unlimited lookups subject to fair use policy (no automated scraping or abuse)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Cancellation and Refunds</h3>
          <p className="text-gray-700 mb-4">
            You may cancel your subscription at any time through your account settings. Upon cancellation:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>You will retain access until the end of your current billing period</li>
            <li>No refunds will be provided for partial months</li>
            <li>Your job history will be retained for 90 days after cancellation</li>
            <li>You may reactivate your subscription at any time</li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptable Use Policy</h2>
          <p className="text-gray-700 mb-4">You agree to use the Service only for lawful purposes. You may not:</p>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Prohibited Activities</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li><strong>Data Scraping:</strong> Use automated tools, bots, or scripts to extract data from the Service</li>
            <li><strong>Abuse:</strong> Make excessive requests or attempt to overwhelm our systems</li>
            <li><strong>Unauthorized Access:</strong> Attempt to access accounts, systems, or data without authorization</li>
            <li><strong>Reverse Engineering:</strong> Decompile, disassemble, or reverse engineer any part of the Service</li>
            <li><strong>Resale:</strong> Resell, redistribute, or sublicense access to the Service without permission</li>
            <li><strong>Misrepresentation:</strong> Impersonate others or misrepresent your affiliation with any entity</li>
            <li><strong>Harmful Content:</strong> Upload malware, viruses, or other harmful code</li>
            <li><strong>Interference:</strong> Interfere with or disrupt the Service or servers</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Fair Use Policy</h3>
          <p className="text-gray-700">
            Enterprise "unlimited" plans are subject to fair use. We reserve the right to limit or suspend accounts that engage in excessive automated lookups, data scraping, or other abusive behavior that impacts service quality for other users.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Accuracy and Limitations</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Data Sources</h3>
          <p className="text-gray-700 mb-4">
            TankFindr aggregates data from publicly available government sources. We make reasonable efforts to ensure data accuracy, but we do not guarantee:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>Completeness of coverage in all areas</li>
            <li>Real-time updates from government agencies</li>
            <li>Accuracy of GPS coordinates provided by source agencies</li>
            <li>Identification of all septic systems on a property</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Verification Required</h3>
          <p className="text-gray-700 mb-4">
            <strong>IMPORTANT:</strong> TankFindr reports are for informational purposes only and should not replace professional septic system inspections or surveys. You agree that:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Our reports are estimates based on government records</li>
            <li>Physical verification by licensed professionals is required before excavation or construction</li>
            <li>We are not responsible for damages resulting from reliance on our data</li>
            <li>You will not use our Service as a substitute for professional septic inspections</li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property Rights</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Our Rights</h3>
          <p className="text-gray-700 mb-4">
            The Service, including its design, features, algorithms, and compiled data, is owned by TankFindr and protected by copyright, trademark, and other intellectual property laws. You may not:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>Copy, modify, or create derivative works of the Service</li>
            <li>Use our trademarks, logos, or branding without permission</li>
            <li>Remove or alter any proprietary notices or watermarks</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h3>
          <p className="text-gray-700">
            You retain ownership of any content you submit to the Service. By using the Service, you grant us a license to use your search queries and usage data to improve our Service and provide analytics.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimers and Limitation of Liability</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Service "As Is"</h3>
          <p className="text-gray-700 mb-4">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Warranty</h3>
          <p className="text-gray-700 mb-4">We do not warrant that:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>The Service will be uninterrupted, secure, or error-free</li>
            <li>Data provided will be accurate, complete, or current</li>
            <li>Defects will be corrected</li>
            <li>The Service will meet your specific requirements</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h3>
          <p className="text-gray-700 mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, TANKFINDR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>Loss of profits, revenue, or business opportunities</li>
            <li>Property damage resulting from reliance on our data</li>
            <li>Costs of excavation, repair, or remediation</li>
            <li>Damages from unauthorized access to your account</li>
          </ul>
          <p className="text-gray-700">
            Our total liability for any claims arising from your use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
          <p className="text-gray-700">
            You agree to indemnify, defend, and hold harmless TankFindr and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including legal fees) arising from:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of another party</li>
            <li>Any damage to property or injury to persons caused by your reliance on our data</li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to suspend or terminate your account and access to the Service at any time, with or without notice, for:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>Violation of these Terms</li>
            <li>Fraudulent or illegal activity</li>
            <li>Abusive behavior or excessive usage</li>
            <li>Non-payment of fees</li>
            <li>Any reason at our sole discretion</li>
          </ul>
          <p className="text-gray-700">
            Upon termination, your right to use the Service will immediately cease. We may delete your account data after 90 days.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dispute Resolution</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Informal Resolution</h3>
          <p className="text-gray-700 mb-4">
            Before filing a legal claim, you agree to contact us at support@tankfindr.com to attempt to resolve the dispute informally.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Governing Law</h3>
          <p className="text-gray-700 mb-4">
            These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Arbitration</h3>
          <p className="text-gray-700">
            Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration, except that either party may seek injunctive relief in court for intellectual property infringement or unauthorized access.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">General Provisions</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Entire Agreement</h3>
          <p className="text-gray-700 mb-4">
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and TankFindr regarding the Service.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Severability</h3>
          <p className="text-gray-700 mb-4">
            If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Waiver</h3>
          <p className="text-gray-700 mb-4">
            Our failure to enforce any right or provision of these Terms will not be deemed a waiver of such right or provision.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Assignment</h3>
          <p className="text-gray-700">
            You may not assign or transfer these Terms without our written consent. We may assign our rights and obligations without restriction.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
          <p className="text-gray-700">
            We reserve the right to modify these Terms at any time. We will notify users of material changes by email or through a notice on our website. Your continued use of the Service after changes become effective constitutes acceptance of the revised Terms.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
          <p className="text-gray-700 mb-4">
            If you have questions about these Terms, please contact us:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <strong>Email:</strong> <a href="mailto:support@tankfindr.com" className="text-blue-600 hover:text-blue-800 underline">support@tankfindr.com</a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
