import { WorkoutLogEntry, PerformedSet } from '../types/training';

export interface ProgressionRecommendation {
  nextTargetWeightKg?: number;
  nextTargetReps?: number;
  message: string;
  rationale: string;
  status: 'advance_load' | 'increase_reps' | 'maintain' | 'deload_caution' | 'pain_protect';
}

/**
 * Calculates double-progression recommendation for an exercise
 */
export function calculateNextPrescription(
  exerciseId: string,
  lastPerformedSets: PerformedSet[],
  targetRepsRange: [number, number] = [5, 6],
  currentTargetLoadKg: number,
  reportedPain: boolean = false,
  painLocations: string[] = []
): ProgressionRecommendation {
  // 1. Pain protection override
  const isLowerBody = ['back_squat', 'romanian_deadlift', 'deadlift', 'rfess', 'walking_lunge'].includes(exerciseId);
  const isUpperBody = ['bench_press', 'weighted_pull_up', 'half_kneeling_cable_press', 'chest_supported_row'].includes(exerciseId);

  if (reportedPain) {
    const hasRelevantPain = 
      (isLowerBody && painLocations.some(l => ['knee', 'lower_back', 'hip', 'groin', 'achilles'].includes(l))) ||
      (isUpperBody && painLocations.some(l => ['shoulder', 'elbow', 'wrist', 'neck'].includes(l)));

    if (hasRelevantPain) {
      return {
        nextTargetWeightKg: currentTargetLoadKg,
        nextTargetReps: targetRepsRange[0],
        message: 'Pain reported: Holding load constant to protect joint tissue.',
        rationale: 'Never progress load into active joint or connective tissue discomfort. Maintain or reduce 5-10% if discomfort lingers.',
        status: 'pain_protect'
      };
    }
  }

  if (!lastPerformedSets || lastPerformedSets.length === 0) {
    return {
      nextTargetWeightKg: currentTargetLoadKg,
      nextTargetReps: targetRepsRange[0],
      message: `Maintain initial target ${currentTargetLoadKg} kg × ${targetRepsRange[0]} reps`,
      rationale: 'No previous set data available.',
      status: 'maintain'
    };
  }

  const completedSets = lastPerformedSets.filter(s => s.completed);
  if (completedSets.length === 0) {
    return {
      nextTargetWeightKg: currentTargetLoadKg,
      nextTargetReps: targetRepsRange[0],
      message: 'Maintain current load',
      rationale: 'Sets were incomplete.',
      status: 'maintain'
    };
  }

  const [minReps, maxReps] = targetRepsRange;
  const allSetsHitMaxReps = completedSets.every(s => (s.actualReps || 0) >= maxReps);
  const allSetsHitMinReps = completedSets.every(s => (s.actualReps || 0) >= minReps);
  const avgRpe = completedSets.reduce((acc, s) => acc + (s.actualRpe || 7.5), 0) / completedSets.length;
  const anyRpeGrinder = completedSets.some(s => s.actualRpe >= 9.5);

  // If grinding severely (RPE 9.5-10) or missed minimum reps
  if (anyRpeGrinder || !allSetsHitMinReps) {
    return {
      nextTargetWeightKg: currentTargetLoadKg,
      nextTargetReps: minReps,
      message: `Hold at ${currentTargetLoadKg} kg (RPE was high or reps missed)`,
      rationale: 'Avoid routine grinding and technical breakdown. Consolidate clean bar speed first.',
      status: 'maintain'
    };
  }

  // If user hit max reps across ALL sets (e.g. 6, 6, 6, 6) with controlled RPE (<= 8.5)
  if (allSetsHitMaxReps && avgRpe <= 8.5) {
    // Upper body progression: +2.5 kg. Lower body: +2.5kg to +5kg (approx 2.5-5% increment)
    let increment = 2.5;
    if (['back_squat', 'deadlift'].includes(exerciseId)) {
      increment = currentTargetLoadKg >= 70 ? 5 : 2.5;
    } else if (exerciseId === 'weighted_pull_up') {
      increment = 1.25; // or 2.5
    }

    const nextWeight = Math.round((currentTargetLoadKg + increment) * 10) / 10;

    return {
      nextTargetWeightKg: nextWeight,
      nextTargetReps: minReps,
      message: `Progress load to ${nextWeight} kg (+${increment} kg), reset to ${minReps} reps`,
      rationale: `Double progression achieved: Hit ${maxReps} reps across all sets at comfortable RPE (${avgRpe.toFixed(1)}). Ready for 2.5-5% load bump.`,
      status: 'advance_load'
    };
  }

  // User hit min reps, but not all sets at max reps yet (e.g. 6, 5, 5, 5)
  return {
    nextTargetWeightKg: currentTargetLoadKg,
    nextTargetReps: maxReps,
    message: `Keep load at ${currentTargetLoadKg} kg, push reps toward ${maxReps}`,
    rationale: `All sets hit base target (${minReps} reps). Now work on achieving ${maxReps} reps across all sets before adding weight.`,
    status: 'increase_reps'
  };
}

/**
 * Evaluates whether a deload week is warranted based on fatigue accumulation
 */
export function evaluateDeloadNeed(recentLogs: WorkoutLogEntry[], weeksSinceLastDeload: number): {
  suggestDeload: boolean;
  reason: string;
} {
  if (weeksSinceLastDeload >= 7) {
    return {
      suggestDeload: true,
      reason: `${weeksSinceLastDeload} continuous weeks of training completed. A structured deload protects connective tissue and restores nervous system freshness.`
    };
  }

  if (recentLogs.length >= 6) {
    const last3Logs = recentLogs.slice(0, 3);
    const highRpeCount = last3Logs.filter(l => l.sessionRpe >= 8.5).length;
    const lowEnergyCount = last3Logs.filter(l => l.energyLevel <= 2).length;
    const painReportedCount = last3Logs.filter(l => l.painReported).length;

    if (weeksSinceLastDeload >= 4 && (highRpeCount >= 2 || lowEnergyCount >= 2 || painReportedCount >= 2)) {
      return {
        suggestDeload: true,
        reason: 'Elevated fatigue markers detected across recent sessions (high RPE / lower energy / joint strain). An adaptive deload will lock in adaptations.'
      };
    }
  }

  return {
    suggestDeload: false,
    reason: 'Fatigue is well-managed. Continue regular progression.'
  };
}
