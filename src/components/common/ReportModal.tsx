import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useVideos } from '../../context/VideoContext';
import { Video } from '../../types';

interface ReportModalProps {
  video: Video;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Sexual content or nudity',
  'Violent or repulsive content',
  'Hateful or abusive speech',
  'Harassment or cyberbullying',
  'Harmful or dangerous acts',
  'Child safety violation',
  'Spam or misleading metadata',
  'Copyright infringement (DMCA)',
];

export const ReportModal: React.FC<ReportModalProps> = ({ video, isOpen, onClose }) => {
  const { submitReport } = useVideos();
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport({
      targetType: 'video',
      targetId: video.id,
      reason: selectedReason,
      details: details.trim(),
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-[#16181D] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-5 text-gray-900 dark:text-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-red-600">
            <Flag className="w-5 h-5" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white">Report Video</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Report Received</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Thank you for keeping PaPip safe. Our trust and moderation system has flagged this video for review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Flagged videos are reviewed 24/7 against PaPip Community Guidelines.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Reason for reporting
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                      selectedReason === reason
                        ? 'border-[#FF2A38] bg-red-50/50 dark:bg-red-950/30 text-gray-900 dark:text-white font-medium'
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="text-[#FF2A38] focus:ring-[#FF2A38]"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Additional Details (Optional)
              </label>
              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide timestamps or context..."
                className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-[#FF2A38]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#FF2A38] hover:bg-[#E51927] rounded-xl shadow-xs transition-all"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
