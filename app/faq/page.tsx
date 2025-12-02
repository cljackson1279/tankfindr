'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string | string[]
  category: string
}

const faqs: FAQItem[] = [
  // General Questions
  {
    category: 'General',
    question: 'What is TankFindr?',
    answer: 'TankFindr is a septic tank location service that helps homeowners, real estate professionals, and septic contractors quickly find septic system locations using real county GIS data. We aggregate publicly available government records from over 85 counties across 13 states, covering 2.2+ million septic systems.',
  },
  {
    category: 'General',
    question: 'How accurate is TankFindr?',
    answer: [
      'Our accuracy depends on the data quality tier:',
      '• Verified Permits (High Quality): Actual DOH permit records with permit numbers, system types, and GPS coordinates. Accurate within 5-15 meters.',
      '• Estimated Inventory (Moderate Quality): Property-level septic likelihood estimates from state inventories. Location accuracy within 30-100 meters.',
      'Every report clearly shows which data quality tier applies. Professional field verification is always recommended before excavation or construction.',
    ],
  },
  {
    category: 'General',
    question: 'What\'s the difference between "Verified Permit" and "Estimated Inventory" data?',
    answer: [
      'Verified Permit Data:',
      '• Source: Florida Department of Health active permit records',
      '• Includes: Permit numbers, system types, capacity, approval dates',
      '• Accuracy: High - actual permitted systems',
      '• Coverage: Miami-Dade County and select areas',
      '',
      'Estimated Inventory Data:',
      '• Source: Florida DOH 2009-2015 estimated septic inventory',
      '• Includes: Property location, parcel info, land use',
      '• Accuracy: Moderate - estimates based on property tax records',
      '• Coverage: Statewide Florida',
      '',
      'All reports clearly indicate which data type is being used with visual badges and disclaimers.',
    ],
  },
  {
    category: 'General',
    question: 'Can I trust estimated inventory records?',
    answer: [
      'Estimated records are useful for preliminary assessment but should be verified:',
      '• Good for: Initial property research, budget planning, identifying areas that may need septic inspection',
      '• Not sufficient for: Final construction decisions, exact tank location, permit compliance',
      '• Recommendation: Always conduct field inspection and/or county records request for properties with estimated data',
      'We clearly label all estimated records with yellow warning badges and detailed disclaimers so you know exactly what you\'re getting.',
    ],
  },
  {
    category: 'General',
    question: 'What areas does TankFindr cover?',
    answer: 'We currently cover 13 states with 85+ counties, including all 67 counties in Florida. Our coverage includes Florida (statewide), Virginia, California, North Carolina, New Mexico (statewide), Ohio, Iowa, Utah, South Dakota, Montana, Rhode Island (statewide), Maryland, and Vermont. Visit our Coverage page for detailed information about available counties.',
  },
  {
    category: 'General',
    question: 'Is my county covered?',
    answer: 'Check our Coverage page to see if your county has data available. If your county isn\'t listed, you can request it! We add new counties every week based on user demand. Most counties can be added within 1-2 weeks.',
  },

  // Pricing & Plans
  {
    category: 'Pricing',
    question: 'How much does TankFindr cost?',
    answer: [
      'We offer several options:',
      '• Free Widget: Basic "Sewer or Septic?" check on our homepage',
      '• Property Reports: $19 one-time purchase for detailed reports',
      '• Inspector Pro: $79/month for unlimited septic reports (for home inspectors)',
      '• TankFindr Pro - Starter: $99/month for 300 lookups',
      '• TankFindr Pro - Pro: $249/month for 1,500 lookups (most popular)',
      '• TankFindr Pro - Enterprise: $599/month for unlimited lookups',
    ],
  },
  {
    category: 'Pricing',
    question: 'What\'s included in a $19 Property Report?',
    answer: [
      'Each property report includes:',
      '• Septic system classification (septic vs. sewer)',
      '• GPS coordinates of the tank location',
      '• Interactive map with satellite imagery',
      '• System type and permit information (if available)',
      '• Installation date and age estimate',
      '• Risk assessment and recommendations',
      '• Data sources and confidence level',
      '• Downloadable PDF for your records',
    ],
  },
  {
    category: 'Pricing',
    question: 'What\'s the difference between the subscription tiers?',
    answer: [
      'The main difference is the number of monthly lookups:',
      '• Starter (300 lookups): Best for small contractors or occasional users',
      '• Pro (1,500 lookups): Ideal for active septic companies and inspectors',
      '• Enterprise (Unlimited): For high-volume users, subject to fair use policy',
      'All tiers include job history tracking, priority support, and access to the Pro dashboard.',
    ],
  },
  {
    category: 'Pricing',
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes! You can cancel your subscription at any time through your account settings. You\'ll retain access until the end of your current billing period, and no refunds are provided for partial months. Your job history will be retained for 90 days after cancellation.',
  },
  {
    category: 'Pricing',
    question: 'What happens if I exceed my monthly lookup limit?',
    answer: 'If you\'re on the Starter or Pro plan and exceed your monthly limit, additional lookups will be blocked until the next billing cycle. You can upgrade to a higher tier at any time to get more lookups immediately. Enterprise users have unlimited lookups subject to our fair use policy.',
  },

  // Data & Accuracy
  {
    category: 'Data',
    question: 'Where does TankFindr get its data?',
    answer: 'We aggregate data from publicly available government sources, including county GIS databases, state environmental health departments, public permit records, onsite wastewater system registries, and municipal planning databases. All data comes from official government sources.',
  },
  {
    category: 'Data',
    question: 'How often is the data updated?',
    answer: 'We update our database regularly as new county data becomes available. Most counties update their GIS systems quarterly or annually. We monitor source agencies and import new records as they\'re published. However, there may be a lag between when a permit is issued and when it appears in our system.',
  },
  {
    category: 'Data',
    question: 'What if TankFindr doesn\'t find a septic tank on my property?',
    answer: [
      'If we don\'t find a septic tank, it could mean:',
      '• Your property is connected to municipal sewer',
      '• Your county isn\'t in our database yet',
      '• The septic system was installed before digital record-keeping',
      '• The permit records haven\'t been digitized by the county',
      'We recommend contacting your local health department for historical records or hiring a professional septic locator service.',
    ],
  },
  {
    category: 'Data',
    question: 'Can I rely on TankFindr for excavation or construction?',
    answer: 'No. TankFindr reports are for informational purposes only and should not replace professional septic system inspections or surveys. Always hire a licensed professional to physically verify tank locations before excavation, construction, or major landscaping projects.',
  },

  // Technical Questions
  {
    category: 'Technical',
    question: 'Do I need to create an account to use TankFindr?',
    answer: 'Not for basic features! You can use our free "Sewer or Septic?" widget on the homepage without an account. However, purchasing property reports or subscribing to Pro plans requires account creation for billing and report delivery.',
  },
  {
    category: 'Technical',
    question: 'How do I access my purchased reports?',
    answer: 'After purchasing a property report, you\'ll receive an email with a link to view your report online. You can also access all your purchased reports through your account dashboard. Reports can be printed or saved as PDFs for your records.',
  },
  {
    category: 'Technical',
    question: 'What is the Pro Dashboard?',
    answer: 'The Pro Dashboard is available to subscribers and provides quick tank lookup search, job history tracking (all past searches), usage statistics (lookups this month), subscription management, and downloadable reports for each job. It\'s designed for septic professionals who need to track multiple properties.',
  },
  {
    category: 'Technical',
    question: 'Can I share my reports with others?',
    answer: 'Property reports are licensed for single use and include a unique watermark. Sharing reports with clients or colleagues for legitimate business purposes is allowed, but reselling or publicly distributing reports is prohibited. Pro subscribers can generate reports for their clients as part of their service.',
  },

  // Business & Professional Use
  {
    category: 'Business',
    question: 'Is TankFindr suitable for septic contractors?',
    answer: 'Absolutely! Many septic contractors use TankFindr to pre-screen properties before site visits, provide quick estimates to clients, verify permit records, and save time on tank location research. Our Pro and Enterprise plans are specifically designed for high-volume professional use.',
  },
  {
    category: 'Business',
    question: 'Can real estate agents use TankFindr?',
    answer: 'Yes! Real estate agents use TankFindr to quickly determine if properties have septic systems, provide disclosure information to buyers, answer buyer questions during showings, and order detailed reports for property listings. The $19 property reports are perfect for occasional use.',
  },
  {
    category: 'Business',
    question: 'Do you offer white-label or API access?',
    answer: 'We\'re currently developing API access for Enterprise customers. If you\'re interested in white-label solutions or API integration, please contact us at support@tankfindr.com to discuss custom enterprise solutions.',
  },
  {
    category: 'Business',
    question: 'Can I get a refund if the data is inaccurate?',
    answer: 'We stand behind our data quality. If you purchase a property report and the location is significantly inaccurate (more than 100 meters off) due to an error in our system, contact us at support@tankfindr.com within 30 days for a refund. However, we cannot refund reports where the source government data is incomplete or outdated.',
  },

  // Privacy & Security
  {
    category: 'Privacy',
    question: 'Is my search history private?',
    answer: 'Yes. Your search history is private and only accessible to you through your account. We do not sell or share your search data with third parties. Pro subscribers\' job history is stored indefinitely, while free users\' history is retained for 30 days. See our Privacy Policy for details.',
  },
  {
    category: 'Privacy',
    question: 'How is my payment information protected?',
    answer: 'We use Stripe, a PCI-compliant payment processor, to handle all transactions. We never store your credit card information on our servers. All payment data is encrypted and securely processed through Stripe\'s infrastructure.',
  },
  {
    category: 'Privacy',
    question: 'What data does TankFindr collect?',
    answer: 'We collect account information (email, name), payment information (processed by Stripe), search addresses and GPS coordinates, usage data (number of lookups, features used), and device information (IP address, browser type). We use this data to provide our Service, prevent abuse, and improve our algorithms. See our Privacy Policy for complete details.',
  },

  // Troubleshooting
  {
    category: 'Troubleshooting',
    question: 'Why can\'t I find an address?',
    answer: [
      'If you\'re having trouble finding an address:',
      '• Try different address formats (with/without unit numbers)',
      '• Use the full street name (e.g., "Street" instead of "St")',
      '• Check for typos in the address',
      '• Verify the address exists in Google Maps',
      '• Try using nearby addresses if the exact address isn\'t found',
    ],
  },
  {
    category: 'Troubleshooting',
    question: 'What does "No coverage in this area" mean?',
    answer: 'This means we don\'t have septic system data for that county yet. We\'re constantly adding new counties. You can request your county through our Coverage page, and we\'ll prioritize it based on demand. Most requested counties can be added within 1-2 weeks.',
  },
  {
    category: 'Troubleshooting',
    question: 'I found an error in your data. How do I report it?',
    answer: 'We appreciate your help in improving our data quality! Please email support@tankfindr.com with the address, the error you found, and any supporting documentation. We\'ll investigate and update our records if needed. Note that we can only correct errors in our system, not in the source government databases.',
  },

  // Getting Started
  {
    category: 'Getting Started',
    question: 'How do I get started with TankFindr?',
    answer: [
      'Getting started is easy:',
      '1. Try our free widget on the homepage to check if a property has a septic system',
      '2. If you need detailed information, purchase a $19 property report',
      '3. For professional use, sign up for a Pro subscription',
      '4. Create an account to track your searches and access reports',
      'No credit card required for the free widget!',
    ],
  },
  {
    category: 'Getting Started',
    question: 'Do you offer a free trial?',
    answer: 'We don\'t currently offer free trials for Pro subscriptions, but you can try our free "Sewer or Septic?" widget without creating an account. You can also purchase a single $19 property report to test our data quality before committing to a subscription.',
  },
]

const categories = Array.from(new Set(faqs.map(faq => faq.category)))

function FAQAccordion({ faq }: { faq: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 px-6 flex items-start justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-semibold text-gray-900 pr-8">{faq.question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          {Array.isArray(faq.answer) ? (
            <div className="text-gray-700 space-y-2">
              {faq.answer.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          ) : (
            <p className="text-gray-700">{faq.answer}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const filteredFAQs = selectedCategory === 'All'
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Everything you need to know about TankFindr
        </p>

        {/* Category Filter */}
        <Card className="p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Questions
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </Card>

        {/* FAQ List */}
        <Card className="mb-8">
          {filteredFAQs.map((faq, index) => (
            <FAQAccordion key={index} faq={faq} />
          ))}
        </Card>

        {/* Contact CTA */}
        <Card className="p-8 text-center bg-gradient-to-br from-emerald-50 to-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Still Have Questions?
          </h2>
          <p className="text-gray-700 mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <a
            href="mailto:support@tankfindr.com"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Contact Support
          </a>
        </Card>
      </div>
    </div>
  )
}
