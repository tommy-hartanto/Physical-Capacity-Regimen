import { WorkoutExerciseItem, WorkoutType, DayOfWeek, WorkoutTemplate, WorkoutTemplateExercise, ExerciseDefinition } from '../types/training';
import { EXERCISE_LIBRARY } from './exerciseLibrary';

export const WORKOUT_TEMPLATES: Record<string, WorkoutTemplate> = {
  'lower_power': {
    workoutType: 'lower_power',
    title: 'Lower Strength + Power',
    shortDescription: 'Explosive jumps, bilateral squat & hinge, unilateral control, and Achilles/adductor tissue work.',
    estimatedMinutes: 75,
    exercises: [
      // 1. Preparation & Essential Warm-Up (~6 min)
      { exerciseId: 'ankle_dorsiflexion', targetSets: 2, targetDurationSec: 45, defaultRestSec: 20, coachNote: 'Active range + control at end-range' },
      { exerciseId: 'hip_90_90', targetSets: 2, targetDurationSec: 45, defaultRestSec: 20, coachNote: 'Internal & external hip capsule rotation' },
      { exerciseId: 'deep_squat_hold', targetSets: 2, targetDurationSec: 30, defaultRestSec: 20, coachNote: 'Pry open hips and rotate thoracic spine' },
      { exerciseId: 'hip_flexor_lunge', targetSets: 1, targetDurationSec: 40, defaultRestSec: 20, coachNote: 'Tuck pelvis, contract rear glute' },
      // 2. Power (~10 min)
      { exerciseId: 'broad_jump', targetSets: 3, targetReps: 3, defaultRestSec: 75, coachNote: 'Stop immediately if jump quality or stick stiffness drops' },
      { exerciseId: 'lateral_bound', targetSets: 2, targetReps: 4, defaultRestSec: 60, coachNote: 'Stick single-leg landing for 2s with zero knee wobble' },
      // 3. Primary Strength (~28 min)
      { exerciseId: 'back_squat', targetSets: 4, targetReps: 5, targetRepsRange: [5, 6], targetRpe: 7.5, defaultRestSec: 150, coachNote: 'Double progression: 4x5 -> 4x6 before +2.5-5% load' },
      { exerciseId: 'romanian_deadlift', targetSets: 3, targetReps: 8, targetRpe: 7.5, defaultRestSec: 120, coachNote: 'Controlled 3s eccentric stretch on hamstrings' },
      // 4. Secondary Movement (~18 min)
      { exerciseId: 'rfess', targetSets: 3, targetReps: 7, targetRepsRange: [6, 8], targetRpe: 8, defaultRestSec: 75, coachNote: 'Unilateral quad & hip stability' },
      { exerciseId: 'cossack_squat', targetSets: 2, targetReps: 7, targetRepsRange: [6, 8], defaultRestSec: 60, coachNote: 'Frontal plane depth with flat heel' },
      // 5. Structural / Tissue (~12 min)
      { exerciseId: 'standing_calf_raise', targetSets: 3, targetReps: 10, targetRepsRange: [8, 12], defaultRestSec: 60, coachNote: '1s dead pause at bottom stretches Achilles safely' },
      { exerciseId: 'tibialis_raise', targetSets: 2, targetReps: 18, targetRepsRange: [15, 20], defaultRestSec: 45, coachNote: 'Shins against shin splints and running impact' },
      { exerciseId: 'copenhagen_plank', targetSets: 2, targetDurationSec: 30, targetRpe: 8, defaultRestSec: 60, coachNote: 'Adductor and groin resilience' }
    ]
  },

  'upper_posture': {
    workoutType: 'upper_posture',
    title: 'Upper Strength + Posture',
    shortDescription: 'Upper power throws, horizontal press & vertical pull, scapular retractors, carries, and dragon flag.',
    estimatedMinutes: 74,
    exercises: [
      // 1. Preparation (~6 min)
      { exerciseId: 'thoracic_rotation', targetSets: 2, targetDurationSec: 40, defaultRestSec: 20, coachNote: 'Open up thoracic spine without moving pelvis' },
      { exerciseId: 'shoulder_cars', targetSets: 2, targetDurationSec: 40, defaultRestSec: 20, coachNote: 'Active articular rotation at glenohumeral joint' },
      { exerciseId: 'wall_slide', targetSets: 2, targetDurationSec: 40, defaultRestSec: 20, coachNote: 'Activate serratus anterior and lower trap' },
      // 2. Power (~10 min)
      { exerciseId: 'medball_chest_throw', targetSets: 3, targetReps: 5, defaultRestSec: 75, coachNote: 'Maximal chest velocity into wall' },
      { exerciseId: 'medball_rotational_throw', targetSets: 3, targetReps: 4, defaultRestSec: 60, coachNote: 'Power generated from rear hip pivot' },
      // 3. Primary Strength (~28 min)
      { exerciseId: 'bench_press', targetSets: 4, targetReps: 5, targetRepsRange: [5, 6], targetRpe: 7.5, defaultRestSec: 150, coachNote: 'Double progression: achieve 4x5, then 4x6, then add 2.5kg' },
      { exerciseId: 'weighted_pull_up', targetSets: 4, targetReps: 5, targetRepsRange: [5, 6], targetRpe: 7.5, defaultRestSec: 150, coachNote: 'Full dead hang to chin over bar' },
      // 4. Secondary Movement (~16 min)
      { exerciseId: 'half_kneeling_cable_press', targetSets: 3, targetReps: 8, targetRpe: 7.5, defaultRestSec: 60, coachNote: 'Rotary core stability + unilateral press' },
      { exerciseId: 'chest_supported_row', targetSets: 3, targetReps: 9, targetRepsRange: [8, 10], targetRpe: 8, defaultRestSec: 75, coachNote: 'Zero lumbar fatigue; squeeze scapulae' },
      // 5. Shoulder/Scapula & Tissue (~14 min)
      { exerciseId: 'cable_face_pull', targetSets: 2, targetReps: 12, targetRepsRange: [10, 15], defaultRestSec: 60, coachNote: 'External rotation at end for cuff health' },
      { exerciseId: 'cable_y_raise', targetSets: 2, targetReps: 12, targetRepsRange: [10, 15], defaultRestSec: 60, coachNote: 'Lower trap recruitment for posture' },
      { exerciseId: 'suitcase_carry', targetSets: 3, targetDistanceM: 40, defaultRestSec: 60, coachNote: '30-50m walking tall with anti-lateral flexion' },
      { exerciseId: 'dragon_flag_progression', targetSets: 3, targetReps: 4, targetRepsRange: [3, 6], defaultRestSec: 75, coachNote: 'Agonizingly slow 4s eccentric descent' }
    ]
  },

  'full_body_athletic': {
    workoutType: 'full_body_athletic',
    title: 'Full Body + Athletic Movement + Conditioning',
    shortDescription: 'Box jumps, deadlifts, single-leg RDLs, multi-planar lunges, cable lifts, and aerobic engine flush.',
    estimatedMinutes: 80,
    exercises: [
      // 1. Preparation (~6 min)
      { exerciseId: 'hip_90_90', targetSets: 1, targetDurationSec: 45, defaultRestSec: 20, coachNote: 'Rotational hip lubrication' },
      { exerciseId: 'thoracic_rotation', targetSets: 1, targetDurationSec: 45, defaultRestSec: 20, coachNote: 'Spinal thoracic mobility' },
      { exerciseId: 'ankle_dorsiflexion', targetSets: 1, targetDurationSec: 45, defaultRestSec: 20, coachNote: 'Ankle prep for box jumps & lunges' },
      // 2. Power (~10 min)
      { exerciseId: 'box_jump', targetSets: 3, targetReps: 3, defaultRestSec: 75, coachNote: 'Step down every rep; preserve Achilles tendons' },
      { exerciseId: 'medball_overhead_slam', targetSets: 3, targetReps: 5, defaultRestSec: 60, coachNote: 'Violent anterior sling closure' },
      // 3. Primary Strength (~26 min)
      { exerciseId: 'deadlift', targetSets: 3, targetReps: 5, targetRpe: 7.5, defaultRestSec: 180, coachNote: 'Pull slack out, wedge hips, drive floor away' },
      { exerciseId: 'single_leg_rdl', targetSets: 3, targetReps: 8, targetRpe: 7.5, defaultRestSec: 75, coachNote: 'Unilateral hinge & ankle stabilization' },
      // 4. Movement (~16 min)
      { exerciseId: 'walking_lunge', targetSets: 3, targetReps: 8, targetRpe: 8, defaultRestSec: 75, coachNote: 'Locomotive dynamic leg strength' },
      { exerciseId: 'cable_rotational_lift', targetSets: 3, targetReps: 8, defaultRestSec: 60, coachNote: 'Low-to-high transverse power transfer' },
      // 5. Tissue (~10 min)
      { exerciseId: 'hamstring_curl', targetSets: 2, targetReps: 11, targetRepsRange: [10, 12], defaultRestSec: 60, coachNote: 'Knee-flexion hamstring protection' },
      { exerciseId: 'seated_calf_raise', targetSets: 3, targetReps: 11, targetRepsRange: [10, 12], defaultRestSec: 60, coachNote: 'Soleus strength for running resilience' },
      { exerciseId: 'copenhagen_plank', targetSets: 1, targetDurationSec: 30, defaultRestSec: 60, coachNote: 'Adductor check (if needed)' },
      // 6. Conditioning (~10 min)
      { exerciseId: 'rower_bike_conditioning', targetSets: 1, targetDurationSec: 540, defaultRestSec: 60, coachNote: '8-10 min moderate conversational aerobic flush' }
    ]
  },

  'swim': {
    workoutType: 'swim',
    title: 'Aerobic Swimming Session',
    shortDescription: 'Continuous aerobic conditioning and breath rhythm in the pool.',
    estimatedMinutes: 50,
    exercises: []
  },

  'run': {
    workoutType: 'run',
    title: 'Aerobic Base Running',
    shortDescription: 'Easy conversational running for mitochondrial density and running economy.',
    estimatedMinutes: 45,
    exercises: []
  },

  'rest': {
    workoutType: 'rest',
    title: 'Rest & Tissue Recovery',
    shortDescription: 'Complete rest, light walking, optimal sleep, and connective tissue recovery.',
    estimatedMinutes: 0,
    exercises: []
  }
};

