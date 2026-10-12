import React, { useState } from 'react';
import { X, Copy, Check, Share2, Code, Clock } from 'lucide-react';
import { Video } from '../../types';

interface ShareModalProps {
  video: Video;
  currentTime?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  video,
  currentTime = 0,
  isOpen,
  onClose,
}) => {
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'embed'>('link');

  if (!isOpen) return null;

  const currentSeconds = Math.floor(currentTime);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://papip.io';
  const shareUrl = `${baseUrl}/watch/${video.id}${
    includeTimestamp && currentSeconds > 0 ? `?t=${currentSeconds}` : ''
  }`;

  const embedCode = `<iframe width="560" height="315" src="${baseUrl}/embed/${video.id}" title="${video.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;

  const copyToClipboard = async (text: string, isEmbed: boolean = false) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isEmbed) {
        setEmbedCopied(true);
        setTimeout(() => setEmbedCopied(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-[#16181D] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-5 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#FF2A38]" />
            <h3 className="font-bold text-base">Share Video</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 border-b border-gray-100 dark:border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab('link')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'link'
                ? 'bg-red-50 dark:bg-red-950/50 text-[#FF2A38]'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Direct Link
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'embed'
                ? 'bg-red-50 dark:bg-red-950/50 text-[#FF2A38]'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Embed Player
          </button>
        </div>

        {activeTab === 'link' ? (
          <div className="mt-4 space-y-4">
            {/* Link Box */}
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 rounded-xl">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-xs text-gray-700 dark:text-gray-300 focus:outline-none select-all px-1"
              />
              <button
                onClick={() => copyToClipboard(shareUrl, false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF2A38] hover:bg-[#E51927] text-white text-xs font-semibold transition-all flex-shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Timestamp Option */}
            {currentSeconds > 0 && (
              <label className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeTimestamp}
                  onChange={(e) => setIncludeTimestamp(e.target.checked)}
                  className="rounded border-gray-300 text-[#FF2A38] focus:ring-[#FF2A38]"
                />
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  Start at <strong className="text-gray-900 dark:text-white">{Math.floor(currentSeconds / 60)}:{(currentSeconds % 60).toString().padStart(2, '0')}</strong>
                </span>
              </label>
            )}

            {/* Quick Social Shares */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Share to Apps
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(video.title + ' ' + shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center py-2 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 text-xs font-semibold transition-colors"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(video.title)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 text-xs font-semibold transition-colors"
                >
                  Twitter / X
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(video.title)}&body=${encodeURIComponent(shareUrl)}`}
                  className="flex-1 text-center py-2 px-3 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 text-gray-600 dark:text-gray-300 text-xs font-semibold transition-colors"
                >
                  Email
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Copy this HTML snippet to embed the PaPip player on any website:
            </p>
            <textarea
              readOnly
              rows={3}
              value={embedCode}
              className="w-full p-2.5 font-mono text-[11px] bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none select-all"
            />
            <button
              onClick={() => copyToClipboard(embedCode, true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#FF2A38] hover:bg-[#E51927] text-white text-xs font-semibold transition-colors"
            >
              {embedCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{embedCopied ? 'Embed Code Copied!' : 'Copy Embed Code'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
