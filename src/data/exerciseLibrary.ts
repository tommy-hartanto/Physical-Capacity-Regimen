import { ExerciseDefinition } from '../types/training';

export const EXERCISE_LIBRARY: Record<string, ExerciseDefinition> = {
  // --- PREPARATION & MOBILITY ---
  'ankle_dorsiflexion': {
    id: 'ankle_dorsiflexion',
    name: 'Ankle Dorsiflexion Rocking',
    category: 'prep',
    targetMuscles: ['Soleus', 'Achilles', 'Tibialis anterior'],
    primaryPlane: 'sagittal',
    contraction: 'active_mobility',
    tempo: '2s end-range hold',
    cues: [
      'Keep heel flat to the floor as knee drives past toes',
      'Maintain an active arch without foot collapsing inward',
      'Pause at end-range for 2 full seconds of tension'
    ],
    mistakesToAvoid: [
      'Heel lifting off floor',
      'Knee collapsing medially across the big toe'
    ],
    equipment: 'bodyweight',
    loadType: 'duration_sec',
    defaultRestSec: 30,
    explanation: 'Unlocks deep ankle flexion for squats and lunges while priming the Achilles tendon under active control.'
  },

  'hip_90_90': {
    id: 'hip_90_90',
    name: '90/90 Hip Rotations & Hinge',
    category: 'prep',
    targetMuscles: ['Hip internal rotators', 'Glute medius', 'Hip capsule'],
    primaryPlane: 'transverse',
    contraction: 'active_mobility',
    tempo: '3-0-1-0',
    cues: [
      'Form strict 90-degree angles at both knees and hips',
      'Stay tall through the torso and hinge gently over the lead shin',
      'Transition smoothly between sides without using hands if possible'
    ],
    mistakesToAvoid: [
      'Slouching through the lumbar spine when leaning forward',
      'Rushing the internal rotation of the trailing hip'
    ],
    equipment: 'bodyweight',
    loadType: 'duration_sec',
    defaultRestSec: 30,
    explanation: 'Restores rotational range of motion in the hip capsule, reducing lumbar compensation on squats and hinges.'
  },

  'deep_squat_hold': {
    id: 'deep_squat_hold',
    name: 'Deep Squat Hold with Thoracic Reach',
    category: 'prep',
    targetMuscles: ['Hip adductors', 'Thoracic spine', 'Ankles'],
    primaryPlane: 'sagittal',
    contraction: 'isometric',
    tempo: '30s hold with alternating reaches',
    cues: [
      'Sink into lowest comfortable squat depth with heels grounded',
      'Use elbows inside knees to gently expand hip adductors',
      'Reach one arm up to ceiling, rotating thoracic spine with breath'
    ],
    mistakesToAvoid: [
      'Allowing heels to lift off the ground',
      'Excessive spinal rounding without active upright tension'
    ],
    equipment: 'bodyweight',
    loadType: 'duration_sec',
    defaultRestSec: 30,
    explanation: 'Pairs deep ankle and hip integration with thoracic mobility needed for upright barbell squat mechanics.'
  },

  'hip_flexor_lunge': {
    id: 'hip_flexor_lunge',
    name: 'Active Hip Flexor Half-Kneeling Stretch',
    category: 'prep',
    targetMuscles: ['Psoas', 'Rectus femoris', 'Glutes'],
    primaryPlane: 'sagittal',
    contraction: 'active_mobility',
    tempo: 'Pulsing 2s holds',
    cues: [
      'Tuck pelvis under (posterior pelvic tilt) and squeeze back glute hard',
      'Shift forward slightly without hyperextending the lower back',
      'Raise rear-side arm overhead for an expanded myofascial stretch'
    ],
    mistakesToAvoid: [
      'Arching lower back to fake hip extension',
      'Failing to squeeze the rear glute'
    ],
    equipment: 'bodyweight',
    loadType: 'duration_sec',
    defaultRestSec: 30,
    explanation: 'Opens anterior hip chain to allow clean hip extension during heavy deadlifts and squats.'
  },

  'thoracic_rotation': {
    id: 'thoracic_rotation',
    name: 'Quadruped Thoracic Rotation',
    category: 'prep',
    targetMuscles: ['Thoracic spine', 'Rhomboids', 'Rear deltoids'],
    primaryPlane: 'transverse',
    contraction: 'active_mobility',
    tempo: 'Controlled 2s holds',
    cues: [
      'Hand behind head, lock lower lumbar by sitting hips back towards heels',
      'Rotate ribcage up towards ceiling led by your elbow',
      'Exhale deeply at top rotation, inhale back down'
    ],
    mistakesToAvoid: [
      'Shifting hips side to side instead of rotating through upper back',
      'Yanking on the neck with the top hand'
    ],
    equipment: 'bodyweight',
    loadType: 'duration_sec',
    defaultRestSec: 30,
    explanation: 'Frees up thoracic rotation, shielding the lower back and shoulder joints on all presses and pulls.'
  },

  'shoulder_cars': {
    id: 'shoulder_cars',
    name: 'Shoulder CARs (Controlled Articular Rotations)',
    category: 'prep',
    targetMuscles: ['Rotator cuff', 'Scapula', 'Glenohumeral capsule'],
    primaryPlane: 'multi_planar',
    contraction: 'active_mobility',
    tempo: 'Slow, 10s per full circle',
    cues: [
      'Brace core and glutes so your torso does not rotate or lean',
      'Draw the largest possible circle with your arm without moving ribcage',
      'Internally rotate shoulder at the highest point before moving behind body'
    ],
    mistakesToAvoid: [
      'Arching spine as arm moves overhead',
      'Rushing through sticky or tight angles'
    ],
    equipment: 'bodyweight',
    loadType: 'duration_sec',
    defaultRestSec: 30,
    explanation: 'Actively lubricates the glenohumeral joint capsule, improving end-range stability prior to heavy pressing.'
  },

  'wall_slide': {
    id: 'wall_slide',
    name: 'Wall Slide with Protraction',
    category: 'prep',
    targetMuscles: ['Serratus anterior', 'Lower trapezius'],
    primaryPlane: 'sagittal',
    contraction: 'active_mobility',
    tempo: '2-1-2-1',
    cues: [
      'Forearms flush against wall at 90 degrees',
      'Slide arms upward in a slight V while actively pushing chest away from wall',
      'Reach tall at peak without arching lower back'
    ],
    mistakesToAvoid: [
      'Shrugging upper traps towards ears',
      'Flaring ribs away from wall'
    ],
    equipment: 'bodyweight',
    loadType: 'duration_sec',
    defaultRestSec: 30,
    explanation: 'Activates the serratus anterior to allow natural upward scapular rotation on overhead reach and bench press.'
  },

  // --- POWER EXERCISES ---
  'broad_jump': {
    id: 'broad_jump',
    name: 'Broad Jump (Horizontal Stick)',
    category: 'power',
    targetMuscles: ['Glutes', 'Hamstrings', 'Quadriceps', 'Calves'],
    primaryPlane: 'sagittal',
    contraction: 'explosive',
    tempo: 'Maximal intent',
    cues: [
      'Violent hip hinge with backward arm swing, then explode forward',
      'Project hips forward and triple-extend ankles, knees, and hips',
      'Stick the landing softly in athletic squat: knees tracking toes, zero noise'
    ],
    mistakesToAvoid: [
      'Landing stiff-legged or with knees caving in (valgus)',
      'Doing high-rep endurance jumps; STOP set immediately when jump distance or speed drops'
    ],
    equipment: 'bodyweight',
    loadType: 'bodyweight',
    defaultRestSec: 75,
    explanation: 'Trains rate of force development (RFD) in horizontal plane. Emphasizes maximal intent and quiet landing mechanics.'
  },

  'lateral_bound': {
    id: 'lateral_bound',
    name: 'Lateral Bound with Stick',
    category: 'power',
    targetMuscles: ['Glute medius', 'Adductors', 'Calves', 'Ankles'],
    primaryPlane: 'frontal',
    contraction: 'explosive',
    tempo: 'Maximal intent + 2s stick',
    cues: [
      'Push hard off inside edge of trailing foot laterally',
      'Catch landing on single leg softly, absorbing force through hip and knee',
      'Hold single-leg stick for 2 full seconds before next rep'
    ],
    mistakesToAvoid: [
      'Letting knee collapse inward on the landing catch',
      'Rushing into the next rep before establishing balance'
    ],
    equipment: 'bodyweight',
    loadType: 'bodyweight',
    defaultRestSec: 60,
    explanation: 'Crucial frontal-plane power and deceleration drill for multi-directional athleticism and joint resilience.'
  },

  'medball_chest_throw': {
    id: 'medball_chest_throw',
    name: 'Medicine-Ball Chest Throw (Wall)',
    category: 'power',
    targetMuscles: ['Pectorals', 'Triceps', 'Trunk anterior'],
    primaryPlane: 'sagittal',
    contraction: 'explosive',
    tempo: 'Maximal speed',
    cues: [
      'Athletic stance, ball at sternum with elbows tucked 45 degrees',
      'Slight dip of hips, then violently launch ball straight into solid wall',
      'Follow through fully with hands; catch rebound cleanly or let reset'
    ],
    mistakesToAvoid: [
      'Using a ball that is too heavy (>6kg) which slows down velocity',
      'Continuing reps when throw velocity noticeably drops'
    ],
    equipment: 'medicine_ball',
    loadType: 'weight_kg',
    defaultRestSec: 75,
    explanation: 'Builds explosive upper-body pressing power without decelerating at lock-out, priming the bench press.'
  },

  'medball_rotational_throw': {
    id: 'medball_rotational_throw',
    name: 'Medicine-Ball Rotational Throw',
    category: 'power',
    targetMuscles: ['Obliques', 'Hips', 'Rotational slings'],
    primaryPlane: 'transverse',
    contraction: 'explosive',
    tempo: 'Maximal intent',
    cues: [
      'Stand perpendicular to wall, load weight onto rear hip',
      'Initiate throw from the rear foot pivot and hip rotation first',
      'Let the torso and arms whip through like swinging a bat into wall'
    ],
    mistakesToAvoid: [
      'Throwing purely with upper arms without using the hips and foot pivot',
      'Losing balance or falling away from the wall'
    ],
    equipment: 'medicine_ball',
    loadType: 'weight_kg',
    defaultRestSec: 60,
    explanation: 'Develops rotational power in the transverse plane, transferring force seamlessly from ground to hands.'
  },

  'box_jump': {
    id: 'box_jump',
    name: 'Box Jump (Step-Down)',
    category: 'power',
    targetMuscles: ['Quadriceps', 'Glutes', 'Calves'],
    primaryPlane: 'sagittal',
    contraction: 'explosive',
    tempo: 'Maximal vertical intent',
    cues: [
      'Rapid countermovement arm swing down into hip hinge',
      'Explode straight up, landing gently on top of box with soft knees',
      'Always STEP down one foot at a time; never rebound jump down'
    ],
    mistakesToAvoid: [
      'Using a box so high you land in an excessive deep tuck',
      'Rebounding off floor between reps (protects Achilles)'
    ],
    equipment: 'box_bench',
    loadType: 'bodyweight',
    defaultRestSec: 75,
    explanation: 'Develops vertical rate of force development while minimizing eccentric impact on landing by catching higher.'
  },

  'medball_overhead_slam': {
    id: 'medball_overhead_slam',
    name: 'Medicine-Ball Overhead Slam',
    category: 'power',
    targetMuscles: ['Lats', 'Abdominals', 'Hips', 'Shoulders'],
    primaryPlane: 'sagittal',
    contraction: 'explosive',
    tempo: 'Maximal velocity',
    cues: [
      'Reach ball high overhead extending tall onto toes',
      'Hinge aggressively at hips and slam ball down between feet with full trunk flexion',
      'Catch bounce or reset with pristine spine posture'
    ],
    mistakesToAvoid: [
      'Slamming purely with arms without violent abdominal flexion',
      'Bending at lumbar spine with rounded back when reaching for rebound'
    ],
    equipment: 'medicine_ball',
    loadType: 'weight_kg',
    defaultRestSec: 60,
    explanation: 'Explosive anterior sling power drill connecting lats, core, and hip flexors in high-velocity closure.'
  },

  // --- PRIMARY STRENGTH ---
  'back_squat': {
    id: 'back_squat',
    name: 'Barbell Back Squat',
    category: 'primary_strength',
    targetMuscles: ['Quadriceps', 'Glutes', 'Spinal erectors', 'Adductors'],
    primaryPlane: 'sagittal',
    contraction: 'concentric_eccentric',
    tempo: '3-1-X-1',
    cues: [
      'Brace 360-degree diaphragm breath before initiating descent',
      'Sit back and down between heels, knees tracking in line with toes',
      'Drive out of the hole with chest and hips rising simultaneously'
    ],
    mistakesToAvoid: [
      'Good-morning squat: hips shooting up first leaving chest behind',
      'Knee valgus collapse or heels lifting off floor'
    ],
    equipment: 'barbell',
    alternativeExerciseIds: ['goblet_squat', 'front_squat'],
    loadType: 'weight_kg',
    defaultRestSec: 150,
    explanation: 'Foundational bilateral lower-body squat pattern building robust quad, glute, and spinal integrity.'
  },

  'romanian_deadlift': {
    id: 'romanian_deadlift',
    name: 'Romanian Deadlift (RDL)',
    category: 'primary_strength',
    targetMuscles: ['Hamstrings', 'Glutes', 'Spinal erectors', 'Lats'],
    primaryPlane: 'sagittal',
    contraction: 'eccentric_emphasis',
    tempo: '3-1-1-0',
    cues: [
      'Soft knee unlock, then push hips straight back towards the wall behind you',
      'Keep bar in constant contact with thighs and shins, lats locked',
      'Stop when hips cannot travel further back; drive forward with glutes'
    ],
    mistakesToAvoid: [
      'Turning it into a squat by bending knees excessively',
      'Spinal rounding when trying to reach the floor beyond hamstring range'
    ],
    equipment: 'barbell',
    alternativeExerciseIds: ['dumbbell_rdl'],
    loadType: 'weight_kg',
    defaultRestSec: 120,
    explanation: 'Emphasizes controlled eccentric loading of the posterior chain, essential for hamstring tendon durability.'
  },

  'bench_press': {
    id: 'bench_press',
    name: 'Barbell Bench Press',
    category: 'primary_strength',
    targetMuscles: ['Pectorals', 'Anterior deltoids', 'Triceps'],
    primaryPlane: 'sagittal',
    contraction: 'concentric_eccentric',
    tempo: '2-1-X-0',
    cues: [
      'Pin scapulae retracted and depressed into bench, feet firmly planted',
      'Lower bar with elbows tucked ~45-60 degrees toward lower sternum',
      'Drive feet into floor and press bar back slightly in a gentle J-curve'
    ],
    mistakesToAvoid: [
      'Flaring elbows 90 degrees out (impinges shoulders)',
      'Bouncing the bar off the ribcage'
    ],
    equipment: 'barbell',
    alternativeExerciseIds: ['dumbbell_bench_press'],
    loadType: 'weight_kg',
    defaultRestSec: 150,
    explanation: 'Primary horizontal press for upper body mass, bone density, and pressing force.'
  },

  'weighted_pull_up': {
    id: 'weighted_pull_up',
    name: 'Weighted Pull-Up (or Bodyweight)',
    category: 'primary_strength',
    targetMuscles: ['Latissimus dorsi', 'Biceps', 'Rhomboids', 'Brachialis'],
    primaryPlane: 'sagittal',
    contraction: 'concentric_eccentric',
    tempo: '2-0-1-1',
    cues: [
      'Initiate from a dead hang by depressing scapulae downward first',
      'Pull chest up to bar with hollow body position, ribs tucked down',
      'Lower under control to a full dead hang with elbows straight'
    ],
    mistakesToAvoid: [
      'Kipping or swinging legs to cheat the top range',
      'Cutting ROM short at the bottom'
    ],
    equipment: 'bodyweight',
    alternativeExerciseIds: ['lat_pulldown'],
    loadType: 'added_weight_kg',
    defaultRestSec: 150,
    explanation: 'Vertical pulling king: combines massive back strength with scapular stability and shoulder overhead health.'
  },

  'deadlift': {
    id: 'deadlift',
    name: 'Conventional Barbell Deadlift',
    category: 'primary_strength',
    targetMuscles: ['Glutes', 'Hamstrings', 'Entire back', 'Forearms/Grip'],
    primaryPlane: 'sagittal',
    contraction: 'concentric_eccentric',
    tempo: 'Reset each rep',
    cues: [
      'Bar over mid-foot, hinge and grasp bar, wedge shins to meet it',
      'Pull slack out of the bar until you hear the click, lock lats in armpits',
      'Push the floor away through mid-foot; lock out tall without hyperextending'
    ],
    mistakesToAvoid: [
      'Jerking the bar off the floor without taking out the slack',
      'Rounding the lower back or hyperextending backwards at lockout'
    ],
    equipment: 'barbell',
    alternativeExerciseIds: ['trap_bar_deadlift'],
    loadType: 'weight_kg',
    defaultRestSec: 180,
    explanation: 'The ultimate full-body compound test of systemic pulling power and spinal stability.'
  },

  'single_leg_rdl': {
    id: 'single_leg_rdl',
    name: 'Single-Leg Romanian Deadlift',
    category: 'primary_strength',
    targetMuscles: ['Hamstrings', 'Glute medius', 'Ankle stabilizers'],
    primaryPlane: 'sagittal',
    contraction: 'concentric_eccentric',
    tempo: '3-1-1-0',
    cues: [
      'Stand on one leg, keep hips square to floor (do not let rear hip flare open)',
      'Reach rear heel back like a straight lever from crown to heel',
      'Feel deep tension in stance-leg hamstring; push ground away to return'
    ],
    mistakesToAvoid: [
      'Rotating pelvis open toward the ceiling',
      'Losing balance by rushing instead of rooting big toe and heel'
    ],
    equipment: 'dumbbell',
    loadType: 'weight_kg',
    defaultRestSec: 75,
    explanation: 'Eliminates left-right asymmetries, bulletproofs ankles, and conditions the hamstrings and glute medius.'
  },

  // --- SECONDARY MOVEMENT / UNILATERAL / MULTI-PLANAR ---
  'rfess': {
    id: 'rfess',
    name: 'Rear-Foot Elevated Split Squat (Bulgarian)',
    category: 'secondary_movement',
    targetMuscles: ['Quadriceps', 'Glutes', 'Adductors'],
    primaryPlane: 'sagittal',
    contraction: 'concentric_eccentric',
    tempo: '3-0-1-0',
    cues: [
      'Rear laces resting on bench, slight forward torso lean to load hip',
      'Drop back knee straight down toward floor under control',
      'Drive through front whole foot (big toe, pinky, heel) to rise'
    ],
    mistakesToAvoid: [
      'Excessive hyperextension in lumbar spine',
      'Front heel lifting off floor'
    ],
    equipment: 'dumbbell',
    loadType: 'weight_kg',
    defaultRestSec: 75,
    explanation: 'Supreme unilateral quad and hip developer that also provides an active stretch to the rear hip flexor.'
  },

  'cossack_squat': {
    id: 'cossack_squat',
    name: 'Cossack Squat (Frontal Plane)',
    category: 'secondary_movement',
    targetMuscles: ['Adductors', 'Glute medius', 'Quadriceps', 'Ankles'],
    primaryPlane: 'frontal',
    contraction: 'active_mobility',
    tempo: '3-1-1-0',
    cues: [
      'Wide stance, descend deep into one hip while keeping that heel glued down',
      'Trailing leg stays straight with toes pointed up to ceiling',
      'Keep chest proud and drive through stance heel to return to center'
    ],
    mistakesToAvoid: [
      'Allowing working heel to peel off the floor',
      'Excessive spinal rounding at bottom position'
    ],
    equipment: 'bodyweight',
    loadType: 'bodyweight',
    defaultRestSec: 60,
    explanation: 'Builds end-range strength and extraordinary adductor mobility in the often-neglected frontal plane.'
  },

  'half_kneeling_cable_press': {
    id: 'half_kneeling_cable_press',
    name: 'Half-Kneeling Single-Arm Cable Press',
    category: 'secondary_movement',
    targetMuscles: ['Anterior deltoids', 'Pectorals', 'Serratus', 'Core'],
    primaryPlane: 'sagittal',
    contraction: 'concentric_eccentric',
    tempo: '2-0-1-1',
    cues: [
      'Kneel on same side as pressing arm; squeeze down-knee glute hard for base',
      'Press cable forward smoothly without allowing torso to twist or lean back',
      'Let shoulder blade protract naturally at the finish; pull back under control'
    ],
    mistakesToAvoid: [
      'Twisting shoulders to cheat the weight forward',
      'Losing pelvic tilt or arching lower back'
    ],
    equipment: 'cable',
    loadType: 'weight_kg',
    defaultRestSec: 60,
    explanation: 'Forces rotary core stability and unilateral pressing strength without allowing compensation.'
  },

  'chest_supported_row': {
    id: 'chest_supported_row',
    name: 'Chest-Supported Row',
    category: 'secondary_movement',
    targetMuscles: ['Rhomboids', 'Mid-trapezius', 'Lats', 'Rear deltoids'],
    primaryPlane: 'sagittal',
    contraction: 'concentric_eccentric',
    tempo: '2-1-1-1',
    cues: [
      'Incline bench supporting chest completely eliminates lower back fatigue',
      'Lead with elbows pulled back to pockets, pausing for 1s squeeze between blades',
      'Control the lowering phase and let scapulae stretch forward'
    ],
    mistakesToAvoid: [
      'Shrugging shoulders into ears at top',
      'Bouncing chest off the bench cushion'
    ],
    equipment: 'dumbbell',
    loadType: 'weight_kg',
    defaultRestSec: 75,
    explanation: 'Isolates upper-back postural retractors with zero lumbar loading after heavy compounds.'
  },

  'walking_lunge': {
    id: 'walking_lunge',
    name: 'Walking Dumbbell Lunge',
    category: 'secondary_movement',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Calves'],
    primaryPlane: 'sagittal',
    contraction: 'concentric_eccentric',
    tempo: 'Smooth continuous',
    cues: [
      'Step out with comfortable stride, trailing knee tapping floor softly',
      'Torso tall with neutral spine, holding dumbbells tight at sides',
      'Drive off lead heel smoothly into the subsequent stride'
    ],
    mistakesToAvoid: [
      'Slamming trailing knee into hard floor',
      'Short, cramped steps causing knee overhang and heel lift'
    ],
    equipment: 'dumbbell',
    loadType: 'weight_kg',
    defaultRestSec: 75,
    explanation: 'Dynamic locomotive leg strength and dynamic balance under load.'
  },

  'cable_rotational_lift': {
    id: 'cable_rotational_lift',
    name: 'Cable Rotational Lift (Low to High)',
    category: 'secondary_movement',
    targetMuscles: ['Obliques', 'Transverse abdominis', 'Shoulders'],
    primaryPlane: 'transverse',
    contraction: 'concentric_eccentric',
    tempo: '2-0-1-1',
    cues: [
      'Set cable at lowest pin; athletic stance perpendicular to tower',
      'Pivot rear foot and drive rotation through hips and core diagonally up',
      'Arms stay long; core powers the rotation, not the elbows'
    ],
    mistakesToAvoid: [
      'Keeping feet glued and twisting solely at the lumbar spine',
      'Bending arms and turning it into a curl'
    ],
    equipment: 'cable',
    loadType: 'weight_kg',
    defaultRestSec: 60,
    explanation: 'Develops rotational power transfer through the kinetic chain from foot to opposite shoulder.'
  },

  // --- STRUCTURAL / TISSUE WORK ---
  'standing_calf_raise': {
    id: 'standing_calf_raise',
    name: 'Standing Calf Raise (Gastrocnemius & Achilles)',
    category: 'structural_tissue',
    targetMuscles: ['Gastrocnemius', 'Achilles tendon'],
    primaryPlane: 'sagittal',
    contraction: 'eccentric_emphasis',
    tempo: '3-1-1-1',
    cues: [
      'Balls of feet on edge of step with straight knees (locks gastrocnemius)',
      'Lower into deep stretch below step for 3 seconds',
      'Pause at absolute bottom for 1 full second to dissipate stretch reflex',
      'Drive up high onto the big toe knuckle, hold top contraction'
    ],
    mistakesToAvoid: [
      'Bouncing rapidly at bottom without pause (fails to train tendon stiffness)',
      'Rolling weight onto outside of foot'
    ],
    equipment: 'dumbbell',
    loadType: 'weight_kg',
    defaultRestSec: 60,
    explanation: 'Directly reinforces the Achilles tendon and gastrocnemius with slow eccentrics and paused deep stretches.'
  },

  'tibialis_raise': {
    id: 'tibialis_raise',
    name: 'Tibialis Anterior Raise',
    category: 'structural_tissue',
    targetMuscles: ['Tibialis anterior'],
    primaryPlane: 'sagittal',
    contraction: 'concentric_eccentric',
    tempo: '2-1-1-1',
    cues: [
      'Back flat against wall, walk heels out ~2-3 feet with straight legs',
      'Flex toes and feet straight up toward your shins as high as possible',
      'Hold peak squeeze for 1 second, then lower with control'
    ],
    mistakesToAvoid: [
      'Bending knees or pushing hips off wall',
      'Partial reps when burning begins'
    ],
    equipment: 'bodyweight',
    loadType: 'bodyweight',
    defaultRestSec: 45,
    explanation: 'Bulletproofs shins against shin splints and improves decelerative ankle deceleration for running and jumping.'
  },

  'copenhagen_plank': {
    id: 'copenhagen_plank',
    name: 'Copenhagen Adductor Plank',
    category: 'structural_tissue',
    targetMuscles: ['Adductors', 'Obliques', 'Groin complex'],
    primaryPlane: 'frontal',
    contraction: 'isometric',
    tempo: 'Static hold',
    cues: [
      'Side plank with top leg resting on bench, bottom leg floating beneath it',
      'Lift hips high so body forms a rigid straight line from head to heels',
      'Squeeze adductor hard, keeping neck and ribs aligned'
    ],
    mistakesToAvoid: [
      'Hips sagging toward floor or rotating backwards',
      'Resting knee directly on hard edge; pad or position mid-shin'
    ],
    equipment: 'box_bench',
    loadType: 'duration_sec',
    defaultRestSec: 60,
    explanation: 'The gold standard exercise for adductor strength, pelvic stability, and groin injury prevention.'
  },

  'cable_face_pull': {
    id: 'cable_face_pull',
    name: 'Cable Face Pull with External Rotation',
    category: 'structural_tissue',
    targetMuscles: ['Infraspinatus', 'Teres minor', 'Rear deltoid', 'Lower trap'],
    primaryPlane: 'transverse',
    contraction: 'concentric_eccentric',
    tempo: '2-1-1-1',
    cues: [
      'Rope set at eye level, thumbs pointed backward',
      'Pull rope toward bridge of nose while externally rotating hands back behind ears',
      'Hold the "double bicep" pose for a full 1-second squeeze of upper back'
    ],
    mistakesToAvoid: [
      'Leaning torso backwards to swing heavy weight',
      'Letting elbows drop lower than wrists'
    ],
    equipment: 'cable',
    loadType: 'weight_kg',
    defaultRestSec: 60,
    explanation: 'Restores scapular balance, counteracts forward shoulder posture, and strengthens rotator cuff.'
  },

  'cable_y_raise': {
    id: 'cable_y_raise',
    name: 'Cable or Dumbbell Y-Raise',
    category: 'structural_tissue',
    targetMuscles: ['Lower trapezius', 'Serratus anterior'],
    primaryPlane: 'sagittal',
    contraction: 'concentric_eccentric',
    tempo: '2-1-1-1',
    cues: [
      'Set cables low or hold light dumbbells, hinge slightly forward',
      'Raise arms diagonally in a 45-degree "Y" angle with thumbs up',
      'Focus on drawing the bottom tips of shoulder blades down into your spine'
    ],
    mistakesToAvoid: [
      'Shrugging upper traps towards ears',
      'Using excessive momentum or swaying torso'
    ],
    equipment: 'dumbbell',
    loadType: 'weight_kg',
    defaultRestSec: 60,
    explanation: 'Directly targets the lower traps, essential for healthy overhead mechanics and default posture.'
  },

  'suitcase_carry': {
    id: 'suitcase_carry',
    name: 'Single-Arm Suitcase Carry',
    category: 'structural_tissue',
    targetMuscles: ['Quadratus lumborum', 'Obliques', 'Grip/Forearms'],
    primaryPlane: 'frontal',
    contraction: 'isometric',
    tempo: 'Deliberate marching pace',
    cues: [
      'Hold heavy dumbbell or kettlebell in ONE hand only',
      'Stand completely upright without leaning sideways toward or away from load',
      'Walk with slow, deliberate, tall strides; keep shoulders level'
    ],
    mistakesToAvoid: [
      'Tilting sideways to compensate for weight',
      'Resting dumbbell against the side of the thigh'
    ],
    equipment: 'dumbbell',
    loadType: 'weight_kg',
    defaultRestSec: 60,
    explanation: 'Brutal anti-lateral flexion core exercise that teaches reflexive spinal stabilization and grip endurance.'
  },

  'dragon_flag_progression': {
    id: 'dragon_flag_progression',
    name: 'Dragon-Flag Progression (Eccentric/Tuck)',
    category: 'structural_tissue',
    targetMuscles: ['Rectus abdominis', 'Hollow-body core', 'Lats'],
    primaryPlane: 'sagittal',
    contraction: 'eccentric_emphasis',
    tempo: '4s slow eccentric descent',
    cues: [
      'Grip sturdy bench behind head, pull body up pivoting on upper shoulders',
      'Keep rigid straight plank from shoulders to hips (tucked knees if progressing)',
      'Lower torso down agonizingly slow for 4 seconds; avoid collapsing lower back'
    ],
    mistakesToAvoid: [
      'Pivoting at the hips/lumbar spine instead of pivoting purely at the shoulder blades',
      'Crashing down on bench when fatigue sets in'
    ],
    equipment: 'box_bench',
    loadType: 'bodyweight',
    defaultRestSec: 75,
    explanation: 'High-level gymnastic trunk lever building exceptional anti-extension core strength and athletic control.'
  },

  'hamstring_curl': {
    id: 'hamstring_curl',
    name: 'Lying or Seated Hamstring Curl',
    category: 'structural_tissue',
    targetMuscles: ['Hamstrings (Knee flexion component)'],
    primaryPlane: 'sagittal',
    contraction: 'eccentric_emphasis',
    tempo: '3-0-1-1',
    cues: [
      'Dorsiflex ankles (pull toes to shins) to recruit gastrocnemius & hamstrings together',
      'Curl heel to butt, pausing for 1s contraction',
      'Lower with strict 3-second eccentric control; avoid letting hips buck off pad'
    ],
    mistakesToAvoid: [
      'Allowing hips to hyperextend or lift off bench',
      'Dropping weight uncontrollably on eccentric'
    ],
    equipment: 'dumbbell',
    loadType: 'weight_kg',
    defaultRestSec: 60,
    explanation: 'Trains the distal knee-flexion function of hamstrings, completing the posterior chain protection started by RDLs.'
  },

  'seated_calf_raise': {
    id: 'seated_calf_raise',
    name: 'Seated Calf Raise (Soleus Focus)',
    category: 'structural_tissue',
    targetMuscles: ['Soleus'],
    primaryPlane: 'sagittal',
    contraction: 'concentric_eccentric',
    tempo: '2-1-1-1',
    cues: [
      'Knees bent at 90 degrees isolates soleus from gastrocnemius',
      'Full deep ankle stretch at bottom with 1s pause',
      'Push up tall onto big toe knuckle'
    ],
    mistakesToAvoid: [
      'Partial range of motion',
      'Bouncing rapidly at bottom'
    ],
    equipment: 'dumbbell',
    loadType: 'weight_kg',
    defaultRestSec: 60,
    explanation: 'The soleus bears immense load in running and landing; seated isolation builds endurance and protects Achilles.'
  },

  // --- CONDITIONING ---
  'rower_bike_conditioning': {
    id: 'rower_bike_conditioning',
    name: 'Conditioning: Erg Bike or Rower',
    category: 'conditioning',
    targetMuscles: ['Cardiovascular system', 'Whole body'],
    primaryPlane: 'sagittal',
    contraction: 'concentric_eccentric',
    tempo: 'Zone 2 / Moderate tempo',
    cues: [
      'Keep smooth, rhythmic breathing cadence',
      'Maintain steady pace: you should be able to speak in short sentences',
      'If doing intervals, follow prescribed work/rest ratio precisely'
    ],
    mistakesToAvoid: [
      'Redlining early and dying before the target time',
      'Rounding back excessively on rowing machine catch'
    ],
    equipment: 'machine_cardio',
    loadType: 'duration_sec',
    defaultRestSec: 60,
    explanation: 'Aerobic energy system development and metabolic clearance to conclude the Thursday athletic session.'
  }
};
