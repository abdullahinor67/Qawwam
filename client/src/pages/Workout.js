import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Dumbbell, Check, ChevronDown, ChevronUp, Flame, Target, Utensils, Plus, Minus, Scale, TrendingDown } from 'lucide-react';

const WORKOUT_PLAN = [
  {
    id: 'day1',
    day: 'Day 1',
    name: 'Upper Push',
    subtitle: 'Chest, Shoulders, Triceps',
    emoji: '💪',
    exercises: [
      { id: 'd1e1', name: 'Bench Press', targetSets: 4, targetReps: '6-10' },
      { id: 'd1e2', name: 'Incline Dumbbell Press', targetSets: 3, targetReps: '8-12' },
      { id: 'd1e3', name: 'Overhead Shoulder Press', targetSets: 3, targetReps: '8-12' },
      { id: 'd1e4', name: 'Lateral Raises', targetSets: 3, targetReps: '12-15' },
      { id: 'd1e5', name: 'Tricep Pushdowns', targetSets: 3, targetReps: '12-15' },
      { id: 'd1e6', name: 'Hanging Leg Raises', targetSets: 3, targetReps: '12-15' },
    ]
  },
  {
    id: 'day2',
    day: 'Day 2',
    name: 'Lower Body',
    subtitle: 'Thighs & Glutes',
    emoji: '🦵',
    exercises: [
      { id: 'd2e1', name: 'Barbell Squats', targetSets: 4, targetReps: '6-10' },
      { id: 'd2e2', name: 'Romanian Deadlifts', targetSets: 3, targetReps: '8-12' },
      { id: 'd2e3', name: 'Walking Lunges', targetSets: 3, targetReps: '20 steps' },
      { id: 'd2e4', name: 'Leg Press', targetSets: 3, targetReps: '12-15' },
      { id: 'd2e5', name: 'Standing Calf Raises', targetSets: 4, targetReps: '15-20' },
      { id: 'd2e6', name: 'Plank', targetSets: 3, targetReps: '60 sec' },
    ]
  },
  {
    id: 'day3',
    day: 'Day 3',
    name: 'Cardio + Abs',
    subtitle: 'Zone 2 + Core',
    emoji: '🔥',
    exercises: [
      { id: 'd3e1', name: 'Incline Treadmill Walk', targetSets: 1, targetReps: '35-45 min' },
      { id: 'd3e2', name: 'Cable Crunches', targetSets: 3, targetReps: '15' },
      { id: 'd3e3', name: 'Bicycle Crunches', targetSets: 3, targetReps: '20' },
      { id: 'd3e4', name: 'Russian Twists', targetSets: 3, targetReps: '20' },
      { id: 'd3e5', name: 'Ab Wheel', targetSets: 3, targetReps: '10-12' },
    ]
  },
  {
    id: 'day4',
    day: 'Day 4',
    name: 'Upper Pull',
    subtitle: 'Back & Biceps',
    emoji: '🏋️',
    exercises: [
      { id: 'd4e1', name: 'Pull-Ups / Lat Pulldowns', targetSets: 4, targetReps: '8-12' },
      { id: 'd4e2', name: 'Barbell Rows', targetSets: 4, targetReps: '8-10' },
      { id: 'd4e3', name: 'Seated Cable Rows', targetSets: 3, targetReps: '10-12' },
      { id: 'd4e4', name: 'Face Pulls', targetSets: 3, targetReps: '15' },
      { id: 'd4e5', name: 'Dumbbell Curls', targetSets: 3, targetReps: '10-12' },
      { id: 'd4e6', name: 'Hammer Curls', targetSets: 3, targetReps: '12' },
    ]
  },
  {
    id: 'day5',
    day: 'Day 5',
    name: 'Full Body + HIIT',
    subtitle: 'Strength + Conditioning',
    emoji: '⚡',
    exercises: [
      { id: 'd5e1', name: 'Deadlifts', targetSets: 4, targetReps: '5' },
      { id: 'd5e2', name: 'Dumbbell Shoulder Press', targetSets: 3, targetReps: '10' },
      { id: 'd5e3', name: 'Kettlebell Swings', targetSets: 3, targetReps: '20' },
      { id: 'd5e4', name: 'Battle Ropes', targetSets: 10, targetReps: '30s on/60s off' },
      { id: 'd5e5', name: 'Mountain Climbers', targetSets: 3, targetReps: '30 sec' },
    ]
  },
  {
    id: 'day6',
    day: 'Day 6',
    name: 'Optional Cardio',
    subtitle: 'Core & Recovery',
    emoji: '🧘',
    exercises: [
      { id: 'd6e1', name: 'Light Cardio', targetSets: 1, targetReps: '30-45 min' },
      { id: 'd6e2', name: 'Kegels', targetSets: 10, targetReps: '10 sec hold' },
      { id: 'd6e3', name: 'Glute Bridges', targetSets: 1, targetReps: '15-20' },
      { id: 'd6e4', name: 'Dead Bugs', targetSets: 1, targetReps: '12 per side' },
      { id: 'd6e5', name: 'Plank', targetSets: 1, targetReps: '45-60 sec' },
    ]
  },
  {
    id: 'day7',
    day: 'Day 7',
    name: 'Rest Day',
    subtitle: 'Recovery',
    emoji: '😴',
    exercises: [
      { id: 'd7e1', name: 'Stretching', targetSets: 1, targetReps: '15-20 min' },
      { id: 'd7e2', name: 'Light Walking', targetSets: 1, targetReps: '20-30 min' },
      { id: 'd7e3', name: 'Foam Rolling', targetSets: 1, targetReps: 'As needed' },
    ]
  },
];

