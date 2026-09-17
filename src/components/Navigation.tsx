import React from 'react';
import { Calendar, Dumbbell, BarChart3, History, Settings, Play } from 'lucide-react';
import { useTraining } from '../context/TrainingContext';

export type TabType = 'today' | 'program' | 'capacity' | 'history' | 'settings';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onStartTodayWorkout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onStartTodayWorkout
}) => {
  const { activeWorkout, userProfile, currentDayOfWeek } = useTraining();
  const todayWorkoutType = userProfile.schedule[currentDayOfWeek];
  const isRest = todayWorkoutType === 'rest';

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-100 font-bold tracking-tight">
            <span className="text-emerald-400 font-mono text-xs">P•C</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-zinc-100 flex items-center gap-1.5">
              Physical Capacity
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                Phase {userProfile.currentPhase}
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium">
              Week {userProfile.currentWeekNumber} • 34yo Regimen
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {activeWorkout ? (
            <button
              onClick={onStartTodayWorkout}
              className="flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold px-3 py-1.5 rounded-full animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>In Session</span>
            </button>
          ) : !isRest && (
            <button
              onClick={onStartTodayWorkout}
              className="flex items-center space-x-1 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-semibold px-3 py-1.5 rounded-full transition shadow-sm active:scale-95"
            >
              <Play className="w-3 h-3 fill-zinc-950" />
              <span>Train</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile-First Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 pb-[calc(env(safe-area-inset-bottom)+6px)] pt-1 px-2">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          <button
            onClick={() => onSelectTab('today')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition ${
              currentTab === 'today'
                ? 'text-emerald-400 bg-zinc-900/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Dumbbell className="w-5 h-5 mb-1" />
            <span className="text-[11px] tracking-tight">Today</span>
          </button>

          <button
            onClick={() => onSelectTab('program')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition ${
              currentTab === 'program'
                ? 'text-emerald-400 bg-zinc-900/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-5 h-5 mb-1" />
            <span className="text-[11px] tracking-tight">Program</span>
          </button>

          <button
            onClick={() => onSelectTab('capacity')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition ${
              currentTab === 'capacity'
                ? 'text-emerald-400 bg-zinc-900/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-1" />
            <span className="text-[11px] tracking-tight">Capacity</span>
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition ${
              currentTab === 'history'
                ? 'text-emerald-400 bg-zinc-900/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History className="w-5 h-5 mb-1" />
            <span className="text-[11px] tracking-tight">Logbook</span>
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition ${
              currentTab === 'settings'
                ? 'text-emerald-400 bg-zinc-900/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-[11px] tracking-tight">Settings</span>
          </button>
        </div>
      </nav>
    </>
  );
};
