
import React, { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [businessName, setBusinessName] = useState('Your Company');
  const [email, setEmail] = useState('admin@yourcompany.com');
  const [plan, setPlan] = useState('Pro');
  const [trialEndsAt, setTrialEndsAt] = useState('2023-11-30');
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Settings</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'account'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'notifications'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'billing'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('billing')}
        >
          Billing
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'integrations'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('integrations')}
        >
          Integrations
        </button>
      </div>

      {/* Account Settings */}
      {activeTab === 'account' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Account Information</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <button
                type="button"
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none"
              >
                Change Password
              </button>
            </div>
            <div className="pt-4">
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
              >
                Save Changes
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Subscription Plan</h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-gray-800">{plan} Plan</span>
                  <span className="ml-2 text-sm text-gray-500">
                    {plan === 'Pro' && '£249/month'}
                    {plan === 'Scale' && '£119/month'}
                    {plan === 'Growth' && '£59/month'}
                  </span>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Change Plan
                </button>
              </div>
              <p className="text-sm text-gray-600">
                {trialEndsAt ? (
                  <>
                    Your free trial ends on{' '}
                    <span className="font-medium">
                      {new Date(trialEndsAt).toLocaleDateString()}
                    </span>
                  </>
                ) : (
                  'Your subscription is active'
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-medium text-gray-800">Email Notifications</h3>
                <p className="text-xs text-gray-500">Receive important updates via email</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  className="h-4 w-4 text-blue-600 rounded"
                  defaultChecked
                />
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-medium text-gray-800">Payment Alerts</h3>
                <p className="text-xs text-gray-500">Notifications about payment failures and recovery</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="paymentAlerts"
                  className="h-4 w-4 text-blue-600 rounded"
                  defaultChecked
                />
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-medium text-gray-800">Churn Predictions</h3>
                <p className="text-xs text-gray-500">Alert when new customers are at risk of churning</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="churnPredictions"
                  className="h-4 w-4 text-blue-600 rounded"
                  defaultChecked
                />
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-medium text-gray-800">Weekly Reports</h3>
                <p className="text-xs text-gray-500">Receive weekly summary reports</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="weeklyReports"
                  className="h-4 w-4 text-blue-600 rounded"
                  defaultChecked
                />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <h3 className="text-sm font-medium text-gray-800">Marketing Updates</h3>
                <p className="text-xs text-gray-500">News about features and product updates</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="marketingUpdates"
                  className="h-4 w-4 text-blue-600 rounded"
                  defaultChecked
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Settings */}
      {activeTab === 'billing' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Billing & Payment</h2>
          
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-2">Current Plan</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-gray-800">{plan} Plan</span>
                  <span className="ml-2 text-sm text-gray-500">
                    {plan === 'Pro' && '£249/month'}
                    {plan === 'Scale' && '£119/month'}
                    {plan === 'Growth' && '£59/month'}
                  </span>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Change Plan
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Next billing date: November 15, 2023
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-2">Payment Method</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white p-2 rounded border border-gray-200 mr-3">
                  <span className="text-lg">💳</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">Visa ending in 4242</div>
                  <div className="text-xs text-gray-500">Expires 12/2025</div>
                </div>
              </div>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Update Payment Method
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Billing History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Oct 15, 2023</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Pro Plan Subscription</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£249.00</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                      <a href="#">Download</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sep 15, 2023</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Pro Plan Subscription</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£249.00</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                      <a href="#">Download</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Aug 15, 2023</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Pro Plan Subscription</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£249.00</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                      <a href="#">Download</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Settings */}
      {activeTab === 'integrations' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Integrations</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded mr-4">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <h3 className="text-md font-medium text-gray-800">Stripe</h3>
                  <p className="text-sm text-gray-500">Connect your Stripe account to process payments</p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none"
              >
                Connect
              </button>
            </div>
            
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded mr-4">
                  <span className="text-xl">📧</span>
                </div>
                <div>
                  <h3 className="text-md font-medium text-gray-800">Mailchimp</h3>
                  <p className="text-sm text-gray-500">Connect with Mailchimp for email campaigns</p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none"
              >
                Connect
              </button>
            </div>
            
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded mr-4">
                  <span className="text-xl">💬</span>
                </div>
                <div>
                  <h3 className="text-md font-medium text-gray-800">Intercom</h3>
                  <p className="text-sm text-gray-500">Connect with Intercom for customer support</p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none"
              >
                Connect
              </button>
            </div>
            
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded mr-4">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h3 className="text-md font-medium text-gray-800">Google Analytics</h3>
                  <p className="text-sm text-gray-500">Connect with Google Analytics for advanced reporting</p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
