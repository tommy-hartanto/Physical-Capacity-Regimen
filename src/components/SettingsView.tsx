import React, { useState } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Shield,
  FileText
} from 'lucide-react';
import { useTraining } from '../context/TrainingContext';
import { soundFx } from '../utils/sound';

export const SettingsView: React.FC = () => {
  const {
    userProfile,
    updateTargetLoad,
    exportDataJson,
    importDataJson,
    resetToDefaults
  } = useTraining();

  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [soundActive, setSoundActive] = useState<boolean>(soundFx.enabled);

  const handleExport = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `capacity_program_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    try {
      const success = importDataJson(importText);
      if (success) {
        setImportStatus('Data successfully restored!');
        setShowImportBox(false);
        setImportText('');
      } else {
        setImportStatus('Error: Invalid backup file format.');
      }
    } catch {
      setImportStatus('Error: Could not parse JSON text.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        try {
          const success = importDataJson(content);
          if (success) {
            setImportStatus('Backup loaded successfully!');
          } else {
            setImportStatus('Failed to parse uploaded backup file.');
          }
        } catch {
          setImportStatus('Failed to parse uploaded backup file.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-zinc-100">Program & System Settings</h2>
        <p className="text-xs text-zinc-400">
          Tune load targets, sound notifications, and manage offline data backup.
        </p>
      </div>

      {importStatus && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl text-xs text-emerald-300">
          {importStatus}
        </div>
      )}

      {/* Target Loads Fine-Tuning */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase font-mono text-zinc-300">
          Current Working Targets (kg)
        </h3>
        <p className="text-[11px] text-zinc-400">
          The progression engine updates these automatically based on RPE, but you can manually adjust them anytime.
        </p>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {[
            { id: 'back_squat', label: 'Back Squat' },
            { id: 'bench_press', label: 'Bench Press' },
            { id: 'deadlift', label: 'Deadlift' },
            { id: 'weighted_pull_up', label: 'Weighted Pull-Up' },
            { id: 'overhead_press', label: 'Overhead Press' },
            { id: 'bulgarian_split_squat', label: 'Bulgarian Split Squat' }
          ].map(item => (
            <div key={item.id} className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">
                {item.label}
              </span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  step="2.5"
                  value={userProfile.activeLoadTargets[item.id] || 0}
                  onChange={e => updateTargetLoad(item.id, parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent font-mono font-bold text-base text-zinc-100 focus:outline-none"
                />
                <span className="text-xs font-mono text-zinc-500">kg</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Hierarchy & Philosophy Check */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
        <h3 className="text-xs font-bold uppercase font-mono text-zinc-300">
          Program Core Priorities (Active)
        </h3>
        <ol className="text-xs text-zinc-300 space-y-1 font-mono">
          <li>1. Flexibility / mobility & end-range control</li>
          <li>2. Athleticism / power & movement quality</li>
          <li>3. Compound strength (double progression)</li>
          <li>4. Cardiovascular fitness (Aerobic base run + swim)</li>
          <li>5. Longevity & connective tissue robustness</li>
          <li>6. Moderate functional muscle development</li>
        </ol>
      </div>

      {/* Audio Preferences */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Volume2 className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs font-bold text-zinc-200">Rest Timer Chime</div>
            <div className="text-[11px] text-zinc-400">Audio chime when rest period ends</div>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.enabled = !soundActive;
            setSoundActive(!soundActive);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition border ${
            soundActive
              ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}
        >
          {soundActive ? 'Enabled' : 'Muted'}
        </button>
      </div>

      {/* Data Export & Backup */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase font-mono text-zinc-300">
          Data Export & Portability
        </h3>
        <p className="text-[11px] text-zinc-400">
          All your workout logs, progression calibrations, and cardio sessions are saved locally in your browser. Export anytime to back up your history.
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-200 flex items-center justify-center space-x-1.5"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export JSON</span>
          </button>

          <label className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-200 flex items-center justify-center space-x-1.5 cursor-pointer">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Import File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {showImportBox ? (
          <div className="space-y-2 pt-2">
            <textarea
              rows={3}
              placeholder="Paste JSON backup text here..."
              value={importText}
              onChange={e => setImportText(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs font-mono text-zinc-200"
            />
            <div className="flex gap-2">
              <button
                onClick={handleImportSubmit}
                className="px-3 py-1.5 bg-emerald-500 text-zinc-950 rounded-lg text-xs font-bold"
              >
                Apply
              </button>
              <button
                onClick={() => setShowImportBox(false)}
                className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowImportBox(true)}
            className="text-[11px] text-zinc-500 hover:text-zinc-400 underline block"
          >
            Or paste JSON manually
          </button>
        )}
      </div>

      {/* Reset System to Baseline */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-zinc-300">Reset to Defaults</div>
          <div className="text-[11px] text-zinc-500">Restore default templates and starting loads</div>
        </div>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset program data to baseline?')) {
              resetToDefaults();
            }
          }}
          className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-rose-900/60 text-xs text-rose-400 font-semibold"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
