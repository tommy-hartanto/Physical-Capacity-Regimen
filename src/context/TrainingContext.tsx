import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  UserProfile,
  ActiveWorkoutSession,
  WorkoutLogEntry,
  CardioLogEntry,
  PhysicalAssessmentRecord,
  DayOfWeek,
  WorkoutType,
  PerformedSet,
  ReminderConfig,
  WorkoutTemplate,
  ExerciseDefinition,
  CloudSyncStatus,
  TimerPreferences,
  SecurityPreferences
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
  allTemplates: Record<string, WorkoutTemplate>;
  allExercises: Record<string, ExerciseDefinition>;
  cloudSyncStatus: CloudSyncStatus;
  lastCloudSync: string | null;
  syncToCloudNow: () => Promise<boolean>;
  isAppLocked: boolean;
  unlockApp: (pin: string) => boolean;
  lockApp: () => void;
  showUtilityTimers: boolean;
  setShowUtilityTimers: (show: boolean) => void;
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
  saveCustomTemplate: (template: WorkoutTemplate) => void;
  deleteCustomTemplate: (workoutType: string) => void;
  addCustomExercise: (exercise: ExerciseDefinition) => void;
  updateCustomExercise: (exercise: ExerciseDefinition) => void;
  deleteCustomExercise: (exerciseId: string) => void;
  updateWorkoutLog: (updatedLog: WorkoutLogEntry) => void;
  deleteWorkoutLog: (logId: string) => void;
  updateCardioLog: (updatedLog: CardioLogEntry) => void;
  deleteCardioLog: (logId: string) => void;
  setUnitPreference: (unit: 'kg' | 'lbs') => void;
  updateTimerPreferences: (prefs: Partial<TimerPreferences>) => void;
  updateSecurityPreferences: (prefs: Partial<SecurityPreferences>) => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
  completeOnboarding: (confirmedLoads: Record<string, number>, daysPerWeek: 3 | 4, swimDay: DayOfWeek, runDay: DayOfWeek) => void;
  resetToDefaults: () => void;
}

const TrainingContext = createContext<TrainingContextType | null>(null);

const STORAGE_KEYS = {
  USER_PROFILE: 'training_user_profile_v2',
  ACTIVE_WORKOUT: 'training_active_workout_v2',
  WORKOUT_LOGS: 'training_workout_logs_v2',
  CARDIO_LOGS: 'training_cardio_logs_v2',
  ASSESSMENTS: 'training_assessments_v2',
  ONBOARDING: 'training_onboarding_v2',
  REMINDERS: 'training_reminders_v2',
  APP_UNLOCKED: 'training_app_unlocked_session'
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Athlete',
  age: 34,
  bodyweightKg: 78,
  unitPreference: 'kg',
  availableGymDaysPerWeek: 3,
  schedule: DEFAULT_WEEK_SCHEDULE,
  preferredSwimDay: 'wednesday',
  preferredRunDay: 'saturday',
  currentPhase: 1,
  phaseStartWeek: 1,
  currentWeekNumber: 1,
  deloadSuggested: false,
  lastDeloadWeek: 0,
  activeLoadTargets: DEFAULT_INITIAL_LOADS,
  timerPreferences: {
    autoStartRest: true,
    restSoundEnabled: true,
    restVibrationEnabled: true,
    restNotificationEnabled: false,
    keepScreenAwake: true
  },
  securityPreferences: {
    pinEnabled: false,
    pinCode: undefined
  },
  customTemplates: {},
  customExercises: []
};

