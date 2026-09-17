import React, { useState } from 'react';
import { History, Calendar, Clock, ChevronDown, ChevronUp, ShieldAlert, Waves, Flame } from 'lucide-react';
import { useTraining } from '../context/TrainingContext';

export const HistoryView: React.FC = () => {
  const { workoutLogs, cardioLogs } = useTraining();
  const [filter, setFilter] = useState<'all' | 'gym' | 'cardio'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Combine workout logs and cardio logs sorted by date descending
  const allEntries = [
    ...workoutLogs.map(w => ({ ...w, entryType: 'gym' as const })),
    ...cardioLogs.map(c => ({ ...c, entryType: 'cardio' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredEntries = allEntries.filter(entry => {
    if (filter === 'gym') return entry.entryType === 'gym';
    if (filter === 'cardio') return entry.entryType === 'cardio';
    return true;
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* Header & Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Training Logbook</h2>
          <p className="text-xs text-zinc-400">
            Immutable session performance history and notes
          </p>
        </div>

        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              filter === 'all' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('gym')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              filter === 'gym' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
            }`}
          >
            Gym
          </button>
          <button
            onClick={() => setFilter('cardio')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              filter === 'cardio' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
            }`}
          >
            Cardio
          </button>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-2">
          <History className="w-8 h-8 text-zinc-600 mx-auto" />
          <div className="text-sm font-semibold text-zinc-300">No session logs yet</div>
          <p className="text-xs text-zinc-500">
            Complete your scheduled workout today to begin recording data.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map(entry => {
            const isExpanded = expandedLogId === entry.id;

            if (entry.entryType === 'gym') {
              return (
                <div
                  key={entry.id}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setExpandedLogId(isExpanded ? null : entry.id)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-zinc-100">{entry.title}</span>
                        {entry.painReported && (
                          <span className="text-[10px] text-rose-400 bg-rose-950/40 border border-rose-900/50 px-1.5 py-0.2 rounded font-mono">
                            Pain Noted
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {entry.date} • {entry.durationMinutes} min • RPE {entry.sessionRpe} • Energy {entry.energyLevel}/5
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-emerald-400 font-mono font-semibold">
                        {entry.exercises.length} movements
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-zinc-950 border-t border-zinc-800 space-y-3 text-xs animate-in fade-in">
                      {entry.summaryNotes && (
                        <div className="p-2.5 bg-zinc-900 rounded-xl text-zinc-300 italic border border-zinc-800">
                          &ldquo;{entry.summaryNotes}&rdquo;
                        </div>
                      )}

                      {entry.painReported && entry.painLocations && entry.painLocations.length > 0 && (
                        <div className="p-2.5 bg-rose-950/20 border border-rose-900/40 rounded-xl text-rose-300">
                          <span className="font-semibold">Reported Discomfort: </span>
                          {entry.painLocations.join(', ')}
                          {entry.painNotes && ` — ${entry.painNotes}`}
                        </div>
                      )}

                      {/* Exercise Sets Detail */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold block">
                          Performed Exercises & Sets
                        </span>
                        {entry.exercises.map((ex, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                            <div className="flex items-center justify-between font-semibold text-zinc-200">
                              <span>{ex.exerciseName}</span>
                              <span className="text-emerald-400 font-mono text-[11px]">
                                {ex.targetLoad ? `Target: ${ex.targetLoad}kg` : ''}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {ex.sets.map(s => (
                                <span
                                  key={s.setNumber}
                                  className="text-[10px] font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300"
                                >
                                  Set {s.setNumber}: {s.actualWeightKg ? `${s.actualWeightKg}kg × ` : ''}
                                  {s.actualReps ? `${s.actualReps}r` : `${s.actualDurationSec}s`} @ RPE {s.actualRpe}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            } else {
              // Cardio log
              return (
                <div
                  key={entry.id}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                      {entry.type === 'swim' ? (
                        <Waves className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Flame className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-100">{entry.title}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {entry.date} • {entry.durationMinutes} min • RPE {entry.rpe}
                      </div>
                      {entry.notes && (
                        <div className="text-[10px] text-zinc-500 italic mt-0.5">
                          {entry.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-emerald-400">
                      {entry.distanceKm ? `${entry.distanceKm} km` : entry.distanceMeters ? `${entry.distanceMeters} m` : ''}
                    </div>
                    {entry.averagePace && (
                      <div className="text-[10px] text-zinc-400">{entry.averagePace}</div>
                    )}
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
};
