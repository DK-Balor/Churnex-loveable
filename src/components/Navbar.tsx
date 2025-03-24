
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  
  // Mockup authentication - this would be replaced with actual auth
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }
  
  const handleLogout = () => {
    // This would be replaced with actual logout logic
    setIsLoggedIn(false)
    navigate('/')
  }

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 py-4 px-6 shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className="text-3xl font-bold text-white">Churnex</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-white hover:text-blue-200 py-2">Home</Link>
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-blue-200 py-2">Dashboard</Link>
                <Link to="/customers" className="text-white hover:text-blue-200 py-2">Customers</Link>
                <Link to="/predictions" className="text-white hover:text-blue-200 py-2">Predictions</Link>
                <Link to="/recovery" className="text-white hover:text-blue-200 py-2">Recovery</Link>
              </>
            ) : null}
            <Link to="/pricing" className="text-white hover:text-blue-200 py-2">Pricing</Link>
          </nav>
          
          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="bg-white text-blue-700 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
              >
                Log Out
              </button>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-blue-700 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="mt-4 md:hidden bg-blue-700 rounded-lg p-4">
            <nav className="flex flex-col space-y-3">
              <Link to="/" className="text-white hover:text-blue-200 py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              {isLoggedIn ? (
                <>
                  <Link to="/dashboard" className="text-white hover:text-blue-200 py-2" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  <Link to="/customers" className="text-white hover:text-blue-200 py-2" onClick={() => setMobileMenuOpen(false)}>Customers</Link>
                  <Link to="/predictions" className="text-white hover:text-blue-200 py-2" onClick={() => setMobileMenuOpen(false)}>Predictions</Link>
                  <Link to="/recovery" className="text-white hover:text-blue-200 py-2" onClick={() => setMobileMenuOpen(false)}>Recovery</Link>
                </>
              ) : null}
              <Link to="/pricing" className="text-white hover:text-blue-200 py-2" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              
              {isLoggedIn ? (
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-white text-blue-700 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  Log Out
                </button>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-white hover:text-blue-200 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-white text-blue-700 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Start Free Trial
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
