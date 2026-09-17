import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  ActiveWorkoutSession,
  WorkoutLogEntry,
  CardioLogEntry,
  PhysicalAssessmentRecord,
  DayOfWeek,
  WorkoutType,
  PerformedSet,
  ReminderConfig
} from '../types/training';
import { DEFAULT_WEEK_SCHEDULE, DEFAULT_INITIAL_LOADS, WORKOUT_TEMPLATES, buildWorkoutSession } from '../data/defaultProgram';
import { calculateNextPrescription, evaluateDeloadNeed } from '../utils/progressionEngine';

interface TrainingContextType {
  userProfile: UserProfile;
  activeWorkout: ActiveWorkoutSession | null;
  workoutLogs: WorkoutLogEntry[];
  cardioLogs: CardioLogEntry[];
  assessments: PhysicalAssessmentRecord[];
  onboardingCompleted: boolean;
  reminders: ReminderConfig;
  currentDayOfWeek: DayOfWeek;
  startWorkout: (type?: WorkoutType, timeBudgetMin?: number) => void;
  updateActiveWorkout: (workout: ActiveWorkoutSession) => void;
  logSetForCurrentExercise: (exerciseIndex: number, set: PerformedSet) => void;
  skipExercise: (exerciseIndex: number, reason: string) => void;
  swapExercise: (exerciseIndex: number, newExerciseId: string) => void;
  finishWorkout: (debrief: {
    sessionRpe: number;
    energyLevel: 1 | 2 | 3 | 4 | 5;
    painReported: boolean;
    painLocations?: string[];
    painNotes?: string;
    notes?: string;
  }) => WorkoutLogEntry;
  cancelWorkout: () => void;
  logCardioSession: (entry: Omit<CardioLogEntry, 'id'>) => void;
  updateSchedule: (schedule: Record<DayOfWeek, WorkoutType>) => void;
  setGymDaysPerWeek: (days: 3 | 4) => void;
  updateTargetLoad: (exerciseId: string, newKg: number) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateReminders: (reminders: ReminderConfig) => void;
  saveAssessment: (record: Omit<PhysicalAssessmentRecord, 'id'>) => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
  completeOnboarding: (confirmedLoads: Record<string, number>, daysPerWeek: 3 | 4, swimDay: DayOfWeek, runDay: DayOfWeek) => void;
  resetToDefaults: () => void;
}

const TrainingContext = createContext<TrainingContextType | null>(null);

const STORAGE_KEYS = {
  USER_PROFILE: 'training_user_profile_v1',
  ACTIVE_WORKOUT: 'training_active_workout_v1',
  WORKOUT_LOGS: 'training_workout_logs_v1',
  CARDIO_LOGS: 'training_cardio_logs_v1',
  ASSESSMENTS: 'training_assessments_v1',
  ONBOARDING: 'training_onboarding_v1',
  REMINDERS: 'training_reminders_v1'
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Athlete',
  age: 34,
  bodyweightKg: 78,
  availableGymDaysPerWeek: 3,
  schedule: DEFAULT_WEEK_SCHEDULE,
  preferredSwimDay: 'wednesday',
  preferredRunDay: 'saturday',
  currentPhase: 1,
  phaseStartWeek: 1,
  currentWeekNumber: 1,
  deloadSuggested: false,
  lastDeloadWeek: 0,
  activeLoadTargets: DEFAULT_INITIAL_LOADS
};

export function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayIndex = new Date().getDay();
  return days[todayIndex];
}

