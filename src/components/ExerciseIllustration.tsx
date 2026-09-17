import React from 'react';

interface ExerciseIllustrationProps {
  exerciseId: string;
  className?: string;
}

export const ExerciseIllustration: React.FC<ExerciseIllustrationProps> = ({ exerciseId, className = 'w-full h-28' }) => {
  // Minimalist athletic biomechanical wireframe SVG diagrams
  if (exerciseId.includes('squat') || exerciseId === 'rfess' || exerciseId === 'cossack_squat') {
    return (
      <div className={`flex items-center justify-center bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/60 ${className}`}>
        <svg viewBox="0 0 160 100" className="h-full max-h-24 w-auto stroke-zinc-400 fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Head & Spine */}
          <circle cx="80" cy="22" r="7" className="stroke-emerald-400 fill-emerald-500/20" />
          <path d="M 80 29 L 76 52" />
          {/* Barbell / Arms */}
          <line x1="50" y1="33" x2="110" y2="33" className="stroke-zinc-200" strokeWidth="3.5" />
          <line x1="50" y1="28" x2="50" y2="38" className="stroke-zinc-400" strokeWidth="3" />
          <line x1="110" y1="28" x2="110" y2="38" className="stroke-zinc-400" strokeWidth="3" />
          {/* Pelvis & Femur (Hips back & down) */}
          <path d="M 76 52 L 60 62 L 78 86" />
          <path d="M 76 52 L 92 62 L 74 86" />
          {/* Feet grounded */}
          <line x1="72" y1="86" x2="84" y2="86" className="stroke-emerald-400" strokeWidth="3" />
          <line x1="20" y1="92" x2="140" y2="92" className="stroke-zinc-800" strokeWidth="2" />
          {/* Vector trajectory arrows */}
          <path d="M 125 45 L 125 75" className="stroke-emerald-500/80 stroke-dasharray-2" strokeWidth="1.5" />
          <polyline points="122,70 125,76 128,70" className="stroke-emerald-500" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  if (exerciseId.includes('deadlift') || exerciseId.includes('rdl')) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/60 ${className}`}>
        <svg viewBox="0 0 160 100" className="h-full max-h-24 w-auto stroke-zinc-400 fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Ground */}
          <line x1="20" y1="90" x2="140" y2="90" className="stroke-zinc-800" strokeWidth="2" />
          {/* Head & Spine in hinge */}
          <circle cx="95" cy="30" r="7" className="stroke-emerald-400 fill-emerald-500/20" />
          <path d="M 91 36 L 68 56" />
          {/* Hips & Legs */}
          <path d="M 68 56 L 62 70 L 68 90" />
          {/* Barbell on shins */}
          <line x1="45" y1="80" x2="105" y2="80" className="stroke-zinc-200" strokeWidth="3.5" />
          <line x1="45" y1="72" x2="45" y2="88" className="stroke-zinc-400" strokeWidth="3" />
          <line x1="105" y1="72" x2="105" y2="88" className="stroke-zinc-400" strokeWidth="3" />
          {/* Arms hanging vertical */}
          <path d="M 85 42 L 75 79" />
          {/* Hip hinge indicator */}
          <path d="M 52 50 C 56 46, 64 46, 68 54" className="stroke-emerald-400" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  if (exerciseId.includes('bench') || exerciseId.includes('press')) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/60 ${className}`}>
        <svg viewBox="0 0 160 100" className="h-full max-h-24 w-auto stroke-zinc-400 fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Bench */}
          <rect x="40" y="58" width="80" height="8" rx="2" className="fill-zinc-800 stroke-zinc-700" />
          <line x1="50" y1="66" x2="50" y2="90" className="stroke-zinc-700" strokeWidth="3" />
          <line x1="110" y1="66" x2="110" y2="90" className="stroke-zinc-700" strokeWidth="3" />
          {/* Torso & Head */}
          <circle cx="52" cy="52" r="6" className="stroke-emerald-400 fill-emerald-500/20" />
          <path d="M 58 56 L 95 56" />
          {/* Feet planted on floor */}
          <path d="M 95 56 L 105 72 L 105 90" />
          {/* Barbell & Arms */}
          <line x1="50" y1="30" x2="100" y2="30" className="stroke-zinc-200" strokeWidth="3.5" />
          <path d="M 72 56 L 75 42 L 75 31" className="stroke-emerald-400" />
        </svg>
      </div>
    );
  }

  if (exerciseId.includes('pull_up') || exerciseId.includes('row')) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/60 ${className}`}>
        <svg viewBox="0 0 160 100" className="h-full max-h-24 w-auto stroke-zinc-400 fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Bar */}
          <line x1="30" y1="18" x2="130" y2="18" className="stroke-zinc-200" strokeWidth="3.5" />
          {/* Hands & Arms */}
          <path d="M 68 18 L 74 32 L 80 40" className="stroke-emerald-400" />
          <path d="M 92 18 L 86 32 L 80 40" className="stroke-emerald-400" />
          {/* Head & Torso */}
          <circle cx="80" cy="28" r="6" className="stroke-emerald-400 fill-emerald-500/20" />
          <path d="M 80 34 L 80 65" />
          {/* Hollow body legs */}
          <path d="M 80 65 L 77 88" />
        </svg>
      </div>
    );
  }

  if (exerciseId.includes('jump') || exerciseId.includes('bound')) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/60 ${className}`}>
        <svg viewBox="0 0 160 100" className="h-full max-h-24 w-auto stroke-zinc-400 fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="20" y1="90" x2="140" y2="90" className="stroke-zinc-800" strokeWidth="2" />
          {/* Dynamic athletic jump stick */}
          <circle cx="70" cy="34" r="6" className="stroke-emerald-400 fill-emerald-500/20" />
          <path d="M 70 40 L 76 58 L 68 76 L 76 89" className="stroke-emerald-400" />
          <path d="M 76 58 L 88 74 L 84 89" />
          {/* Explosion / Impulse arcs */}
          <path d="M 40 88 C 50 65, 65 50, 80 40" className="stroke-emerald-500/60" strokeWidth="1.5" strokeDasharray="3,3" />
          <polyline points="76,38 82,40 78,46" className="stroke-emerald-500" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  // Default biomechanical athletic figure
  return (
    <div className={`flex items-center justify-center bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/60 ${className}`}>
      <svg viewBox="0 0 160 100" className="h-full max-h-24 w-auto stroke-zinc-400 fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="80" cy="25" r="7" className="stroke-emerald-400 fill-emerald-500/20" />
        <line x1="80" y1="32" x2="80" y2="60" />
        <path d="M 62 44 L 80 38 L 98 44" />
        <path d="M 80 60 L 70 88" />
        <path d="M 80 60 L 90 88" />
        <circle cx="80" cy="60" r="3" className="fill-emerald-400 stroke-none" />
      </svg>
    </div>
  );
};
