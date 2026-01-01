import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Target, RotateCcw, HelpCircle, Lock } from 'lucide-react';
import QuranReader from '../components/QuranReader';
import TajweedKitab from '../components/TajweedKitab';
import MemorizationPlan from '../components/MemorizationPlan';
import RevisionPlan from '../components/RevisionPlan';
import QuranQuiz from '../components/QuranQuiz';
import FeatureGate, { LockBadge } from '../components/FeatureGate';

const TABS = [
  { id: 'read', label: 'Read', icon: BookOpen, feature: null }, // Free for all (limited)
  { id: 'memorize', label: 'Memorize', icon: Target, feature: 'memorization' },
  { id: 'revise', label: 'Revise', icon: RotateCcw, feature: 'revision' },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle, feature: 'musabaqah' },
  { id: 'tajweed', label: 'Tajweed', icon: BookOpen, feature: 'tajweed' },
];

function Quran() {
  const [activeTab, setActiveTab] = useState('read');
  const { hasAccess, getTier } = useAuth();
  const tier = getTier();

  const renderTabContent = () => {
    const currentTab = TABS.find(t => t.id === activeTab);
    
    // If tab requires a feature and user doesn't have access
    if (currentTab?.feature && !hasAccess(currentTab.feature)) {
      return (
        <FeatureGate feature={currentTab.feature}>
          <div style={{ minHeight: 300 }} />
        </FeatureGate>
      );
    }

    switch (activeTab) {
      case 'read':
        return <QuranReader limitedMode={tier === 'free'} />;
      case 'memorize':
        return <MemorizationPlan />;
      case 'revise':
        return <RevisionPlan />;
      case 'quiz':
        return <QuranQuiz />;
      case 'tajweed':
        return <TajweedKitab />;
      default:
        return null;
    }
  };

  return (
    <div className="quran-page">
      <header className="page-header">
        <h1>📖 Quran</h1>
        <p className="subtitle">Read, Memorize, Review & Learn</p>
      </header>

      {/* Tabs */}
      <div className="tabs-container">
        {TABS.map((tab) => {
          const isLocked = tab.feature && !hasAccess(tab.feature);
          
          return (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
              {isLocked && <Lock size={12} className="lock-icon" />}
            </button>
          );
        })}
      </div>

      {/* Free user notice */}
      {tier === 'free' && activeTab === 'read' && (
        <div className="free-notice">
          <Lock size={14} />
          <span>Free users can read 5 surahs. <a href="/pricing">Upgrade</a> for all 114.</span>
        </div>
      )}

      {/* Tab Content */}
      <div className="tab-content">
        {renderTabContent()}
      </div>

      <style>{`
        .quran-page {
          padding: 20px;
          padding-bottom: 100px;
        }
        .page-header {
          margin-bottom: 20px;
        }
        .page-header h1 {
          font-size: 28px;
          margin-bottom: 4px;
        }
        .subtitle {
          color: var(--text-muted);
          font-size: 14px;
        }
        .tabs-container {
          display: flex;
          gap: 6px;
          margin-bottom: 16px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 14px;
          background: var(--bg-surface);
          border: none;
          border-radius: 10px;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          position: relative;
        }
        .tab:hover {
          background: var(--bg-surface-light);
        }
        .tab.active {
          background: var(--primary);
          color: var(--gold);
        }
        .tab.locked {
          opacity: 0.7;
        }
        .tab .lock-icon {
          color: var(--gold);
        }
        .free-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(212,175,55,0.1);
          border: 1px solid rgba(212,175,55,0.3);
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 16px;
          font-size: 12px;
          color: var(--gold);
        }
        .free-notice a {
          color: var(--gold);
          font-weight: 600;
        }
        .tab-content {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default Quran;
