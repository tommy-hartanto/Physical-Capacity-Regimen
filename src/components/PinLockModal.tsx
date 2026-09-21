import React, { useState } from 'react';
import { Lock, Delete, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTraining } from '../context/TrainingContext';

export const PinLockModal: React.FC = () => {
  const { unlockApp } = useTraining();
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePressDigit = (digit: string) => {
    if (enteredPin.length < 6) {
      const next = enteredPin + digit;
      setEnteredPin(next);
      setErrorMsg(null);
      if (next.length >= 4) {
        // Auto check if pin matches
        const ok = unlockApp(next);
        if (!ok && next.length === 6) {
          setErrorMsg('Incorrect PIN. Please try again.');
          setEnteredPin('');
        }
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin(prev => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const ok = unlockApp(enteredPin);
    if (!ok) {
      setErrorMsg('Incorrect PIN. Please try again.');
      setEnteredPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/98 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-zinc-100">
      <div className="max-w-xs w-full text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto shadow-lg shadow-cyan-950/50">
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-black text-zinc-100 tracking-tight">Physical Capacity Regimen</h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono">Single-User Protected Instance</p>
        </div>

        {/* PIN Dots */}
        <div className="flex items-center justify-center space-x-3 py-2">
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                enteredPin.length > idx
                  ? 'bg-emerald-400 scale-110 shadow-md shadow-emerald-500/50'
                  : 'bg-zinc-800 border border-zinc-700'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <div className="text-xs text-rose-400 font-medium animate-shake">
            {errorMsg}
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handlePressDigit(num)}
              className="w-16 h-16 mx-auto rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-800 text-xl font-bold font-mono text-zinc-100 flex items-center justify-center transition active:scale-95 shadow"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleDelete}
            className="w-16 h-16 mx-auto rounded-2xl bg-zinc-900/50 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-800/80 text-zinc-400 flex items-center justify-center transition active:scale-95"
            title="Delete"
          >
            <Delete className="w-5 h-5" />
          </button>
          <button
            onClick={() => handlePressDigit('0')}
            className="w-16 h-16 mx-auto rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-800 text-xl font-bold font-mono text-zinc-100 flex items-center justify-center transition active:scale-95 shadow"
          >
            0
          </button>
          <button
            onClick={() => handleSubmit()}
            disabled={enteredPin.length < 4}
            className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-bold flex items-center justify-center transition active:scale-95 shadow"
            title="Unlock"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
