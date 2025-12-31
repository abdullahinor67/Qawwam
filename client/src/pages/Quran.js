import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Target, RotateCcw, HelpCircle, Settings, ChevronRight, Check, X, Play, Award } from 'lucide-react';
import axios from 'axios';
import QuranReader from '../components/QuranReader';
import TajweedKitab from '../components/TajweedKitab';
import MemorizationPlan from '../components/MemorizationPlan';
import RevisionPlan from '../components/RevisionPlan';
import QuranQuiz from '../components/QuranQuiz';

const TABS = [
  { id: 'read', label: 'Read', icon: BookOpen },
  { id: 'memorize', label: 'Memorize', icon: Target },
  { id: 'revise', label: 'Revise', icon: RotateCcw },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
  { id: 'tajweed', label: 'Tajweed', icon: BookOpen },
];

function Quran() {
  const [activeTab, setActiveTab] = useState('read');
  const { addXp } = useApp();

  return (
    <div className="quran-page">
      <header className="page-header">
        <h1>📖 Quran</h1>
        <p className="subtitle">Read, Memorize, Review & Learn</p>
      </header>

      {/* Tabs */}
      <div className="tabs-container">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'read' && <QuranReader />}
        {activeTab === 'memorize' && <MemorizationPlan />}
        {activeTab === 'revise' && <RevisionPlan />}
        {activeTab === 'quiz' && <QuranQuiz />}
        {activeTab === 'tajweed' && <TajweedKitab />}
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
          margin-bottom: 20px;
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
        }
        .tab:hover {
          background: var(--bg-surface-light);
        }
        .tab.active {
          background: var(--primary);
          color: var(--gold);
        }
        .tab-content {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Quran;
