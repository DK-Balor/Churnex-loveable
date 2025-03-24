
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')
  
  const plans = [
    {
      name: 'Growth',
      description: 'Perfect for small businesses just getting started with churn prevention.',
      monthlyPrice: 59,
      annualPrice: 49,
      features: [
        'Up to 500 subscribers',
        'Basic churn prediction',
        'Payment recovery',
        'Email notifications',
        'Standard support',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Scale',
      description: 'For growing businesses that need advanced churn prevention tools.',
      monthlyPrice: 119,
      annualPrice: 99,
      features: [
        'Up to 2,000 subscribers',
        'Advanced churn prediction',
        'AI-powered win-back campaigns',
        'Custom recovery workflows',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Pro',
      description: 'Enterprise-grade tools for businesses with complex retention needs.',
      monthlyPrice: 249,
      annualPrice: 199,
      features: [
        'Unlimited subscribers',
        'Advanced churn prediction & analytics',
        'Custom retention strategies',
        'API access',
        'Dedicated account manager',
        '24/7 premium support',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
  ]

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">
            Choose the plan that's right for your business. All plans include a 7-day free trial.
          </p>
        </div>
        
        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1 rounded-lg shadow-md flex items-center">
            <button
              className={`px-6 py-2 rounded-md ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-md ${
                billingPeriod === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setBillingPeriod('annual')}
            >
              Annual <span className="text-xs font-bold text-green-500 ml-1">Save 15%</span>
            </button>
          </div>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`
                bg-white rounded-lg shadow-lg overflow-hidden
                ${plan.popular ? 'transform md:-translate-y-4 ring-2 ring-blue-600' : ''}
              `}
            >
              {plan.popular && (
                <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6 h-12">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                  </span>
                  <span className="text-gray-600 ml-2">/ month</span>
                  {billingPeriod === 'annual' && (
                    <p className="text-green-600 text-sm mt-1">
                      Billed annually (${plan.annualPrice * 12}/year)
                    </p>
                  )}
                </div>
                
                <Link
                  to="/register"
                  className={`
                    block w-full py-3 px-4 rounded-md text-center font-medium
                    ${plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }
                    transition-colors mb-6
                  `}
                >
                  {plan.cta}
                </Link>
                
                <div className="border-t border-gray-200 pt-6">
                  <p className="font-medium text-gray-900 mb-4">What's included:</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-24">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">How does the free trial work?</h3>
              <p className="text-gray-700">
                All plans come with a 7-day free trial. You can try out all features without 
                any commitment. No credit card required to start your trial.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
              <p className="text-gray-700">
                Yes, you can upgrade or downgrade your plan at any time. If you upgrade, you'll 
                be charged the prorated difference. If you downgrade, you'll receive a prorated 
                credit to your account.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Do you offer a discount for nonprofits?</h3>
              <p className="text-gray-700">
                Yes, we offer a 20% discount for nonprofits and educational institutions. 
                Please contact our support team to apply for this discount.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-700">
                We accept all major credit cards (Visa, Mastercard, American Express, Discover) 
                and PayPal. For annual plans, we can also invoice you directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing
