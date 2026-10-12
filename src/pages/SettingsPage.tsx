import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  HardDrive,
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useVideos } from '../context/VideoContext';
import {
  getSavedFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
  FirebaseCustomConfig,
} from '../services/firebase';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { storageUsageMB, refreshStorageStats, videos } = useVideos();

  // Firebase config state
  const [fbConfig, setFbConfig] = useState<FirebaseCustomConfig>(() => {
    return (
      getSavedFirebaseConfig() || {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
        firestoreDatabaseId: '(default)',
      }
    );
  });

  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    if (fbConfig.apiKey && fbConfig.projectId) {
      saveFirebaseConfig(fbConfig);
      setSavedStatus('Firebase credentials saved successfully. Reloading will connect.');
    } else {
      clearFirebaseConfig();
      setSavedStatus('Firebase configuration cleared. Running in local standalone mode.');
    }
    setTimeout(() => setSavedStatus(null), 3500);
  };

  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      platform: 'PaPip Video Sharing Platform',
      videosCount: videos.length,
      videos: videos.map((v) => ({ ...v, videoUrl: v.blobStorageKey ? '[IndexedDB Blob]' : v.videoUrl })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `papip_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="pb-3 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#FF2A38]" />
          <span>Platform Settings & Storage</span>
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Manage appearance, IndexedDB offline media cache, backups, and Firebase connection.
        </p>
      </div>

      {/* Appearance Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 space-y-4">
        <h2 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          <span>Appearance & Color Scheme</span>
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Theme Mode
            </p>
            <p className="text-[11px] text-gray-500">
              Currently active: <strong className="capitalize">{theme} mode</strong>
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-bold text-gray-800 dark:text-gray-200 transition-colors"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
        </div>
      </div>

      {/* Local Media Storage Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-amber-500" />
            <span>IndexedDB High-Capacity Media Store</span>
          </h2>
          <button
            onClick={refreshStorageStats}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            title="Refresh Storage Usage"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          PaPip uses browser IndexedDB (`papip_media_store_v1`) to store full-resolution video binaries and frame thumbnails locally. This prevents database document bloat while providing zero-latency playback.
        </p>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase">Estimated Storage Used</p>
            <p className="text-2xl font-black text-amber-500 mt-0.5">{storageUsageMB} MB</p>
          </div>
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF2A38] text-white text-xs font-bold shadow-xs hover:bg-[#E51927]"
          >
            <Download className="w-4 h-4" />
            <span>Export Metadata Backup</span>
          </button>
        </div>
      </div>

      {/* Optional Live Firebase Connection Manager */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 space-y-4">
        <h2 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-[#FF2A38]" />
          <span>Firebase Production Connection Bridge</span>
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          To connect PaPip to an external Google Firebase project (Firestore + Authentication + Firebase Storage), supply your configuration keys below. If blank, PaPip operates smoothly in high-performance local persistent mode.
        </p>

        {savedStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{savedStatus}</span>
          </div>
        )}

        <form onSubmit={handleSaveFirebase} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-gray-700 dark:text-gray-300">API Key (apiKey)</label>
              <input
                type="text"
                value={fbConfig.apiKey}
                onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700 dark:text-gray-300">Project ID (projectId)</label>
              <input
                type="text"
                value={fbConfig.projectId}
                onChange={(e) => setFbConfig({ ...fbConfig, projectId: e.target.value })}
                placeholder="papip-production"
                className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700 dark:text-gray-300">Auth Domain</label>
              <input
                type="text"
                value={fbConfig.authDomain}
                onChange={(e) => setFbConfig({ ...fbConfig, authDomain: e.target.value })}
                placeholder="papip.firebaseapp.com"
                className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700 dark:text-gray-300">Storage Bucket</label>
              <input
                type="text"
                value={fbConfig.storageBucket || ''}
                onChange={(e) => setFbConfig({ ...fbConfig, storageBucket: e.target.value })}
                placeholder="papip.appspot.com"
                className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => {
                clearFirebaseConfig();
                setFbConfig({
                  apiKey: '',
                  authDomain: '',
                  projectId: '',
                  storageBucket: '',
                  messagingSenderId: '',
                  appId: '',
                  firestoreDatabaseId: '(default)',
                });
                setSavedStatus('Cleared configuration.');
              }}
              className="text-red-500 hover:underline font-semibold"
            >
              Reset to Standalone
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#FF2A38] text-white font-bold shadow-md shadow-red-500/20 hover:bg-[#E51927]"
            >
              Save Firebase Keys
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
