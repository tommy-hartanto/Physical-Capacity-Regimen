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
  FileText,
  Cloud,
  RefreshCw,
  Lock,
  Unlock,
  Smartphone,
  Bell
} from 'lucide-react';
import { useTraining } from '../context/TrainingContext';
import { soundFx } from '../utils/sound';

export const SettingsView: React.FC = () => {
  const {
    userProfile,
    updateTargetLoad,
    exportDataJson,
    importDataJson,
    resetToDefaults,
    cloudSyncStatus,
    lastCloudSync,
    syncToCloudNow,
    setUnitPreference,
    updateTimerPreferences,
    updateSecurityPreferences,
    lockApp
  } = useTraining();

  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [syncingNow, setSyncingNow] = useState(false);

  // PIN Form
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinInput, setPinInput] = useState('');

  const isLbs = userProfile.unitPreference === 'lbs';

  const handleManualSync = async () => {
    setSyncingNow(true);
    await syncToCloudNow();
    setSyncingNow(false);
  };

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
        setImportStatus('Data successfully restored and synced!');
        setShowImportBox(false);
        setImportText('');
        syncToCloudNow();
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
            syncToCloudNow();
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

  const handleSavePin = () => {
    if (!pinInput.trim()) return;
    updateSecurityPreferences({
      pinEnabled: true,
      pinCode: pinInput.trim()
    });
    setShowPinSetup(false);
    setPinInput('');
  };

  const handleDisablePin = () => {
    updateSecurityPreferences({
      pinEnabled: false,
      pinCode: undefined
    });
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-zinc-100">Settings & Cloud Storage</h2>
        <p className="text-xs text-zinc-400">
          Fly.io persistence, display units, timers, and single-user privacy lock.
        </p>
      </div>

      {importStatus && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl text-xs text-emerald-300">
          {importStatus}
        </div>
      )}

      {/* FLY.IO CLOUD SYNC STATUS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase font-mono text-zinc-200">
                Fly.io Cloud Storage
              </h3>
              <p className="text-[11px] text-zinc-400">
                {cloudSyncStatus === 'synced'
                  ? `Synced to persistent volume (${lastCloudSync || 'Active'})`
                  : cloudSyncStatus === 'syncing'
                  ? 'Saving changes to Fly.io...'
                  : 'Offline mirror active (auto-syncs on connect)'}
              </p>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={syncingNow}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition border border-zinc-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${syncingNow ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* UNIT PREFERENCE (KG VS LBS) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-zinc-200">Units of Measurement</div>
          <div className="text-[11px] text-zinc-400">Display weights in kilograms or pounds</div>
        </div>

        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setUnitPreference('kg')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              !isLbs ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400'
            }`}
          >
            kg
          </button>
          <button
            onClick={() => setUnitPreference('lbs')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              isLbs ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400'
            }`}
          >
            lbs
          </button>
        </div>
      </div>

      {/* TIMER & ERGONOMICS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase font-mono text-zinc-300">
          Timer & Ergonomics
        </h3>

        {/* Auto-start rest */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-xs font-semibold text-zinc-200">Auto-Start Rest Timer</div>
            <div className="text-[11px] text-zinc-400">Trigger countdown immediately when a set is logged</div>
          </div>
          <button
            onClick={() => updateTimerPreferences({ autoStartRest: !(userProfile.timerPreferences?.autoStartRest ?? true) })}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
              (userProfile.timerPreferences?.autoStartRest ?? true) ? 'bg-emerald-500 justify-end' : 'bg-zinc-800 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white block shadow-md" />
          </button>
        </div>

        {/* Rest chime sound */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2.5">
          <div className="flex items-center space-x-2">
            <div>
              <div className="text-xs font-semibold text-zinc-200">Audio Chimes & Tones</div>
              <div className="text-[11px] text-zinc-400">Synthesized acoustic alert on rest / hold completion</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => soundFx.playChime()}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
              title="Test Sound"
            >
              <Volume2 className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={() => {
                const next = !(userProfile.timerPreferences?.restSoundEnabled ?? true);
                updateTimerPreferences({ restSoundEnabled: next });
                soundFx.enabled = next;
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                (userProfile.timerPreferences?.restSoundEnabled ?? true) ? 'bg-emerald-500 justify-end' : 'bg-zinc-800 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white block shadow-md" />
            </button>
          </div>
        </div>

        {/* Screen Wake Lock */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2.5">
          <div>
            <div className="text-xs font-semibold text-zinc-200">Keep Screen Awake</div>
            <div className="text-[11px] text-zinc-400">Prevent device sleep during active workouts</div>
          </div>
          <button
            onClick={() => updateTimerPreferences({ keepScreenAwake: !(userProfile.timerPreferences?.keepScreenAwake ?? true) })}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
              (userProfile.timerPreferences?.keepScreenAwake ?? true) ? 'bg-emerald-500 justify-end' : 'bg-zinc-800 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white block shadow-md" />
          </button>
        </div>

        {/* Background Notifications */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2.5">
          <div>
            <div className="text-xs font-semibold text-zinc-200">Background Rest Notification</div>
            <div className="text-[11px] text-zinc-400">Push notification if tab/phone is in background</div>
          </div>
          <button
            onClick={async () => {
              if (typeof window !== 'undefined' && 'Notification' in window) {
                const perm = await Notification.requestPermission();
                updateTimerPreferences({ restNotificationEnabled: perm === 'granted' });
              }
            }}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
              userProfile.timerPreferences?.restNotificationEnabled ? 'bg-emerald-500 justify-end' : 'bg-zinc-800 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white block shadow-md" />
          </button>
        </div>
      </div>

      {/* SINGLE-USER SECURITY PIN LOCK */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-200">App Passkey / PIN Lock</div>
              <div className="text-[11px] text-zinc-400">
                {userProfile.securityPreferences?.pinEnabled
                  ? 'PIN lock is active on this Fly.io instance'
                  : 'Protect your fitness logs from public visitors'}
              </div>
            </div>
          </div>

          {userProfile.securityPreferences?.pinEnabled ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={lockApp}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold"
              >
                Lock Now
              </button>
              <button
                onClick={handleDisablePin}
                className="px-2.5 py-1 bg-rose-950/40 text-rose-400 border border-rose-900/50 rounded-lg text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPinSetup(true)}
              className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold"
            >
              Set PIN
            </button>
          )}
        </div>

        {showPinSetup && (
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 pt-2">
            <label className="text-[11px] text-zinc-400 block">Enter 4-digit security PIN:</label>
            <div className="flex gap-2">
              <input
                type="password"
                maxLength={6}
                placeholder="e.g., 1234"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-center font-mono text-base font-bold text-zinc-100"
              />
              <button
                onClick={handleSavePin}
                disabled={!pinInput.trim()}
                className="px-3 py-1.5 bg-emerald-500 text-zinc-950 rounded-lg text-xs font-bold"
              >
                Save PIN
              </button>
              <button
                onClick={() => setShowPinSetup(false)}
                className="px-2 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Target Loads Fine-Tuning */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase font-mono text-zinc-300">
          Working Load Targets ({userProfile.unitPreference || 'kg'})
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
          ].map(item => {
            const rawKg = userProfile.activeLoadTargets[item.id] || 0;
            const displayVal = isLbs ? Math.round(rawKg * 2.20462 * 10) / 10 : rawKg;
            return (
              <div key={item.id} className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">
                  {item.label}
                </span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step={isLbs ? '5' : '2.5'}
                    value={displayVal}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      updateTargetLoad(item.id, isLbs ? Math.round((val / 2.20462) * 10) / 10 : val);
                    }}
                    className="w-full bg-transparent font-mono font-bold text-base text-zinc-100 focus:outline-none"
                  />
                  <span className="text-xs font-mono text-zinc-500">{userProfile.unitPreference || 'kg'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Export & Portability */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase font-mono text-zinc-300">
          Data Export & Backup
        </h3>
        <p className="text-[11px] text-zinc-400">
          Export your entire training notebook as JSON anytime.
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
          <div className="text-xs font-bold text-zinc-300">Reset to Baseline</div>
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
