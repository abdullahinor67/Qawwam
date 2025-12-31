import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, Plus, X, Sparkles, Trash2 } from 'lucide-react';

function Habits() {
  const { habits, toggleHabit, addHabit, deleteHabit, addXp } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState('');

  const addNewHabit = () => {
    if (!newHabit.trim()) return;
    addHabit(newHabit.trim());
    setNewHabit('');
    setShowAdd(false);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteHabit(id);
  };

  const completedCount = habits.filter(h => h.completed).length;
  const progress = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

  return (
    <div className="habits-page">
      <header className="page-header">
        <h1>✓ Habits</h1>
        <p className="subtitle">Build consistency, build character</p>
      </header>

      <div className="progress-card">
        <div className="progress-header">
          <span>Today's Progress</span>
          <span className="progress-text">{completedCount}/{habits.length}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress === 100 && habits.length > 0 && (
          <div className="complete-message">
            <Sparkles size={16} />
            All habits completed! Great job! 🎉
          </div>
        )}
      </div>

      <div className="section-header">
        <h2>Daily Habits</h2>
        <button className="add-btn" onClick={() => setShowAdd(true)}>
          <Plus size={20} />
        </button>
      </div>

      {showAdd && (
        <div className="add-habit-form">
          <input
            type="text"
            placeholder="New habit..."
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addNewHabit()}
            autoFocus
          />
          <div className="form-actions">
            <button className="btn btn-primary" onClick={addNewHabit}>Add</button>
            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="habits-list">
        {habits.map((habit) => (
          <div 
            key={habit.id} 
            className={`habit-item ${habit.completed ? 'completed' : ''}`}
            onClick={() => toggleHabit(habit.id)}
          >
            <div className={`checkbox ${habit.completed ? 'checked' : ''}`}>
              {habit.completed && <Check size={16} />}
            </div>
            <span className="habit-name">{habit.name}</span>
            {habit.completed && (
              <span className="xp-badge">+10 XP</span>
            )}
            <button 
              className="delete-btn" 
              onClick={(e) => handleDelete(habit.id, e)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {habits.length === 0 && (
        <div className="empty-state">
          <p>No habits yet. Add your first habit!</p>
        </div>
      )}

      <div className="tips-card">
        <h3>💡 Tips for Building Habits</h3>
        <ul>
          <li>Start small - one habit at a time</li>
          <li>Stack habits - attach new habits to existing ones</li>
          <li>Never miss twice - if you slip, get back on track</li>
          <li>Celebrate small wins - consistency beats intensity</li>
        </ul>
      </div>

      <style>{`
        .habits-page {
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
        .progress-card {
          background: var(--bg-surface);
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 24px;
        }
        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .progress-text {
          font-weight: 600;
          color: var(--gold);
        }
        .progress-bar {
          height: 8px;
          background: var(--bg-surface-light);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-light), var(--gold));
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        .complete-message {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          color: var(--success);
          font-size: 14px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .section-header h2 {
          font-size: 18px;
        }
        .add-btn {
          background: var(--primary);
          border: none;
          color: var(--text-primary);
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .add-btn:hover {
          background: var(--primary-light);
        }
        .add-habit-form {
          background: var(--bg-surface);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          animation: fadeIn 0.2s ease-out;
        }
        .add-habit-form input {
          width: 100%;
          padding: 12px;
          background: var(--bg-surface-light);
          border: none;
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 14px;
          margin-bottom: 12px;
        }
        .add-habit-form input:focus {
          outline: 2px solid var(--gold);
        }
        .form-actions {
          display: flex;
          gap: 8px;
        }
        .form-actions .btn {
          flex: 1;
          padding: 10px;
        }
        .habits-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }
        .habit-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-surface);
          padding: 14px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .habit-item:hover {
          background: var(--bg-surface-light);
        }
        .habit-item.completed .habit-name {
          text-decoration: line-through;
          opacity: 0.6;
        }
        .checkbox {
          width: 24px;
          height: 24px;
          border: 2px solid var(--text-muted);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .checkbox.checked {
          background: var(--ring-habit);
          border-color: var(--ring-habit);
          color: white;
        }
        .habit-name {
          flex: 1;
          font-size: 14px;
        }
        .xp-badge {
          background: var(--gold);
          color: var(--bg-primary);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }
        .delete-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 8px;
        }
        .delete-btn:hover {
          color: var(--error);
          background: rgba(231, 76, 60, 0.1);
        }
        .empty-state {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
        }
        .tips-card {
          background: var(--bg-surface);
          padding: 20px;
          border-radius: 16px;
        }
        .tips-card h3 {
          font-size: 14px;
          margin-bottom: 12px;
          color: var(--text-secondary);
        }
        .tips-card ul {
          list-style: none;
          padding: 0;
        }
        .tips-card li {
          padding: 8px 0;
          font-size: 13px;
          color: var(--text-muted);
          border-bottom: 1px solid var(--bg-surface-light);
        }
        .tips-card li:last-child {
          border-bottom: none;
        }
        .tips-card li::before {
          content: '→ ';
          color: var(--gold);
        }
      `}</style>
    </div>
  );
}

export default Habits;
