import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Flag,
  Clock,
  Zap,
  Volume2,
  VolumeX,
  Plus,
  Minus
} from 'lucide-react';
import { soundFx } from '../utils/sound';

interface UtilityTimersModalProps {
  onClose: () => void;
}

export const UtilityTimersModal: React.FC<UtilityTimersModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'stopwatch' | 'interval' | 'quick_rest'>('stopwatch');

  // --- STOPWATCH STATE ---
  const [swRunning, setSwRunning] = useState(false);
  const [swElapsedMs, setSwElapsedMs] = useState(0);
  const [laps, setLaps] = useState<{ id: number; lapTime: number; overallTime: number }[]>([]);
  const swStartRef = useRef<number>(0);
  const swAccumulatedRef = useRef<number>(0);

  useEffect(() => {
    let animFrame: number;
    if (swRunning) {
      swStartRef.current = performance.now();
      const tick = () => {
        const now = performance.now();
        const delta = now - swStartRef.current;
        setSwElapsedMs(swAccumulatedRef.current + delta);
        animFrame = requestAnimationFrame(tick);
      };
      animFrame = requestAnimationFrame(tick);
    } else {
      swAccumulatedRef.current = swElapsedMs;
    }
    return () => cancelAnimationFrame(animFrame);
  }, [swRunning]);

  const handleSwStartPause = () => {
    setSwRunning(prev => !prev);
  };

  const handleSwReset = () => {
    setSwRunning(false);
    swAccumulatedRef.current = 0;
    setSwElapsedMs(0);
    setLaps([]);
  };

  const handleSwLap = () => {
    const currentOverall = swElapsedMs;
    const lastOverall = laps.length > 0 ? laps[0].overallTime : 0;
    const lapTime = currentOverall - lastOverall;
    setLaps(prev => [{ id: prev.length + 1, lapTime, overallTime: currentOverall }, ...prev]);
  };

  const formatStopwatch = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const centis = Math.floor((ms % 1000) / 10);
    return {
      minutes: String(m).padStart(2, '0'),
      seconds: String(s).padStart(2, '0'),
      centis: String(centis).padStart(2, '0')
    };
  };

  // --- INTERVAL / EMOM STATE ---
  const [intRounds, setIntRounds] = useState(8);
  const [intWorkSec, setIntWorkSec] = useState(40);
  const [intRestSec, setIntRestSec] = useState(20);
  const [intCurrentRound, setIntCurrentRound] = useState(1);
  const [intPhase, setIntPhase] = useState<'idle' | 'prep' | 'work' | 'rest' | 'finished'>('idle');
  const [intRemainingSec, setIntRemainingSec] = useState(0);
  const [intTargetEndTime, setIntTargetEndTime] = useState<number | null>(null);

  // Apply Presets
  const applyPreset = (rounds: number, work: number, rest: number) => {
    setIntPhase('idle');
    setIntCurrentRound(1);
    setIntRounds(rounds);
    setIntWorkSec(work);
    setIntRestSec(rest);
    setIntRemainingSec(work);
    setIntTargetEndTime(null);
  };

  const startIntervalTimer = () => {
    setIntCurrentRound(1);
    setIntPhase('prep');
    setIntRemainingSec(3);
    setIntTargetEndTime(Date.now() + 3000);
    soundFx.playCountdownBeep(600);
  };

  const stopIntervalTimer = () => {
    setIntPhase('idle');
    setIntTargetEndTime(null);
  };

  // Interval Ticker
  useEffect(() => {
    if (intPhase === 'idle' || intPhase === 'finished' || !intTargetEndTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((intTargetEndTime - now) / 1000));
      setIntRemainingSec(remaining);

      // Acoustic countdown in final 3 seconds
      if (remaining <= 3 && remaining > 0) {
        soundFx.playCountdownBeep(remaining === 1 ? 880 : 700);
      }

      if (remaining <= 0) {
        if (intPhase === 'prep') {
          // Transition to first Work round
          setIntPhase('work');
          setIntRemainingSec(intWorkSec);
          setIntTargetEndTime(Date.now() + intWorkSec * 1000);
          soundFx.playGoTone();
        } else if (intPhase === 'work') {
          if (intRestSec > 0) {
            setIntPhase('rest');
            setIntRemainingSec(intRestSec);
            setIntTargetEndTime(Date.now() + intRestSec * 1000);
            soundFx.playChime();
          } else {
            // No rest, advance round directly
            advanceRound();
          }
        } else if (intPhase === 'rest') {
          advanceRound();
        }
      }
    }, 200);

    const advanceRound = () => {
      if (intCurrentRound < intRounds) {
        setIntCurrentRound(prev => prev + 1);
        setIntPhase('work');
        setIntRemainingSec(intWorkSec);
        setIntTargetEndTime(Date.now() + intWorkSec * 1000);
        soundFx.playGoTone();
      } else {
        setIntPhase('finished');
        setIntTargetEndTime(null);
        soundFx.playChime();
      }
    };

    return () => clearInterval(interval);
  }, [intPhase, intTargetEndTime, intCurrentRound, intRounds, intWorkSec, intRestSec]);

  // --- QUICK REST TIMER ---
  const [quickRestTarget, setQuickRestTarget] = useState<number | null>(null);
  const [quickRestInitial, setQuickRestInitial] = useState(90);
  const [quickRestRemaining, setQuickRestRemaining] = useState<number | null>(null);

  const startQuickRest = (seconds: number) => {
    setQuickRestInitial(seconds);
    setQuickRestRemaining(seconds);
    setQuickRestTarget(Date.now() + seconds * 1000);
    soundFx.playGoTone();
  };

  useEffect(() => {
    if (quickRestTarget === null) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((quickRestTarget - Date.now()) / 1000));
      setQuickRestRemaining(remaining);

      if (remaining <= 3 && remaining > 0) {
        soundFx.playTick();
      }

      if (remaining <= 0) {
        soundFx.playChime();
        soundFx.sendNotification('Rest Complete', 'Time to start your next set!');
        setQuickRestTarget(null);
        setQuickRestRemaining(null);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [quickRestTarget]);

  const swTime = formatStopwatch(swElapsedMs);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Utility Timers</h3>
              <p className="text-[10px] text-zinc-400 font-mono">Rest • Intervals • Stopwatch</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 my-3">
          <button
            onClick={() => setActiveTab('stopwatch')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'stopwatch' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
            }`}
          >
            Stopwatch
          </button>
          <button
            onClick={() => setActiveTab('interval')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'interval' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
            }`}
          >
            Interval / EMOM
          </button>
          <button
            onClick={() => setActiveTab('quick_rest')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'quick_rest' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
            }`}
          >
            Quick Rest
          </button>
        </div>

        {/* --- TAB 1: STOPWATCH --- */}
        {activeTab === 'stopwatch' && (
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center shadow-inner">
              <div className="font-mono text-4xl sm:text-5xl font-black text-zinc-100 tracking-tight flex items-baseline justify-center">
                <span>{swTime.minutes}</span>
                <span className="text-emerald-400 mx-1">:</span>
                <span>{swTime.seconds}</span>
                <span className="text-xl sm:text-2xl text-emerald-400 font-semibold ml-1.5 w-9 text-left">
                  .{swTime.centis}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSwStartPause}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-1.5 shadow transition ${
                  swRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                    : 'bg-emerald-400 hover:bg-emerald-300 text-zinc-950'
                }`}
              >
                {swRunning ? <Pause className="w-4 h-4 fill-zinc-950" /> : <Play className="w-4 h-4 fill-zinc-950" />}
                <span>{swRunning ? 'Pause' : 'Start'}</span>
              </button>

              {swRunning && (
                <button
                  onClick={handleSwLap}
                  className="py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-semibold text-sm flex items-center justify-center space-x-1"
                >
                  <Flag className="w-4 h-4 text-cyan-400" />
                  <span>Lap</span>
                </button>
              )}

              <button
                onClick={handleSwReset}
                disabled={swElapsedMs === 0}
                className="py-3 px-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 rounded-xl font-semibold text-sm"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Lap list */}
            {laps.length > 0 && (
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 border-t border-zinc-800/80 pt-2">
                <span className="text-[10px] font-mono uppercase text-zinc-500 font-semibold px-1 block">
                  Laps Recorded
                </span>
                {laps.map(lap => {
                  const formattedLap = formatStopwatch(lap.lapTime);
                  const formattedOverall = formatStopwatch(lap.overallTime);
                  return (
                    <div
                      key={lap.id}
                      className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/70 flex items-center justify-between text-xs font-mono"
                    >
                      <span className="text-zinc-400 font-bold">Lap {lap.id}</span>
                      <span className="text-emerald-400 font-semibold">
                        +{formattedLap.minutes}:{formattedLap.seconds}.{formattedLap.centis}
                      </span>
                      <span className="text-zinc-500">
                        {formattedOverall.minutes}:{formattedOverall.seconds}.{formattedOverall.centis}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: INTERVAL / EMOM --- */}
        {activeTab === 'interval' && (
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            {intPhase === 'idle' ? (
              <div className="space-y-3 overflow-y-auto pr-1">
                {/* Presets */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block mb-1.5">
                    Quick Presets
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => applyPreset(10, 60, 0)}
                      className="p-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-center"
                    >
                      <span className="text-xs font-bold text-emerald-400 block font-mono">EMOM 10m</span>
                      <span className="text-[10px] text-zinc-500">10 × 60s</span>
                    </button>
                    <button
                      onClick={() => applyPreset(8, 20, 10)}
                      className="p-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-center"
                    >
                      <span className="text-xs font-bold text-emerald-400 block font-mono">Tabata</span>
                      <span className="text-[10px] text-zinc-500">8 × 20s/10s</span>
                    </button>
                    <button
                      onClick={() => applyPreset(10, 30, 30)}
                      className="p-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-center"
                    >
                      <span className="text-xs font-bold text-emerald-400 block font-mono">30s / 30s</span>
                      <span className="text-[10px] text-zinc-500">10 × 30s/30s</span>
                    </button>
                  </div>
                </div>

                {/* Custom Configuration */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-300 font-medium">Total Rounds</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIntRounds(prev => Math.max(1, prev - 1))}
                        className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-sm text-zinc-100">
                        {intRounds}
                      </span>
                      <button
                        onClick={() => setIntRounds(prev => prev + 1)}
                        className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2">
                    <span className="text-xs text-zinc-300 font-medium">Work Interval</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIntWorkSec(prev => Math.max(5, prev - 5))}
                        className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-12 text-center font-mono font-bold text-sm text-emerald-400">
                        {intWorkSec}s
                      </span>
                      <button
                        onClick={() => setIntWorkSec(prev => prev + 5)}
                        className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2">
                    <span className="text-xs text-zinc-300 font-medium">Rest Interval</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIntRestSec(prev => Math.max(0, prev - 5))}
                        className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-12 text-center font-mono font-bold text-sm text-amber-400">
                        {intRestSec}s
                      </span>
                      <button
                        onClick={() => setIntRestSec(prev => prev + 5)}
                        className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={startIntervalTimer}
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-zinc-950" />
                  <span>Start Interval Regimen</span>
                </button>
              </div>
            ) : (
              /* Active Interval Full-Screen Display */
              <div className="space-y-4 text-center">
                <div
                  className={`p-8 rounded-3xl border transition-all ${
                    intPhase === 'prep'
                      ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                      : intPhase === 'work'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                      : intPhase === 'rest'
                      ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="text-xs uppercase font-mono tracking-widest font-bold">
                    {intPhase === 'prep'
                      ? 'Get Ready...'
                      : intPhase === 'work'
                      ? `Work Round ${intCurrentRound} of ${intRounds}`
                      : intPhase === 'rest'
                      ? `Rest Round ${intCurrentRound} of ${intRounds}`
                      : 'Completed!'}
                  </div>

                  <div className="font-mono text-6xl font-black mt-2">
                    {intRemainingSec}s
                  </div>

                  <div className="text-xs font-mono text-zinc-400 mt-2">
                    {intPhase === 'work' ? 'Maximum intent & crisp form' : 'Deep nasal recovery breath'}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={stopIntervalTimer}
                    className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-sm"
                  >
                    End Interval
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: QUICK REST TIMER --- */}
        {activeTab === 'quick_rest' && (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block">
                Tap to Start Rest Countdown
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[30, 45, 60, 90, 120, 180].map(sec => (
                  <button
                    key={sec}
                    onClick={() => startQuickRest(sec)}
                    className="p-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-center transition"
                  >
                    <span className="text-base font-bold font-mono text-emerald-400 block">{sec}s</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {quickRestRemaining !== null && (
              <div className="bg-emerald-950/40 border border-emerald-500/60 rounded-2xl p-4 text-center space-y-2 animate-in slide-in-from-bottom">
                <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold">
                  Rest Countdown
                </span>
                <div className="font-mono text-4xl font-black text-zinc-100">
                  {Math.floor(quickRestRemaining / 60)}:
                  {String(quickRestRemaining % 60).padStart(2, '0')}
                </div>
                <div className="flex justify-center gap-2 pt-1">
                  <button
                    onClick={() => setQuickRestTarget(prev => (prev ? prev + 30000 : null))}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono rounded-lg text-zinc-200"
                  >
                    +30s
                  </button>
                  <button
                    onClick={() => { setQuickRestTarget(null); setQuickRestRemaining(null); }}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-lg text-rose-300"
                  >
                    Stop
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
