import React, { useState } from 'react';
import { Award, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { useTraining } from '../context/TrainingContext';
import { PhysicalAssessmentRecord } from '../types/training';

interface AssessmentModalProps {
  onClose: () => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({ onClose }) => {
  const { saveAssessment, userProfile } = useTraining();

  const [broadJump, setBroadJump] = useState<string>('215');
  const [pullUps, setPullUps] = useState<string>('9');
  const [squatWeight, setSquatWeight] = useState<string>('70');
  const [benchWeight, setBenchWeight] = useState<string>('60');
  const [deadliftWeight, setDeadliftWeight] = useState<string>('80');
  const [fiveKmTime, setFiveKmTime] = useState<string>('28');
  const [swimDistance, setSwimDistance] = useState<string>('1200');
  const [dragonLevel, setDragonLevel] = useState<PhysicalAssessmentRecord['dragonFlagLevel']>('tuck_eccentric');
  const [anklePassed, setAnklePassed] = useState<boolean>(true);
  const [hipPassed, setHipPassed] = useState<boolean>(true);
  const [cossackPassed, setCossackPassed] = useState<boolean>(true);
  const [shoulderPassed, setShoulderPassed] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  const handleSave = () => {
    // Calculate mobility score 1-5
    const mobilityScore = [anklePassed, hipPassed, cossackPassed, shoulderPassed].filter(Boolean).length + 1;

    saveAssessment({
      date: new Date().toISOString().split('T')[0],
      phaseCompleted: userProfile.currentPhase,
      broadJumpCm: parseFloat(broadJump) || 215,
      maxBodyweightPullUps: parseInt(pullUps, 10) || 9,
      weightedPullUpKg: 5,
      squat5rmKg: parseFloat(squatWeight) || 70,
      bench5rmKg: parseFloat(benchWeight) || 60,
      deadlift5rmKg: parseFloat(deadliftWeight) || 80,
      run5kMinutes: parseFloat(fiveKmTime) || 28,
      easyRunPace: '5:45 /km',
      easyRunRpe: 7,
      swimmingDistanceMeters: parseInt(swimDistance, 10) || 1200,
      swimmingRpe: 7,
      dragonFlagLevel: dragonLevel,
      mobilityCheckpointScore: mobilityScore,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-5 my-auto shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">8–12 Week Capacity Assessment</h3>
              <p className="text-[11px] text-zinc-400 font-mono">Phase {userProfile.currentPhase} Test Battery</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs max-h-[60vh] overflow-y-auto pr-1">
          {/* Section: Power & Strength */}
          <div className="space-y-2">
            <span className="font-mono uppercase font-bold text-emerald-400 text-[10px] block">
              1. Power & Strength Benchmarks
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <label className="text-[10px] text-zinc-400 block mb-1">Broad Jump (cm)</label>
                <input
                  type="number"
                  value={broadJump}
                  onChange={e => setBroadJump(e.target.value)}
                  className="w-full bg-transparent font-mono font-bold text-base text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <label className="text-[10px] text-zinc-400 block mb-1">Max Clean Pull-Ups</label>
                <input
                  type="number"
                  value={pullUps}
                  onChange={e => setPullUps(e.target.value)}
                  className="w-full bg-transparent font-mono font-bold text-base text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <label className="text-[10px] text-zinc-400 block mb-1">Squat 5-Rep Max (kg)</label>
                <input
                  type="number"
                  value={squatWeight}
                  onChange={e => setSquatWeight(e.target.value)}
                  className="w-full bg-transparent font-mono font-bold text-base text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <label className="text-[10px] text-zinc-400 block mb-1">Deadlift 5-Rep Max (kg)</label>
                <input
                  type="number"
                  value={deadliftWeight}
                  onChange={e => setDeadliftWeight(e.target.value)}
                  className="w-full bg-transparent font-mono font-bold text-base text-zinc-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Conditioning */}
          <div className="space-y-2">
            <span className="font-mono uppercase font-bold text-cyan-400 text-[10px] block">
              2. Aerobic Engine Benchmarks
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <label className="text-[10px] text-zinc-400 block mb-1">5K Run Time (mm:ss)</label>
                <input
                  type="text"
                  value={fiveKmTime}
                  onChange={e => setFiveKmTime(e.target.value)}
                  className="w-full bg-transparent font-mono font-bold text-base text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <label className="text-[10px] text-zinc-400 block mb-1">Swim Distance (meters)</label>
                <input
                  type="number"
                  value={swimDistance}
                  onChange={e => setSwimDistance(e.target.value)}
                  className="w-full bg-transparent font-mono font-bold text-base text-zinc-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Trunk Control & Mobility */}
          <div className="space-y-2">
            <span className="font-mono uppercase font-bold text-amber-400 text-[10px] block">
              3. Trunk & Mobility Checkpoints
            </span>

            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 space-y-1.5">
              <label className="text-[10px] text-zinc-400 block">Dragon Flag / Hollow Progression</label>
              <select
                value={dragonLevel}
                onChange={e => setDragonLevel(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-zinc-200 text-xs font-mono"
              >
                <option value="hollow_body_hold">Hollow Body Hold (45s)</option>
                <option value="tuck_eccentric">Tuck Dragon Flag Eccentric</option>
                <option value="straddle_eccentric">Straddle Dragon Flag Eccentric</option>
                <option value="full_dragon_flag">Full Dragon Flag Reps</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAnklePassed(!anklePassed)}
                className={`p-2.5 rounded-xl border text-left transition ${
                  anklePassed ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="font-bold">Ankle Dorsiflexion</div>
                <div className="text-[10px] font-mono">{anklePassed ? 'Passed (12cm+)' : 'Needs Work'}</div>
              </button>

              <button
                type="button"
                onClick={() => setHipPassed(!hipPassed)}
                className={`p-2.5 rounded-xl border text-left transition ${
                  hipPassed ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="font-bold">90/90 Hip Rotation</div>
                <div className="text-[10px] font-mono">{hipPassed ? 'Passed (Clean)' : 'Restricted'}</div>
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold rounded-xl text-sm flex items-center justify-center space-x-1.5 shadow-lg"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save Assessment Benchmarks</span>
        </button>
      </div>
    </div>
  );
};
