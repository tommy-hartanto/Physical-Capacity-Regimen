import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  Dumbbell,
  Clock,
  ArrowUpDown,
  Search,
  CheckCircle2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Info,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit3,
  Sparkles,
  Save,
  X
} from 'lucide-react';
import { useTraining } from '../context/TrainingContext';
import { DayOfWeek, WorkoutType, WorkoutTemplate, WorkoutTemplateExercise, ExerciseDefinition, MovementTier, PlaneOfMotion, ContractionFocus } from '../types/training';
import { WORKOUT_TEMPLATES } from '../data/defaultProgram';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const ProgramView: React.FC = () => {
  const {
    userProfile,
    updateSchedule,
    setGymDaysPerWeek,
    allTemplates,
    allExercises,
    saveCustomTemplate,
    deleteCustomTemplate,
    addCustomExercise,
    deleteCustomExercise
  } = useTraining();

  const [activeTab, setActiveTab] = useState<'schedule' | 'templates' | 'phases' | 'library'>('schedule');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  // Day editor modal / dropdown
  const [editingDay, setEditingDay] = useState<DayOfWeek | null>(null);

  // Template Editor State
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('lower_power');
  const [isEditingTemplate, setIsEditingTemplate] = useState<boolean>(false);
  const [editingTemplateData, setEditingTemplateData] = useState<WorkoutTemplate | null>(null);
  const [showAddExerciseToTemplate, setShowAddExerciseToTemplate] = useState<boolean>(false);
  const [showNewRoutineModal, setShowNewRoutineModal] = useState<boolean>(false);

  // New Routine Form
  const [newRoutineId, setNewRoutineId] = useState('');
  const [newRoutineTitle, setNewRoutineTitle] = useState('');
  const [newRoutineDesc, setNewRoutineDesc] = useState('');

  // Custom Exercise Creator State
  const [showNewExerciseModal, setShowNewExerciseModal] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExCategory, setNewExCategory] = useState<MovementTier>('primary_strength');
  const [newExMuscles, setNewExMuscles] = useState('');
  const [newExPlane, setNewExPlane] = useState<PlaneOfMotion>('sagittal');
  const [newExContraction, setNewExContraction] = useState<ContractionFocus>('concentric_eccentric');
  const [newExEquipment, setNewExEquipment] = useState<ExerciseDefinition['equipment']>('dumbbell');
  const [newExLoadType, setNewExLoadType] = useState<ExerciseDefinition['loadType']>('weight_kg');
  const [newExRest, setNewExRest] = useState(90);
  const [newExCues, setNewExCues] = useState('');

  const handleSetWorkoutForDay = (day: DayOfWeek, type: WorkoutType) => {
    const updated = { ...userProfile.schedule, [day]: type };
    updateSchedule(updated);
    setEditingDay(null);
  };

  // Combined exercise pool
  const combinedExercises: Record<string, ExerciseDefinition> = {
    ...EXERCISE_LIBRARY,
    ...allExercises
  };

  const filteredExercises: ExerciseDefinition[] = (Object.values(combinedExercises) as ExerciseDefinition[]).filter(ex => {
    const query = searchQuery.toLowerCase();
    return (
      ex.name.toLowerCase().includes(query) ||
      ex.category.toLowerCase().includes(query) ||
      ex.targetMuscles.some(m => m.toLowerCase().includes(query))
    );
  });

  // Start editing a template
  const handleStartEditTemplate = (templateKey: string) => {
    const tmpl = allTemplates[templateKey];
    if (!tmpl) return;
    setEditingTemplateData(JSON.parse(JSON.stringify(tmpl)));
    setIsEditingTemplate(true);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplateData) return;
    saveCustomTemplate(editingTemplateData);
    setIsEditingTemplate(false);
  };

  const handleMoveTemplateExercise = (index: number, direction: 'up' | 'down') => {
    if (!editingTemplateData) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= editingTemplateData.exercises.length) return;

    const updated = [...editingTemplateData.exercises];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setEditingTemplateData({ ...editingTemplateData, exercises: updated });
  };

  const handleRemoveTemplateExercise = (index: number) => {
    if (!editingTemplateData) return;
    const updated = editingTemplateData.exercises.filter((_, i) => i !== index);
    setEditingTemplateData({ ...editingTemplateData, exercises: updated });
  };

  const handleAddExerciseToRoutine = (exerciseId: string) => {
    if (!editingTemplateData) return;
    const exDef = combinedExercises[exerciseId];
    const newEx: WorkoutTemplateExercise = {
      exerciseId,
      targetSets: 3,
      targetReps: exDef?.loadType === 'duration_sec' ? undefined : 6,
      targetDurationSec: exDef?.loadType === 'duration_sec' ? 30 : undefined,
      defaultRestSec: exDef?.defaultRestSec || 90,
      targetRpe: 7.5
    };
    setEditingTemplateData({
      ...editingTemplateData,
      exercises: [...editingTemplateData.exercises, newEx]
    });
    setShowAddExerciseToTemplate(false);
  };

  const handleCreateNewRoutine = () => {
    if (!newRoutineTitle.trim()) return;
    const safeId = newRoutineId.trim()
      ? newRoutineId.toLowerCase().replace(/\s+/g, '_')
      : `custom_${newRoutineTitle.toLowerCase().replace(/\s+/g, '_')}`;

    const newTemplate: WorkoutTemplate = {
      workoutType: safeId,
      title: newRoutineTitle.trim(),
      shortDescription: newRoutineDesc.trim() || 'Custom training session.',
      estimatedMinutes: 60,
      exercises: [],
      isCustom: true
    };

    saveCustomTemplate(newTemplate);
    setSelectedTemplateKey(safeId);
    setEditingTemplateData(newTemplate);
    setIsEditingTemplate(true);
    setShowNewRoutineModal(false);
    setNewRoutineTitle('');
    setNewRoutineDesc('');
    setNewRoutineId('');
  };

  const handleSaveCustomExercise = () => {
    if (!newExName.trim()) return;
    const safeId = `custom_${newExName.toLowerCase().replace(/\s+/g, '_')}`;
    const newDef: ExerciseDefinition = {
      id: safeId,
      name: newExName.trim(),
      category: newExCategory,
      targetMuscles: newExMuscles.split(',').map(m => m.trim()).filter(Boolean),
      primaryPlane: newExPlane,
      contraction: newExContraction,
      equipment: newExEquipment,
      loadType: newExLoadType,
      defaultRestSec: newExRest,
      cues: newExCues.split(';').map(c => c.trim()).filter(Boolean),
      mistakesToAvoid: [],
      explanation: 'Custom athlete movement.'
    };

    addCustomExercise(newDef);
    setShowNewExerciseModal(false);
    setNewExName('');
    setNewExMuscles('');
    setNewExCues('');
  };

  const activeTemplate = allTemplates[selectedTemplateKey] || allTemplates['lower_power'];

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* Tab Switcher */}
      <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
        <button
          onClick={() => { setActiveTab('schedule'); setIsEditingTemplate(false); }}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'schedule' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Schedule
        </button>
        <button
          onClick={() => { setActiveTab('templates'); setIsEditingTemplate(false); }}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'templates' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Routines
        </button>
        <button
          onClick={() => { setActiveTab('phases'); setIsEditingTemplate(false); }}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'phases' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Roadmap
        </button>
        <button
          onClick={() => { setActiveTab('library'); setIsEditingTemplate(false); }}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'library' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Library
        </button>
      </div>

      {/* TAB 1: WEEKLY SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          {/* 3-day vs 4-day gym capacity selector */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase font-mono text-zinc-200">
                  Gym Frequency Rule
                </h3>
                <p className="text-[11px] text-zinc-400">
                  If only 3 gym sessions available, app cleanly uses Mon, Tue, Thu without cramming.
                </p>
              </div>

              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0">
                <button
                  onClick={() => setGymDaysPerWeek(3)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    userProfile.availableGymDaysPerWeek === 3
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'text-zinc-400'
                  }`}
                >
                  3 Days
                </button>
                <button
                  onClick={() => setGymDaysPerWeek(4)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    userProfile.availableGymDaysPerWeek === 4
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'text-zinc-400'
                  }`}
                >
                  4 Days
                </button>
              </div>
            </div>
          </div>

          {/* 7-Day Interactive List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono uppercase text-zinc-400 font-semibold">
                Scheduled Days (Tap to Swap or Move)
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">1-tap reassign</span>
            </div>

            {DAYS.map(day => {
              const workoutType = userProfile.schedule[day];
              const template = allTemplates[workoutType];
              const isRest = workoutType === 'rest';
              const isEditing = editingDay === day;

              return (
                <div
                  key={day}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl overflow-hidden transition"
                >
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-mono text-xs font-bold text-zinc-300 uppercase">
                        {day.slice(0, 3)}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-zinc-200 capitalize">
                          {day}
                        </div>
                        <div className="text-[11px] font-mono text-emerald-400">
                          {template ? template.title : workoutType}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {isRest ? 'Rest' : `~${template?.estimatedMinutes || 60}m`}
                      </span>
                      <button
                        onClick={() => setEditingDay(isEditing ? null : day)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-semibold"
                      >
                        {isEditing ? 'Cancel' : 'Change'}
                      </button>
                    </div>
                  </div>

                  {/* Inline Reassignment Dropdown */}
                  {isEditing && (
                    <div className="p-3 bg-zinc-950 border-t border-zinc-800 space-y-1.5 animate-in fade-in">
                      <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                        Reassign {day} to:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(Object.values(allTemplates) as WorkoutTemplate[]).map(tmpl => (
                          <button
                            key={tmpl.workoutType}
                            onClick={() => handleSetWorkoutForDay(day, tmpl.workoutType)}
                            className="p-2 text-left bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 text-xs font-medium text-zinc-200 truncate"
                          >
                            {tmpl.title}
                          </button>
                        ))}
                        <button
                          onClick={() => handleSetWorkoutForDay(day, 'rest')}
                          className="p-2 text-left bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 text-xs font-medium text-zinc-400"
                        >
                          Rest & Recovery
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ROUTINES & TEMPLATE EDITOR */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {/* Header with New Routine Button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Workout Routines</h3>
              <p className="text-[11px] text-zinc-400">Customize exercises, sets, reps, and order</p>
            </div>
            <button
              onClick={() => setShowNewRoutineModal(true)}
              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 rounded-xl text-xs font-bold flex items-center space-x-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Routine</span>
            </button>
          </div>

          {/* Routine Selector Carousel / Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {(Object.values(allTemplates) as WorkoutTemplate[])
              .filter(t => t.workoutType !== 'rest')
              .map(t => (
                <button
                  key={t.workoutType}
                  onClick={() => {
                    setSelectedTemplateKey(t.workoutType);
                    setIsEditingTemplate(false);
                    setEditingTemplateData(null);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                    selectedTemplateKey === t.workoutType
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t.title}
                </button>
              ))}
          </div>

          {/* Template Detail / Editor Card */}
          {activeTemplate && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base font-bold text-zinc-100">
                      {isEditingTemplate ? editingTemplateData?.title : activeTemplate.title}
                    </h4>
                    {activeTemplate.isCustom && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {isEditingTemplate ? editingTemplateData?.shortDescription : activeTemplate.shortDescription}
                  </p>
                </div>

                {!isEditingTemplate ? (
                  <button
                    onClick={() => handleStartEditTemplate(selectedTemplateKey)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border border-zinc-700"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Routine</span>
                  </button>
                ) : (
                  <div className="flex space-x-1.5">
                    <button
                      onClick={handleSaveTemplate}
                      className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 rounded-xl text-xs font-bold flex items-center space-x-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => setIsEditingTemplate(false)}
                      className="px-2 py-1.5 bg-zinc-800 text-zinc-400 rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Exercise List */}
              <div className="space-y-2 pt-1 border-t border-zinc-800">
                <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                  Movement Prescription ({isEditingTemplate ? editingTemplateData?.exercises.length : activeTemplate.exercises.length} Exercises)
                </span>

                {((isEditingTemplate ? editingTemplateData?.exercises : activeTemplate.exercises) || []).map((ex, idx) => {
                  const def = combinedExercises[ex.exerciseId];
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-zinc-500 font-bold text-[11px] w-4">
                          {idx + 1}.
                        </span>
                        <div>
                          <div className="font-semibold text-zinc-200">
                            {def ? def.name : ex.exerciseId.replace(/_/g, ' ')}
                          </div>
                          <div className="text-[10px] font-mono text-emerald-400">
                            {ex.targetSets} sets × {ex.targetReps ? `${ex.targetReps} reps` : ex.targetRepsRange ? `${ex.targetRepsRange[0]}-${ex.targetRepsRange[1]} reps` : `${ex.targetDurationSec || 30}s`} • Rest {ex.defaultRestSec || 90}s
                          </div>
                        </div>
                      </div>

                      {isEditingTemplate && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleMoveTemplateExercise(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded bg-zinc-800 disabled:opacity-30 text-zinc-300"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMoveTemplateExercise(idx, 'down')}
                            disabled={idx === (editingTemplateData?.exercises.length || 0) - 1}
                            className="p-1 rounded bg-zinc-800 disabled:opacity-30 text-zinc-300"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRemoveTemplateExercise(idx)}
                            className="p-1 rounded bg-zinc-800 text-rose-400 hover:bg-rose-950"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {isEditingTemplate && (
                  <button
                    onClick={() => setShowAddExerciseToTemplate(true)}
                    className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-dashed border-zinc-700 rounded-xl text-xs font-semibold text-emerald-400 flex items-center justify-center space-x-1.5 transition mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Exercise From Library</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PHASE ROADMAP */}
      {activeTab === 'phases' && (
        <div className="space-y-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase font-mono text-zinc-300">
              8–12 Week Macrocycle Architecture
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Program preserves all physical qualities in every block. Only the dosage, rep emphasis, and volume ratios shift to induce adaptations without stalling.
            </p>
          </div>

          {/* Phase 1 */}
          <div className={`p-4 rounded-2xl border ${userProfile.currentPhase === 1 ? 'bg-zinc-900 border-emerald-500/60 ring-1 ring-emerald-500/40' : 'bg-zinc-950 border-zinc-800'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-emerald-400">
                Phase 1 (Current Block)
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                Weeks 1–8
              </span>
            </div>
            <h4 className="text-sm font-bold text-zinc-100 mt-1">
              Aerobic Base & End-Range Mobility Emphasis
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Conservative compound strength baseline. Strict double-progression, 30–40 min conversational runs, continuous easy swimming, and adductor/Achilles tissue resilience.
            </p>
          </div>

          {/* Phase 2 */}
          <div className={`p-4 rounded-2xl border ${userProfile.currentPhase === 2 ? 'bg-zinc-900 border-emerald-500/60 ring-1 ring-emerald-500/40' : 'bg-zinc-950 border-zinc-800'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-zinc-400">
                Phase 2
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                Weeks 9–16
              </span>
            </div>
            <h4 className="text-sm font-bold text-zinc-100 mt-1">
              Rate of Force Development & Compound Overload
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Intensification of jumps, velocity work, higher-intensity aerobic thresholds, and progressing towards dragon flag full reps.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: EXERCISE LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 mr-2">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search movements, muscle, tier..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/60"
              />
            </div>
            <button
              onClick={() => setShowNewExerciseModal(true)}
              className="py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center space-x-1 shrink-0 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Custom</span>
            </button>
          </div>

          <div className="space-y-2">
            {filteredExercises.map(ex => {
              const isExpanded = expandedExerciseId === ex.id;
              const isCustom = ex.id.startsWith('custom_');

              return (
                <div
                  key={ex.id}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                    className="w-full p-3.5 flex items-center justify-between text-left"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-zinc-200">{ex.name}</span>
                        {isCustom && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] uppercase font-mono text-zinc-500 mt-0.5">
                        {ex.category.replace(/_/g, ' ')} • {ex.equipment}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono text-emerald-400">
                        {ex.targetMuscles.slice(0, 2).join(', ')}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-3.5 bg-zinc-950 border-t border-zinc-800 space-y-2 text-xs animate-in fade-in">
                      <p className="text-zinc-300">{ex.explanation}</p>
                      {ex.cues.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] uppercase font-mono text-zinc-500 font-bold block">
                            Key Cues:
                          </span>
                          <ul className="text-zinc-300 space-y-0.5 list-disc list-inside">
                            {ex.cues.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {isCustom && (
                        <div className="pt-2 border-t border-zinc-900 flex justify-end">
                          <button
                            onClick={() => deleteCustomExercise(ex.id)}
                            className="px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg border border-rose-900/50 flex items-center space-x-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Custom Movement</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Add Exercise to Template */}
      {showAddExerciseToTemplate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-5 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100">Select Movement to Add</h3>
              <button onClick={() => setShowAddExerciseToTemplate(false)} className="p-1 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              {(Object.values(combinedExercises) as ExerciseDefinition[]).map(ex => (
                <button
                  key={ex.id}
                  onClick={() => handleAddExerciseToRoutine(ex.id)}
                  className="w-full p-2.5 bg-zinc-950 hover:bg-zinc-800 rounded-xl border border-zinc-800 text-left flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-zinc-200">{ex.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono uppercase">{ex.category.replace(/_/g, ' ')}</div>
                  </div>
                  <span className="text-emerald-400 font-bold">+ Add</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New Routine */}
      {showNewRoutineModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100">Create Custom Routine</h3>
              <button onClick={() => setShowNewRoutineModal(false)} className="p-1 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Routine Title</label>
                <input
                  type="text"
                  placeholder="e.g., Upper Body Hypertrophy"
                  value={newRoutineTitle}
                  onChange={e => setNewRoutineTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Short Description</label>
                <input
                  type="text"
                  placeholder="e.g., Heavy press, row, and posture tissue focus"
                  value={newRoutineDesc}
                  onChange={e => setNewRoutineDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleCreateNewRoutine}
                disabled={!newRoutineTitle.trim()}
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-zinc-950 font-bold rounded-xl text-sm"
              >
                Create Routine & Add Movements
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Exercise */}
      {showNewExerciseModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100">Add Custom Movement</h3>
              <button onClick={() => setShowNewExerciseModal(false)} className="p-1 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Exercise Name</label>
                <input
                  type="text"
                  placeholder="e.g., Landmine Press"
                  value={newExName}
                  onChange={e => setNewExName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">Tier / Category</label>
                  <select
                    value={newExCategory}
                    onChange={e => setNewExCategory(e.target.value as MovementTier)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100"
                  >
                    <option value="prep">Prep / Mobility</option>
                    <option value="power">Power</option>
                    <option value="primary_strength">Primary Strength</option>
                    <option value="secondary_movement">Secondary Movement</option>
                    <option value="structural_tissue">Structural Tissue</option>
                    <option value="conditioning">Conditioning</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Load Type</label>
                  <select
                    value={newExLoadType}
                    onChange={e => setNewExLoadType(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100"
                  >
                    <option value="weight_kg">Weight (kg/lbs)</option>
                    <option value="bodyweight">Bodyweight</option>
                    <option value="duration_sec">Duration / Hold (sec)</option>
                    <option value="distance_m">Distance (meters)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Target Muscles (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., Shoulders, Triceps, Serratus"
                  value={newExMuscles}
                  onChange={e => setNewExMuscles(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Key Technique Cues (semicolon separated)</label>
                <input
                  type="text"
                  placeholder="e.g., Brace abs; Reach at top; Controlled eccentric"
                  value={newExCues}
                  onChange={e => setNewExCues(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100"
                />
              </div>

              <button
                onClick={handleSaveCustomExercise}
                disabled={!newExName.trim()}
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-zinc-950 font-bold rounded-xl text-sm mt-2"
              >
                Save Movement to Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
