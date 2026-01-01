import React, { useState, useEffect } from 'react';
import { useAuth, TIERS } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Dumbbell, Check, ChevronDown, ChevronUp, Target, 
  Plus, Minus, Scale, TrendingDown, Upload, FileText, Trash2,
  ToggleLeft, ToggleRight, Lock, Crown, X, Edit2, Loader, Wand2
} from 'lucide-react';
import FeatureGate from '../components/FeatureGate';

// PDF.js for parsing PDFs
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function Workout() {
  const { user, hasAccess, getTier } = useAuth();
  const tier = getTier();
  
  const [workoutEnabled, setWorkoutEnabled] = useState(false);
  const [customPdf, setCustomPdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  
  // Custom workout plan (user creates their own)
  const [customPlan, setCustomPlan] = useState([]);
  const [addingDay, setAddingDay] = useState(false);
  const [newDayName, setNewDayName] = useState('');
  const [editingDay, setEditingDay] = useState(null);
  const [newExercise, setNewExercise] = useState({ name: '', sets: 3, reps: '10' });
  
  const [weightInput, setWeightInput] = useState('');
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weightHistory, setWeightHistory] = useState([]);
  const [currentWeight, setCurrentWeight] = useState(null);
  
  const [exerciseData, setExerciseData] = useState({});
  const [completedWorkouts, setCompletedWorkouts] = useState({});
  const [expandedDay, setExpandedDay] = useState(null);

  // Load user workout data
  useEffect(() => {
    if (user) {
      loadWorkoutData();
    }
  }, [user]);

  const loadWorkoutData = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'users', user.uid, 'fitness', 'workout');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWorkoutEnabled(data.enabled || false);
        setCustomPdf(data.customPdf || null);
        setCustomPlan(data.customPlan || []);
        setWeightHistory(data.weightHistory || []);
        setCurrentWeight(data.currentWeight || null);
        setExerciseData(data.exerciseData || {});
        setCompletedWorkouts(data.completedWorkouts || {});
      }
    } catch (error) {
      console.error('Error loading workout data:', error);
    }
    setLoading(false);
  };

  const saveWorkoutData = async (updates) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'fitness', 'workout');
      await setDoc(docRef, {
        enabled: workoutEnabled,
        customPdf,
        customPlan,
        weightHistory,
        currentWeight,
        exerciseData,
        completedWorkouts,
        ...updates,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving workout data:', error);
    }
  };

  const toggleWorkout = async () => {
    const newValue = !workoutEnabled;
    setWorkoutEnabled(newValue);
    await saveWorkoutData({ enabled: newValue });
  };

  // Parse PDF and extract workout data
  const parsePdfContent = async (file) => {
    setParsing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      
      // Parse the extracted text into workout structure
      const parsedWorkout = parseWorkoutText(fullText);
      
      if (parsedWorkout.length > 0) {
        setCustomPlan(parsedWorkout);
        await saveWorkoutData({ customPlan: parsedWorkout });
        alert(`✅ Found ${parsedWorkout.length} workout days with exercises!`);
      } else {
        alert('Could not auto-detect workout structure. You can add days and exercises manually.');
      }
      
    } catch (error) {
      console.error('Error parsing PDF:', error);
      alert('Error reading PDF. Please try again or add workouts manually.');
    }
    
    setParsing(false);
  };

  // Parse workout text into structured data
  const parseWorkoutText = (text) => {
    const workoutDays = [];
    
    // Common patterns for workout days
    const dayPatterns = [
      /(?:Day\s*(\d+)|Week\s*\d+\s*-?\s*Day\s*(\d+))\s*[-:–]?\s*([A-Za-z\s&+\/]+?)(?=\n|Day|\d+\.|$)/gi,
      /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*[-:–]?\s*([A-Za-z\s&+\/]+)/gi,
      /(Push|Pull|Legs|Upper|Lower|Full Body|Chest|Back|Arms|Shoulders)\s*(?:Day|Workout)?/gi,
    ];
    
    // Common exercise patterns: "Exercise Name: 3x10" or "Exercise Name 3 sets x 10 reps"
    const exercisePatterns = [
      /([A-Za-z\s\-()]+?)[\s:]+(\d+)\s*[x×]\s*(\d+[-–]?\d*)/gi,
      /([A-Za-z\s\-()]+?)[\s:]+(\d+)\s*sets?\s*[,x×]\s*(\d+[-–]?\d*)\s*reps?/gi,
      /([A-Za-z\s\-()]+?)\s+(\d+)\s+(\d+[-–]?\d*)/gi,
    ];
    
    // Common exercise names to look for
    const commonExercises = [
      'Bench Press', 'Incline Press', 'Decline Press', 'Dumbbell Press', 'Chest Press',
      'Squat', 'Leg Press', 'Lunges', 'Leg Extension', 'Leg Curl', 'Deadlift', 'Romanian Deadlift',
      'Pull Up', 'Chin Up', 'Lat Pulldown', 'Row', 'Barbell Row', 'Dumbbell Row', 'Cable Row',
      'Shoulder Press', 'Military Press', 'Lateral Raise', 'Front Raise', 'Face Pull',
      'Bicep Curl', 'Hammer Curl', 'Preacher Curl', 'Tricep Extension', 'Tricep Pushdown', 'Skull Crusher',
      'Plank', 'Crunch', 'Sit Up', 'Russian Twist', 'Leg Raise', 'Ab Wheel',
      'Hip Thrust', 'Glute Bridge', 'Calf Raise', 'Shrug',
      'Push Up', 'Dip', 'Cable Fly', 'Pec Deck', 'Machine',
      'HIIT', 'Cardio', 'Running', 'Cycling', 'Elliptical', 'Stairmaster',
    ];
    
    // Split text into lines and analyze
    const lines = text.split(/\n+/);
    let currentDay = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Check for day headers
      const dayMatch = line.match(/(?:Day\s*(\d+)|Week\s*\d+[^a-z]*Day\s*(\d+))\s*[-:–]?\s*([A-Za-z\s&+\/,]+)?/i);
      const namedDayMatch = line.match(/(Push|Pull|Legs|Upper|Lower|Full Body|Chest|Back|Arms|Shoulders|Core)\s*(?:Day|Workout|Session)?/i);
      const weekdayMatch = line.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*[-:–]?\s*(.+)?/i);
      
      if (dayMatch) {
        const dayNum = dayMatch[1] || dayMatch[2];
        const dayName = dayMatch[3]?.trim() || `Day ${dayNum}`;
        currentDay = {
          id: `day_${Date.now()}_${dayNum}`,
          name: dayName,
          exercises: []
        };
        workoutDays.push(currentDay);
        continue;
      }
      
      if (namedDayMatch && !currentDay) {
        currentDay = {
          id: `day_${Date.now()}_${workoutDays.length + 1}`,
          name: namedDayMatch[0].trim(),
          exercises: []
        };
        workoutDays.push(currentDay);
        continue;
      }
      
      if (weekdayMatch) {
        const weekday = weekdayMatch[1];
        const focus = weekdayMatch[2]?.trim() || weekday;
        currentDay = {
          id: `day_${Date.now()}_${workoutDays.length + 1}`,
          name: focus.includes(weekday) ? focus : `${weekday} - ${focus}`,
          exercises: []
        };
        workoutDays.push(currentDay);
        continue;
      }
      
      // If no current day, try to create one based on content
      if (!currentDay && workoutDays.length === 0) {
        // Check if this line looks like it might be starting exercises
        const hasExercise = commonExercises.some(ex => 
          line.toLowerCase().includes(ex.toLowerCase())
        );
        if (hasExercise) {
          currentDay = {
            id: `day_${Date.now()}_1`,
            name: 'Workout Day 1',
            exercises: []
          };
          workoutDays.push(currentDay);
        }
      }
      
      // Parse exercises
      if (currentDay) {
        // Try to extract exercise with sets and reps
        const exerciseMatch = line.match(/([A-Za-z\s\-()]+?)[\s:]+(\d+)\s*[x×]\s*(\d+[-–]?\d*)/i);
        
        if (exerciseMatch) {
          const exerciseName = exerciseMatch[1].trim();
          const sets = parseInt(exerciseMatch[2]);
          const reps = exerciseMatch[3];
          
          // Validate it looks like an exercise
          if (exerciseName.length > 2 && exerciseName.length < 50 && sets > 0 && sets <= 10) {
            currentDay.exercises.push({
              id: `ex_${Date.now()}_${currentDay.exercises.length}`,
              name: exerciseName,
              targetSets: sets,
              targetReps: reps
            });
            continue;
          }
        }
        
        // Check if line contains a common exercise name
        for (const exercise of commonExercises) {
          if (line.toLowerCase().includes(exercise.toLowerCase())) {
            // Try to find sets/reps nearby
            const setsRepsMatch = line.match(/(\d+)\s*[x×]\s*(\d+[-–]?\d*)/);
            const sets = setsRepsMatch ? parseInt(setsRepsMatch[1]) : 3;
            const reps = setsRepsMatch ? setsRepsMatch[2] : '10';
            
            // Extract the exercise name more precisely
            const nameMatch = line.match(new RegExp(`([A-Za-z\\s\\-()]*${exercise}[A-Za-z\\s\\-()]*)`, 'i'));
            const name = nameMatch ? nameMatch[1].trim() : exercise;
            
            // Don't add duplicates
            if (!currentDay.exercises.some(e => e.name.toLowerCase() === name.toLowerCase())) {
              currentDay.exercises.push({
                id: `ex_${Date.now()}_${currentDay.exercises.length}`,
                name: name,
                targetSets: sets,
                targetReps: reps
              });
            }
            break;
          }
        }
      }
    }
    
    // Filter out days with no exercises
    return workoutDays.filter(day => day.exercises.length > 0);
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const pdfData = {
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString()
    };
    setCustomPdf(pdfData);
    await saveWorkoutData({ customPdf: pdfData });
    
    // Parse the PDF
    await parsePdfContent(file);
  };

  const handleRemovePdf = async () => {
    if (window.confirm('Remove PDF and all workout data?')) {
      setCustomPdf(null);
      setCustomPlan([]);
      setExerciseData({});
      setCompletedWorkouts({});
      await saveWorkoutData({ 
        customPdf: null, 
        customPlan: [], 
        exerciseData: {},
        completedWorkouts: {}
      });
    }
  };

  // Add a new workout day
  const addWorkoutDay = async () => {
    if (!newDayName.trim()) return;
    
    const newDay = {
      id: `day_${Date.now()}`,
      name: newDayName.trim(),
      exercises: []
    };
    
    const updatedPlan = [...customPlan, newDay];
    setCustomPlan(updatedPlan);
    setNewDayName('');
    setAddingDay(false);
    await saveWorkoutData({ customPlan: updatedPlan });
  };

  // Delete a workout day
  const deleteWorkoutDay = async (dayId) => {
    if (!window.confirm('Delete this workout day?')) return;
    
    const updatedPlan = customPlan.filter(d => d.id !== dayId);
    setCustomPlan(updatedPlan);
    await saveWorkoutData({ customPlan: updatedPlan });
  };

  // Add exercise to a day
  const addExerciseToDay = async (dayId) => {
    if (!newExercise.name.trim()) return;
    
    const exercise = {
      id: `ex_${Date.now()}`,
      name: newExercise.name.trim(),
      targetSets: parseInt(newExercise.sets),
      targetReps: newExercise.reps
    };
    
    const updatedPlan = customPlan.map(day => {
      if (day.id === dayId) {
        return { ...day, exercises: [...day.exercises, exercise] };
      }
      return day;
    });
    
    setCustomPlan(updatedPlan);
    setNewExercise({ name: '', sets: 3, reps: '10' });
    await saveWorkoutData({ customPlan: updatedPlan });
  };

  // Delete exercise from a day
  const deleteExercise = async (dayId, exerciseId) => {
    const updatedPlan = customPlan.map(day => {
      if (day.id === dayId) {
        return { ...day, exercises: day.exercises.filter(e => e.id !== exerciseId) };
      }
      return day;
    });
    
    setCustomPlan(updatedPlan);
    await saveWorkoutData({ customPlan: updatedPlan });
  };

  const handleWeightLog = async () => {
    if (!weightInput) return;
    
    const weight = parseFloat(weightInput);
    const newHistory = [...weightHistory, { weight, date: new Date().toISOString() }];
    
    setWeightHistory(newHistory);
    setCurrentWeight(weight);
    setWeightInput('');
    setShowWeightInput(false);
    
    await saveWorkoutData({ 
      weightHistory: newHistory, 
      currentWeight: weight 
    });
  };

  const getExerciseData = (exerciseId) => {
    return exerciseData[exerciseId] || { completed: false, sets: [] };
  };

  const toggleExercise = async (exerciseId, targetSets) => {
    const current = exerciseData[exerciseId] || { completed: false, sets: [] };
    const newData = {
      ...exerciseData,
      [exerciseId]: {
        completed: !current.completed,
        sets: current.completed ? [] : Array(targetSets).fill({ reps: '', weight: '' })
      }
    };
    setExerciseData(newData);
    await saveWorkoutData({ exerciseData: newData });
  };

  const updateSet = async (exerciseId, setIndex, field, value) => {
    const current = exerciseData[exerciseId] || { completed: true, sets: [] };
    const newSets = [...current.sets];
    newSets[setIndex] = { ...newSets[setIndex], [field]: value };
    
    const newData = {
      ...exerciseData,
      [exerciseId]: { ...current, sets: newSets }
    };
    setExerciseData(newData);
  };

  const isDayComplete = (day) => {
    return day.exercises.length > 0 && day.exercises.every(ex => getExerciseData(ex.id).completed);
  };

  const markDayComplete = async (dayId) => {
    const today = new Date().toDateString();
    const newCompleted = { 
      ...completedWorkouts, 
      [dayId]: [...(completedWorkouts[dayId] || []), today]
    };
    setCompletedWorkouts(newCompleted);
    await saveWorkoutData({ completedWorkouts: newCompleted });
  };

  const startWeight = weightHistory[0]?.weight;
  const weightLost = startWeight && currentWeight ? (startWeight - currentWeight).toFixed(1) : null;

  // Check if user has access to workout
  if (!hasAccess('workout')) {
    return (
      <div className="workout-page">
        <header className="page-header">
          <h1>💪 Workout</h1>
          <p className="subtitle">Track your fitness journey</p>
        </header>
        <FeatureGate feature="workout">
          <div style={{ minHeight: 400 }} />
        </FeatureGate>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="workout-page">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Workout not enabled - show enable screen
  if (!workoutEnabled) {
    return (
      <div className="workout-page">
        <header className="page-header">
          <h1>💪 Workout</h1>
          <p className="subtitle">Track your fitness journey</p>
        </header>

        <div className="enable-card">
          <Dumbbell size={48} className="enable-icon" />
          <h2>Enable Workout Tracking?</h2>
          <p>Import your workout PDF and we'll automatically create your training checklist.</p>
          
          <button className="btn btn-primary enable-btn" onClick={toggleWorkout}>
            <ToggleRight size={20} />
            Enable Workout
          </button>
        </div>

        <style>{`
          .workout-page {
            padding: 20px;
            padding-bottom: 100px;
          }
          .page-header h1 { font-size: 28px; margin-bottom: 4px; }
          .subtitle { color: var(--text-muted); font-size: 14px; }
          .enable-card {
            background: var(--bg-surface);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            margin-top: 40px;
          }
          .enable-icon {
            color: var(--gold);
            margin-bottom: 20px;
          }
          .enable-card h2 {
            font-size: 22px;
            margin-bottom: 12px;
          }
          .enable-card p {
            color: var(--text-muted);
            font-size: 14px;
            margin-bottom: 24px;
            max-width: 300px;
            margin-left: auto;
            margin-right: auto;
          }
          .enable-btn {
            padding: 16px 32px;
            font-size: 16px;
          }
          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
          }
          .btn-primary {
            background: var(--gold);
            color: var(--bg-primary);
          }
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 300px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--bg-surface-light);
            border-top-color: var(--gold);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="workout-page">
      <header className="page-header">
        <div className="header-content">
          <h1>💪 Workout</h1>
          <p className="subtitle">Your Custom Training Plan</p>
        </div>
        <button className="disable-btn" onClick={toggleWorkout} title="Disable Workout">
          <ToggleLeft size={18} />
        </button>
      </header>

      {/* PDF Upload Section */}
      <div className="pdf-section">
        <div className="pdf-header">
          <Wand2 size={18} />
          <span>Auto-Scan Workout PDF</span>
        </div>
        
        {customPdf ? (
          <div className="pdf-uploaded">
            <div className="pdf-info">
              <span className="pdf-name">{customPdf.name}</span>
              <span className="pdf-date">Uploaded {new Date(customPdf.uploadedAt).toLocaleDateString()}</span>
            </div>
            <button className="remove-pdf-btn" onClick={handleRemovePdf}>
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <label className={`upload-pdf-btn ${parsing ? 'parsing' : ''}`}>
            {parsing ? (
              <>
                <Loader size={16} className="spin" />
                <span>Scanning PDF...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Upload Workout PDF</span>
              </>
            )}
            <input type="file" accept=".pdf" onChange={handlePdfUpload} hidden disabled={parsing} />
          </label>
        )}
        
        <p className="pdf-hint">
          📄 Upload your workout PDF and we'll auto-create your exercise checklist
        </p>
      </div>

      {/* Weight Tracker - Pro+ Only */}
      {tier === TIERS.PRO_PLUS ? (
        <div className="weight-tracker">
          <div className="weight-header">
            <Scale size={18} />
            <h3>Weight Tracker</h3>
            <button 
              className="log-weight-btn"
              onClick={() => setShowWeightInput(!showWeightInput)}
            >
              {showWeightInput ? 'Cancel' : '+ Log'}
            </button>
          </div>
          
          {showWeightInput && (
            <div className="weight-input-row">
              <input
                type="number"
                placeholder="Weight"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                step="0.1"
              />
              <span>lbs</span>
              <button className="save-weight-btn" onClick={handleWeightLog}>Save</button>
            </div>
          )}

          <div className="weight-stats">
            <div className="weight-stat">
              <span className="weight-value">{currentWeight || '--'}</span>
              <span className="weight-label">Current</span>
            </div>
            <div className="weight-stat">
              <span className="weight-value">{startWeight || '--'}</span>
              <span className="weight-label">Start</span>
            </div>
            <div className="weight-stat">
              <span className="weight-value">{weightLost && weightLost > 0 ? `-${weightLost}` : '--'}</span>
              <span className="weight-label">Lost</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="weight-locked">
          <Lock size={16} />
          <span>Weight tracking available in Pro+</span>
          <a href="/pricing">Upgrade</a>
        </div>
      )}

      {/* Custom Workout Plan */}
      <div className="workout-plan">
        <div className="plan-header">
          <h3>Your Workout Plan</h3>
          <button className="add-day-btn" onClick={() => setAddingDay(true)}>
            <Plus size={16} /> Add Day
          </button>
        </div>

        {addingDay && (
          <div className="add-day-form">
            <input
              type="text"
              placeholder="Day name (e.g., Push Day, Leg Day)"
              value={newDayName}
              onChange={(e) => setNewDayName(e.target.value)}
              autoFocus
            />
            <div className="add-day-actions">
              <button className="btn btn-secondary" onClick={() => { setAddingDay(false); setNewDayName(''); }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={addWorkoutDay}>
                Add Day
              </button>
            </div>
          </div>
        )}

        {customPlan.length === 0 ? (
          <div className="empty-plan">
            <Dumbbell size={40} />
            <h4>No Workout Days Yet</h4>
            <p>Upload your PDF to auto-generate, or add days manually</p>
          </div>
        ) : (
          <div className="days-list">
            {customPlan.map((day) => {
              const isExpanded = expandedDay === day.id;
              const dayComplete = isDayComplete(day);
              const completedCount = day.exercises.filter(ex => getExerciseData(ex.id).completed).length;
              const completionHistory = completedWorkouts[day.id] || [];
              
              return (
                <div key={day.id} className={`day-card ${dayComplete ? 'completed' : ''}`}>
                  <div className="day-header" onClick={() => setExpandedDay(isExpanded ? null : day.id)}>
                    <div className="day-info">
                      <h4>{day.name}</h4>
                      <span className="exercise-count">
                        {completedCount}/{day.exercises.length} exercises
                        {completionHistory.length > 0 && (
                          <span className="completion-badge">✓ {completionHistory.length}x</span>
                        )}
                      </span>
                    </div>
                    <div className="day-actions">
                      {dayComplete && <Check size={18} className="complete-icon" />}
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="day-content">
                      {day.exercises.length === 0 ? (
                        <p className="no-exercises">No exercises added yet</p>
                      ) : (
                        <div className="exercises-list">
                          {day.exercises.map((exercise) => {
                            const data = getExerciseData(exercise.id);
                            return (
                              <div key={exercise.id} className={`exercise-item ${data.completed ? 'done' : ''}`}>
                                <div className="exercise-header" onClick={() => toggleExercise(exercise.id, exercise.targetSets)}>
                                  <div className={`exercise-check ${data.completed ? 'checked' : ''}`}>
                                    {data.completed && <Check size={14} />}
                                  </div>
                                  <div className="exercise-info">
                                    <span className="exercise-name">{exercise.name}</span>
                                    <span className="exercise-target">{exercise.targetSets} × {exercise.targetReps}</span>
                                  </div>
                                  <button 
                                    className="delete-exercise"
                                    onClick={(e) => { e.stopPropagation(); deleteExercise(day.id, exercise.id); }}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>

                                {data.completed && (
                                  <div className="sets-tracker">
                                    {data.sets.map((set, i) => (
                                      <div key={i} className="set-row">
                                        <span className="set-num">Set {i + 1}</span>
                                        <div className="set-inputs">
                                          <input
                                            type="number"
                                            placeholder="Reps"
                                            value={set.reps}
                                            onChange={(e) => updateSet(exercise.id, i, 'reps', e.target.value)}
                                          />
                                          <input
                                            type="number"
                                            placeholder="lbs"
                                            value={set.weight}
                                            onChange={(e) => updateSet(exercise.id, i, 'weight', e.target.value)}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add Exercise Form */}
                      {editingDay === day.id ? (
                        <div className="add-exercise-form">
                          <input
                            type="text"
                            placeholder="Exercise name"
                            value={newExercise.name}
                            onChange={(e) => setNewExercise(p => ({ ...p, name: e.target.value }))}
                          />
                          <div className="exercise-params">
                            <input
                              type="number"
                              placeholder="Sets"
                              value={newExercise.sets}
                              onChange={(e) => setNewExercise(p => ({ ...p, sets: e.target.value }))}
                            />
                            <input
                              type="text"
                              placeholder="Reps"
                              value={newExercise.reps}
                              onChange={(e) => setNewExercise(p => ({ ...p, reps: e.target.value }))}
                            />
                          </div>
                          <div className="add-exercise-actions">
                            <button className="btn btn-secondary" onClick={() => setEditingDay(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={() => { addExerciseToDay(day.id); setEditingDay(null); }}>Add</button>
                          </div>
                        </div>
                      ) : (
                        <button className="add-exercise-btn" onClick={() => setEditingDay(day.id)}>
                          <Plus size={14} /> Add Exercise
                        </button>
                      )}

                      <div className="day-footer">
                        {dayComplete && (
                          <button className="complete-day-btn" onClick={() => markDayComplete(day.id)}>
                            <Check size={16} /> Mark Day Complete
                          </button>
                        )}
                        <button className="delete-day-btn" onClick={() => deleteWorkoutDay(day.id)}>
                          <Trash2 size={14} /> Delete Day
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
        .page-header h1 { font-size: 28px; margin-bottom: 4px; }
        .subtitle { color: var(--gold); font-size: 13px; font-weight: 500; }
        .disable-btn {
          background: var(--bg-surface);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pdf-section {
          background: linear-gradient(135deg, var(--primary) 0%, #1a4a3a 100%);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
        }
        .pdf-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
          font-size: 15px;
          font-weight: 600;
          color: var(--gold);
        }
        .pdf-uploaded {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px;
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
        }
        .pdf-name { font-size: 14px; display: block; }
        .pdf-date { font-size: 11px; color: var(--text-muted); }
        .remove-pdf-btn {
          background: rgba(231,76,60,0.3);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          color: var(--error);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .upload-pdf-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 16px;
          background: rgba(0,0,0,0.2);
          border: 2px dashed var(--gold);
          border-radius: 12px;
          color: var(--gold);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .upload-pdf-btn:hover {
          background: rgba(212,175,55,0.1);
        }
        .upload-pdf-btn.parsing {
          border-style: solid;
          cursor: not-allowed;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        .pdf-hint {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 12px;
          text-align: center;
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
        .weight-header h3 { flex: 1; font-size: 15px; }
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
        }
        .weight-input-row input {
          flex: 1;
          padding: 12px;
          background: var(--bg-surface-light);
          border: none;
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 16px;
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
          color: var(--gold);
        }
        .weight-label { font-size: 11px; color: var(--text-muted); }
        .weight-locked {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px;
          background: var(--bg-surface);
          border-radius: 12px;
          margin-bottom: 16px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .weight-locked a {
          margin-left: auto;
          color: var(--gold);
          text-decoration: none;
          font-weight: 600;
        }
        
        .workout-plan {
          background: var(--bg-surface);
          border-radius: 16px;
          padding: 20px;
        }
        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .plan-header h3 { font-size: 16px; }
        .add-day-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--primary);
          border: none;
          padding: 10px 16px;
          border-radius: 10px;
          color: var(--gold);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .add-day-form {
          background: var(--bg-surface-light);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 16px;
        }
        .add-day-form input {
          width: 100%;
          padding: 12px;
          background: var(--bg-primary);
          border: none;
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 14px;
          margin-bottom: 12px;
        }
        .add-day-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-primary {
          background: var(--gold);
          color: var(--bg-primary);
        }
        .btn-secondary {
          background: var(--bg-surface);
          color: var(--text-secondary);
        }
        
        .empty-plan {
          text-align: center;
          padding: 40px 20px;
        }
        .empty-plan svg { color: var(--text-muted); margin-bottom: 16px; }
        .empty-plan h4 { margin-bottom: 8px; }
        .empty-plan p { color: var(--text-muted); font-size: 13px; }
        
        .days-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .day-card {
          background: var(--bg-surface-light);
          border-radius: 14px;
          overflow: hidden;
          border-left: 4px solid var(--text-muted);
        }
        .day-card.completed { border-left-color: var(--success); }
        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          cursor: pointer;
        }
        .day-info h4 { font-size: 15px; margin-bottom: 2px; }
        .exercise-count { font-size: 12px; color: var(--text-muted); }
        .completion-badge {
          display: inline-block;
          margin-left: 8px;
          padding: 2px 8px;
          background: var(--success);
          color: white;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
        }
        .day-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
        }
        .complete-icon { color: var(--success); }
        .day-content {
          padding: 0 16px 16px;
          border-top: 1px solid var(--bg-primary);
        }
        .no-exercises {
          text-align: center;
          padding: 20px;
          color: var(--text-muted);
          font-size: 13px;
        }
        .exercises-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }
        .exercise-item {
          background: var(--bg-primary);
          border-radius: 10px;
          overflow: hidden;
        }
        .exercise-item.done { border-left: 3px solid var(--success); }
        .exercise-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          cursor: pointer;
        }
        .exercise-check {
          width: 22px;
          height: 22px;
          border: 2px solid var(--text-muted);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .exercise-check.checked {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }
        .exercise-info { flex: 1; }
        .exercise-name { display: block; font-size: 14px; }
        .exercise-target { font-size: 12px; color: var(--text-muted); }
        .delete-exercise {
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 4px;
          cursor: pointer;
        }
        .delete-exercise:hover { color: var(--error); }
        .sets-tracker {
          padding: 8px 12px 12px;
          border-top: 1px solid var(--bg-surface);
        }
        .set-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
        }
        .set-num { font-size: 12px; color: var(--text-muted); width: 45px; }
        .set-inputs { display: flex; gap: 8px; flex: 1; }
        .set-inputs input {
          flex: 1;
          padding: 8px;
          background: var(--bg-surface);
          border: none;
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 14px;
          text-align: center;
        }
        .add-exercise-form {
          background: var(--bg-primary);
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 12px;
        }
        .add-exercise-form input {
          width: 100%;
          padding: 10px;
          background: var(--bg-surface);
          border: none;
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 13px;
          margin-bottom: 8px;
        }
        .exercise-params {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }
        .exercise-params input { flex: 1; }
        .add-exercise-actions { display: flex; gap: 8px; justify-content: flex-end; }
        .add-exercise-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          padding: 12px;
          background: none;
          border: 2px dashed var(--text-muted);
          border-radius: 10px;
          color: var(--text-muted);
          font-size: 13px;
          cursor: pointer;
          margin-bottom: 12px;
        }
        .add-exercise-btn:hover {
          border-color: var(--gold);
          color: var(--gold);
        }
        .day-footer {
          display: flex;
          gap: 10px;
          justify-content: space-between;
        }
        .complete-day-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--success);
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .delete-day-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(231,76,60,0.15);
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          color: var(--error);
          font-size: 13px;
          cursor: pointer;
        }
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--bg-surface-light);
          border-top-color: var(--gold);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default Workout;
