import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import { checkApiHealth } from './services/api';
import { Activity, BarChart2, ShieldAlert, Wifi, WifiOff } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiOnline, setApiOnline] = useState(false);
  const [trainingData, setTrainingData] = useState(null);

  useEffect(() => {
    // Verify connection to FastAPI backend on load
    checkApiHealth()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Logo & Application Name */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">
                AquaPure <span className="text-sky-400 font-normal">Prediction System</span>
              </h1>
              <p className="text-[10px] text-slate-400">ML Water Screening & Parameter Analysis</p>
            </div>
          </div>

          {/* Tab Navigation Controls */}
          <nav className="flex space-x-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/50">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Parameter Stats</span>
            </button>
          </nav>

          {/* API Health Indicator Badge */}
          <div className="hidden sm:flex items-center space-x-2 text-xs">
            {apiOnline ? (
              <span className="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <Wifi className="w-3 h-3" />
                <span className="font-medium text-[11px]">API Online</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full">
                <WifiOff className="w-3 h-3" />
                <span className="font-medium text-[11px]">API Disconnected</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <div className="flex-grow">
        {activeTab === 'dashboard' ? (
          <Dashboard trainingData={trainingData} setTrainingData={setTrainingData} />
        ) : (
          <Analytics parameterSummary={trainingData?.parameter_summary} />
        )}
      </div>

      {/* Global Footer & Required Screening Notice */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-amber-400/90 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <p className="text-[11px]">
              Predictions are automated screening results and do not replace certified water testing.
            </p>
          </div>
          <p className="text-slate-500 text-[11px]">
            &copy; {new Date().getFullYear()} Smart Water Quality Prediction System. Built with FastAPI & React.
          </p>
        </div>
      </footer>
    </div>
  );
}
