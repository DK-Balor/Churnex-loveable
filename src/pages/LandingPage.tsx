
import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Churnex</h1>
              <p className="text-blue-100">Intelligent Customer Retention Platform</p>
            </div>
            <nav>
              <ul className="flex space-x-8">
                <li>
                  <a href="#features" className="text-blue-100 hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-blue-100 hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link to="/auth" className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50">
                    Sign In
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-800 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Predict & Prevent Customer Churn Before It Happens
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
            AI-powered platform that helps subscription businesses reduce churn and recover lost revenue
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/auth"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium text-lg transition-colors"
            >
              Start Free Trial
            </Link>
            <a
              href="#features"
              className="bg-blue-800 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium text-lg transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Key Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to reduce churn and increase customer lifetime value
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-3xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Revenue Recovery</h3>
              <p className="text-gray-600">
                Identify and retry failed payments automatically. Send automated recovery messages and
                recover up to 70% of failed subscription payments.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-3xl mb-4">🔮</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Churn Prediction</h3>
              <p className="text-gray-600">
                AI-driven customer risk scoring and behaviour analysis. Identify customers likely to
                cancel and automate proactive retention efforts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Win-Back Campaigns</h3>
              <p className="text-gray-600">
                Personalised win-back campaigns based on customer data. Dynamic incentives to encourage
                re-subscription and engagement.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Actionable Analytics</h3>
              <p className="text-gray-600">
                Comprehensive subscription metrics and dashboards. Real-time reporting on churn rates,
                recovery success, and customer health.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">How Churnex™ Helps</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our customers have achieved incredible results with our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">43%</div>
              <p className="text-gray-600">Reduction in churn rates</p>
            </div>

            <div className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">70%</div>
              <p className="text-gray-600">Recovery of failed payments</p>
            </div>

            <div className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">38%</div>
              <p className="text-gray-600">Increase in customer lifetime value</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Plans that grow with your business. All plans come with a 7-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Growth</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">£59</span>
                <span className="text-gray-600"> / month</span>
              </div>
              <p className="text-gray-600 mb-6">Up to 500 subscribers</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Basic recovery</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Churn prediction</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Email notifications</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Standard support</span>
                </li>
              </ul>
              <Link
                to="/auth"
                className="block text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors w-full"
              >
                Start Free Trial
              </Link>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-blue-500 transform scale-105">
              <div className="bg-blue-500 text-white text-xs font-bold uppercase tracking-wide py-1 px-2 rounded-full inline-block mb-4">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Scale</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">£119</span>
                <span className="text-gray-600"> / month</span>
              </div>
              <p className="text-gray-600 mb-6">Up to 2,000 subscribers</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Advanced recovery</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>AI churn prevention</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Win-back campaigns</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
              <Link
                to="/auth"
                className="block text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors w-full"
              >
                Start Free Trial
              </Link>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">£249</span>
                <span className="text-gray-600"> / month</span>
              </div>
              <p className="text-gray-600 mb-6">Unlimited subscribers</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Enterprise features</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Custom retention workflows</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>24/7 premium support</span>
                </li>
              </ul>
              <Link
                to="/auth"
                className="block text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors w-full"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to reduce churn and grow revenue?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Start your 7-day free trial today. No credit card required.
          </p>
          <Link
            to="/auth"
            className="bg-white text-blue-800 hover:bg-blue-50 px-8 py-4 rounded-md font-medium text-lg transition-colors inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Churnex</h3>
              <p className="mb-4">
                AI-powered platform that helps subscription businesses reduce churn and recover lost revenue.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  LinkedIn
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  Facebook
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Case Studies
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Cookies
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Licenses
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} Churnex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
