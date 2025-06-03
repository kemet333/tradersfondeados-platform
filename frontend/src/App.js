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

// Confetti Component
const Confetti = ({ show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onComplete(), 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`
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
      transition-all duration-500 ease-out group card-3d
      ${className}
    `}>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Enhanced Ripple Button Component
const RippleButton = ({ children, onClick, className = "", variant = "primary" }) => {
  const [ripples, setRipples] = useState([]);

  const createRipple = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleClick = (e) => {
    createRipple(e);
    if (onClick) onClick(e);
  };

  const baseClasses = "relative overflow-hidden rounded-2xl px-8 py-3 font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400/50";
  const variantClasses = {
    primary: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl hover-glow",
    secondary: "bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20",
    ghost: "text-purple-300 hover:text-white hover:bg-white/10"
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={handleClick}
    >
      <span className="relative z-10">{children}</span>
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            transform: 'scale(0)',
            animation: 'ripple-effect 0.6s linear'
          }}
        />
      ))}
    </button>
  );
};

// Advanced Filter Sidebar Component
const FilterSidebar = ({ filters, setFilters, onApplyFilters, onReset }) => {
  const platforms = ["MetaTrader 4", "MetaTrader 5", "cTrader", "NinjaTrader", "TradingView"];
  const payoutFrequencies = ["weekly", "bi-weekly", "monthly"];

  return (
    <GlassCard className="sticky top-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full mr-3"></span>
          Advanced Filters
        </h3>
        <RippleButton onClick={onReset} variant="ghost" className="text-xs px-4 py-2">
          Reset
        </RippleButton>
      </div>
      
      <div className="space-y-6">
        {/* Account Size Range */}
        <div>
          <label className="block text-purple-200 text-sm font-medium mb-3">Account Size Range</label>
          <div className="space-y-3">
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
                <span className="text-white font-medium bg-purple-600/20 px-2 py-1 rounded-lg">
                  ${((filters.minAccountSize || 5000) / 1000).toFixed(0)}K+
                </span>
                <span>$100K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profit Split */}
        <div>
          <label className="block text-purple-200 text-sm font-medium mb-3">Minimum Profit Split</label>
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
              <span className="text-white font-medium bg-green-600/20 px-2 py-1 rounded-lg">
                {filters.minProfitSplit || 70}%+
              </span>
              <span>90%</span>
            </div>
          </div>
        </div>

        {/* Trading Platform */}
        <div>
          <label className="block text-purple-200 text-sm font-medium mb-3">Trading Platform</label>
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
          <div className="grid grid-cols-1 gap-2">
            {payoutFrequencies.map(freq => (
              <label key={freq} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="payoutFrequency"
                  value={freq}
                  checked={filters.payoutFrequency === freq}
                  onChange={(e) => setFilters(prev => ({...prev, payoutFrequency: e.target.value}))}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-400 focus:ring-2"
                />
                <span className="text-purple-200 group-hover:text-white transition-colors capitalize">
                  {freq.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-3">
          <label className="block text-purple-200 text-sm font-medium">Features</label>
          {[
            { key: 'newsTrading', label: 'News Trading Allowed', icon: '📈' },
            { key: 'expertAdvisors', label: 'Expert Advisors', icon: '🤖' },
            { key: 'scalingPlan', label: 'Scaling Available', icon: '📊' },
          ].map(({ key, label, icon }) => (
            <label key={key} className="flex items-center space-x-3 cursor-pointer group bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={filters[key] || false}
                onChange={(e) => setFilters(prev => ({...prev, [key]: e.target.checked}))}
                className="w-5 h-5 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-400 focus:ring-2"
              />
              <span className="text-lg">{icon}</span>
              <span className="text-purple-200 group-hover:text-white transition-colors text-sm">
                {label}
              </span>
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

// Enhanced Firm Card Component
const FirmCard = ({ firm, onCompare, isSelected, onQuickView }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleVisitSite = () => {
    setShowConfetti(true);
    setTimeout(() => window.open(firm.website_url, '_blank'), 500);
  };

  return (
    <>
      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
      <GlassCard className="h-full group">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src={firm.logo_url} 
                  alt={`${firm.name} logo`}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 group-hover:border-purple-400/50 transition-colors"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-gradient transition-colors">
                  {firm.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`transition-all duration-300 ${
                          i < Math.floor(firm.rating) ? 'text-yellow-400 scale-110' : 'text-gray-600'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-purple-200 text-sm">({firm.total_reviews})</span>
                </div>
              </div>
            </div>
            
            {onCompare && (
              <button
                onClick={() => onCompare(firm.id)}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isSelected 
                    ? 'bg-purple-600 text-white scale-110' 
                    : 'bg-white/10 text-purple-200 hover:bg-purple-600/20 hover:text-white hover:scale-105'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </button>
            )}
          </div>

          {/* Enhanced Key Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-3 border border-green-500/30 hover:border-green-400/50 transition-colors">
              <div className="text-green-300 text-sm font-medium">Profit Split</div>
              <div className="text-white text-xl font-bold">{firm.profit_split[0]}%</div>
              <div className="text-green-200 text-xs">You keep</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-3 border border-blue-500/30 hover:border-blue-400/50 transition-colors">
              <div className="text-blue-300 text-sm font-medium">Min Account</div>
              <div className="text-white text-xl font-bold">${(firm.min_account_size / 1000).toFixed(0)}K</div>
              <div className="text-blue-200 text-xs">Starting size</div>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-300">Max Drawdown:</span>
              <span className="text-white font-medium">{firm.max_drawdown}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Payout:</span>
              <span className="text-white font-medium capitalize">{firm.payout_frequency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Min Payout:</span>
              <span className="text-white font-medium">${firm.minimum_payout}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Eval Fee:</span>
              <span className="text-white font-medium">${Object.values(firm.evaluation_fee)[0]}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-purple-200 text-sm mb-4 flex-grow leading-relaxed">
            {firm.description}
          </p>

          {/* Enhanced Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { condition: firm.news_trading, label: 'News Trading', color: 'green' },
              { condition: firm.expert_advisors, label: 'EAs', color: 'blue' },
              { condition: firm.scaling_plan, label: 'Scaling', color: 'purple' },
              { condition: true, label: `${firm.payout_frequency} payouts`, color: 'pink' }
            ].filter(item => item.condition).slice(0, 4).map((feature, idx) => (
              <span 
                key={idx}
                className={`px-3 py-1 bg-${feature.color}-500/20 border border-${feature.color}-500/30 rounded-full text-xs text-${feature.color}-200 hover:bg-${feature.color}-500/30 transition-colors`}
              >
                {feature.label}
              </span>
            ))}
          </div>

          {/* Enhanced Actions */}
          <div className="flex space-x-3">
            {onQuickView && (
              <RippleButton 
                onClick={() => onQuickView(firm)}
                variant="secondary"
                className="flex-1 text-sm"
              >
                Quick View
              </RippleButton>
            )}
            <RippleButton 
              onClick={handleVisitSite}
              className="flex-1 text-sm"
            >
              Visit Site →
            </RippleButton>
          </div>
        </div>
      </GlassCard>
    </>
  );
};

// Quick View Modal Component
const QuickViewModal = ({ firm, isOpen, onClose }) => {
  if (!isOpen || !firm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <GlassCard className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-purple-300 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
          
          <div className="pr-8">
            <div className="flex items-center space-x-4 mb-6">
              <img src={firm.logo_url} alt={firm.name} className="w-16 h-16 rounded-xl border-2 border-white/20"/>
              <div>
                <h2 className="text-3xl font-bold text-white">{firm.name}</h2>
                <p className="text-purple-200">{firm.headquarters}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-green-400">{firm.profit_split[0]}%</div>
                <div className="text-purple-200 text-sm">Profit Split</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-blue-400">${(firm.min_account_size/1000).toFixed(0)}K</div>
                <div className="text-purple-200 text-sm">Min Account</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-yellow-400">{firm.rating}</div>
                <div className="text-purple-200 text-sm">Rating</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {firm.trading_platforms.map(platform => (
                    <span key={platform} className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-200 text-sm">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Instruments</h3>
                <div className="flex flex-wrap gap-2">
                  {firm.instruments.map(instrument => (
                    <span key={instrument} className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-200 text-sm">
                      {instrument}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <RippleButton onClick={() => window.open(firm.website_url, '_blank')} className="w-full">
                Visit {firm.name} →
              </RippleButton>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
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
  const [allFirms, setAllFirms] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedFirms, setSelectedFirms] = useState([]);
  const [quickViewFirm, setQuickViewFirm] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

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
      setAllFirms(firmsResponse.data);
      setStatistics(statsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.minAccountSize) params.append('min_account_size', filters.minAccountSize);
      if (filters.minProfitSplit) params.append('min_profit_split', filters.minProfitSplit);
      if (filters.platform) params.append('platform', filters.platform);
      if (filters.payoutFrequency) params.append('payout_frequency', filters.payoutFrequency);
      if (filters.newsTrading !== undefined) params.append('news_trading', filters.newsTrading);
      if (filters.expertAdvisors !== undefined) params.append('expert_advisors', filters.expertAdvisors);
      if (filters.scalingPlan !== undefined) params.append('scaling_plan', filters.scalingPlan);

      const response = await axios.get(`${API}/firms?${params.toString()}`);
      setFirms(response.data);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({});
    setFirms(allFirms);
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
            
            {/* Enhanced Search Bar */}
            <div className="max-w-lg mx-auto relative">
              <input
                type="text"
                placeholder="Search by firm name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 pl-12 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 focus:bg-white/15"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 pb-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Advanced Filters Sidebar */}
            <div className="lg:w-1/4">
              <FilterSidebar 
                filters={filters}
                setFilters={setFilters}
                onApplyFilters={applyFilters}
                onReset={resetFilters}
              />
            </div>

            {/* Main Content Area */}
            <div className="lg:w-3/4">
              {/* Statistics */}
              <StatisticsBar stats={statistics} />

              {/* Comparison Bar */}
              {selectedFirms.length > 0 && (
                <GlassCard className="mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-white font-medium">
                        {selectedFirms.length} firm(s) selected for comparison
                      </span>
                      <div className="flex space-x-2">
                        {selectedFirms.map((firmId, idx) => {
                          const firm = allFirms.find(f => f.id === firmId);
                          return firm ? (
                            <div key={firmId} className="flex items-center space-x-1 bg-purple-600/20 rounded-lg px-2 py-1">
                              <span className="text-white text-sm">{firm.name}</span>
                              <button 
                                onClick={() => handleCompareToggle(firmId)}
                                className="text-purple-300 hover:text-white"
                              >
                                ×
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <RippleButton 
                        onClick={() => setSelectedFirms([])}
                        variant="ghost"
                        className="text-sm"
                      >
                        Clear All
                      </RippleButton>
                      {selectedFirms.length >= 2 && (
                        <RippleButton 
                          onClick={() => setShowComparison(true)}
                          className="text-sm"
                        >
                          Compare Now ({selectedFirms.length})
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
                    <div key={i} className="h-96 bg-white/10 rounded-3xl animate-pulse shimmer" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {filteredFirms.length} Prop Firms Found
                      </h2>
                      <p className="text-purple-200">
                        {searchQuery ? `Results for "${searchQuery}"` : 'Compare the best proprietary trading firms in the industry'}
                      </p>
                    </div>
                    
                    {Object.keys(filters).length > 0 && (
                      <RippleButton onClick={resetFilters} variant="ghost" className="text-sm">
                        Clear Filters
                      </RippleButton>
                    )}
                  </div>

                  {/* Firms Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredFirms.map(firm => (
                      <FirmCard 
                        key={firm.id} 
                        firm={firm}
                        onCompare={handleCompareToggle}
                        isSelected={selectedFirms.includes(firm.id)}
                        onQuickView={setQuickViewFirm}
                      />
                    ))}
                  </div>
                </>
              )}

              {!loading && filteredFirms.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No firms found</h3>
                  <p className="text-purple-200 mb-4">
                    {searchQuery ? `No results for "${searchQuery}"` : 'Try adjusting your filters'}
                  </p>
                  {(searchQuery || Object.keys(filters).length > 0) && (
                    <RippleButton onClick={() => {
                      setSearchQuery('');
                      resetFilters();
                    }}>
                      Reset Search & Filters
                    </RippleButton>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                🚀 Prop Firm Comparison Platform
              </h3>
              <p className="text-purple-200 mb-4">
                Your gateway to finding the perfect proprietary trading firm
              </p>
              <div className="flex justify-center space-x-6 text-sm text-purple-300">
                <span>6 Top Firms</span>
                <span>•</span>
                <span>Real-time Data</span>
                <span>•</span>
                <span>Advanced Filtering</span>
                <span>•</span>
                <span>Side-by-side Comparison</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal 
        firm={quickViewFirm}
        isOpen={!!quickViewFirm}
        onClose={() => setQuickViewFirm(null)}
      />
    </div>
  );
}

export default App;