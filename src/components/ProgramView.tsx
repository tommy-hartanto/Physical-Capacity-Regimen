import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  Dumbbell,
  Clock,
  ArrowUpDown,
  Search,
  CheckCircle2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { useTraining } from '../context/TrainingContext';
import { DayOfWeek, WorkoutType } from '../types/training';
import { WORKOUT_TEMPLATES } from '../data/defaultProgram';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const ProgramView: React.FC = () => {
  const { userProfile, updateSchedule, setGymDaysPerWeek, startWorkout } = useTraining();
  const [activeTab, setActiveTab] = useState<'schedule' | 'phases' | 'library'>('schedule');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  // Day editor modal / dropdown
  const [editingDay, setEditingDay] = useState<DayOfWeek | null>(null);

  const handleSetWorkoutForDay = (day: DayOfWeek, type: WorkoutType) => {
    const updated = { ...userProfile.schedule, [day]: type };
    updateSchedule(updated);
    setEditingDay(null);
  };

  const filteredExercises = Object.values(EXERCISE_LIBRARY).filter(ex => {
    const query = searchQuery.toLowerCase();
    return (
      ex.name.toLowerCase().includes(query) ||
      ex.category.toLowerCase().includes(query) ||
      ex.targetMuscles.some(m => m.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* Tab Switcher */}
      <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'schedule'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Weekly Schedule
        </button>
        <button
          onClick={() => setActiveTab('phases')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'phases'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Phase Roadmap
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'library'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Exercise Library
        </button>
      </div>

      {/* TAB 1: WEEKLY SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          {/* 3-day vs 4-day gym capacity selector */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase font-mono text-zinc-200">
                  Gym Frequency Rule
                </h3>
                <p className="text-[11px] text-zinc-400">
                  If only 3 gym sessions available, app cleanly uses Mon, Tue, Thu without cramming.
                </p>
              </div>

              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0">
                <button
                  onClick={() => setGymDaysPerWeek(3)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    userProfile.availableGymDaysPerWeek === 3
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'text-zinc-400'
                  }`}
                >
                  3 Days
                </button>
                <button
                  onClick={() => setGymDaysPerWeek(4)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    userProfile.availableGymDaysPerWeek === 4
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'text-zinc-400'
                  }`}
                >
                  4 Days
                </button>
              </div>
            </div>
          </div>

          {/* 7-Day Interactive List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono uppercase text-zinc-400 font-semibold">
                Scheduled Days (Tap to Swap or Move)
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Drag-free 1-tap reassign</span>
            </div>

            {DAYS.map(day => {
              const workoutType = userProfile.schedule[day];
              const template = WORKOUT_TEMPLATES[workoutType];
              const isRest = workoutType === 'rest';
              const isEditing = editingDay === day;

              return (
                <div
                  key={day}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl overflow-hidden transition"
                >
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-mono text-xs font-bold text-zinc-300 uppercase">
                        {day.slice(0, 3)}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-zinc-200 capitalize">
                          {day}
                        </div>
                        <div className="text-[11px] font-mono text-emerald-400">
                          {template ? template.title : workoutType}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {isRest ? 'Rest' : `~${template?.estimatedMinutes}m`}
                      </span>
                      <button
                        onClick={() => setEditingDay(isEditing ? null : day)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-semibold"
                      >
                        {isEditing ? 'Cancel' : 'Change'}
                      </button>
                    </div>
                  </div>

                  {/* Inline Reassignment Dropdown */}
                  {isEditing && (
                    <div className="p-3 bg-zinc-950 border-t border-zinc-800 space-y-1.5 animate-in fade-in">
                      <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                        Reassign {day} to:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => handleSetWorkoutForDay(day, 'lower_power')}
                          className="p-2 text-left bg-zinc-900 hover:bg-zinc-850 rounded-xl border border-zinc-800 text-xs font-medium text-zinc-200"
                        >
                          Lower Strength + Power
                        </button>
                        <button
                          onClick={() => handleSetWorkoutForDay(day, 'upper_posture')}
                          className="p-2 text-left bg-zinc-900 hover:bg-zinc-850 rounded-xl border border-zinc-800 text-xs font-medium text-zinc-200"
                        >
                          Upper Strength + Posture
                        </button>
                        <button
                          onClick={() => handleSetWorkoutForDay(day, 'swim')}
                          className="p-2 text-left bg-zinc-900 hover:bg-zinc-850 rounded-xl border border-zinc-800 text-xs font-medium text-cyan-300"
                        >
                          Swimming
                        </button>
                        <button
                          onClick={() => handleSetWorkoutForDay(day, 'full_body_athletic')}
                          className="p-2 text-left bg-zinc-900 hover:bg-zinc-850 rounded-xl border border-zinc-800 text-xs font-medium text-zinc-200"
                        >
                          Full Body Athletic
                        </button>
                        <button
                          onClick={() => handleSetWorkoutForDay(day, 'run')}
                          className="p-2 text-left bg-zinc-900 hover:bg-zinc-850 rounded-xl border border-zinc-800 text-xs font-medium text-emerald-300"
                        >
                          Running
                        </button>
                        <button
                          onClick={() => handleSetWorkoutForDay(day, 'rest')}
                          className="p-2 text-left bg-zinc-900 hover:bg-zinc-850 rounded-xl border border-zinc-800 text-xs font-medium text-zinc-400"
                        >
                          Rest & Recovery
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PHASE ROADMAP */}
      {activeTab === 'phases' && (
        <div className="space-y-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase font-mono text-zinc-300">
              8–12 Week Macrocycle Architecture
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Program preserves all physical qualities in every block. Only the dosage, rep emphasis, and volume ratios shift to induce adaptations without stalling.
            </p>
          </div>

          {/* Phase 1 */}
          <div className={`p-4 rounded-2xl border ${userProfile.currentPhase === 1 ? 'bg-zinc-900 border-emerald-500/60 ring-1 ring-emerald-500/40' : 'bg-zinc-950 border-zinc-800'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-emerald-400">
                Phase 1 (Current Block)
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                Weeks 1–8
              </span>
            </div>
            <h4 className="text-sm font-bold text-zinc-100 mt-1">
              Aerobic Base & End-Range Mobility Emphasis
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Conservative compound strength baseline (Squat 60kg, Deadlift 65kg, Bench 50kg). Strict double-progression, 30–40 min conversational runs, continuous easy swimming, and adductor/Achilles tissue resilience.
            </p>
          </div>

          {/* Phase 2 */}
          <div className={`p-4 rounded-2xl border ${userProfile.currentPhase === 2 ? 'bg-zinc-900 border-emerald-500/60 ring-1 ring-emerald-500/40' : 'bg-zinc-950 border-zinc-800'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-zinc-400">
                Phase 2
              </span>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">
                Weeks 9–16
              </span>
            </div>
            <h4 className="text-sm font-bold text-zinc-200 mt-1">
              Strength & Power Intensity
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Main compound loads scale upward. Power throws and bounds transition into higher velocity intent. Introduction of 4 × 3 min moderately hard running intervals.
            </p>
          </div>

          {/* Phase 3 */}
          <div className={`p-4 rounded-2xl border ${userProfile.currentPhase === 3 ? 'bg-zinc-900 border-emerald-500/60 ring-1 ring-emerald-500/40' : 'bg-zinc-950 border-zinc-800'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-zinc-400">
                Phase 3
              </span>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">
                Weeks 17–24
              </span>
            </div>
            <h4 className="text-sm font-bold text-zinc-200 mt-1">
              Athletic Capacity & Multi-Planar Mastery
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Peak multi-directional speed, full dragon flag progression, 5K performance pacing, and swim interval repeats. End-of-block test battery before reassessment.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: EXERCISE LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search exercise, muscle, or movement pattern..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            {filteredExercises.map(ex => {
              const isExpanded = expandedExerciseId === ex.id;
              const currentTargetKg = userProfile.activeLoadTargets[ex.id];

              return (
                <div
                  key={ex.id}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                    className="w-full p-3.5 flex items-center justify-between text-left"
                  >
                    <div>
                      <div className="text-xs font-bold text-zinc-100">{ex.name}</div>
                      <div className="text-[10px] uppercase font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span>{ex.category.replace(/_/g, ' ')}</span>
                        <span>•</span>
                        <span>{ex.primaryPlane}</span>
                        {currentTargetKg !== undefined && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">{currentTargetKg} kg</span>
                          </>
                        )}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                  </button>

                  {isExpanded && (
                    <div className="p-3.5 bg-zinc-950 border-t border-zinc-800/80 space-y-2.5 text-xs text-zinc-300 animate-in fade-in">
                      <p className="text-zinc-400 leading-relaxed text-[11px]">
                        {ex.explanation}
                      </p>

                      <div>
                        <span className="text-[10px] uppercase font-mono text-zinc-400 font-semibold block mb-1">
                          Technique Cues:
                        </span>
                        <ul className="space-y-1">
                          {ex.cues.map((c, i) => (
                            <li key={i} className="flex items-start space-x-1.5 text-[11px] text-zinc-200">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {ex.mistakesToAvoid.length > 0 && (
                        <div className="text-[11px] text-rose-300 bg-rose-950/20 border border-rose-900/40 p-2 rounded-lg">
                          <span className="font-semibold">Avoid: </span>
                          {ex.mistakesToAvoid.join('; ')}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 text-[10px] font-mono text-zinc-400 pt-1">
                        <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          Contraction: {ex.contraction.replace(/_/g, ' ')}
                        </span>
                        <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          Rest: {ex.defaultRestSec}s
                        </span>
                        {ex.tempo && (
                          <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                            Tempo: {ex.tempo}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
