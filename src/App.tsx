import React, { useState } from 'react';
import { TrainingProvider, useTraining } from './context/TrainingContext';
import { Navigation, TabType } from './components/Navigation';
import { TodayView } from './components/TodayView';
import { ProgramView } from './components/ProgramView';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { WorkoutExecution } from './components/WorkoutExecution';
import { PostWorkoutModal } from './components/PostWorkoutModal';
import { CardioLoggerModal } from './components/CardioLoggerModal';
import { AssessmentModal } from './components/AssessmentModal';
import { WorkoutType } from './types/training';

const MainAppContent: React.FC = () => {
  const { activeWorkout, startWorkout, cancelActiveWorkout, userProfile, currentDayOfWeek } = useTraining();
  const [currentTab, setCurrentTab] = useState<TabType>('today');
  const [isExecuting, setIsExecuting] = useState<boolean>(() => !!activeWorkout);
  const [showPostWorkoutModal, setShowPostWorkoutModal] = useState<boolean>(false);
  const [showCardioModal, setShowCardioModal] = useState<{ open: boolean; type: 'run' | 'swim' }>({
    open: false,
    type: 'run'
  });
  const [showAssessmentModal, setShowAssessmentModal] = useState<boolean>(false);

  const handleStartWorkout = (type?: WorkoutType, timeBudgetMin?: number) => {
    const targetType = type || userProfile.schedule[currentDayOfWeek];
    if (targetType === 'rest') return;

    if (!activeWorkout || activeWorkout.workoutType !== targetType) {
      startWorkout(targetType, timeBudgetMin);
    }
    setIsExecuting(true);
  };

  const handleFinishWorkout = () => {
    setShowPostWorkoutModal(true);
  };

  const handlePostWorkoutComplete = () => {
    setShowPostWorkoutModal(false);
    setIsExecuting(false);
    setCurrentTab('history');
  };

  const handleCancelWorkout = () => {
    if (confirm('Are you sure you want to pause/exit this active workout session? You can resume it anytime today.')) {
      setIsExecuting(false);
    }
  };

  // If in active workout execution screen, render full-screen immersive view
  if (isExecuting && activeWorkout) {
    return (
      <>
        <WorkoutExecution
          onFinish={handleFinishWorkout}
          onCancel={handleCancelWorkout}
        />
        {showPostWorkoutModal && (
          <PostWorkoutModal onComplete={handlePostWorkoutComplete} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onStartTodayWorkout={() => handleStartWorkout()}
      />

      {/* Main Tab Screen Router */}
      <main className="flex-1 pb-24">
        {currentTab === 'today' && (
          <TodayView
            onStartWorkout={handleStartWorkout}
            onOpenCardioLogger={(type) => setShowCardioModal({ open: true, type })}
            onViewProgram={() => setCurrentTab('program')}
          />
        )}

        {currentTab === 'program' && <ProgramView />}

        {currentTab === 'capacity' && (
          <DashboardView onStartAssessment={() => setShowAssessmentModal(true)} />
        )}

        {currentTab === 'history' && <HistoryView />}

        {currentTab === 'settings' && <SettingsView />}
      </main>

      {/* Cardio Logger Modal */}
      {showCardioModal.open && (
        <CardioLoggerModal
          initialType={showCardioModal.type}
          onClose={() => setShowCardioModal({ open: false, type: 'run' })}
        />
      )}

      {/* 8-12 Week Assessment Battery Modal */}
      {showAssessmentModal && (
        <AssessmentModal onClose={() => setShowAssessmentModal(false)} />
      )}

      {/* Post Workout Debrief Modal (if triggered outside execution) */}
      {showPostWorkoutModal && (
        <PostWorkoutModal onComplete={handlePostWorkoutComplete} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <TrainingProvider>
      <MainAppContent />
    </TrainingProvider>
  );
}
