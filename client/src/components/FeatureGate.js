import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth, FEATURES, TIER_LABELS } from '../context/AuthContext';
import { Lock, Crown, Sparkles } from 'lucide-react';

// Feature Gate Component - Shows locked content for users without access
function FeatureGate({ feature, children, showPreview = false }) {
  const { hasAccess, getTier } = useAuth();
  
  if (hasAccess(feature)) {
    return children;
  }

  // Get required tier for this feature
  const requiredTiers = FEATURES[feature] || [];
  const lowestTier = requiredTiers[0];
  const tierLabel = TIER_LABELS[lowestTier] || 'Pro';

  return (
    <div className="feature-locked">
      {showPreview && (
        <div className="preview-content">
          {children}
          <div className="preview-overlay" />
        </div>
      )}
      
      <div className="locked-card">
        <div className="locked-icon">
          <Lock size={32} />
        </div>
        <h3>Upgrade to {tierLabel}</h3>
        <p>This feature requires a {tierLabel} subscription</p>
        <Link to="/pricing" className="btn btn-primary upgrade-btn">
          <Crown size={16} />
          Upgrade Now
        </Link>
      </div>

      <style>{`
        .feature-locked {
          position: relative;
        }
        .preview-content {
          position: relative;
          filter: blur(4px);
          pointer-events: none;
          user-select: none;
        }
        .preview-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 0%, var(--bg-primary) 100%);
        }
        .locked-card {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: var(--bg-surface);
          border: 2px solid var(--gold);
          border-radius: 20px;
          padding: 32px;
          text-align: center;
          max-width: 300px;
          z-index: 10;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .locked-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, #1a4a3a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: var(--gold);
        }
        .locked-card h3 {
          font-size: 20px;
          margin-bottom: 8px;
        }
        .locked-card p {
          color: var(--text-muted);
          font-size: 14px;
          margin-bottom: 20px;
        }
        .upgrade-btn {
          width: 100%;
        }
      `}</style>
    </div>
  );
}

// Simple lock badge for inline use
export function LockBadge({ feature }) {
  const { hasAccess } = useAuth();
  
  if (hasAccess(feature)) return null;
  
  return (
    <span className="lock-badge">
      <Lock size={12} />
      <style>{`
        .lock-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: var(--gold);
          border-radius: 50%;
          color: var(--bg-primary);
          margin-left: 8px;
        }
      `}</style>
    </span>
  );
}

// Tier badge component
export function TierBadge({ tier, size = 'normal' }) {
  const label = TIER_LABELS[tier];
  const colors = {
    free: '#6b7280',
    pro: '#d4af37',
    pro_plus: '#8b5cf6'
  };
  
  return (
    <span 
      className={`tier-badge-inline ${size}`}
      style={{ background: colors[tier] }}
    >
      {tier !== 'free' && <Crown size={size === 'small' ? 10 : 12} />}
      {label}
      <style>{`
        .tier-badge-inline {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          color: var(--bg-primary);
        }
        .tier-badge-inline.small {
          padding: 2px 8px;
          font-size: 10px;
        }
      `}</style>
    </span>
  );
}

export default FeatureGate;