export const DEFAULT_WEEK_SCHEDULE: Record<DayOfWeek, WorkoutType> = {
  monday: 'lower_power',
  tuesday: 'upper_posture',
  wednesday: 'swim',
  thursday: 'full_body_athletic',
  friday: 'rest',
  saturday: 'run',
  sunday: 'rest'
};

export const DEFAULT_INITIAL_LOADS: Record<string, number> = {
  'back_squat': 60,
  'romanian_deadlift': 45,
  'bench_press': 50,
  'weighted_pull_up': 5,
  'deadlift': 65,
  'rfess': 14,
  'half_kneeling_cable_press': 17.5,
  'chest_supported_row': 18,
  'cable_face_pull': 20,
  'cable_y_raise': 6,
  'suitcase_carry': 24,
  'single_leg_rdl': 16,
  'walking_lunge': 16,
  'cable_rotational_lift': 15,
  'standing_calf_raise': 20,
  'hamstring_curl': 35,
  'seated_calf_raise': 25,
  'medball_chest_throw': 4,
  'medball_rotational_throw': 4,
  'medball_overhead_slam': 6
};

export function buildWorkoutSession(
  workoutType: WorkoutType,
  phaseNumber: number = 1,
  phaseWeek: number = 1,
  userTargetLoads: Record<string, number> = DEFAULT_INITIAL_LOADS,
  timeBudgetMin?: number,
  customTemplates?: Record<string, WorkoutTemplate>,
  customExercises?: ExerciseDefinition[]
): WorkoutExerciseItem[] {
  const mergedTemplates: Record<string, WorkoutTemplate> = {
    ...WORKOUT_TEMPLATES,
    ...(customTemplates || {})
  };
  const template = mergedTemplates[workoutType];
  if (!template || template.exercises.length === 0) return [];

  const customExMap = (customExercises || []).reduce((acc, ex) => {
    acc[ex.id] = ex;
    return acc;
  }, {} as Record<string, ExerciseDefinition>);

  const getDef = (id: string) => customExMap[id] || EXERCISE_LIBRARY[id];

  const items: WorkoutExerciseItem[] = template.exercises.map(item => {
    const def = getDef(item.exerciseId);
    const targetLoad = userTargetLoads[item.exerciseId];

    const prescribedSets = Array.from({ length: item.targetSets }, (_, i) => ({
      setNumber: i + 1,
      targetReps: item.targetReps,
      targetRepsRange: item.targetRepsRange,
      targetWeightKg: targetLoad,
      targetDurationSec: item.targetDurationSec,
      targetDistanceM: item.targetDistanceM,
      targetRpe: item.targetRpe || 7.5,
      prescribedRestSec: item.defaultRestSec || (def ? def.defaultRestSec : 90),
      notes: item.coachNote
    }));

    return {
      exerciseId: item.exerciseId,
      exerciseName: def ? def.name : item.exerciseId.replace(/_/g, ' '),
      tier: def ? def.category : 'primary_strength',
      prescribedSets,
      performedSets: [],
      coachRecommendation: item.coachNote
    };
  });

  // If time budget is specified (e.g. 60 min instead of 80 min), apply intelligent trimming hierarchy
  if (timeBudgetMin && timeBudgetMin < template.estimatedMinutes) {
    applyTimeCrunchHierarchy(items, timeBudgetMin, template.estimatedMinutes);
  }

  return items;
}

