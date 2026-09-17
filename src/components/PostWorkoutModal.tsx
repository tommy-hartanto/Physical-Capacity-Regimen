import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTraining } from '../context/TrainingContext';
import { calculateNextPrescription } from '../utils/progressionEngine';

interface PostWorkoutModalProps {
  onComplete: () => void;
}

export const PostWorkoutModal: React.FC<PostWorkoutModalProps> = ({ onComplete }) => {
  const { activeWorkout, finishWorkout } = useTraining();

  const [sessionRpe, setSessionRpe] = useState<number>(7.5);
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [hasPain, setHasPain] = useState<boolean>(false);
  const [painLocations, setPainLocations] = useState<string[]>([]);
  const [painNotes, setPainNotes] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [progressionSummary, setProgressionSummary] = useState<{ name: string; message: string; status: string }[]>([]);

  if (!activeWorkout) return null;

  const toggleLocation = (loc: string) => {
    if (painLocations.includes(loc)) {
      setPainLocations(painLocations.filter(l => l !== loc));
    } else {
      setPainLocations([...painLocations, loc]);
    }
  };

  const handleSubmitDebrief = () => {
    // Calculate preview of double progression
    const summary = activeWorkout.exercises
      .filter(e => !e.isSkipped && e.performedSets.length > 0)
      .map(item => {
        const currentTarget = item.prescribedSets[0]?.targetWeightKg;
        if (currentTarget !== undefined) {
          const rec = calculateNextPrescription(
            item.exerciseId,
            item.performedSets,
            item.prescribedSets[0]?.targetRepsRange || [5, 6],
            currentTarget,
            hasPain,
            painLocations
          );
          return {
            name: item.exerciseName,
            message: rec.message,
            status: rec.status
          };
        }
        return null;
      })
      .filter(Boolean) as { name: string; message: string; status: string }[];

    setProgressionSummary(summary);

    finishWorkout({
      sessionRpe,
      energyLevel,
      painReported: hasPain,
      painLocations: hasPain ? painLocations : [],
      painNotes: hasPain ? painNotes : undefined,
      notes: sessionNotes.trim() || undefined
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }

    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-5 my-auto shadow-2xl">
        {!isSubmitted ? (
          <>
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Workout Debrief</h2>
              <p className="text-xs text-zinc-400">
                Quick 30-second log to calibrate next session load and recovery.
              </p>
            </div>

            {/* Overall Session RPE */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase font-mono text-zinc-300">
                  Overall Session RPE
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  RPE {sessionRpe} ({sessionRpe <= 7 ? 'Comfortable' : sessionRpe <= 8 ? 'Ideal Target' : sessionRpe <= 9 ? 'Hard' : 'Exhausting'})
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="10"
                step="0.5"
                value={sessionRpe}
                onChange={e => setSessionRpe(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 bg-zinc-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>5 (Very Easy)</span>
                <span>7.5 (Prescribed Baseline)</span>
                <span>10 (Maximal)</span>
              </div>
            </div>

            {/* Energy Level (1 to 5) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase font-mono text-zinc-300 block">
                Post-Session Energy Level
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {([1, 2, 3, 4, 5] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEnergyLevel(lvl)}
                    className={`py-2 rounded-xl text-xs font-mono font-semibold transition border ${
                      energyLevel === lvl
                        ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {lvl === 1 ? '1 Low' : lvl === 5 ? '5 Peak' : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Pain / Discomfort Check */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase font-mono text-zinc-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Unusual Discomfort or Pain?
                </span>
                <button
                  type="button"
                  onClick={() => setHasPain(!hasPain)}
                  className={`text-xs font-mono px-3 py-1 rounded-full border transition ${
                    hasPain
                      ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}
                >
                  {hasPain ? 'Yes (Reported)' : 'No (Clean)'}
                </button>
              </div>

              {hasPain && (
                <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-3.5 space-y-2.5 animate-in fade-in">
                  <p className="text-[11px] text-rose-300 leading-tight">
                    Select affected joints/areas. The progression engine will freeze or deload target loads for those patterns:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['knee', 'lower_back', 'shoulder', 'elbow', 'achilles', 'hip', 'wrist', 'groin'].map(loc => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => toggleLocation(loc)}
                        className={`text-xs px-2.5 py-1 rounded-lg border capitalize transition ${
                          painLocations.includes(loc)
                            ? 'bg-rose-500 text-zinc-950 border-rose-400 font-bold'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        {loc.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Optional note: e.g. mild patellar pinch on deep squat"
                    value={painNotes}
                    onChange={e => setPainNotes(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}
            </div>

            {/* Optional Session Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase font-mono text-zinc-400 block">
                Session Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="How did movement quality feel today?"
                value={sessionNotes}
                onChange={e => setSessionNotes(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
              />
            </div>

            <button
              onClick={handleSubmitDebrief}
              className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50 transition"
            >
              <span>Save & Calculate Next Prescriptions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          /* Post-Submission Coach Recommendations Screen */
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100">Workout Saved to Logbook</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Automated progression engine adjustments for your next session:
              </p>
            </div>

            <div className="space-y-2 text-left max-h-60 overflow-y-auto pr-1">
              {progressionSummary.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs ${
                    item.status === 'advance_load'
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                      : item.status === 'pain_protect'
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="font-semibold text-zinc-200 flex items-center justify-between">
                    <span>{item.name}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-400 text-[11px] leading-relaxed">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={onComplete}
              className="w-full py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl text-sm transition"
            >
              Done & Return Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
