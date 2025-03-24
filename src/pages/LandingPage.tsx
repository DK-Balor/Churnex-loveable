
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, AlertCircle, TrendingUp, Users } from 'lucide-react';

export default function LandingPage() {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="py-4 border-b border-gray-100">
        <div className="container max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-brand-dark-800">
              Churnex<span className="text-sm align-top">™</span>
            </h1>
          </div>
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li>
                <a href="#features" className="text-brand-dark-600 hover:text-brand-dark-800">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-brand-dark-600 hover:text-brand-dark-800">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-dark-600 hover:text-brand-dark-800">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-dark-600 hover:text-brand-dark-800">
                  Contact
                </a>
              </li>
            </ul>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/auth" className="text-brand-dark-700 hover:text-brand-dark-900 px-4 py-2 rounded-md">
              Login
            </Link>
            <Link to="/auth" className="bg-brand-green text-white px-6 py-2 rounded-md hover:bg-brand-green-600 transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-bg py-20 md:py-28">
        <div className="container max-w-6xl mx-auto px-4 md:flex items-center">
          <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12">
            <div className="inline-flex items-center text-sm bg-white py-1 px-3 rounded-full mb-6 text-brand-dark-700">
              <div className="w-2 h-2 bg-brand-green rounded-full mr-2"></div>
              <span>Recover lost revenue</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark-900 mb-6 leading-tight">
              Predict <span className="text-brand-dark-800">&</span> Prevent <br/>
              <span className="text-brand-green">Customer Churn</span> <br/>
              Before It Happens
            </h2>
            
            <p className="text-lg text-brand-dark-600 mb-8 max-w-lg">
              Churnex™ uses AI to identify at-risk customers and recover revenue before it's
              lost. Our platform helps subscription businesses reduce churn by up to 43%.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/auth"
                className="bg-brand-green hover:bg-brand-green-600 text-white px-6 py-3 rounded-md font-medium text-lg transition-colors text-center"
              >
                Get Started Free
              </Link>
              <a
                href="#features"
                className="border border-brand-dark-300 hover:border-brand-dark-400 text-brand-dark-800 px-6 py-3 rounded-md font-medium text-lg transition-colors text-center"
              >
                See how it works
              </a>
            </div>
            
            <div className="mt-8 flex items-center text-sm text-brand-dark-500">
              <span className="inline-block px-2 py-1 bg-brand-dark-100 text-xs rounded mr-2">NEW</span>
              Now with AI-powered win-back campaign suggestions
            </div>
          </div>

          <div className="md:w-1/2">
            {/* Dashboard Preview with hover animation */}
            <div 
              className={`bg-white rounded-lg shadow-card overflow-hidden border border-gray-100 transition-all duration-300 ${isHovering ? 'transform scale-105' : ''}`}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-brand-dark-700">Revenue Recovery Dashboard</h3>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={`bg-white p-4 rounded-lg border border-gray-100 transition-all duration-500 ${isHovering ? 'bg-brand-green-50' : ''}`}>
                    <p className="text-sm text-brand-dark-500">Revenue Recovered</p>
                    <p className={`text-3xl font-bold transition-all duration-500 ${isHovering ? 'text-brand-green' : 'text-brand-dark-900'}`}>
                      {isHovering ? '$31,547' : '$28,429'}
                    </p>
                  </div>
                  <div className={`bg-white p-4 rounded-lg border border-gray-100 transition-all duration-500 ${isHovering ? 'bg-brand-green-50' : ''}`}>
                    <p className="text-sm text-brand-dark-500">Recovery Rate</p>
                    <p className={`text-3xl font-bold transition-all duration-500 ${isHovering ? 'text-brand-green' : 'text-brand-green'}`}>
                      {isHovering ? '92%' : '87%'}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-brand-dark-600">Recovery Trend</h4>
                    <span className="text-xs text-brand-dark-400">Last 30 days</span>
                  </div>
                  <div className="h-32 bg-gray-50 rounded-lg flex items-end p-2 space-x-1">
                    {[30, 45, 40, 60, 50, 45, 70, 55, 60, 80].map((height, i) => (
                      <div
                        key={i}
                        className={`w-full rounded-t-sm ${i % 3 === 0 ? 'bg-brand-green' : 'bg-brand-dark-400'} ${
                          isHovering && i === 9 ? 'animate-pulse h-[90%]' : ''
                        }`}
                        style={{ 
                          height: `${isHovering && i === 8 ? height + 10 : height}%`,
                          transition: 'height 0.5s ease-in-out'
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button className="text-brand-dark-600 text-sm font-medium">View Full Dashboard</button>
                  <div className={`px-2 py-1 text-xs rounded-md transition-all duration-300 ${
                    isHovering ? 'bg-brand-green text-white' : 'bg-brand-green-50 text-brand-green-600'
                  }`}>
                    {isHovering ? 'Risk Alert: 3 customers' : 'New Alert'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-dark-900 mb-4">Key Features</h2>
            <p className="text-xl text-brand-dark-600 max-w-3xl mx-auto">
              Everything you need to reduce churn and increase customer lifetime value
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-brand-green-50 rounded-lg flex items-center justify-center mb-4 text-brand-green">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-semibold text-brand-dark-800 mb-2">Revenue Recovery</h3>
              <p className="text-brand-dark-600">
                Identify and retry failed payments automatically. Send automated recovery messages and
                recover up to 70% of failed subscription payments.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-brand-green-50 rounded-lg flex items-center justify-center mb-4 text-brand-green">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xl font-semibold text-brand-dark-800 mb-2">Churn Prediction</h3>
              <p className="text-brand-dark-600">
                AI-driven customer risk scoring and behaviour analysis. Identify customers likely to
                cancel and automate proactive retention efforts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-brand-green-50 rounded-lg flex items-center justify-center mb-4 text-brand-green">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-semibold text-brand-dark-800 mb-2">AI Win-Back Campaigns</h3>
              <p className="text-brand-dark-600">
                Personalised win-back campaigns based on customer data. Dynamic incentives to encourage
                re-subscription and engagement.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-brand-green-50 rounded-lg flex items-center justify-center mb-4 text-brand-green">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-semibold text-brand-dark-800 mb-2">Actionable Analytics</h3>
              <p className="text-brand-dark-600">
                Comprehensive subscription metrics and dashboards. Real-time reporting on churn rates,
                recovery success, and customer health.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-dark-900 mb-4">How Churnex™ Helps</h2>
            <p className="text-xl text-brand-dark-600 max-w-3xl mx-auto">
              Our customers have achieved incredible results with our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-brand-green mb-2">43%</div>
              <p className="text-brand-dark-600">Reduction in churn rates</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-brand-green mb-2">70%</div>
              <p className="text-brand-dark-600">Recovery of failed payments</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-brand-green mb-2">38%</div>
              <p className="text-brand-dark-600">Increase in customer lifetime value</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-green text-white">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to reduce churn and grow revenue?</h2>
          <p className="text-xl text-white opacity-90 mb-10 max-w-3xl mx-auto">
            Start your 7-day free trial today. No credit card required.
          </p>
          <Link
            to="/auth"
            className="bg-white text-brand-green hover:bg-gray-100 px-8 py-4 rounded-md font-medium text-lg transition-colors inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark-900 text-gray-400 py-12">
        <div className="container max-w-6xl mx-auto px-4">
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