/**
 * Intelligent trimming rules according to user specification:
 * Hierarchy of preservation:
 * 1. Power
 * 2. Primary compound strength
 * 3. Major movement pattern
 * 4. Structural/tissue work
 * 5. Conditioning
 * 6. Optional accessories
 */
export function applyTimeCrunchHierarchy(items: WorkoutExerciseItem[], budgetMin: number, fullMin: number) {
  const diff = fullMin - budgetMin;
  
  if (diff >= 25) {
    // Severe crunch (e.g. 50-60 min available)
    // 1. Omit conditioning
    // 2. Reduce structural tissue work sets from 3 to 2, or omit Copenhagen/curls if already covered
    items.forEach(item => {
      if (item.tier === 'conditioning') {
        item.isSkipped = true;
        item.skipReason = 'Omitted due to time constraint (preserving power and compounds)';
      } else if (item.tier === 'structural_tissue') {
        if (item.exerciseId === 'copenhagen_plank' || item.exerciseId === 'cable_y_raise') {
          item.isSkipped = true;
          item.skipReason = 'Streamlined tissue work for time budget';
        } else {
          // Drop last set
          if (item.prescribedSets.length > 2) {
            item.prescribedSets = item.prescribedSets.slice(0, 2);
          }
        }
      }
    });
  } else if (diff >= 12) {
    // Mild crunch (e.g. 65-70 min available)
    items.forEach(item => {
      if (item.tier === 'conditioning') {
        // Shorten conditioning to 5 min
        if (item.prescribedSets[0]?.targetDurationSec) {
          item.prescribedSets[0].targetDurationSec = 300;
        }
      }
    });
  }
}
