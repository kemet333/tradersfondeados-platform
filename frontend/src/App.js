import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
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

// Filter Sidebar Component
const FilterSidebar = ({ filters, setFilters, onApplyFilters }) => {
  const platforms = ["MetaTrader 4", "MetaTrader 5", "cTrader", "NinjaTrader", "TradingView"];
  const payoutFrequencies = ["weekly", "bi-weekly", "monthly"];

  return (
    <GlassCard className="sticky top-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full mr-3"></span>
        Filters
      </h3>
      
      <div className="space-y-6">
        {/* Account Size */}
        <div>
          <label className="block text-purple-200 text-sm font-medium mb-3">Min Account Size</label>
          <div className="relative">
            <input
              type="range"
              min="5000"
              max="100000"
              step="5000"
              value={filters.minAccountSize || 5000}
              onChange={(e) => setFilters(prev => ({...prev, minAccountSize: parseInt(e.target.value)}))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-purple-300 mt-2">
              <span>$5K</span>
              <span className="text-white font-medium">${((filters.minAccountSize || 5000) / 1000).toFixed(0)}K</span>
              <span>$100K</span>
            </div>
          </div>
        </div>

        {/* Profit Split */}
        <div>
          <label className="block text-purple-200 text-sm font-medium mb-3">Min Profit Split</label>
          <div className="relative">
            <input
              type="range"
              min="70"
              max="90"
              step="5"
              value={filters.minProfitSplit || 70}
              onChange={(e) => setFilters(prev => ({...prev, minProfitSplit: parseInt(e.target.value)}))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-purple-300 mt-2">
              <span>70%</span>
              <span className="text-white font-medium">{filters.minProfitSplit || 70}%</span>
              <span>90%</span>
            </div>
          </div>
        </div>

        {/* Platform */}
        <div>
          <label className="block text-purple-200 text-sm font-medium mb-3">Platform</label>
          <select
            value={filters.platform || ''}
            onChange={(e) => setFilters(prev => ({...prev, platform: e.target.value}))}
            className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          >
            <option value="">All Platforms</option>
            {platforms.map(platform => (
              <option key={platform} value={platform} className="bg-gray-800">{platform}</option>
            ))}
          </select>
        </div>

        {/* Payout Frequency */}
        <div>
          <label className="block text-purple-200 text-sm font-medium mb-3">Payout Frequency</label>
          <select
            value={filters.payoutFrequency || ''}
            onChange={(e) => setFilters(prev => ({...prev, payoutFrequency: e.target.value}))}
            className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          >
            <option value="">All Frequencies</option>
            {payoutFrequencies.map(freq => (
              <option key={freq} value={freq} className="bg-gray-800">{freq}</option>
            ))}
          </select>
        </div>

        {/* Boolean Filters */}
        <div className="space-y-3">
          {[
            { key: 'newsTrading', label: 'News Trading' },
            { key: 'expertAdvisors', label: 'Expert Advisors' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters[key] || false}
                onChange={(e) => setFilters(prev => ({...prev, [key]: e.target.checked}))}
                className="w-5 h-5 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-400 focus:ring-2"
              />
              <span className="text-purple-200 group-hover:text-white transition-colors">{label}</span>
            </label>
          ))}
        </div>

        <RippleButton onClick={onApplyFilters} className="w-full">
          Apply Filters
        </RippleButton>
      </div>
    </GlassCard>
  );
};

// Firm Card Component
const FirmCard = ({ firm, onCompare, isSelected }) => {
  const navigate = useNavigate();

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
          
          <button
            onClick={() => onCompare(firm.id)}
            className={`p-2 rounded-xl transition-all duration-300 ${
              isSelected 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/10 text-purple-200 hover:bg-purple-600/20 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </button>
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
            onClick={() => navigate(`/firm/${firm.id}`)}
            variant="secondary"
            className="flex-1"
          >
            View Details
          </RippleButton>
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

// Home Page Component
const HomePage = () => {
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFirms, setSelectedFirms] = useState([]);
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFirms();
  }, []);

  const fetchFirms = async (filterParams = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filterParams.minAccountSize) params.append('min_account_size', filterParams.minAccountSize);
      if (filterParams.minProfitSplit) params.append('min_profit_split', filterParams.minProfitSplit);
      if (filterParams.platform) params.append('platform', filterParams.platform);
      if (filterParams.payoutFrequency) params.append('payout_frequency', filterParams.payoutFrequency);
      if (filterParams.newsTrading !== undefined) params.append('news_trading', filterParams.newsTrading);
      if (filterParams.expertAdvisors !== undefined) params.append('expert_advisors', filterParams.expertAdvisors);

      const response = await axios.get(`${API}/firms?${params.toString()}`);
      setFirms(response.data);
    } catch (error) {
      console.error('Error fetching firms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareToggle = (firmId) => {
    setSelectedFirms(prev => {
      if (prev.includes(firmId)) {
        return prev.filter(id => id !== firmId);
      } else if (prev.length < 4) {
        return [...prev, firmId];
      } else {
        alert('Maximum 4 firms can be compared');
        return prev;
      }
    });
  };

  const handleApplyFilters = () => {
    fetchFirms(filters);
  };

  const handleCompare = () => {
    if (selectedFirms.length >= 2) {
      navigate(`/compare?firms=${selectedFirms.join(',')}`);
    }
  };

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
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <FilterSidebar 
                filters={filters}
                setFilters={setFilters}
                onApplyFilters={handleApplyFilters}
              />
            </div>

            {/* Firms Grid */}
            <div className="lg:w-3/4">
              {/* Compare Bar */}
              {selectedFirms.length > 0 && (
                <GlassCard className="mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">
                      {selectedFirms.length} firm(s) selected for comparison
                    </span>
                    <div className="flex space-x-3">
                      <RippleButton 
                        onClick={() => setSelectedFirms([])}
                        variant="ghost"
                      >
                        Clear
                      </RippleButton>
                      {selectedFirms.length >= 2 && (
                        <RippleButton onClick={handleCompare}>
                          Compare ({selectedFirms.length})
                        </RippleButton>
                      )}
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Loading */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-96 bg-white/10 rounded-3xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {firms.map(firm => (
                    <FirmCard
                      key={firm.id}
                      firm={firm}
                      onCompare={handleCompareToggle}
                      isSelected={selectedFirms.includes(firm.id)}
                    />
                  ))}
                </div>
              )}

              {!loading && firms.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No firms found</h3>
                  <p className="text-purple-200">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Firm Detail Page
const FirmDetailPage = () => {
  const { firmId } = useParams();
  const [firm, setFirm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFirm();
  }, [firmId]);

  const fetchFirm = async () => {
    try {
      const response = await axios.get(`${API}/firms/${firmId}`);
      setFirm(response.data);
    } catch (error) {
      console.error('Error fetching firm:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!firm) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Firm not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <FloatingParticles />
      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Firm details implementation here */}
        <GlassCard>
          <h1 className="text-4xl font-bold text-white mb-4">{firm.name}</h1>
          <p className="text-purple-200">{firm.description}</p>
        </GlassCard>
      </div>
    </div>
  );
};

// Compare Page
const ComparePage = () => {
  const [searchParams] = useSearchParams();
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const firmIds = searchParams.get('firms')?.split(',') || [];
    if (firmIds.length > 0) {
      fetchComparisonData(firmIds);
    }
  }, [searchParams]);

  const fetchComparisonData = async (firmIds) => {
    try {
      const response = await axios.post(`${API}/firms/compare`, { firm_ids: firmIds });
      setFirms(response.data.firms);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <FloatingParticles />
      <div className="relative z-10 container mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-white text-center mb-16">
          Firm Comparison
        </h1>
        {/* Comparison table implementation here */}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/firm/:firmId" element={<FirmDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;