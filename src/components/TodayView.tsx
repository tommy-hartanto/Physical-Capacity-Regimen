import React, { useState } from 'react';
import {
  Play,
  Clock,
  Calendar,
  Sparkles,
  AlertTriangle,
  Waves,
  Flame,
  Moon,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  Info
} from 'lucide-react';
import { useTraining } from '../context/TrainingContext';
import { WORKOUT_TEMPLATES } from '../data/defaultProgram';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';
import { WorkoutType } from '../types/training';

interface TodayViewProps {
  onStartWorkout: (type?: WorkoutType, timeBudgetMin?: number) => void;
  onOpenCardioLogger: (type: 'run' | 'swim') => void;
  onViewProgram: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  onStartWorkout,
  onOpenCardioLogger,
  onViewProgram
}) => {
  const {
    userProfile,
    currentDayOfWeek,
    workoutLogs,
    cardioLogs,
    startWorkout,
    activeWorkout
  } = useTraining();

  const todayType = userProfile.schedule[currentDayOfWeek];
  const template = WORKOUT_TEMPLATES[todayType];
  const isRest = todayType === 'rest';
  const isCardio = todayType === 'swim' || todayType === 'run';

  // Time budget selector state (default is full session)
  const [selectedBudget, setSelectedBudget] = useState<number>(template?.estimatedMinutes || 75);
  const [showBudgetOptions, setShowBudgetOptions] = useState<boolean>(false);

  // Daily readiness check
  const [readinessEnergy, setReadinessEnergy] = useState<number>(4);
  const [readinessSoreness, setReadinessSoreness] = useState<number>(1);
  const [readinessChecked, setReadinessChecked] = useState<boolean>(false);

  // Last session of the same type
  const lastSession = workoutLogs.find(l => l.workoutType === todayType);

  // Check if today was already completed today
  const todayDateStr = new Date().toISOString().split('T')[0];
  const alreadyCompletedToday = workoutLogs.some(l => l.date === todayDateStr) || cardioLogs.some(l => l.date === todayDateStr);

  const getDayFormatted = () => {
    return currentDayOfWeek.charAt(0).toUpperCase() + currentDayOfWeek.slice(1);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* Context-Aware Day & Deload Banner */}
      {userProfile.deloadSuggested && (
        <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-3.5 flex items-start space-x-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-amber-300 block">
              Adaptive Deload Recommended
            </span>
            <p className="text-zinc-300 leading-relaxed">
              4+ weeks of progressive overload completed with high exertion markers. Volume is automatically reduced ~30% today to restore tendon elasticity and lock in neuromuscular gains.
            </p>
          </div>
        </div>
      )}

      {/* Active Workout Resume Card (if user closed browser mid-workout) */}
      {activeWorkout && (
        <div className="bg-emerald-950/40 border border-emerald-500/60 rounded-2xl p-4 flex items-center justify-between shadow-lg ring-1 ring-emerald-500/30 animate-pulse">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] uppercase font-mono font-bold text-emerald-400">
                Session In Progress
              </span>
            </div>
            <h3 className="text-sm font-bold text-zinc-100 mt-1">
              {activeWorkout.workoutTitle}
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Exercise {activeWorkout.currentExerciseIndex + 1} of {activeWorkout.exercises.length}
            </p>
          </div>
          <button
            onClick={() => onStartWorkout()}
            className="bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-zinc-950" />
            <span>Resume</span>
          </button>
        </div>
      )}

      {/* Immediate Answer: "Today: Lower Strength + Power" */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {getDayFormatted()} Focus
          </span>
          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-full border border-zinc-800">
            Phase {userProfile.currentPhase}: Base & Mobility
          </span>
        </div>

        <h2 className="text-2xl font-black text-zinc-100 tracking-tight">
          {template ? template.title : 'Scheduled Training'}
        </h2>

        <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
          {template?.shortDescription}
        </p>

        {/* Workout Attributes Pill Strip */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-zinc-800/80">
          <div className="flex items-center space-x-1 text-xs font-mono text-zinc-300 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>~{selectedBudget} min planned</span>
          </div>

          <div className="flex items-center space-x-1 text-xs font-mono text-zinc-300 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target RPE 7–8</span>
          </div>

          {!isRest && !isCardio && (
            <button
              onClick={() => setShowBudgetOptions(!showBudgetOptions)}
              className="flex items-center space-x-1 text-xs font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 transition"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Time Budget</span>
            </button>
          )}
        </div>

        {/* Time Budget Customizer */}
        {showBudgetOptions && !isRest && !isCardio && (
          <div className="mt-3 p-3 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300">Adjust Session Duration</span>
              <span className="text-emerald-400 font-mono">{selectedBudget} min</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-tight">
              Shortening preserves: 1. Power &rarr; 2. Squat/Hinge/Press &rarr; 3. Movement patterns.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[45, 60, template?.estimatedMinutes || 75].map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBudget(b)}
                  className={`py-2 px-1 text-xs font-mono font-bold rounded-xl border transition ${
                    selectedBudget === b
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                  }`}
                >
                  {b} min
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Big Action Button */}
        <div className="mt-5">
          {isRest ? (
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 flex items-center space-x-3 text-zinc-300">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-400">
                <Moon className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-zinc-200">Rest & Recovery Day</div>
                <p className="text-zinc-400 text-[11px]">
                  Take a 20–30 min walk, hydrate, and prioritize sleep for connective tissue remodeling.
                </p>
              </div>
            </div>
          ) : todayType === 'swim' ? (
            <button
              onClick={() => onOpenCardioLogger('swim')}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded-2xl text-base flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/40 transition active:scale-[0.99]"
            >
              <Waves className="w-5 h-5" />
              <span>Log Swimming Session</span>
            </button>
          ) : todayType === 'run' ? (
            <button
              onClick={() => onOpenCardioLogger('run')}
              className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold rounded-2xl text-base flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/40 transition active:scale-[0.99]"
            >
              <Flame className="w-5 h-5" />
              <span>Log Aerobic Run</span>
            </button>
          ) : (
            <button
              onClick={() => onStartWorkout(todayType, selectedBudget)}
              className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold rounded-2xl text-base flex items-center justify-center space-x-2 shadow-xl shadow-emerald-950/50 transition active:scale-[0.99]"
            >
              <Play className="w-5 h-5 fill-zinc-950" />
              <span>Start Workout Now</span>
            </button>
          )}

          {alreadyCompletedToday && (
            <div className="mt-2 text-center text-xs text-emerald-400 font-medium flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>A session was already logged today! You can train again or edit logbook.</span>
            </div>
          )}
        </div>
      </div>

      {/* Pre-Session Readiness & Sleep Check */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase font-mono text-zinc-300">
              Pre-Session Readiness Check
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">Auto-calibrated</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">
              Energy & Sleep:
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(e => (
                <button
                  key={e}
                  onClick={() => { setReadinessEnergy(e); setReadinessChecked(true); }}
                  className={`flex-1 py-1 rounded text-xs font-mono font-bold transition ${
                    readinessEnergy === e
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">
              Joint Soreness:
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => { setReadinessSoreness(s); setReadinessChecked(true); }}
                  className={`flex-1 py-1 rounded text-xs font-mono font-bold transition ${
                    readinessSoreness === s
                      ? s >= 3 ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-200 text-zinc-950'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {readinessEnergy <= 2 && (
          <div className="text-[11px] text-amber-300 bg-amber-950/30 p-2 rounded-lg border border-amber-900/40">
            Low energy reported: Target conservative RPE 7 today. Keep movement crisp and do not push for new load jumps.
          </div>
        )}
      </div>

      {/* Exercise Order Preview (Answers "What am I doing today? In what order?") */}
      {template && template.exercises.length > 0 && (
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase font-mono text-zinc-300">
              Exercise Lineup ({template.exercises.length} movements)
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">Zero memorization</span>
          </div>

          <div className="space-y-2">
            {template.exercises.map((item, idx) => {
              const def = EXERCISE_LIBRARY[item.exerciseId];
              const targetKg = userProfile.activeLoadTargets[item.exerciseId];

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-900 text-zinc-400 flex items-center justify-center font-mono text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-zinc-200">
                        {def ? def.name : item.exerciseId}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono uppercase">
                        {def?.category.replace(/_/g, ' ')} • {item.targetSets} sets
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-emerald-400 font-semibold text-xs">
                      {targetKg !== undefined && targetKg > 0 ? `${targetKg} kg` : ''}
                      {item.targetReps ? ` ${item.targetReps} reps` : item.targetRepsRange ? ` ${item.targetRepsRange[0]}-${item.targetRepsRange[1]} reps` : item.targetDurationSec ? ` ${item.targetDurationSec}s` : ''}
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      Rest {item.defaultRestSec || def?.defaultRestSec}s
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Last Session Performance Card */}
      {lastSession && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase font-bold text-zinc-400">
              Last Time You Did This ({lastSession.date})
            </span>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded">
              {lastSession.durationMinutes} min • RPE {lastSession.sessionRpe}
            </span>
          </div>

          <div className="space-y-1 pt-1 text-xs">
            {lastSession.exercises.slice(0, 3).map((ex, i) => (
              <div key={i} className="flex items-center justify-between text-zinc-300">
                <span className="truncate pr-2">{ex.exerciseName}</span>
                <span className="font-mono text-emerald-400 shrink-0">
                  {ex.targetLoad ? `${ex.targetLoad}kg ` : ''}
                  ({ex.sets.map(s => s.actualReps || `${s.actualDurationSec}s`).join(', ')})
                </span>
              </div>
            ))}
          </div>

          {lastSession.summaryNotes && (
            <p className="text-[11px] text-zinc-400 italic pt-1 border-t border-zinc-800/60">
              &ldquo;{lastSession.summaryNotes}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Weekly Schedule Quick Bar */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-mono text-zinc-400 block">
            Weekly Schedule Configuration
          </span>
          <span className="text-xs font-bold text-zinc-200">
            {userProfile.availableGymDaysPerWeek}-Day Gym Engine + Swim + Run
          </span>
        </div>
        <button
          onClick={onViewProgram}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
        >
          <span>Manage</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
