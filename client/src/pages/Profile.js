import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, TIER_LABELS, TIER_COLORS, TIERS } from '../context/AuthContext';
import { 
  User, Mail, Crown, LogOut, ChevronRight, Settings, 
  Shield, Bell, HelpCircle, FileText, Upload, Trash2
} from 'lucide-react';

function Profile() {
  const { user, userProfile, logout, updateUserProfile, getTier } = useAuth();
  const navigate = useNavigate();
  const [customPdf, setCustomPdf] = useState(userProfile?.customWorkoutPdf || null);

  const tier = getTier();
  const tierLabel = TIER_LABELS[tier];
  const tierColor = TIER_COLORS[tier];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    // Convert to base64 for storage
    const reader = new FileReader();
    reader.onload = async (event) => {
      const pdfData = {
        name: file.name,
        data: event.target.result,
        uploadedAt: new Date().toISOString()
      };
      setCustomPdf(pdfData);
      await updateUserProfile({ customWorkoutPdf: pdfData });
      alert('Workout PDF uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePdf = async () => {
    setCustomPdf(null);
    await updateUserProfile({ customWorkoutPdf: null });
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="avatar">
          {userProfile?.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
        </div>
        <h1>{userProfile?.displayName || 'User'}</h1>
        <p className="email">{user.email}</p>
        <div className="tier-badge" style={{ background: tierColor?.bg, color: tierColor?.text }}>
          <Crown size={14} />
          {tierLabel}
        </div>
      </div>

      {/* Subscription Card */}
      <div className="section">
        <h2>Subscription</h2>
        <div className="card subscription-card" onClick={() => navigate('/pricing')}>
          <div className="card-icon" style={{ background: `${tierColor?.bg}20`, color: tierColor?.text }}>
            <Crown size={20} />
          </div>
          <div className="card-content">
            <h3>{tierLabel} Plan</h3>
            <p>{tier === TIERS.FREE ? 'Upgrade for more features' : 'Manage your subscription'}</p>
          </div>
          <ChevronRight size={20} className="chevron" />
        </div>
      </div>

      {/* Pro+ Custom Workout PDF */}
      {tier === TIERS.PRO_PLUS && (
        <div className="section">
          <h2>Custom Workout</h2>
          <div className="card pdf-card">
            <div className="card-icon" style={{ background: 'rgba(139,92,246,0.2)', color: '#8b5cf6' }}>
              <FileText size={20} />
            </div>
            <div className="card-content">
              {customPdf ? (
                <>
                  <h3>{customPdf.name}</h3>
                  <p>Uploaded {new Date(customPdf.uploadedAt).toLocaleDateString()}</p>
                </>
              ) : (
                <>
                  <h3>Upload Your Workout PDF</h3>
                  <p>Import your personal workout plan</p>
                </>
              )}
            </div>
            {customPdf ? (
              <button className="remove-pdf" onClick={handleRemovePdf}>
                <Trash2 size={18} />
              </button>
            ) : (
              <label className="upload-btn">
                <Upload size={18} />
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handlePdfUpload}
                  hidden 
                />
              </label>
            )}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="section">
        <h2>Settings</h2>
        <div className="settings-list">
          <div className="card setting-item">
            <Bell size={20} />
            <span>Notifications</span>
            <ChevronRight size={18} className="chevron" />
          </div>
          <div className="card setting-item">
            <Shield size={20} />
            <span>Privacy</span>
            <ChevronRight size={18} className="chevron" />
          </div>
          <div className="card setting-item">
            <HelpCircle size={20} />
            <span>Help & Support</span>
            <ChevronRight size={18} className="chevron" />
          </div>
        </div>
      </div>

      {/* Logout */}
      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={18} />
        Sign Out
      </button>

      <p className="version">Qawaam v1.0.0</p>

      <style>{`
        .profile-page {
          padding: 20px;
          padding-bottom: 100px;
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .profile-header {
          text-align: center;
          padding: 30px 20px;
          background: var(--bg-surface);
          border-radius: 20px;
          margin-bottom: 24px;
        }
        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, #1a4a3a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
          color: var(--gold);
          margin: 0 auto 16px;
        }
        .profile-header h1 {
          font-size: 24px;
          margin-bottom: 4px;
        }
        .email {
          color: var(--text-muted);
          font-size: 14px;
          margin-bottom: 12px;
        }
        .tier-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: var(--bg-primary);
        }
        .section {
          margin-bottom: 24px;
        }
        .section h2 {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 12px;
          padding-left: 4px;
        }
        .card {
          background: var(--bg-surface);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .card:hover {
          background: var(--bg-surface-light);
        }
        .card-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .card-content {
          flex: 1;
        }
        .card-content h3 {
          font-size: 15px;
          margin-bottom: 2px;
        }
        .card-content p {
          font-size: 12px;
          color: var(--text-muted);
        }
        .chevron {
          color: var(--text-muted);
        }
        .pdf-card {
          cursor: default;
        }
        .upload-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gold);
          cursor: pointer;
        }
        .remove-pdf {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(231,76,60,0.2);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--error);
          cursor: pointer;
        }
        .settings-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .setting-item {
          padding: 14px 16px;
        }
        .setting-item span {
          flex: 1;
          font-size: 14px;
        }
        .setting-item svg:first-child {
          color: var(--text-muted);
        }
        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px;
          background: rgba(231,76,60,0.15);
          border: 1px solid rgba(231,76,60,0.3);
          border-radius: 14px;
          color: var(--error);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 16px;
        }
        .logout-btn:hover {
          background: var(--error);
          color: white;
        }
        .version {
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 24px;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}

export default Profile;