const NUTRITION = {
  calories: '1,800-1,900',
  protein: '180g',
  fat: '50-60g',
  carbs: 'Remaining',
};

function Workout() {
  const { addXp, workoutStats, updateWeight, completeWorkout } = useApp();
  
  const [weightInput, setWeightInput] = useState('');
  const [showWeightInput, setShowWeightInput] = useState(false);
  
  // Track completed exercises with sets data
  const [exerciseData, setExerciseData] = useState(() => {
    const saved = localStorage.getItem('qawaam_exercise_data');
    const today = new Date().toDateString();
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) return parsed.data;
    }
    return {};
  });

  const [completedWorkouts, setCompletedWorkouts] = useState(() => {
    const saved = localStorage.getItem('qawaam_workout_completed');
    const today = new Date().toDateString();
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) return parsed.completed;
    }
    return {};
  });

  const [expandedDay, setExpandedDay] = useState(null);
  const [showNutrition, setShowNutrition] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(() => {
    const saved = localStorage.getItem('qawaam_workout_week');
    return saved ? parseInt(saved) : 1;
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('qawaam_exercise_data', JSON.stringify({
      date: new Date().toDateString(),
      data: exerciseData
    }));
  }, [exerciseData]);

  useEffect(() => {
    localStorage.setItem('qawaam_workout_completed', JSON.stringify({
      date: new Date().toDateString(),
      completed: completedWorkouts
    }));
  }, [completedWorkouts]);

  useEffect(() => {
    localStorage.setItem('qawaam_workout_week', currentWeek.toString());
  }, [currentWeek]);

  // Get exercise data for a specific exercise
  const getExerciseData = (exerciseId) => {
    return exerciseData[exerciseId] || { completed: false, sets: [] };
  };

  // Toggle exercise completion
  const toggleExercise = (exerciseId, targetSets) => {
    setExerciseData(prev => {
      const current = prev[exerciseId] || { completed: false, sets: [] };
      
      if (current.completed) {
        // Uncheck - clear data
        return {
          ...prev,
          [exerciseId]: { completed: false, sets: [] }
        };
      } else {
        // Check - initialize with empty sets if none
        const sets = current.sets.length > 0 
          ? current.sets 
          : Array(targetSets).fill({ reps: '', weight: '' });
        return {
          ...prev,
          [exerciseId]: { completed: true, sets }
        };
      }
    });
  };

  // Update set data
  const updateSet = (exerciseId, setIndex, field, value) => {
    setExerciseData(prev => {
      const current = prev[exerciseId] || { completed: true, sets: [] };
      const newSets = [...current.sets];
      newSets[setIndex] = { ...newSets[setIndex], [field]: value };
      return {
        ...prev,
        [exerciseId]: { ...current, sets: newSets }
      };
    });
  };

  // Add a set
  const addSet = (exerciseId) => {
    setExerciseData(prev => {
      const current = prev[exerciseId] || { completed: true, sets: [] };
      return {
        ...prev,
        [exerciseId]: {
          ...current,
          sets: [...current.sets, { reps: '', weight: '' }]
        }
      };
    });
  };

  // Remove a set
  const removeSet = (exerciseId, setIndex) => {
    setExerciseData(prev => {
      const current = prev[exerciseId] || { completed: true, sets: [] };
      const newSets = current.sets.filter((_, i) => i !== setIndex);
      return {
        ...prev,
        [exerciseId]: { ...current, sets: newSets }
      };
    });
  };

  // Check if all exercises in a day are complete
  const isDayComplete = (dayId) => {
    const day = WORKOUT_PLAN.find(d => d.id === dayId);
    if (!day) return false;
    return day.exercises.every(ex => getExerciseData(ex.id).completed);
  };

  // Mark day as complete
  const markDayComplete = (dayId) => {
    if (!completedWorkouts[dayId]) {
      setCompletedWorkouts(prev => ({ ...prev, [dayId]: true }));
      addXp(50);
    }
  };

  // Get count of completed exercises for a day
  const getCompletedCount = (dayId) => {
    const day = WORKOUT_PLAN.find(d => d.id === dayId);
    if (!day) return 0;
    return day.exercises.filter(ex => getExerciseData(ex.id).completed).length;
  };

  const getTodayWorkout = () => {
    const dayOfWeek = new Date().getDay();
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return WORKOUT_PLAN[dayIndex];
  };

  const todayWorkout = getTodayWorkout();
  const completedDays = Object.keys(completedWorkouts).length;
  const todayCompleted = completedWorkouts[todayWorkout.id];
  const todayExercisesCompleted = getCompletedCount(todayWorkout.id);
  const todayAllExercisesDone = isDayComplete(todayWorkout.id);

  return (
    <div className="workout-page">
      <header className="page-header">
        <div className="header-content">
          <h1>💪 Workout</h1>
          <p className="subtitle">2-Month Aggressive Fat Loss Plan</p>
        </div>
        <div className="week-badge">
          Week {currentWeek}/8
        </div>
      </header>

      {/* Goal Card */}
      <div className="goal-card">
        <Target size={20} />
        <div className="goal-info">
          <span className="goal-label">Goal</span>
          <span className="goal-text">170-175 lbs • Visible Abs • High Stamina</span>
        </div>
      </div>

      {/* Weight Tracker */}
      <div className="weight-tracker">
        <div className="weight-header">
          <Scale size={18} />
          <h3>Weight Tracker</h3>
          <button 
            className="log-weight-btn"
            onClick={() => setShowWeightInput(!showWeightInput)}
          >
            {showWeightInput ? 'Cancel' : '+ Log Weight'}
          </button>
        </div>
        
        {showWeightInput && (
          <div className="weight-input-row">
            <input
              type="number"
              placeholder="Enter weight"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              step="0.1"
            />
            <span>lbs</span>
            <button 
              className="save-weight-btn"
              onClick={() => {
                if (weightInput) {
                  updateWeight(parseFloat(weightInput));
                  setWeightInput('');
                  setShowWeightInput(false);
                }
              }}
            >
              Save
            </button>
          </div>
        )}

        <div className="weight-stats">
          <div className="weight-stat">
            <span className="weight-value">{workoutStats?.currentWeight || '--'}</span>
            <span className="weight-label">Current</span>
          </div>
          <div className="weight-stat">
            <span className="weight-value">{workoutStats?.startWeight || '--'}</span>
            <span className="weight-label">Start</span>
          </div>
          <div className="weight-stat">
            <span className="weight-value">
              {workoutStats?.startWeight && workoutStats?.currentWeight 
                ? (workoutStats.startWeight - workoutStats.currentWeight).toFixed(1)
                : '--'}
            </span>
            <span className="weight-label">Lost</span>
          </div>
        </div>

        {workoutStats?.weightHistory?.length > 1 && (
          <div className="weight-trend">
            <TrendingDown size={14} />
            <span>
              {workoutStats.weightHistory.length} weigh-ins tracked
            </span>
          </div>
        )}
      </div>

      {/* Today's Workout */}
      <div className={`today-workout ${todayCompleted ? 'completed' : ''}`}>
        <div className="today-header">
          <div>
            <h2>Today: {todayWorkout.name}</h2>
            <p>{todayWorkout.subtitle}</p>
          </div>
          <span className="today-progress">
            {todayExercisesCompleted}/{todayWorkout.exercises.length}
          </span>
        </div>

        {/* Today's Exercise List */}
        <div className="today-exercises-list">
          {todayWorkout.exercises.map((exercise) => {
            const data = getExerciseData(exercise.id);
            return (
              <div key={exercise.id} className={`exercise-item ${data.completed ? 'done' : ''}`}>
                <div className="exercise-header" onClick={() => toggleExercise(exercise.id, exercise.targetSets)}>
                  <div className={`exercise-check ${data.completed ? 'checked' : ''}`}>
                    {data.completed && <Check size={14} />}
                  </div>
                  <div className="exercise-info">
                    <span className="exercise-name">{exercise.name}</span>
                    <span className="exercise-target">{exercise.targetSets} sets × {exercise.targetReps}</span>
                  </div>
                </div>

                {/* Set Tracking */}
                {data.completed && (
                  <div className="sets-tracker">
                    {data.sets.map((set, i) => (
                      <div key={i} className="set-row">
                        <span className="set-num">Set {i + 1}</span>
                        <div className="set-inputs">
                          <div className="input-group">
                            <input
                              type="number"
                              placeholder="Reps"
                              value={set.reps}
                              onChange={(e) => updateSet(exercise.id, i, 'reps', e.target.value)}
                            />
                            <span>reps</span>
                          </div>
                          <div className="input-group">
                            <input
                              type="number"
                              placeholder="Weight"
                              value={set.weight}
                              onChange={(e) => updateSet(exercise.id, i, 'weight', e.target.value)}
                            />
                            <span>lbs</span>
                          </div>
                        </div>
                        {data.sets.length > 1 && (
                          <button className="remove-set" onClick={() => removeSet(exercise.id, i)}>
                            <Minus size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button className="add-set-btn" onClick={() => addSet(exercise.id)}>
                      <Plus size={14} /> Add Set
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Complete Day Button */}
        {!todayCompleted && (
          <button 
            className={`complete-day-btn ${todayAllExercisesDone ? 'ready' : 'disabled'}`}
            onClick={() => todayAllExercisesDone && markDayComplete(todayWorkout.id)}
            disabled={!todayAllExercisesDone}
          >
            {todayAllExercisesDone ? (
              <><Check size={18} /> Mark Day Complete (+50 XP)</>
            ) : (
              <><Dumbbell size={18} /> Complete all exercises first</>
            )}
          </button>
        )}

        {todayCompleted && (
          <div className="day-completed-badge">
            <Check size={20} />
            <span>Day Complete! +50 XP</span>
          </div>
        )}
      </div>

      {/* Weekly Progress */}
      <div className="weekly-progress">
        <h3>This Week</h3>
        <div className="progress-dots">
          {WORKOUT_PLAN.map((day) => (
            <div 
              key={day.id}
              className={`day-dot ${completedWorkouts[day.id] ? 'completed' : ''} ${day.id === todayWorkout.id ? 'today' : ''}`}
              title={day.name}
              onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
            >
              {day.emoji}
            </div>
          ))}
        </div>
        <p className="progress-text">{completedDays}/7 days completed</p>
      </div>

      {/* Nutrition Toggle */}
      <button className="nutrition-toggle" onClick={() => setShowNutrition(!showNutrition)}>
        <Utensils size={18} />
        <span>Daily Nutrition Targets</span>
        {showNutrition ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {showNutrition && (
        <div className="nutrition-card">
          <div className="macro">
            <span className="macro-value">{NUTRITION.calories}</span>
            <span className="macro-label">Calories</span>
          </div>
          <div className="macro">
            <span className="macro-value">{NUTRITION.protein}</span>
            <span className="macro-label">Protein</span>
          </div>
          <div className="macro">
            <span className="macro-value">{NUTRITION.fat}</span>
            <span className="macro-label">Fat</span>
          </div>
          <div className="macro">
            <span className="macro-value">{NUTRITION.carbs}</span>
            <span className="macro-label">Carbs</span>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="tips-card">
        <h3>💡 Key Reminders</h3>
        <ul>
          <li>Sleep 7-8 hours for recovery & hormones</li>
          <li>Drink 3-4 liters of water daily</li>
          <li>Track weight daily, use weekly averages</li>
          <li>Visible abs appear around 12-14% body fat</li>
          <li>Consistency for 8 weeks = transformation</li>
        </ul>
      </div>

      <style>{`
        .workout-page {
          padding: 20px;
          padding-bottom: 100px;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .page-header h1 {
          font-size: 28px;
          margin-bottom: 4px;
        }
        .subtitle {
          color: var(--gold);
          font-size: 13px;
          font-weight: 500;
        }
        .week-badge {
          background: var(--primary);
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        .goal-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 16px;
        }
        .goal-label {
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
          display: block;
        }
        .goal-text {
          font-size: 14px;
          font-weight: 600;
        }
        
        .weight-tracker {
          background: var(--bg-surface);
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .weight-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }
        .weight-header h3 {
          flex: 1;
          font-size: 15px;
        }
        .log-weight-btn {
          background: var(--primary);
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          color: var(--gold);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .weight-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
          animation: fadeIn 0.2s ease-out;
        }
        .weight-input-row input {
          flex: 1;
          padding: 12px;
          background: var(--bg-surface-light);
          border: 1px solid var(--bg-surface-light);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 16px;
        }
        .weight-input-row input:focus {
          outline: none;
          border-color: var(--gold);
        }
        .weight-input-row span {
          color: var(--text-muted);
          font-size: 14px;
        }
        .save-weight-btn {
          background: var(--gold);
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          color: var(--bg-primary);
          font-weight: 600;
          cursor: pointer;
        }
        .weight-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .weight-stat {
          text-align: center;
          padding: 12px;
          background: var(--bg-surface-light);
          border-radius: 10px;
        }
        .weight-value {
          display: block;
          font-size: 22px;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          color: var(--gold);
        }
        .weight-label {
          font-size: 11px;
          color: var(--text-muted);
        }
        .weight-trend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 12px;
          font-size: 12px;
          color: var(--success);
        }
        
        .today-workout {
          background: var(--bg-surface);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
          border-left: 4px solid var(--gold);
        }
        .today-workout.completed {
          border-left-color: var(--success);
        }
        .today-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .today-header h2 {
          font-size: 18px;
          margin-bottom: 4px;
        }
        .today-header p {
          color: var(--text-muted);
          font-size: 13px;
        }
        .today-progress {
          background: var(--primary);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          color: var(--gold);
        }

        .today-exercises-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        .exercise-item {
          background: var(--bg-surface-light);
          border-radius: 12px;
          overflow: hidden;
        }
        .exercise-item.done {
          border-left: 3px solid var(--success);
        }
        .exercise-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          cursor: pointer;
        }
        .exercise-check {
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
        .exercise-check.checked {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }
        .exercise-info {
          flex: 1;
        }
        .exercise-name {
          display: block;
          font-size: 14px;
          font-weight: 500;
        }
        .exercise-target {
          font-size: 12px;
          color: var(--text-muted);
        }

        .sets-tracker {
          padding: 0 14px 14px;
          border-top: 1px solid var(--bg-primary);
          animation: fadeIn 0.2s ease-out;
        }
        .set-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 0;
          border-bottom: 1px solid var(--bg-primary);
        }
        .set-row:last-of-type {
          border-bottom: none;
        }
        .set-num {
          font-size: 12px;
          color: var(--text-muted);
          width: 45px;
          flex-shrink: 0;
        }
        .set-inputs {
          display: flex;
          gap: 8px;
          flex: 1;
        }
        .input-group {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }
        .input-group input {
          width: 60px;
          padding: 8px;
          background: var(--bg-primary);
          border: 1px solid var(--bg-surface);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 14px;
          text-align: center;
        }
        .input-group input:focus {
          outline: none;
          border-color: var(--gold);
        }
        .input-group span {
          font-size: 11px;
          color: var(--text-muted);
        }
        .remove-set {
          background: rgba(231,76,60,0.2);
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--error);
          cursor: pointer;
        }
        .add-set-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          padding: 10px;
          margin-top: 8px;
          background: var(--bg-primary);
          border: 1px dashed var(--text-muted);
          border-radius: 8px;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .add-set-btn:hover {
          border-color: var(--gold);
          color: var(--gold);
        }

        .complete-day-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .complete-day-btn.ready {
          background: var(--gold);
          color: var(--bg-primary);
        }
        .complete-day-btn.ready:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }
        .complete-day-btn.disabled {
          background: var(--bg-surface-light);
          color: var(--text-muted);
          cursor: not-allowed;
        }
        .day-completed-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          background: rgba(46,204,113,0.2);
          border-radius: 12px;
          color: var(--success);
          font-weight: 600;
        }

        .weekly-progress {
          background: var(--bg-surface);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          text-align: center;
        }
        .weekly-progress h3 {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        .progress-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .day-dot {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--bg-surface-light);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          opacity: 0.5;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .day-dot:hover {
          opacity: 0.8;
        }
        .day-dot.today {
          border: 2px solid var(--gold);
          opacity: 1;
        }
        .day-dot.completed {
          opacity: 1;
          background: var(--primary);
          box-shadow: 0 0 12px rgba(13, 59, 46, 0.5);
        }
        .progress-text {
          font-size: 12px;
          color: var(--text-muted);
        }

        .nutrition-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: var(--bg-surface);
          border: none;
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 12px;
        }
        .nutrition-toggle span {
          flex: 1;
          text-align: left;
        }
        .nutrition-card {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 20px;
          animation: fadeIn 0.3s ease-out;
        }
        .macro {
          background: var(--bg-surface);
          padding: 12px;
          border-radius: 12px;
          text-align: center;
        }
        .macro-value {
          display: block;
          font-size: 16px;
          font-weight: 700;
          color: var(--gold);
          font-family: 'Space Grotesk', sans-serif;
        }
        .macro-label {
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
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

export default Workout;
