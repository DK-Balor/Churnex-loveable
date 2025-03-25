
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

const HeroSection: React.FC<{ onLearnMore: () => void }> = ({ onLearnMore }) => {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <section className="gradient-bg py-20 md:py-28">
      <div className="container max-w-6xl mx-auto px-4 md:flex items-center">
        <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12 animate-fade-in">
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
            Churnex<span className="text-xs align-top text-brand-green">™</span> uses AI to identify at-risk customers and recover revenue before it's
            lost. Our platform helps subscription businesses reduce churn by up to 43%.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/auth"
              className="bg-brand-green hover:bg-brand-green-600 text-white px-6 py-3 rounded-md font-medium text-lg transition-colors text-center group"
            >
              Get Started Free
              <ArrowRight className="inline ml-2 transition-transform group-hover:translate-x-1" size={18} />
            </Link>
            <button
              onClick={onLearnMore}
              className="border border-brand-dark-300 hover:border-brand-dark-400 text-brand-dark-800 px-6 py-3 rounded-md font-medium text-lg transition-colors text-center"
            >
              See how it works
            </button>
          </div>
          
          <div className="mt-8 flex items-center text-sm text-brand-dark-500">
            <span className="inline-block px-2 py-1 bg-brand-dark-100 text-xs rounded mr-2">NEW</span>
            Now with AI-powered win-back campaign suggestions
          </div>
        </div>

        <div className="md:w-1/2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {/* Dashboard Preview with hover animation */}
          <div 
            className={cn(
              "bg-white rounded-lg shadow-card overflow-hidden border border-gray-100 transition-all duration-300",
              isHovering ? "transform scale-105" : ""
            )}
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
                <div className={cn(
                  "bg-white p-4 rounded-lg border border-gray-100 transition-all duration-500",
                  isHovering ? "bg-brand-green-50" : ""
                )}>
                  <p className="text-sm text-brand-dark-500">Revenue Recovered</p>
                  <p className={cn(
                    "text-3xl font-bold transition-all duration-500",
                    isHovering ? "text-brand-green" : "text-brand-dark-900"
                  )}>
                    {isHovering ? '$31,547' : '$28,429'}
                  </p>
                </div>
                <div className={cn(
                  "bg-white p-4 rounded-lg border border-gray-100 transition-all duration-500",
                  isHovering ? "bg-brand-green-50" : ""
                )}>
                  <p className="text-sm text-brand-dark-500">Recovery Rate</p>
                  <p className={cn(
                    "text-3xl font-bold transition-all duration-500",
                    isHovering ? "text-brand-green" : "text-brand-green"
                  )}>
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
                      className={cn(
                        "w-full rounded-t-sm",
                        i % 3 === 0 ? "bg-brand-green" : "bg-brand-dark-400",
                        isHovering && i === 9 ? "animate-pulse" : ""
                      )}
                      style={{ 
                        height: `${isHovering && i === 8 ? height + 10 : height}%`,
                        transition: 'height 0.5s ease-in-out'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <button className="text-brand-dark-600 text-sm font-medium hover:text-brand-green transition-colors">
                  View Full Dashboard
                </button>
                <div className={cn(
                  "px-2 py-1 text-xs rounded-md transition-all duration-300",
                  isHovering 
                    ? "bg-brand-green text-white" 
                    : "bg-brand-green-50 text-brand-green-600"
                )}>
                  {isHovering ? 'Risk Alert: 3 customers' : 'New Alert'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
