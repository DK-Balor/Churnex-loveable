
import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-white">Churnex</h1>
          <p className="text-blue-100">Intelligent Customer Retention Platform</p>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to Churnex</h2>
          <p className="text-gray-600">
            Predict customer churn and enhance retention strategies with advanced machine learning models.
            Leverage actionable insights to reduce churn, improve customer lifetime value, and drive sustainable growth.
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
