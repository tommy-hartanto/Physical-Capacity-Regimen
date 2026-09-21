export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type WorkoutType = 
  | 'lower_power' 
  | 'upper_posture' 
  | 'swim' 
  | 'full_body_athletic' 
  | 'rest' 
  | 'run'
  | (string & {});

export type MovementTier = 'prep' | 'power' | 'primary_strength' | 'secondary_movement' | 'structural_tissue' | 'conditioning' | 'optional_accessory';

export type ContractionFocus = 'explosive' | 'concentric_eccentric' | 'eccentric_emphasis' | 'isometric' | 'active_mobility';

export type PlaneOfMotion = 'sagittal' | 'frontal' | 'transverse' | 'multi_planar';

export interface TechniqueCue {
  text: string;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: MovementTier;
  targetMuscles: string[];
  primaryPlane: PlaneOfMotion;
  contraction: ContractionFocus;
  tempo?: string;
  cues: string[];
  mistakesToAvoid: string[];
  equipment: 'barbell' | 'dumbbell' | 'cable' | 'bodyweight' | 'medicine_ball' | 'box_bench' | 'machine_cardio' | 'pool' | 'track_road';
  alternativeExerciseIds?: string[];
  loadType: 'weight_kg' | 'added_weight_kg' | 'bodyweight' | 'duration_sec' | 'distance_m' | 'rpe_only';
  defaultRestSec: number;
  explanation: string;
  diagramSvgKey?: string;
}

export interface PrescribedSet {
  setNumber: number;
  targetReps?: number;
  targetRepsRange?: [number, number];
  targetWeightKg?: number;
  targetDurationSec?: number;
  targetDistanceM?: number;
  targetRpe?: number;
  prescribedRestSec: number;
  notes?: string;
}

export interface PerformedSet {
  setNumber: number;
  actualWeightKg?: number;
  actualReps?: number;
  actualDurationSec?: number;
  actualDistanceM?: number;
  actualRpe: number; // 6 to 10
  completed: boolean;
  notes?: string;
  loggedAt: string;
}

export interface WorkoutExerciseItem {
  exerciseId: string;
  exerciseName: string;
  tier: MovementTier;
  prescribedSets: PrescribedSet[];
  performedSets: PerformedSet[];
  coachRecommendation?: string;
  isSkipped?: boolean;
  skipReason?: string;
  customNotes?: string;
}

export interface ActiveWorkoutSession {
  sessionId: string;
  date: string;
  workoutType: WorkoutType;
  workoutTitle: string;
  phaseId: string;
  phaseWeek: number;
  startedAt: string;
  estimatedDurationMin: number;
  targetFinishAt?: string;
  currentExerciseIndex: number;
  exercises: WorkoutExerciseItem[];
  timeBudgetMin?: number;
  isCompleted: boolean;
}

export interface WorkoutLogEntry {
  id: string;
  date: string;
  workoutType: WorkoutType;
  title: string;
  durationMinutes: number;
  sessionRpe: number; // 1-10
  energyLevel: 1 | 2 | 3 | 4 | 5; // 1=very low, 5=peak
  painReported: boolean;
  painLocations?: string[]; // e.g., 'knee', 'lower_back', 'shoulder', 'elbow'
  painNotes?: string;
  completedAsPrescribed: boolean;
  summaryNotes?: string;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    tier: MovementTier;
    sets: PerformedSet[];
    targetLoad?: number;
    notes?: string;
  }[];
}

export interface CardioLogEntry {
  id: string;
  date: string;
  type: 'run' | 'swim';
  title: string;
  durationMinutes: number;
  distanceKm?: number;
  distanceMeters?: number;
  averagePace?: string; // e.g., "5:45 /km" or "2:10 /100m"
  averageHeartRate?: number;
  rpe: number;
  intervalsCompleted?: boolean;
  notes?: string;
}

export interface ScheduledDay {
  day: DayOfWeek;
  workoutType: WorkoutType;
  title: string;
  estimatedMin: number;
  isRestDay: boolean;
  isOptionalGymDay?: boolean;
}

export interface WorkoutTemplateExercise {
  exerciseId: string;
  targetSets: number;
  targetReps?: number;
  targetRepsRange?: [number, number];
  targetDurationSec?: number;
  targetDistanceM?: number;
  targetRpe?: number;
  defaultRestSec?: number;
  coachNote?: string;
}

export interface WorkoutTemplate {
  workoutType: WorkoutType;
  title: string;
  shortDescription: string;
  estimatedMinutes: number;
  exercises: WorkoutTemplateExercise[];
  isCustom?: boolean;
}

export interface TimerPreferences {
  autoStartRest: boolean;
  restSoundEnabled: boolean;
  restVibrationEnabled: boolean;
  restNotificationEnabled: boolean;
  keepScreenAwake: boolean;
}

export interface SecurityPreferences {
  pinEnabled: boolean;
  pinCode?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  bodyweightKg: number;
  unitPreference: 'kg' | 'lbs';
  availableGymDaysPerWeek: 3 | 4;
  schedule: Record<DayOfWeek, WorkoutType>;
  preferredSwimDay: DayOfWeek;
  preferredRunDay: DayOfWeek;
  currentPhase: number; // 1, 2, 3
  phaseStartWeek: number;
  currentWeekNumber: number;
  deloadSuggested: boolean;
  lastDeloadWeek: number;
  activeLoadTargets: Record<string, number>; // exerciseId -> targetKg
  timerPreferences: TimerPreferences;
  securityPreferences: SecurityPreferences;
  customTemplates?: Record<string, WorkoutTemplate>;
  customExercises?: ExerciseDefinition[];
}

export type CloudSyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export interface PhysicalAssessmentRecord {
  id: string;
  date: string;
  phaseCompleted: number;
  squat5rmKg: number;
  deadlift5rmKg: number;
  bench5rmKg: number;
  weightedPullUpKg: number;
  maxBodyweightPullUps: number;
  dragonFlagLevel: 'tuck_eccentric' | 'straddle_eccentric' | 'single_leg' | 'full_reps';
  broadJumpCm: number;
  run5kMinutes: number;
  easyRunPace: string;
  easyRunRpe: number;
  mobilityCheckpointScore: number; // 1 to 5
  swimmingDistanceMeters: number;
  swimmingRpe: number;
  notes?: string;
}

export interface ReminderConfig {
  enabled: boolean;
  preferredWorkoutTime: string; // "07:30"
  notifySwim: boolean;
  notifyRun: boolean;
  notifyReassessment: boolean;
}

