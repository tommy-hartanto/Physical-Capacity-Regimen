import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  ListFilter,
  Check
} from 'lucide-react';
import { useTraining } from '../context/TrainingContext';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';
import { ExerciseIllustration } from './ExerciseIllustration';
import { soundFx } from '../utils/sound';

interface WorkoutExecutionProps {
  onFinish: () => void;
  onCancel: () => void;
}

export const WorkoutExecution: React.FC<WorkoutExecutionProps> = ({ onFinish, onCancel }) => {
  const { activeWorkout, updateActiveWorkout, logSetForCurrentExercise, skipExercise, swapExercise, workoutLogs } = useTraining();

  if (!activeWorkout) return null;

  const currentIdx = activeWorkout.currentExerciseIndex;
  const currentItem = activeWorkout.exercises[currentIdx];
  const exerciseDef = currentItem ? EXERCISE_LIBRARY[currentItem.exerciseId] : null;

  // Active set index being logged (first set without a performed completion)
  const currentSetNumber = (currentItem?.performedSets.length || 0) + 1;
  const targetSet = currentItem?.prescribedSets.find(s => s.setNumber === currentSetNumber) || currentItem?.prescribedSets[0];

  // Local set input state initialized from target
  const [inputWeight, setInputWeight] = useState<number>(() => {
    return targetSet?.targetWeightKg ?? 0;
  });
  const [inputReps, setInputReps] = useState<number>(() => {
    return targetSet?.targetReps ?? targetSet?.targetRepsRange?.[0] ?? 5;
  });
  const [inputDuration, setInputDuration] = useState<number>(() => {
    return targetSet?.targetDurationSec ?? 30;
  });
  const [inputRpe, setInputRpe] = useState<number>(7.5);
  const [setNote, setSetNote] = useState<string>('');

  // Update inputs whenever active exercise or set advances
  useEffect(() => {
    if (targetSet) {
      if (targetSet.targetWeightKg !== undefined) {
        setInputWeight(targetSet.targetWeightKg);
      }
      if (targetSet.targetReps !== undefined) {
        setInputReps(targetSet.targetReps);
      } else if (targetSet.targetRepsRange) {
        setInputReps(targetSet.targetRepsRange[0]);
      }
      if (targetSet.targetDurationSec !== undefined) {
        setInputDuration(targetSet.targetDurationSec);
      }
      setInputRpe(targetSet.targetRpe || 7.5);
    }
  }, [currentIdx, currentSetNumber]);

  // Rest Timer State
  const [restRemaining, setRestRemaining] = useState<number | null>(null);
  const [restInitial, setRestInitial] = useState<number>(90);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Overall workout elapsed timer
  const [elapsedSec, setElapsedSec] = useState<number>(() => {
    return Math.floor((Date.now() - new Date(activeWorkout.startedAt).getTime()) / 1000);
  });

  // Time crunch sheet toggle
  const [showCrunchModal, setShowCrunchModal] = useState<boolean>(false);
  const [showSwapModal, setShowSwapModal] = useState<boolean>(false);
  const [showQueueModal, setShowQueueModal] = useState<boolean>(false);

  // Elapsed workout clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - new Date(activeWorkout.startedAt).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeWorkout.startedAt]);

  // Rest countdown ticker
  useEffect(() => {
    if (restRemaining === null) return;
    if (restRemaining <= 0) {
      soundFx.playChime();
      setRestRemaining(null);
      return;
    }

    const timer = setInterval(() => {
      setRestRemaining(prev => {
        if (prev === null) return null;
        if (prev <= 4 && prev > 1) {
          soundFx.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [restRemaining]);

  const handleStartRest = (seconds: number) => {
    setRestInitial(seconds);
    setRestRemaining(seconds);
  };

  const handleLogSet = () => {
    if (!currentItem || !targetSet) return;

    logSetForCurrentExercise(currentIdx, {
      setNumber: currentSetNumber,
      actualWeightKg: exerciseDef?.loadType === 'duration_sec' || exerciseDef?.loadType === 'bodyweight' ? undefined : inputWeight,
      actualReps: exerciseDef?.loadType === 'duration_sec' ? undefined : inputReps,
      actualDurationSec: exerciseDef?.loadType === 'duration_sec' ? inputDuration : undefined,
      actualRpe: inputRpe,
      completed: true,
      notes: setNote.trim() || undefined,
      loggedAt: new Date().toISOString()
    });

    setSetNote('');

    // Trigger Rest Timer
    const restSeconds = targetSet.prescribedRestSec || exerciseDef?.defaultRestSec || 90;
    handleStartRest(restSeconds);

    // If this was the last set of this exercise, check if all exercises completed or auto advance
    const totalSets = currentItem.prescribedSets.length;
    if (currentSetNumber >= totalSets) {
      // Completed this exercise
      if (currentIdx < activeWorkout.exercises.length - 1) {
        setTimeout(() => {
          updateActiveWorkout({
            ...activeWorkout,
            currentExerciseIndex: currentIdx + 1
          });
        }, 600);
      }
    }
  };

  const navigateExercise = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < activeWorkout.exercises.length) {
      updateActiveWorkout({
        ...activeWorkout,
        currentExerciseIndex: newIndex
      });
    }
  };

  // Find last logged session result for this specific exercise
  const findLastSessionResult = () => {
    if (!currentItem) return null;
    for (const log of workoutLogs) {
      const match = log.exercises.find(e => e.exerciseId === currentItem.exerciseId);
      if (match && match.sets.length > 0) {
        return {
          date: log.date,
          sets: match.sets,
          targetLoad: match.targetLoad
        };
      }
    }
    return null;
  };

  const lastResult = findLastSessionResult();

  // Calculation of elapsed and remaining time
  const elapsedMin = Math.floor(elapsedSec / 60);
  const estimatedRemainingMin = Math.max(0, activeWorkout.estimatedDurationMin - elapsedMin);
  const isBehindSchedule = elapsedMin > activeWorkout.estimatedDurationMin * 0.8 && currentIdx < activeWorkout.exercises.length / 2;

  // Format mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Check how many total sets completed in session
  const totalPrescribedSets = activeWorkout.exercises.reduce((acc, ex) => acc + (ex.isSkipped ? 0 : ex.prescribedSets.length), 0);
  const totalCompletedSets = activeWorkout.exercises.reduce((acc, ex) => acc + ex.performedSets.length, 0);
  const sessionProgressPct = totalPrescribedSets > 0 ? Math.round((totalCompletedSets / totalPrescribedSets) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-28">
      {/* Top Session Progress Bar & Controls */}
      <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={onCancel}
              className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
            >
              Quit
            </button>
            <span className="text-xs font-semibold text-zinc-300 truncate max-w-[150px]">
              {activeWorkout.workoutTitle}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center text-zinc-300 font-mono bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
              <Clock className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              <span>{formatTime(elapsedSec)}</span>
              <span className="text-zinc-500 mx-1">/</span>
              <span className="text-zinc-400">~{estimatedRemainingMin}m left</span>
            </div>

            <button
              onClick={() => setShowQueueModal(true)}
              className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100"
              title="View Exercise Queue"
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress meter */}
        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-400 h-full transition-all duration-300"
            style={{ width: `${sessionProgressPct}%` }}
          />
        </div>

        {/* Schedule crunch auto-warning */}
        {isBehindSchedule && (
          <div className="mt-2 bg-amber-950/40 border border-amber-500/40 rounded-lg p-2 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Behind schedule ({elapsedMin}m elapsed). Preserve power & compounds.</span>
            </div>
            <button
              onClick={() => setShowCrunchModal(true)}
              className="bg-amber-500 text-zinc-950 font-semibold px-2 py-0.5 rounded text-[11px] hover:bg-amber-400 shrink-0"
            >
              Trim
            </button>
          </div>
        )}
      </div>

      {/* Main Single Exercise View */}
      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-4">
        {currentItem && (
          <>
            {/* Step Navigation Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateExercise(currentIdx - 1)}
                disabled={currentIdx === 0}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center">
                <span className="text-[11px] font-mono tracking-wider uppercase text-emerald-400 font-semibold">
                  Exercise {currentIdx + 1} of {activeWorkout.exercises.length}
                </span>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {currentItem.tier.replace(/_/g, ' ')}
                  </span>
                  {exerciseDef && (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {exerciseDef.primaryPlane}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => navigateExercise(currentIdx + 1)}
                disabled={currentIdx === activeWorkout.exercises.length - 1}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Exercise Title & Key Target */}
            <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
                    {currentItem.exerciseName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-emerald-400 font-semibold">
                      {currentItem.prescribedSets.length} Sets ×{' '}
                      {targetSet?.targetReps
                        ? `${targetSet.targetReps} reps`
                        : targetSet?.targetRepsRange
                        ? `${targetSet.targetRepsRange[0]}–${targetSet.targetRepsRange[1]} reps`
                        : targetSet?.targetDurationSec
                        ? `${targetSet.targetDurationSec}s`
                        : targetSet?.targetDistanceM
                        ? `${targetSet.targetDistanceM}m`
                        : 'Hold'}
                    </span>
                    {targetSet?.targetWeightKg !== undefined && targetSet.targetWeightKg > 0 && (
                      <span className="text-xs font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                        {targetSet.targetWeightKg} kg target
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setShowSwapModal(true)}
                  className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700/80 px-2.5 py-1 rounded-lg bg-zinc-800/80"
                >
                  Swap
                </button>
              </div>

              {/* Biomechanical Wireframe Diagram */}
              <div className="mt-3">
                <ExerciseIllustration exerciseId={currentItem.exerciseId} />
              </div>

              {/* Power Quality Alert if explosive */}
              {exerciseDef?.contraction === 'explosive' && (
                <div className="mt-3 bg-amber-950/30 border border-amber-500/30 rounded-lg px-3 py-1.5 flex items-center space-x-2 text-xs text-amber-200">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-medium">
                    Stop the set immediately when velocity, jump height, or landing quality drops!
                  </span>
                </div>
              )}

              {/* Concise Technique Cues & Mistake to Avoid */}
              {exerciseDef && (
                <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-2">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase font-mono tracking-wider text-zinc-400 font-semibold">
                      Key Technique Cues:
                    </p>
                    <ul className="text-xs text-zinc-200 space-y-1">
                      {exerciseDef.cues.map((cue, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-emerald-400 font-bold shrink-0">•</span>
                          <span>{cue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {exerciseDef.mistakesToAvoid.length > 0 && (
                    <div className="text-xs text-rose-300/90 bg-rose-950/20 border border-rose-900/40 rounded-lg p-2">
                      <span className="font-semibold text-rose-300">Avoid: </span>
                      {exerciseDef.mistakesToAvoid.join('; ')}
                    </div>
                  )}

                  {exerciseDef.tempo && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400 font-mono">
                      <span className="text-zinc-500">Tempo:</span>
                      <span className="text-zinc-300 bg-zinc-800/70 px-1.5 py-0.5 rounded">
                        {exerciseDef.tempo}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Last Session Comparison */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 text-xs">
                {lastResult ? (
                  <div className="bg-zinc-950/80 rounded-lg p-2 border border-zinc-800 text-zinc-300 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-zinc-500 block">
                        Last Session ({lastResult.date})
                      </span>
                      <span className="font-mono text-emerald-400">
                        {lastResult.sets.map(s => `${s.actualWeightKg ? `${s.actualWeightKg}kg×` : ''}${s.actualReps || `${s.actualDurationSec}s`}`).join(', ')}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono bg-zinc-900 px-1.5 py-0.5 rounded">
                      RPE ~{(lastResult.sets.reduce((a, b) => a + b.actualRpe, 0) / lastResult.sets.length).toFixed(1)}
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-zinc-500 italic">
                    First logged session for this movement. Establish baseline with conservative RPE 7.
                  </div>
                )}
              </div>
            </div>

            {/* Set Progression Strip */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold px-1">
                Sets Progress ({currentItem.performedSets.length} / {currentItem.prescribedSets.length})
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {currentItem.prescribedSets.map(pSet => {
                  const performed = currentItem.performedSets.find(s => s.setNumber === pSet.setNumber);
                  const isCurrent = currentSetNumber === pSet.setNumber;

                  return (
                    <div
                      key={pSet.setNumber}
                      className={`p-2 rounded-xl text-center border transition ${
                        performed
                          ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                          : isCurrent
                          ? 'bg-zinc-800 border-zinc-500 text-zinc-100 ring-2 ring-emerald-500/40'
                          : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-mono font-bold">
                        Set {pSet.setNumber}
                      </div>
                      <div className="text-xs font-mono mt-0.5 font-semibold">
                        {performed ? (
                          <span>
                            {performed.actualWeightKg ? `${performed.actualWeightKg}k • ` : ''}
                            {performed.actualReps ? `${performed.actualReps}r` : `${performed.actualDurationSec}s`}
                          </span>
                        ) : (
                          <span>
                            {pSet.targetWeightKg ? `${pSet.targetWeightKg}k • ` : ''}
                            {pSet.targetReps || pSet.targetRepsRange?.[0] || `${pSet.targetDurationSec}s`}
                          </span>
                        )}
                      </div>
                      {performed && (
                        <div className="text-[10px] text-emerald-400/80 font-mono">
                          @ {performed.actualRpe}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Set Logger Inputs (Large, mobile-friendly controls) */}
            {currentSetNumber <= currentItem.prescribedSets.length && (
              <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="text-sm font-semibold text-zinc-200">
                    Logging Set {currentSetNumber} of {currentItem.prescribedSets.length}
                  </div>
                  <div className="text-xs text-emerald-400 font-mono">
                    Target RPE: {targetSet?.targetRpe || '7.5'}
                  </div>
                </div>

                {/* Weight and Reps Row */}
                <div className="grid grid-cols-2 gap-3">
                  {exerciseDef?.loadType !== 'duration_sec' && exerciseDef?.loadType !== 'bodyweight' && (
                    <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                      <span className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                        Weight (kg)
                      </span>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setInputWeight(prev => Math.max(0, prev - 2.5))}
                          className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold active:scale-95"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          step="0.5"
                          value={inputWeight}
                          onChange={e => setInputWeight(parseFloat(e.target.value) || 0)}
                          className="w-16 bg-transparent text-center text-xl font-bold font-mono text-zinc-100 focus:outline-none"
                        />
                        <button
                          onClick={() => setInputWeight(prev => prev + 2.5)}
                          className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {exerciseDef?.loadType === 'duration_sec' ? (
                    <div className="col-span-2 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                      <span className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                        Hold Duration (sec)
                      </span>
                      <div className="flex items-center justify-between max-w-xs mx-auto">
                        <button
                          onClick={() => setInputDuration(prev => Math.max(5, prev - 5))}
                          className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold active:scale-95"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-2xl font-bold font-mono text-zinc-100">
                          {inputDuration}s
                        </span>
                        <button
                          onClick={() => setInputDuration(prev => prev + 5)}
                          className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                      <span className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                        Reps Completed
                      </span>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setInputReps(prev => Math.max(1, prev - 1))}
                          className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold active:scale-95"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={inputReps}
                          onChange={e => setInputReps(parseInt(e.target.value, 10) || 0)}
                          className="w-14 bg-transparent text-center text-xl font-bold font-mono text-zinc-100 focus:outline-none"
                        />
                        <button
                          onClick={() => setInputReps(prev => prev + 1)}
                          className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* RPE Selector Pills (6 to 10) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase">
                      Effort (RPE)
                    </span>
                    <span className="text-[11px] font-mono text-zinc-300">
                      {inputRpe <= 7 ? '3+ reps in tank (Easy)' : inputRpe <= 8 ? '2 reps in tank (Ideal Target)' : inputRpe <= 9 ? '1 rep in tank (Hard)' : 'Max effort (Grind)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map(val => (
                      <button
                        key={val}
                        onClick={() => setInputRpe(val)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition shrink-0 ${
                          inputRpe === val
                            ? 'bg-emerald-500 text-zinc-950'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary 1-Tap Log Set Action Button */}
                <button
                  onClick={handleLogSet}
                  className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold rounded-xl text-base flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/40 active:scale-[0.99] transition"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Log Set {currentSetNumber} & Start Rest</span>
                </button>
              </div>
            )}

            {/* Exercise Finished / Next Exercise Advance Button */}
            {currentSetNumber > currentItem.prescribedSets.length && (
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-emerald-300">
                  {currentItem.exerciseName} Complete!
                </h3>
                <p className="text-xs text-zinc-300">
                  All {currentItem.prescribedSets.length} sets logged successfully.
                </p>

                {currentIdx < activeWorkout.exercises.length - 1 ? (
                  <button
                    onClick={() => navigateExercise(currentIdx + 1)}
                    className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition"
                  >
                    <span>Next: {activeWorkout.exercises[currentIdx + 1]?.exerciseName}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onFinish}
                    className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold rounded-xl text-base flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/40 transition"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Complete & Review Workout</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Rest Timer Widget (Auto-appears during active rest) */}
      {restRemaining !== null && (
        <div className="fixed bottom-20 left-4 right-4 z-40 max-w-lg mx-auto bg-zinc-900 border border-emerald-500/50 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl flex items-center justify-between animate-in slide-in-from-bottom">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
              <Clock className="w-5 h-5 animate-spin duration-3000" />
            </div>
            <div>
              <div className="text-[11px] uppercase font-mono text-zinc-400 font-medium">
                Rest Period
              </div>
              <div className="text-2xl font-bold font-mono text-zinc-100 tracking-tight">
                {formatTime(restRemaining)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setRestRemaining(prev => (prev ? prev + 30 : 30))}
              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono rounded-lg text-zinc-300 font-semibold"
            >
              +30s
            </button>
            <button
              onClick={() => {
                soundFx.enabled = !soundEnabled;
                setSoundEnabled(!soundEnabled);
              }}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400"
              title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setRestRemaining(null)}
              className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-xs font-bold rounded-lg text-zinc-200"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Strip */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/80 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+8px)]">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => setShowCrunchModal(true)}
            className="flex-1 py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Time Budget</span>
          </button>

          <button
            onClick={() => {
              if (currentItem) {
                skipExercise(currentIdx, 'User skipped');
                if (currentIdx < activeWorkout.exercises.length - 1) {
                  navigateExercise(currentIdx + 1);
                }
              }
            }}
            className="flex-1 py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-semibold"
          >
            Skip Exercise
          </button>

          <button
            onClick={onFinish}
            className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-bold shadow transition"
          >
            Finish Workout
          </button>
        </div>
      </div>

      {/* Exercise Queue Modal */}
      {showQueueModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100">Workout Exercise Queue</h3>
              <button
                onClick={() => setShowQueueModal(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200 p-1"
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {activeWorkout.exercises.map((item, idx) => {
                const isComplete = item.performedSets.length >= item.prescribedSets.length;
                const isCurrent = idx === currentIdx;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      navigateExercise(idx);
                      setShowQueueModal(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                      isCurrent
                        ? 'bg-zinc-800 border-emerald-500/60 ring-1 ring-emerald-500'
                        : isComplete
                        ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
                        : item.isSkipped
                        ? 'bg-zinc-950/40 border-zinc-900 line-through text-zinc-600'
                        : 'bg-zinc-950 border-zinc-800/80 text-zinc-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">
                        {idx + 1}. {item.exerciseName}
                      </div>
                      <div className="text-[10px] uppercase font-mono text-zinc-400">
                        {item.tier.replace(/_/g, ' ')} • {item.performedSets.length}/{item.prescribedSets.length} sets
                      </div>
                    </div>
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : item.isSkipped ? (
                      <span className="text-[10px] text-zinc-500">Skipped</span>
                    ) : (
                      <span className="text-xs text-zinc-400">Jump</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Equipment Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-4 space-y-3">
            <h3 className="text-sm font-bold text-zinc-100">Swap Exercise Equipment</h3>
            <p className="text-xs text-zinc-400">
              Select an approved biomechanical equivalent to continue your session without breaking program integrity:
            </p>

            <div className="space-y-2 pt-2">
              {exerciseDef?.alternativeExerciseIds && exerciseDef.alternativeExerciseIds.length > 0 ? (
                exerciseDef.alternativeExerciseIds.map(altId => {
                  const altDef = EXERCISE_LIBRARY[altId] || { name: altId.replace(/_/g, ' ') };
                  return (
                    <button
                      key={altId}
                      onClick={() => {
                        swapExercise(currentIdx, altId);
                        setShowSwapModal(false);
                      }}
                      className="w-full p-3 bg-zinc-950 hover:bg-zinc-800 rounded-xl border border-zinc-800 text-left flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-zinc-200 block">{altDef.name}</span>
                        <span className="text-[10px] text-zinc-400 uppercase font-mono">
                          {'equipment' in altDef && altDef.equipment ? altDef.equipment : 'Alternative'}
                        </span>
                      </div>
                      <span className="text-emerald-400 font-semibold">Select</span>
                    </button>
                  );
                })
              ) : (
                <div className="text-xs text-zinc-400 p-2 bg-zinc-950 rounded-lg">
                  No preset swap required. You can adjust load or use dumbbells as direct substitutions.
                </div>
              )}
            </div>

            <button
              onClick={() => setShowSwapModal(false)}
              className="w-full py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Time Crunch Presets Modal */}
      {showCrunchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-zinc-100">Time Budget Adaptation</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Short on time? The system automatically prunes accessories according to the user hierarchy:
              <br />
              <span className="text-zinc-300 font-mono text-[11px] block mt-1">
                1. Power &rarr; 2. Primary Strength &rarr; 3. Movement &rarr; 4. Tissue &rarr; 5. Conditioning
              </span>
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2">
              {[45, 60, 75].map(min => (
                <button
                  key={min}
                  onClick={() => {
                    // Filter down exercises
                    const updated = [...activeWorkout.exercises];
                    if (min <= 50) {
                      // Omit conditioning & last sets of tissue
                      updated.forEach(item => {
                        if (item.tier === 'conditioning') item.isSkipped = true;
                        if (item.tier === 'structural_tissue') item.prescribedSets = item.prescribedSets.slice(0, 2);
                      });
                    } else if (min <= 65) {
                      updated.forEach(item => {
                        if (item.tier === 'conditioning') item.isSkipped = true;
                      });
                    }
                    updateActiveWorkout({
                      ...activeWorkout,
                      timeBudgetMin: min,
                      exercises: updated
                    });
                    setShowCrunchModal(false);
                  }}
                  className="py-3 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-center"
                >
                  <span className="text-base font-bold font-mono text-emerald-400 block">{min}m</span>
                  <span className="text-[10px] text-zinc-400">Streamlined</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCrunchModal(false)}
              className="w-full py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold"
            >
              Keep Full Session (~{activeWorkout.estimatedDurationMin}m)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