// Initial realistic baseline data for this user
const INITIAL_BENCHMARK_ASSESSMENT: PhysicalAssessmentRecord = {
  id: 'baseline_01',
  date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  phaseCompleted: 0,
  squat5rmKg: 70,
  deadlift5rmKg: 75,
  bench5rmKg: 60,
  weightedPullUpKg: 5,
  maxBodyweightPullUps: 10,
  dragonFlagLevel: 'tuck_eccentric',
  broadJumpCm: 215,
  run5kMinutes: 28.5,
  easyRunPace: '5:45 /km',
  easyRunRpe: 7.5,
  mobilityCheckpointScore: 3,
  swimmingDistanceMeters: 1200,
  swimmingRpe: 7
};

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
      if (saved) return JSON.parse(saved);
      // Sample recent logs to give the user immediate rich history
      return [
        {
          id: 'log_prev_01',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          workoutType: 'lower_power',
          title: 'Lower Strength + Power',
          durationMinutes: 72,
          sessionRpe: 7.5,
          energyLevel: 4,
          painReported: false,
          completedAsPrescribed: true,
          summaryNotes: 'Felt crisp. Solid broad jumps and clean 60kg back squat sets.',
          exercises: [
            {
              exerciseId: 'back_squat',
              exerciseName: 'Barbell Back Squat',
              tier: 'primary_strength',
              targetLoad: 60,
              sets: [
                { setNumber: 1, actualWeightKg: 60, actualReps: 5, actualRpe: 7, completed: true, loggedAt: '' },
                { setNumber: 2, actualWeightKg: 60, actualReps: 5, actualRpe: 7.5, completed: true, loggedAt: '' },
                { setNumber: 3, actualWeightKg: 60, actualReps: 5, actualRpe: 7.5, completed: true, loggedAt: '' },
                { setNumber: 4, actualWeightKg: 60, actualReps: 5, actualRpe: 8, completed: true, loggedAt: '' }
              ]
            },
            {
              exerciseId: 'romanian_deadlift',
              exerciseName: 'Romanian Deadlift (RDL)',
              tier: 'primary_strength',
              targetLoad: 45,
              sets: [
                { setNumber: 1, actualWeightKg: 45, actualReps: 8, actualRpe: 7, completed: true, loggedAt: '' },
                { setNumber: 2, actualWeightKg: 45, actualReps: 8, actualRpe: 7.5, completed: true, loggedAt: '' },
                { setNumber: 3, actualWeightKg: 45, actualReps: 8, actualRpe: 7.5, completed: true, loggedAt: '' }
              ]
            }
          ]
        },
        {
          id: 'log_prev_02',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          workoutType: 'upper_posture',
          title: 'Upper Strength + Posture',
          durationMinutes: 70,
          sessionRpe: 7.5,
          energyLevel: 4,
          painReported: false,
          completedAsPrescribed: true,
          summaryNotes: 'Bench pressed 50kg smoothly. Weighted pull-ups +5kg with strict hollow body.',
          exercises: [
            {
              exerciseId: 'bench_press',
              exerciseName: 'Barbell Bench Press',
              tier: 'primary_strength',
              targetLoad: 50,
              sets: [
                { setNumber: 1, actualWeightKg: 50, actualReps: 5, actualRpe: 7, completed: true, loggedAt: '' },
                { setNumber: 2, actualWeightKg: 50, actualReps: 5, actualRpe: 7.5, completed: true, loggedAt: '' },
                { setNumber: 3, actualWeightKg: 50, actualReps: 5, actualRpe: 7.5, completed: true, loggedAt: '' },
                { setNumber: 4, actualWeightKg: 50, actualReps: 5, actualRpe: 8, completed: true, loggedAt: '' }
              ]
            },
            {
              exerciseId: 'weighted_pull_up',
              exerciseName: 'Weighted Pull-Up (or Bodyweight)',
              tier: 'primary_strength',
              targetLoad: 5,
              sets: [
                { setNumber: 1, actualWeightKg: 5, actualReps: 5, actualRpe: 7.5, completed: true, loggedAt: '' },
                { setNumber: 2, actualWeightKg: 5, actualReps: 5, actualRpe: 8, completed: true, loggedAt: '' },
                { setNumber: 3, actualWeightKg: 5, actualReps: 5, actualRpe: 8, completed: true, loggedAt: '' },
                { setNumber: 4, actualWeightKg: 5, actualReps: 5, actualRpe: 8, completed: true, loggedAt: '' }
              ]
            }
          ]
        }
      ];
    } catch {
      return [];
    }
  });

  const [cardioLogs, setCardioLogs] = useState<CardioLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CARDIO_LOGS);
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'cardio_01',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'swim',
          title: 'Weekly Continuous Swim',
          durationMinutes: 45,
          distanceMeters: 1400,
          averagePace: '2:15 /100m',
          rpe: 6.5,
          notes: 'Smooth bilateral breathing. Focused on long glide.'
        },
        {
          id: 'cardio_02',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'run',
          title: 'Conversational Base Run',
          durationMinutes: 35,
          distanceKm: 5.8,
          averagePace: '6:02 /km',
          rpe: 6.5,
          notes: 'Kept nasal breathing throughout. Easy aerobic recovery.'
        }
      ];
    } catch {
      return [];
    }
  });

  const [assessments, setAssessments] = useState<PhysicalAssessmentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
      return saved ? JSON.parse(saved) : [INITIAL_BENCHMARK_ASSESSMENT];
    } catch {
      return [INITIAL_BENCHMARK_ASSESSMENT];
    }
  });

  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ONBOARDING) === 'true';
    } catch {
      return false;
    }
  });

  const [reminders, setReminders] = useState<ReminderConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      return saved ? JSON.parse(saved) : {
        enabled: true,
        preferredWorkoutTime: '07:30',
        notifySwim: true,
        notifyRun: true,
        notifyReassessment: true
      };
    } catch {
      return {
        enabled: true,
        preferredWorkoutTime: '07:30',
        notifySwim: true,
        notifyRun: true,
        notifyReassessment: true
      };
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    }
  }, [activeWorkout]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CARDIO_LOGS, JSON.stringify(cardioLogs));
  }, [cardioLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, String(onboardingCompleted));
  }, [onboardingCompleted]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  const currentDayOfWeek = getTodayDayOfWeek();

  const startWorkout = (type?: WorkoutType, timeBudgetMin?: number) => {
    const workoutTypeToStart = type || userProfile.schedule[currentDayOfWeek];
    if (workoutTypeToStart === 'rest') return;

    const template = WORKOUT_TEMPLATES[workoutTypeToStart];
    if (!template) return;

    const exercises = buildWorkoutSession(
      workoutTypeToStart,
      userProfile.currentPhase,
      userProfile.currentWeekNumber,
      userProfile.activeLoadTargets,
      timeBudgetMin
    );

    const newSession: ActiveWorkoutSession = {
      sessionId: `session_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      workoutType: workoutTypeToStart,
      workoutTitle: template.title,
      phaseId: `phase_${userProfile.currentPhase}`,
      phaseWeek: userProfile.currentWeekNumber,
      startedAt: new Date().toISOString(),
      estimatedDurationMin: timeBudgetMin || template.estimatedMinutes,
      currentExerciseIndex: 0,
      exercises,
      timeBudgetMin,
      isCompleted: false
    };

    setActiveWorkout(newSession);
  };

  const updateActiveWorkout = (workout: ActiveWorkoutSession) => {
    setActiveWorkout(workout);
  };

  const logSetForCurrentExercise = (exerciseIndex: number, set: PerformedSet) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    const targetEx = updatedExercises[exerciseIndex];
    if (!targetEx) return;

    const existingIdx = targetEx.performedSets.findIndex(s => s.setNumber === set.setNumber);
    if (existingIdx >= 0) {
      targetEx.performedSets[existingIdx] = set;
    } else {
      targetEx.performedSets.push(set);
    }

    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
  };

  const skipExercise = (exerciseIndex: number, reason: string) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    if (updatedExercises[exerciseIndex]) {
      updatedExercises[exerciseIndex].isSkipped = true;
      updatedExercises[exerciseIndex].skipReason = reason;
    }
    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
  };

  const swapExercise = (exerciseIndex: number, newExerciseId: string) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    const currentItem = updatedExercises[exerciseIndex];
    if (!currentItem) return;

    const targetLoad = userProfile.activeLoadTargets[newExerciseId] || currentItem.prescribedSets[0]?.targetWeightKg || 20;

    const newPrescribed = currentItem.prescribedSets.map(s => ({
      ...s,
      targetWeightKg: targetLoad
    }));

    updatedExercises[exerciseIndex] = {
      ...currentItem,
      exerciseId: newExerciseId,
      exerciseName: newExerciseId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      prescribedSets: newPrescribed,
      performedSets: []
    };

    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
  };

  const finishWorkout = (debrief: {
    sessionRpe: number;
    energyLevel: 1 | 2 | 3 | 4 | 5;
    painReported: boolean;
    painLocations?: string[];
    painNotes?: string;
    notes?: string;
  }): WorkoutLogEntry => {
    if (!activeWorkout) throw new Error('No active workout session');

    const durationMin = Math.max(
      15,
      Math.round((Date.now() - new Date(activeWorkout.startedAt).getTime()) / 60000)
    );

    const logEntry: WorkoutLogEntry = {
      id: `log_${Date.now()}`,
      date: activeWorkout.date,
      workoutType: activeWorkout.workoutType,
      title: activeWorkout.workoutTitle,
      durationMinutes: durationMin,
      sessionRpe: debrief.sessionRpe,
      energyLevel: debrief.energyLevel,
      painReported: debrief.painReported,
      painLocations: debrief.painLocations,
      painNotes: debrief.painNotes,
      completedAsPrescribed: !activeWorkout.exercises.some(e => e.isSkipped),
      summaryNotes: debrief.notes,
      exercises: activeWorkout.exercises
        .filter(e => !e.isSkipped && e.performedSets.length > 0)
        .map(e => ({
          exerciseId: e.exerciseId,
          exerciseName: e.exerciseName,
          tier: e.tier,
          sets: e.performedSets,
          targetLoad: e.prescribedSets[0]?.targetWeightKg,
          notes: e.customNotes
        }))
    };

    // Update active load targets via double-progression engine
    const nextLoads = { ...userProfile.activeLoadTargets };
    activeWorkout.exercises.forEach(item => {
      if (item.isSkipped || item.performedSets.length === 0) return;
      const currentLoad = item.prescribedSets[0]?.targetWeightKg;
      if (currentLoad !== undefined) {
        const range = item.prescribedSets[0]?.targetRepsRange || [5, 6];
        const rec = calculateNextPrescription(
          item.exerciseId,
          item.performedSets,
          range,
          currentLoad,
          debrief.painReported,
          debrief.painLocations || []
        );
        if (rec.nextTargetWeightKg) {
          nextLoads[item.exerciseId] = rec.nextTargetWeightKg;
        }
      }
    });

    const updatedLogs = [logEntry, ...workoutLogs];
    setWorkoutLogs(updatedLogs);

    // Evaluate deload need
    const weeksSinceDeload = userProfile.currentWeekNumber - userProfile.lastDeloadWeek;
    const deloadEval = evaluateDeloadNeed(updatedLogs, weeksSinceDeload);

    setUserProfile(prev => ({
      ...prev,
      activeLoadTargets: nextLoads,
      deloadSuggested: deloadEval.suggestDeload
    }));

    setActiveWorkout(null);
    return logEntry;
  };

  const cancelWorkout = () => {
    setActiveWorkout(null);
  };

  const logCardioSession = (entry: Omit<CardioLogEntry, 'id'>) => {
    const newEntry: CardioLogEntry = {
      ...entry,
      id: `cardio_${Date.now()}`
    };
    setCardioLogs(prev => [newEntry, ...prev]);
  };

  const updateSchedule = (newSchedule: Record<DayOfWeek, WorkoutType>) => {
    setUserProfile(prev => ({
      ...prev,
      schedule: newSchedule
    }));
  };

  const setGymDaysPerWeek = (days: 3 | 4) => {
    setUserProfile(prev => {
      const schedule = { ...prev.schedule };
      if (days === 3) {
        // Enforce Monday (Lower), Tuesday (Upper), Thursday (Full body), omit 4th day
        schedule.monday = 'lower_power';
        schedule.tuesday = 'upper_posture';
        schedule.thursday = 'full_body_athletic';
      }
      return {
        ...prev,
        availableGymDaysPerWeek: days,
        schedule
      };
    });
  };

  const updateTargetLoad = (exerciseId: string, newKg: number) => {
    setUserProfile(prev => ({
      ...prev,
      activeLoadTargets: {
        ...prev.activeLoadTargets,
        [exerciseId]: newKg
      }
    }));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const updateReminders = (newReminders: ReminderConfig) => {
    setReminders(newReminders);
  };

  const saveAssessment = (record: Omit<PhysicalAssessmentRecord, 'id'>) => {
    const newRecord: PhysicalAssessmentRecord = {
      ...record,
      id: `assessment_${Date.now()}`
    };
    setAssessments(prev => [newRecord, ...prev]);
    // Advance phase if assessment completed
    setUserProfile(prev => ({
      ...prev,
      currentPhase: prev.currentPhase < 3 ? prev.currentPhase + 1 : 1,
      currentWeekNumber: 1,
      lastDeloadWeek: 0,
      deloadSuggested: false
    }));
  };

  const exportDataJson = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      userProfile,
      workoutLogs,
      cardioLogs,
      assessments,
      reminders
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDataJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.userProfile) setUserProfile(data.userProfile);
      if (data.workoutLogs) setWorkoutLogs(data.workoutLogs);
      if (data.cardioLogs) setCardioLogs(data.cardioLogs);
      if (data.assessments) setAssessments(data.assessments);
      if (data.reminders) setReminders(data.reminders);
      return true;
    } catch (e) {
      console.error('Failed to import backup JSON', e);
      return false;
    }
  };

  const completeOnboarding = (
    confirmedLoads: Record<string, number>,
    daysPerWeek: 3 | 4,
    swimDay: DayOfWeek,
    runDay: DayOfWeek
  ) => {
    const newSchedule = { ...DEFAULT_WEEK_SCHEDULE };
    newSchedule[swimDay] = 'swim';
    newSchedule[runDay] = 'run';

    setUserProfile(prev => ({
      ...prev,
      availableGymDaysPerWeek: daysPerWeek,
      schedule: newSchedule,
      preferredSwimDay: swimDay,
      preferredRunDay: runDay,
      activeLoadTargets: {
        ...prev.activeLoadTargets,
        ...confirmedLoads
      }
    }));
    setOnboardingCompleted(true);
  };

  const resetToDefaults = () => {
    setUserProfile(DEFAULT_PROFILE);
    setActiveWorkout(null);
    setWorkoutLogs([]);
    setCardioLogs([]);
    setAssessments([INITIAL_BENCHMARK_ASSESSMENT]);
    setOnboardingCompleted(false);
    localStorage.clear();
  };

  return (
    <TrainingContext.Provider
      value={{
        userProfile,
        activeWorkout,
        workoutLogs,
        cardioLogs,
        assessments,
        onboardingCompleted,
        reminders,
        currentDayOfWeek,
        startWorkout,
        updateActiveWorkout,
        logSetForCurrentExercise,
        skipExercise,
        swapExercise,
        finishWorkout,
        cancelWorkout,
        logCardioSession,
        updateSchedule,
        setGymDaysPerWeek,
        updateTargetLoad,
        updateUserProfile,
        updateReminders,
        saveAssessment,
        exportDataJson,
        importDataJson,
        completeOnboarding,
        resetToDefaults
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
};

export const useTraining = () => {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
};