export function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayIndex = new Date().getDay();
  return days[todayIndex];
}

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
  // 1. User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE) || localStorage.getItem('training_user_profile_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          unitPreference: parsed.unitPreference || 'kg',
          timerPreferences: { ...DEFAULT_PROFILE.timerPreferences, ...(parsed.timerPreferences || {}) },
          securityPreferences: { ...DEFAULT_PROFILE.securityPreferences, ...(parsed.securityPreferences || {}) },
          customTemplates: parsed.customTemplates || {},
          customExercises: parsed.customExercises || []
        };
      }
      return DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // 2. Active Workout
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT) || localStorage.getItem('training_active_workout_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 3. Workout Logs
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS) || localStorage.getItem('training_workout_logs_v1');
      if (saved) return JSON.parse(saved);
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

  // 4. Cardio Logs
  const [cardioLogs, setCardioLogs] = useState<CardioLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CARDIO_LOGS) || localStorage.getItem('training_cardio_logs_v1');
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

  // 5. Assessments
  const [assessments, setAssessments] = useState<PhysicalAssessmentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS) || localStorage.getItem('training_assessments_v1');
      return saved ? JSON.parse(saved) : [INITIAL_BENCHMARK_ASSESSMENT];
    } catch {
      return [INITIAL_BENCHMARK_ASSESSMENT];
    }
  });

  // 6. Onboarding & Reminders
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ONBOARDING) === 'true';
    } catch {
      return false;
    }
  });

  const [reminders, setReminders] = useState<ReminderConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS) || localStorage.getItem('training_reminders_v1');
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

  // 7. Security PIN Lock
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    try {
      const pinEnabled = userProfile.securityPreferences?.pinEnabled;
      const isSessionUnlocked = sessionStorage.getItem(STORAGE_KEYS.APP_UNLOCKED) === 'true';
      return !!pinEnabled && !isSessionUnlocked;
    } catch {
      return false;
    }
  });

  // 8. Utility Timers Modal Toggle
  const [showUtilityTimers, setShowUtilityTimers] = useState<boolean>(false);

  // 9. Cloud Sync Engine (Fly.io)
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('idle');
  const [lastCloudSync, setLastCloudSync] = useState<string | null>(null);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Consolidated template map
  const allTemplates = {
    ...WORKOUT_TEMPLATES,
    ...(userProfile.customTemplates || {})
  };

  // Consolidated exercise library map
  const allExercises = (userProfile.customExercises || []).reduce((acc, ex) => {
    acc[ex.id] = ex;
    return acc;
  }, {} as Record<string, ExerciseDefinition>);

  // Save changes to localStorage immediately as local offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
    } catch (e) {
      console.warn('Failed to write userProfile to localStorage', e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      if (activeWorkout) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(activeWorkout));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      }
    } catch (e) {
      console.warn('Failed to write activeWorkout to localStorage', e);
    }
  }, [activeWorkout]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(workoutLogs));
    } catch (e) {
      console.warn('Failed to write workoutLogs to localStorage', e);
    }
  }, [workoutLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CARDIO_LOGS, JSON.stringify(cardioLogs));
    } catch (e) {
      console.warn('Failed to write cardioLogs to localStorage', e);
    }
  }, [cardioLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
    } catch (e) {
      console.warn('Failed to write assessments to localStorage', e);
    }
  }, [assessments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING, String(onboardingCompleted));
    } catch (e) {
      console.warn('Failed to write onboarding to localStorage', e);
    }
  }, [onboardingCompleted]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    } catch (e) {
      console.warn('Failed to write reminders to localStorage', e);
    }
  }, [reminders]);

  // Cloud Sync to Fly.io server
  const syncToCloudNow = useCallback(async (): Promise<boolean> => {
    try {
      setCloudSyncStatus('syncing');
      const payload = {
        data: {
          userProfile,
          workoutLogs,
          cardioLogs,
          assessments,
          onboardingCompleted,
          reminders
        }
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (userProfile.securityPreferences?.pinCode) {
        headers['x-app-pin'] = userProfile.securityPreferences.pinCode;
      }

      const res = await fetch('/api/data', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Sync failed with HTTP status ${res.status}`);
      }

      const json = await res.json();
      setCloudSyncStatus('synced');
      setLastCloudSync(json.updatedAt || new Date().toLocaleTimeString());
      return true;
    } catch (err) {
      console.warn('[Fly Cloud Sync] Sync skipped or offline:', err);
      setCloudSyncStatus('offline');
      return false;
    }
  }, [userProfile, workoutLogs, cardioLogs, assessments, onboardingCompleted, reminders]);

  // Initial cloud hydration on boot
  useEffect(() => {
    const hydrateFromCloud = async () => {
      try {
        setCloudSyncStatus('syncing');
        const headers: Record<string, string> = {};
        if (userProfile.securityPreferences?.pinCode) {
          headers['x-app-pin'] = userProfile.securityPreferences.pinCode;
        }

        const res = await fetch('/api/data', { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.exists && json.data) {
            const cloudData = json.data;
            if (cloudData.userProfile) setUserProfile(cloudData.userProfile);
            if (cloudData.workoutLogs) setWorkoutLogs(cloudData.workoutLogs);
            if (cloudData.cardioLogs) setCardioLogs(cloudData.cardioLogs);
            if (cloudData.assessments) setAssessments(cloudData.assessments);
            if (cloudData.reminders) setReminders(cloudData.reminders);
            if (typeof cloudData.onboardingCompleted === 'boolean') {
              setOnboardingCompleted(cloudData.onboardingCompleted);
            }
            setCloudSyncStatus('synced');
            setLastCloudSync(json.updatedAt || new Date().toLocaleTimeString());
            console.log('[Fly Cloud Sync] Successfully hydrated data from Fly.io storage');
            return;
          } else {
            // First time on Fly.io volume: sync local baseline to cloud
            await syncToCloudNow();
          }
        } else {
          setCloudSyncStatus('offline');
        }
      } catch {
        // Running locally or offline in gym
        setCloudSyncStatus('offline');
      }
    };

    hydrateFromCloud();
  }, []); // Run once on mount

  // Debounced auto-sync to Fly.io whenever core state changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncToCloudNow();
    }, 1200);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [userProfile, workoutLogs, cardioLogs, assessments, reminders, onboardingCompleted, syncToCloudNow]);

  const currentDayOfWeek = getTodayDayOfWeek();

  // Actions
  const startWorkout = (type?: WorkoutType, timeBudgetMin?: number) => {
    const workoutTypeToStart = type || userProfile.schedule[currentDayOfWeek];
    if (workoutTypeToStart === 'rest') return;

    const template = allTemplates[workoutTypeToStart];
    if (!template) return;

    const exercises = buildWorkoutSession(
      workoutTypeToStart,
      userProfile.currentPhase,
      userProfile.currentWeekNumber,
      userProfile.activeLoadTargets,
      timeBudgetMin,
      userProfile.customTemplates,
      userProfile.customExercises
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
    setUserProfile(prev => ({
      ...prev,
      currentPhase: prev.currentPhase < 3 ? prev.currentPhase + 1 : 1,
      currentWeekNumber: 1,
      lastDeloadWeek: 0,
      deloadSuggested: false
    }));
  };

  // Custom Templates CRUD
  const saveCustomTemplate = (template: WorkoutTemplate) => {
    setUserProfile(prev => ({
      ...prev,
      customTemplates: {
        ...(prev.customTemplates || {}),
        [template.workoutType]: template
      }
    }));
  };

  const deleteCustomTemplate = (workoutType: string) => {
    setUserProfile(prev => {
      const updated = { ...(prev.customTemplates || {}) };
      delete updated[workoutType];
      return {
        ...prev,
        customTemplates: updated
      };
    });
  };

  // Custom Exercises CRUD
  const addCustomExercise = (exercise: ExerciseDefinition) => {
    setUserProfile(prev => ({
      ...prev,
      customExercises: [...(prev.customExercises || []), exercise]
    }));
  };

  const updateCustomExercise = (exercise: ExerciseDefinition) => {
    setUserProfile(prev => ({
      ...prev,
      customExercises: (prev.customExercises || []).map(ex => (ex.id === exercise.id ? exercise : ex))
    }));
  };

  const deleteCustomExercise = (exerciseId: string) => {
    setUserProfile(prev => ({
      ...prev,
      customExercises: (prev.customExercises || []).filter(ex => ex.id !== exerciseId)
    }));
  };

  // Logbook Editing & Deletion
  const updateWorkoutLog = (updatedLog: WorkoutLogEntry) => {
    setWorkoutLogs(prev => prev.map(log => (log.id === updatedLog.id ? updatedLog : log)));
  };

  const deleteWorkoutLog = (logId: string) => {
    setWorkoutLogs(prev => prev.filter(log => log.id !== logId));
  };

  const updateCardioLog = (updatedLog: CardioLogEntry) => {
    setCardioLogs(prev => prev.map(log => (log.id === updatedLog.id ? updatedLog : log)));
  };

  const deleteCardioLog = (logId: string) => {
    setCardioLogs(prev => prev.filter(log => log.id !== logId));
  };

  // Preferences
  const setUnitPreference = (unit: 'kg' | 'lbs') => {
    setUserProfile(prev => ({ ...prev, unitPreference: unit }));
  };

  const updateTimerPreferences = (prefs: Partial<TimerPreferences>) => {
    setUserProfile(prev => ({
      ...prev,
      timerPreferences: {
        ...prev.timerPreferences,
        ...prefs
      }
    }));
  };

  const updateSecurityPreferences = (prefs: Partial<SecurityPreferences>) => {
    setUserProfile(prev => ({
      ...prev,
      securityPreferences: {
        ...prev.securityPreferences,
        ...prefs
      }
    }));
  };

  // PIN Unlock / Lock
  const unlockApp = (pin: string): boolean => {
    if (!userProfile.securityPreferences?.pinEnabled || !userProfile.securityPreferences?.pinCode) {
      setIsAppLocked(false);
      return true;
    }
    if (userProfile.securityPreferences.pinCode === pin.trim()) {
      setIsAppLocked(false);
      try {
        sessionStorage.setItem(STORAGE_KEYS.APP_UNLOCKED, 'true');
      } catch {
        // safe
      }
      return true;
    }
    return false;
  };

  const lockApp = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.APP_UNLOCKED);
    } catch {
      // safe
    }
    setIsAppLocked(true);
  };

  const exportDataJson = () => {
    const payload = {
      version: 2,
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
    sessionStorage.clear();
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
        allTemplates,
        allExercises,
        cloudSyncStatus,
        lastCloudSync,
        syncToCloudNow,
        isAppLocked,
        unlockApp,
        lockApp,
        showUtilityTimers,
        setShowUtilityTimers,
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
        saveCustomTemplate,
        deleteCustomTemplate,
        addCustomExercise,
        updateCustomExercise,
        deleteCustomExercise,
        updateWorkoutLog,
        deleteWorkoutLog,
        updateCardioLog,
        deleteCardioLog,
        setUnitPreference,
        updateTimerPreferences,
        updateSecurityPreferences,
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
