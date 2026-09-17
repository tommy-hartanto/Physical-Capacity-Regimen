import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Heart,
  Waves,
  Flame,
  Award,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useTraining } from '../context/TrainingContext';

interface DashboardViewProps {
  onStartAssessment: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onStartAssessment }) => {
  const { userProfile, workoutLogs, cardioLogs, assessments } = useTraining();
  const [metricTab, setMetricTab] = useState<'strength' | 'conditioning' | 'power_mobility'>('strength');

  // Compute training consistency
  const totalGymSessions = workoutLogs.length;
  const totalCardioSessions = cardioLogs.length;
  const avgSessionRpe = workoutLogs.length > 0
    ? (workoutLogs.reduce((acc, l) => acc + l.sessionRpe, 0) / workoutLogs.length).toFixed(1)
    : '7.5';

  // Extract strength progression points for Squat, Deadlift, Bench, Pull-up
  const squatLogs = workoutLogs
    .map(log => {
      const match = log.exercises.find(e => e.exerciseId === 'back_squat');
      if (match && match.sets.length > 0) {
        const topWeight = Math.max(...match.sets.map(s => s.actualWeightKg || 0));
        return { date: log.date.slice(5), weight: topWeight || userProfile.activeLoadTargets['back_squat'] };
      }
      return null;
    })
    .filter(Boolean)
    .slice(-6);

  const benchLogs = workoutLogs
    .map(log => {
      const match = log.exercises.find(e => e.exerciseId === 'bench_press');
      if (match && match.sets.length > 0) {
        const topWeight = Math.max(...match.sets.map(s => s.actualWeightKg || 0));
        return { date: log.date.slice(5), weight: topWeight || userProfile.activeLoadTargets['bench_press'] };
      }
      return null;
    })
    .filter(Boolean)
    .slice(-6);

  const deadliftLogs = workoutLogs
    .map(log => {
      const match = log.exercises.find(e => e.exerciseId === 'deadlift');
      if (match && match.sets.length > 0) {
        const topWeight = Math.max(...match.sets.map(s => s.actualWeightKg || 0));
        return { date: log.date.slice(5), weight: topWeight || userProfile.activeLoadTargets['deadlift'] };
      }
      return null;
    })
    .filter(Boolean)
    .slice(-6);

  // Latest assessment benchmarks
  const latestAssessment = assessments[0];

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* Top Physical Capacity Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
              Long-Term Trajectory
            </span>
            <h2 className="text-xl font-black text-zinc-100">Physical Capacity Dashboard</h2>
          </div>
          <button
            onClick={onStartAssessment}
            className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Test Battery</span>
          </button>
        </div>

        {/* Consistency Summary Strip */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80">
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-center">
            <span className="text-[10px] font-mono text-zinc-400 block">Gym Logs</span>
            <span className="text-lg font-bold font-mono text-zinc-100">{totalGymSessions}</span>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-center">
            <span className="text-[10px] font-mono text-zinc-400 block">Cardio Logs</span>
            <span className="text-lg font-bold font-mono text-zinc-100">{totalCardioSessions}</span>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-center">
            <span className="text-[10px] font-mono text-zinc-400 block">Average RPE</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{avgSessionRpe}</span>
          </div>
        </div>

        {/* Adaptive Deload Status */}
        <div className="bg-zinc-950 rounded-2xl p-3 border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-zinc-200">Adaptive Deload Engine</div>
            <div className="text-[11px] text-zinc-400">
              {userProfile.deloadSuggested
                ? 'Deload active to preserve joint integrity'
                : `Week ${userProfile.currentWeekNumber} of block • Fatigue managed`}
            </div>
          </div>
          <span
            className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full font-bold border ${
              userProfile.deloadSuggested
                ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-400'
            }`}
          >
            {userProfile.deloadSuggested ? 'Deload Due' : 'Optimal'}
          </span>
        </div>
      </div>

      {/* Metric Category Tabs */}
      <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800 text-xs font-semibold">
        <button
          onClick={() => setMetricTab('strength')}
          className={`flex-1 py-2 rounded-xl transition ${
            metricTab === 'strength'
              ? 'bg-zinc-800 text-zinc-100 shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Compound Strength
        </button>
        <button
          onClick={() => setMetricTab('conditioning')}
          className={`flex-1 py-2 rounded-xl transition ${
            metricTab === 'conditioning'
              ? 'bg-zinc-800 text-zinc-100 shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Running & Swimming
        </button>
        <button
          onClick={() => setMetricTab('power_mobility')}
          className={`flex-1 py-2 rounded-xl transition ${
            metricTab === 'power_mobility'
              ? 'bg-zinc-800 text-zinc-100 shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Power & Mobility
        </button>
      </div>

      {/* TAB 1: COMPOUND STRENGTH */}
      {metricTab === 'strength' && (
        <div className="space-y-3">
          {/* Key Lift Benchmark Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400">Back Squat (Working Target)</span>
              <div className="text-xl font-bold font-mono text-zinc-100">
                {userProfile.activeLoadTargets['back_squat'] || 60} <span className="text-xs text-zinc-400 font-sans">kg</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 block">
                Prescribed 4 × 5–6 @ RPE 7.5
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400">Bench Press (Working Target)</span>
              <div className="text-xl font-bold font-mono text-zinc-100">
                {userProfile.activeLoadTargets['bench_press'] || 50} <span className="text-xs text-zinc-400 font-sans">kg</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 block">
                Prescribed 4 × 5–6 @ RPE 7.5
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400">Deadlift (Working Target)</span>
              <div className="text-xl font-bold font-mono text-zinc-100">
                {userProfile.activeLoadTargets['deadlift'] || 65} <span className="text-xs text-zinc-400 font-sans">kg</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 block">
                Prescribed 3 × 5 @ RPE 7.5
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400">Weighted Pull-Up</span>
              <div className="text-xl font-bold font-mono text-zinc-100">
                +{userProfile.activeLoadTargets['weighted_pull_up'] || 5} <span className="text-xs text-zinc-400 font-sans">kg</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 block">
                Prescribed 4 × 5–6 @ RPE 7.5
              </span>
            </div>
          </div>

          {/* Clean Vector SVG Progression Trend Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase font-mono text-zinc-300">
                Compound Progression (Double-Progression Curve)
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">Conservative Overload</span>
            </div>

            <div className="h-44 w-full pt-4">
              <svg viewBox="0 0 320 120" className="w-full h-full overflow-visible">
                {/* Horizontal Grid lines */}
                <line x1="0" y1="20" x2="320" y2="20" className="stroke-zinc-800" strokeDasharray="3,3" />
                <line x1="0" y1="60" x2="320" y2="60" className="stroke-zinc-800" strokeDasharray="3,3" />
                <line x1="0" y1="100" x2="320" y2="100" className="stroke-zinc-800" strokeDasharray="3,3" />

                {/* Squat line (Emerald) */}
                <path
                  d="M 20 80 Q 80 75, 140 68 T 260 55 T 300 50"
                  fill="none"
                  className="stroke-emerald-400"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="300" cy="50" r="4" className="fill-emerald-400" />

                {/* Deadlift line (Cyan) */}
                <path
                  d="M 20 65 Q 80 60, 140 52 T 260 42 T 300 38"
                  fill="none"
                  className="stroke-cyan-400"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="300" cy="38" r="4" className="fill-cyan-400" />

                {/* Bench line (Amber) */}
                <path
                  d="M 20 95 Q 80 92, 140 88 T 260 78 T 300 74"
                  fill="none"
                  className="stroke-amber-400"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="300" cy="74" r="4" className="fill-amber-400" />
              </svg>
            </div>

            <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Deadlift
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Back Squat
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Bench Press
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONDITIONING */}
      {metricTab === 'conditioning' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Running */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Flame className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase">Running Engine</span>
              </div>
              <div className="text-xl font-bold font-mono text-zinc-100">
                5:45 <span className="text-xs text-zinc-400 font-sans">/km easy pace</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Baseline 5K: ~28:30 (5:42/km). Focus is aerobic base extension, not weekly tests.
              </p>
            </div>

            {/* Swimming */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Waves className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase">Weekly Swim</span>
              </div>
              <div className="text-xl font-bold font-mono text-zinc-100">
                1,400 <span className="text-xs text-zinc-400 font-sans">m avg</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Rhythmic continuous aerobic conditioning. Bilateral breathing drills.
              </p>
            </div>
          </div>

          {/* Recent Cardio Log History */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase font-mono text-zinc-300">
              Recent Endurance Sessions
            </h3>
            <div className="space-y-2">
              {cardioLogs.slice(0, 4).map(log => (
                <div
                  key={log.id}
                  className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    {log.type === 'swim' ? (
                      <Waves className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Flame className="w-4 h-4 text-emerald-400" />
                    )}
                    <div>
                      <div className="font-semibold text-zinc-200">{log.title}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {log.date} • {log.durationMinutes} min • RPE {log.rpe}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs text-emerald-400 font-semibold">
                    {log.distanceKm ? `${log.distanceKm} km` : log.distanceMeters ? `${log.distanceMeters} m` : ''}
                    {log.averagePace && (
                      <div className="text-[10px] text-zinc-500">{log.averagePace}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: POWER & MOBILITY */}
      {metricTab === 'power_mobility' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400">Broad Jump Benchmark</span>
              <div className="text-xl font-bold font-mono text-zinc-100">
                {latestAssessment?.broadJumpCm || 215} <span className="text-xs text-zinc-400 font-sans">cm</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Horizontal Power RFD</span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400">Dragon Flag Tier</span>
              <div className="text-sm font-bold font-mono text-zinc-100 capitalize">
                {latestAssessment?.dragonFlagLevel.replace(/_/g, ' ') || 'Tuck Eccentric'}
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Hollow Body Core</span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase font-mono text-zinc-300">
              Mobility & Connective Tissue Checkpoints
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-200">Ankle Dorsiflexion (Knee to Wall)</div>
                  <div className="text-[10px] text-zinc-400">12cm knee past toe with grounded heel</div>
                </div>
                <span className="text-emerald-400 font-mono font-bold">Passed</span>
              </div>

              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-200">90/90 Hip Internal Rotation</div>
                  <div className="text-[10px] text-zinc-400">Smooth transition without pelvic tilt</div>
                </div>
                <span className="text-emerald-400 font-mono font-bold">Active</span>
              </div>

              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-200">Deep Cossack Squat Mobility</div>
                  <div className="text-[10px] text-zinc-400">Full frontal plane depth on both sides</div>
                </div>
                <span className="text-emerald-400 font-mono font-bold">Good</span>
              </div>

              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-200">Copenhagen Adductor Endurance</div>
                  <div className="text-[10px] text-zinc-400">30s hold per side without pelvic sag</div>
                </div>
                <span className="text-emerald-400 font-mono font-bold">Solid</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
