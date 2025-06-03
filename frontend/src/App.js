import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Floating Particles Component
const FloatingParticles = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}
        />
      ))}
    </div>
  );
};

// Typing Animation Component
const TypingText = ({ text, speed = 100 }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className="inline-block">
      {displayText}
      <span className="animate-blink text-blue-400">|</span>
    </span>
  );
};

// Glass Card Component
const GlassCard = ({ children, className = "", hover = true }) => {
  return (
    <div className={`
      backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6
      shadow-xl shadow-purple-900/20 relative overflow-hidden
      ${hover ? 'hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:shadow-purple-900/30' : ''}
      transition-all duration-500 ease-out group
      ${className}
    `}>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Ripple Button Component
const RippleButton = ({ children, onClick, className = "", variant = "primary" }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      x,
      y,
      id: Date.now()
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    if (onClick) onClick(e);
  };

  const baseClasses = "relative overflow-hidden rounded-2xl px-8 py-3 font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95";
  const variantClasses = {
    primary: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl",
    secondary: "bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20",
    ghost: "text-purple-300 hover:text-white hover:bg-white/10"
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={handleClick}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
      {children}
    </button>
  );
};

// Firm Card Component
const FirmCard = ({ firm }) => {
  return (
    <GlassCard className="h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img 
              src={firm.logo_url} 
              alt={`${firm.name} logo`}
              className="w-12 h-12 rounded-xl object-cover border-2 border-white/20"
            />
            <div>
              <h3 className="text-xl font-bold text-white">{firm.name}</h3>
              <div className="flex items-center space-x-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(firm.rating) ? 'text-yellow-400' : 'text-gray-600'}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-purple-200 text-sm">({firm.total_reviews})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-3 border border-green-500/30">
            <div className="text-green-300 text-sm font-medium">Profit Split</div>
            <div className="text-white text-lg font-bold">{firm.profit_split[0]}%</div>
          </div>
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-3 border border-blue-500/30">
            <div className="text-blue-300 text-sm font-medium">Min Account</div>
            <div className="text-white text-lg font-bold">${(firm.min_account_size / 1000).toFixed(0)}K</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-purple-200 text-sm mb-4 flex-grow">{firm.description}</p>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            firm.news_trading && 'News Trading',
            firm.expert_advisors && 'EAs',
            firm.scaling_plan && 'Scaling',
            `${firm.payout_frequency} payouts`
          ].filter(Boolean).slice(0, 3).map((feature, idx) => (
            <span 
              key={idx}
              className="px-3 py-1 bg-white/10 rounded-full text-xs text-purple-200 border border-white/20"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <RippleButton 
            onClick={() => window.open(firm.website_url, '_blank')}
            className="flex-1"
          >
            Visit Site
          </RippleButton>
        </div>
      </div>
    </GlassCard>
  );
};

// Statistics Component
const StatisticsBar = ({ stats }) => {
  if (!stats) return null;

  return (
    <GlassCard className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{stats.total_firms}</div>
          <div className="text-purple-200 text-sm">Total Firms</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400">{stats.avg_profit_split}%</div>
          <div className="text-purple-200 text-sm">Avg Profit Split</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-400">{stats.avg_rating}</div>
          <div className="text-purple-200 text-sm">Avg Rating</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400">${stats.lowest_evaluation_fee}</div>
          <div className="text-purple-200 text-sm">Lowest Fee</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-400">{stats.most_popular_platform}</div>
          <div className="text-purple-200 text-sm">Top Platform</div>
        </div>
      </div>
    </GlassCard>
  );
};

// Main App Component
function App() {
  const [firms, setFirms] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch firms and statistics
      const [firmsResponse, statsResponse] = await Promise.all([
        axios.get(`${API}/firms`),
        axios.get(`${API}/statistics`)
      ]);
      
      setFirms(firmsResponse.data);
      setStatistics(statsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter firms based on search
  const filteredFirms = firms.filter(firm =>
    firm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    firm.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen relative">
      <FloatingParticles />
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 animate-gradient-shift">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-900/20 to-violet-900/20"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-6 pt-20 pb-16">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <TypingText text="Find Your Perfect" speed={80} />
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Prop Firm
              </span>
            </h1>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto mb-8">
              Compare top proprietary trading firms, analyze profit splits, and discover the perfect match for your trading journey.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <input
                type="text"
                placeholder="Search firms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 pb-16">
          {/* Statistics */}
          <StatisticsBar stats={statistics} />

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-white/10 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {filteredFirms.length} Prop Firms Found
                </h2>
                <p className="text-purple-200">
                  Compare the best proprietary trading firms in the industry
                </p>
              </div>

              {/* Firms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredFirms.map(firm => (
                  <FirmCard key={firm.id} firm={firm} />
                ))}
              </div>
            </>
          )}

          {!loading && filteredFirms.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No firms found</h3>
              <p className="text-purple-200">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                🚀 Prop Firm Comparison Platform
              </h3>
              <p className="text-purple-200">
                Your gateway to finding the perfect proprietary trading firm
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;