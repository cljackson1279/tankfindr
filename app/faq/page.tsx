'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { faqs, type FAQItem } from './faqData'

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
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="max-w-4xl mx-auto py-12 px-4">
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
