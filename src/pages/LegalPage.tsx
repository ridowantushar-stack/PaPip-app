import React, { useState } from 'react';
import { Shield, FileText, Lock, AlertCircle } from 'lucide-react';

export const LegalPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'terms' | 'privacy' | 'community'>('terms');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="pb-3 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#FF2A38]" />
          <span>PaPip Legal & Community Guidelines</span>
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Updated for October 2026. Watch. Create. Share responsibly.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
        <button
          onClick={() => setActiveSection('terms')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeSection === 'terms'
              ? 'bg-[#FF2A38] text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Terms of Service</span>
        </button>

        <button
          onClick={() => setActiveSection('privacy')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeSection === 'privacy'
              ? 'bg-[#FF2A38] text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Privacy Policy</span>
        </button>

        <button
          onClick={() => setActiveSection('community')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeSection === 'community'
              ? 'bg-[#FF2A38] text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Community Standards & Safety</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed">
        {activeSection === 'terms' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or publishing videos to PaPip ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to all terms, do not use the application.
            </p>

            <h2 className="text-base font-bold text-gray-900 dark:text-white pt-2">
              2. User Content & Creator Ownership
            </h2>
            <p>
              Creators retain full copyright ownership of video content uploaded to PaPip. By publishing a video, you grant PaPip a worldwide, non-exclusive license to host, transcode, and stream your media to viewers across compatible devices.
            </p>

            <h2 className="text-base font-bold text-gray-900 dark:text-white pt-2">
              3. DMCA & Intellectual Property
            </h2>
            <p>
              PaPip responds immediately to copyright notices in accordance with the Digital Millennium Copyright Act. To submit an infringement notice, report the video directly via the Watch page's Flag control or email legal@papip.io.
            </p>
          </div>
        )}

        {activeSection === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              1. Information We Collect
            </h2>
            <p>
              PaPip is built with privacy-first principles. We collect your username, public channel profile information, and video metadata necessary to display your channel and sync your watch history.
            </p>

            <h2 className="text-base font-bold text-gray-900 dark:text-white pt-2">
              2. Video Binary Storage
            </h2>
            <p>
              In default local mode, video binaries uploaded from your machine remain on your device's browser IndexedDB cache. No private personal data is ever sold or exchanged with third-party tracking networks.
            </p>

            <h2 className="text-base font-bold text-gray-900 dark:text-white pt-2">
              3. Cookies and Local Storage
            </h2>
            <p>
              We use local storage only to remember your chosen theme (dark/light), current session state, and subscription preferences.
            </p>
          </div>
        )}

        {activeSection === 'community' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              PaPip Community Code of Conduct
            </h2>
            <p>
              PaPip is a platform for original creativity, learning, animation, and cinematic expression. The following behaviors result in instant video removal and channel suspension:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
              <li>Hate speech, discrimination, or targeted harassment of any creator or viewer.</li>
              <li>Violent extremist content or depiction of non-consensual violence.</li>
              <li>Spam, automated comment botting, or misleading clickbait metadata.</li>
              <li>Copyright infringement and reuploading another artist's work without permission.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
