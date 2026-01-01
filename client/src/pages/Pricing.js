import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, TIERS, TIER_LABELS } from '../context/AuthContext';
import { 
  Check, X, Crown, Star, Dumbbell, BookOpen, 
  Calendar, Target, HelpCircle, Scale, Upload
} from 'lucide-react';

function Pricing() {
  const { user, getTier, updateTier } = useAuth();
  const navigate = useNavigate();
  const currentTier = getTier();

  const plans = [
    {
      id: TIERS.FREE,
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Get started with basic features',
      features: [
        { text: 'Dashboard', included: true },
        { text: 'Basic Prayer Times', included: true },
        { text: 'Read 5 Surahs', included: true },
        { text: '3 Habit Slots', included: true },
        { text: 'Salah Tracking & History', included: false },
        { text: 'All 114 Surahs', included: false },
        { text: 'Memorization Goals', included: false },
        { text: 'Musabaqah Quiz', included: false },
        { text: 'Tajweed Lessons', included: false },
        { text: 'Workout Tracking', included: false },
        { text: 'Weight Tracker', included: false },
        { text: 'Custom PDF Workout', included: false },
      ],
      popular: false,
      buttonText: 'Current Plan',
      disabled: currentTier === TIERS.FREE
    },
    {
      id: TIERS.PRO,
      name: 'Pro',
      price: '$4.99',
      period: '/month',
      description: 'For dedicated Muslims',
      badge: <Star size={14} />,
      features: [
        { text: 'Dashboard', included: true },
        { text: 'Full Prayer Times + History', included: true },
        { text: 'Salah Tracking & History', included: true },
        { text: 'All 114 Surahs', included: true },
        { text: 'Unlimited Habits', included: true },
        { text: 'Memorization Goals', included: true },
        { text: 'Revision System', included: true },
        { text: 'Musabaqah Quiz', included: true },
        { text: 'Tajweed Lessons', included: true },
        { text: 'Workout Tracking', included: true },
        { text: 'Weight Tracker', included: false },
        { text: 'Custom PDF Workout', included: false },
      ],
      popular: true,
      buttonText: currentTier === TIERS.PRO ? 'Current Plan' : 'Upgrade to Pro',
      disabled: currentTier === TIERS.PRO
    },
    {
      id: TIERS.PRO_PLUS,
      name: 'Pro+',
      price: '$9.99',
      period: '/month',
      description: 'Complete fitness & Quran system',
      badge: <Crown size={14} />,
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Weight Tracker', included: true, highlight: true },
        { text: 'Custom PDF Workout Upload', included: true, highlight: true },
        { text: 'Advanced Analytics', included: true, highlight: true },
        { text: 'Priority Support', included: true },
        { text: 'Early Access to Features', included: true },
      ],
      popular: false,
      buttonText: currentTier === TIERS.PRO_PLUS ? 'Current Plan' : 'Go Pro+',
      disabled: currentTier === TIERS.PRO_PLUS
    }
  ];

  const handleSubscribe = async (planId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    // For now, just update the tier (Stripe integration would go here)
    // In production, this would redirect to Stripe Checkout
    if (planId === TIERS.FREE) {
      // Downgrade
      if (window.confirm('Are you sure you want to downgrade to Free? You will lose access to Pro features.')) {
        await updateTier(TIERS.FREE);
        alert('Downgraded to Free plan');
      }
    } else {
      // TODO: Integrate Stripe
      // For demo purposes, upgrade directly
      await updateTier(planId);
      alert(`Upgraded to ${TIER_LABELS[planId]}! (Demo - In production this would go through Stripe)`);
    }
  };

  return (
    <div className="pricing-page">
      <header className="pricing-header">
        <h1>Choose Your Plan</h1>
        <p>Unlock your full potential with Qawaam</p>
      </header>

      <div className="plans-container">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`plan-card ${plan.popular ? 'popular' : ''} ${currentTier === plan.id ? 'current' : ''}`}
          >
            {plan.popular && <span className="popular-badge">Most Popular</span>}
            {currentTier === plan.id && <span className="current-badge">Current</span>}
            
            <div className="plan-header">
              {plan.badge && (
                <span className="plan-badge">{plan.badge}</span>
              )}
              <h2>{plan.name}</h2>
              <p className="plan-description">{plan.description}</p>
              <div className="plan-price">
                <span className="price">{plan.price}</span>
                <span className="period">{plan.period}</span>
              </div>
            </div>

            <ul className="feature-list">
              {plan.features.map((feature, index) => (
                <li 
                  key={index} 
                  className={`${feature.included ? 'included' : 'excluded'} ${feature.highlight ? 'highlight' : ''}`}
                >
                  {feature.included ? (
                    <Check size={16} className="check-icon" />
                  ) : (
                    <X size={16} className="x-icon" />
                  )}
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>

            <button 
              className={`subscribe-btn ${plan.disabled ? 'disabled' : ''}`}
              onClick={() => !plan.disabled && handleSubscribe(plan.id)}
              disabled={plan.disabled}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {!user && (
        <div className="login-prompt">
          <p>Already have an account? <Link to="/login">Sign in</Link> to manage your subscription.</p>
        </div>
      )}

      <style>{`
        .pricing-page {
          padding: 20px;
          padding-bottom: 100px;
          animation: fadeIn 0.3s ease-out;
        }
        
        .pricing-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .pricing-header h1 {
          font-size: 32px;
          margin-bottom: 8px;
        }
        .pricing-header p {
          color: var(--text-muted);
          font-size: 16px;
        }
        
        .plans-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .plan-card {
          background: var(--bg-surface);
          border-radius: 20px;
          padding: 24px;
          position: relative;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }
        .plan-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.2);
        }
        .plan-card.popular {
          border-color: var(--gold);
          background: linear-gradient(135deg, var(--bg-surface) 0%, rgba(212,175,55,0.05) 100%);
        }
        .plan-card.current {
          border-color: var(--primary);
        }
        
        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--gold);
          color: var(--bg-primary);
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        
        .current-badge {
          position: absolute;
          top: -12px;
          right: 16px;
          background: var(--primary);
          color: var(--text-primary);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
        }
        
        .plan-header {
          margin-bottom: 20px;
        }
        .plan-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: var(--gold);
          color: var(--bg-primary);
          border-radius: 50%;
          margin-bottom: 12px;
        }
        .plan-header h2 {
          font-size: 24px;
          margin-bottom: 4px;
        }
        .plan-description {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 12px;
        }
        .plan-price {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .price {
          font-size: 40px;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          color: var(--gold);
        }
        .period {
          font-size: 14px;
          color: var(--text-muted);
        }
        
        .feature-list {
          list-style: none;
          margin-bottom: 24px;
        }
        .feature-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          font-size: 14px;
          border-bottom: 1px solid var(--bg-surface-light);
        }
        .feature-list li:last-child {
          border-bottom: none;
        }
        .feature-list li.included {
          color: var(--text-primary);
        }
        .feature-list li.excluded {
          color: var(--text-muted);
          text-decoration: line-through;
          opacity: 0.6;
        }
        .feature-list li.highlight span {
          color: var(--gold);
          font-weight: 500;
        }
        .check-icon { color: var(--success); }
        .x-icon { color: var(--text-muted); }
        
        .subscribe-btn {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          background: var(--gold);
          color: var(--bg-primary);
          transition: all 0.2s ease;
        }
        .subscribe-btn:hover:not(.disabled) {
          background: var(--gold-light);
          transform: scale(1.02);
        }
        .subscribe-btn.disabled {
          background: var(--bg-surface-light);
          color: var(--text-muted);
          cursor: default;
        }
        
        .login-prompt {
          text-align: center;
          margin-top: 32px;
          padding: 20px;
          background: var(--bg-surface);
          border-radius: 12px;
        }
        .login-prompt p {
          color: var(--text-muted);
          font-size: 14px;
        }
        .login-prompt a {
          color: var(--gold);
          font-weight: 600;
        }
        
        @media (min-width: 768px) {
          .plans-container {
            flex-direction: row;
            align-items: stretch;
          }
          .plan-card {
            flex: 1;
          }
          .plan-card.popular {
            transform: scale(1.05);
          }
          .plan-card.popular:hover {
            transform: scale(1.08);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Pricing;
