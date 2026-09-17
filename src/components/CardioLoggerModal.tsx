import React, { useState } from 'react';
import { Waves, Flame, Clock, Heart, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTraining } from '../context/TrainingContext';

interface CardioLoggerModalProps {
  initialType?: 'run' | 'swim';
  onClose: () => void;
}

export const CardioLoggerModal: React.FC<CardioLoggerModalProps> = ({
  initialType = 'run',
  onClose
}) => {
  const { logCardioSession, userProfile } = useTraining();
  const [type, setType] = useState<'run' | 'swim'>(initialType);
  const [durationMin, setDurationMin] = useState<number>(type === 'swim' ? 45 : 35);
  const [distance, setDistance] = useState<string>(type === 'swim' ? '1200' : '5.5');
  const [rpe, setRpe] = useState<number>(6.5);
  const [heartRate, setHeartRate] = useState<string>('');
  const [intervalsDone, setIntervalsDone] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  const calculatePace = () => {
    const numDist = parseFloat(distance);
    if (!numDist || numDist <= 0 || !durationMin || durationMin <= 0) return '--';

    if (type === 'run') {
      // Pace min/km
      const totalMin = durationMin;
      const minPerKm = totalMin / numDist;
      const m = Math.floor(minPerKm);
      const s = Math.round((minPerKm - m) * 60);
      return `${m}:${String(s).padStart(2, '0')} /km`;
    } else {
      // Swim pace per 100m (distance in meters)
      const dist100m = numDist / 100;
      const minPer100 = durationMin / dist100m;
      const m = Math.floor(minPer100);
      const s = Math.round((minPer100 - m) * 60);
      return `${m}:${String(s).padStart(2, '0')} /100m`;
    }
  };

  const handleSave = () => {
    const numDist = parseFloat(distance) || 0;
    const pace = calculatePace();

    logCardioSession({
      date: new Date().toISOString().split('T')[0],
      type,
      title: type === 'swim' ? 'Swimming Session' : 'Aerobic Base Run',
      durationMinutes: durationMin,
      distanceKm: type === 'run' ? numDist : undefined,
      distanceMeters: type === 'swim' ? numDist : undefined,
      averagePace: pace !== '--' ? pace : undefined,
      averageHeartRate: heartRate ? parseInt(heartRate, 10) : undefined,
      rpe,
      intervalsCompleted: intervalsDone,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-5 my-auto shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-emerald-400">
              {type === 'swim' ? <Waves className="w-5 h-5 text-cyan-400" /> : <Flame className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Log {type === 'swim' ? 'Swimming' : 'Running'} Session
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Phase {userProfile.currentPhase} Aerobic Engine
              </p>
            </div>
          </div>

          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => { setType('run'); setDistance('5.5'); setDurationMin(35); }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                type === 'run' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400'
              }`}
            >
              Run
            </button>
            <button
              onClick={() => { setType('swim'); setDistance('1200'); setDurationMin(45); }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                type === 'swim' ? 'bg-cyan-500 text-zinc-950' : 'text-zinc-400'
              }`}
            >
              Swim
            </button>
          </div>
        </div>

        {/* Prescription Guidance Reminder */}
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-3 text-xs text-zinc-300 space-y-1">
          <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <span>Prescription Rule:</span>
          </div>
          {type === 'run' ? (
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              30–40 min easy conversational running. Ignore pace. Keep intensity easy so you could hold a conversation. Run/walk permitted.
            </p>
          ) : (
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Continuous comfortable swimming. Treat breath rhythm and control separately from aerobic capacity — do not turn into maximal breath holding.
            </p>
          )}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={durationMin}
              onChange={e => setDurationMin(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-transparent text-xl font-mono font-bold text-zinc-100 focus:outline-none"
            />
          </div>

          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
              Distance ({type === 'run' ? 'km' : 'meters'})
            </label>
            <input
              type="number"
              step={type === 'run' ? '0.1' : '50'}
              value={distance}
              onChange={e => setDistance(e.target.value)}
              className="w-full bg-transparent text-xl font-mono font-bold text-zinc-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Calculated Pace Display */}
        <div className="bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800/60 flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-mono">Calculated Pace:</span>
          <span className="text-emerald-400 font-mono font-bold">{calculatePace()}</span>
        </div>

        {/* Effort RPE */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-300">Effort / RPE:</span>
            <span className="text-emerald-400 font-bold">{rpe} (Target: 6.0–7.5 conversational)</span>
          </div>
          <input
            type="range"
            min="4"
            max="10"
            step="0.5"
            value={rpe}
            onChange={e => setRpe(parseFloat(e.target.value))}
            className="w-full accent-emerald-400 bg-zinc-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Optional Heart Rate */}
        <div className="space-y-1">
          <label className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            Average Heart Rate (bpm, optional)
          </label>
          <input
            type="number"
            placeholder="e.g. 142"
            value={heartRate}
            onChange={e => setHeartRate(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700 font-mono"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-mono text-zinc-400 block">
            Session Notes (e.g. breathing, conditions)
          </label>
          <input
            type="text"
            placeholder="Nasal breathing maintained, felt fluid"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700"
          />
        </div>

        <div className="flex space-x-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-2 py-3 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save to Logbook</span>
          </button>
        </div>
      </div>
    </div>
  );
};
