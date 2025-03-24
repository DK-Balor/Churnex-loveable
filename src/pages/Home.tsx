
import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart2, ShieldCheck, TrendingUp } from 'lucide-react'

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-20 px-6">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Predict & Prevent Customer Churn Before It Happens
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Churnex uses AI to help subscription businesses identify at-risk customers,
              automate recovery processes, and grow recurring revenue.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/register" 
                className="bg-white text-blue-700 py-3 px-8 rounded-md font-semibold hover:bg-blue-50 transition-colors"
              >
                Start Free Trial
              </Link>
              <Link 
                to="/pricing" 
                className="border border-white text-white py-3 px-8 rounded-md font-semibold hover:bg-blue-700 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-8 rounded-lg text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">43%</p>
              <p className="text-gray-700">Average Reduction in Churn Rate</p>
            </div>
            <div className="bg-blue-50 p-8 rounded-lg text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">70%</p>
              <p className="text-gray-700">Recovery of Failed Payments</p>
            </div>
            <div className="bg-blue-50 p-8 rounded-lg text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">2.5x</p>
              <p className="text-gray-700">Increase in Customer Lifetime Value</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">How Churnex Works</h2>
            <p className="text-lg text-gray-600">
              Our AI-powered platform helps you reduce churn and recover lost revenue through four key features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <BarChart2 className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Churn Prediction</h3>
              <p className="text-gray-600 mb-4">
                Our AI analyzes customer behavior and identifies patterns that signal potential churn, 
                allowing you to proactively address issues before customers leave.
              </p>
              <Link to="/register" className="text-blue-600 inline-flex items-center font-medium">
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <TrendingUp className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Revenue Recovery</h3>
              <p className="text-gray-600 mb-4">
                Automatically retry failed payments and send personalized recovery emails to win back 
                customers who have churned due to payment issues.
              </p>
              <Link to="/register" className="text-blue-600 inline-flex items-center font-medium">
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <ShieldCheck className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Win-Back Campaigns</h3>
              <p className="text-gray-600 mb-4">
                Create personalized win-back campaigns based on customer data and preferences to re-engage 
                customers who have already churned.
              </p>
              <Link to="/register" className="text-blue-600 inline-flex items-center font-medium">
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <BarChart2 className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Actionable Analytics</h3>
              <p className="text-gray-600 mb-4">
                Get clear insights into your churn metrics, customer health scores, and the effectiveness 
                of your retention strategies.
              </p>
              <Link to="/register" className="text-blue-600 inline-flex items-center font-medium">
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 py-16 px-6">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to reduce customer churn and boost revenue?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of subscription businesses that trust Churnex to help them grow.
            </p>
            <Link 
              to="/register" 
              className="bg-white text-blue-700 py-3 px-8 rounded-md font-semibold hover:bg-blue-50 transition-colors inline-block"
            >
              Start Your Free 7-Day Trial
            </Link>
            <p className="text-blue-200 mt-4">No credit card required</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
