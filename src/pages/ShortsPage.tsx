import React, { useState, useRef, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Send,
  X,
} from 'lucide-react';
import { Video } from '../types';
import { useVideos } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { ShareModal } from '../components/common/ShareModal';

interface ShortsPageProps {
  onOpenCreator: (creatorId: string) => void;
}

export const ShortsPage: React.FC<ShortsPageProps> = ({ onOpenCreator }) => {
  const {
    videos,
    recordView,
    toggleLike,
    toggleDislike,
    userReactions,
    getVideoComments,
    addComment,
    toggleSubscribe,
    isSubscribed,
  } = useVideos();

  const { currentUser, isAuthenticated, openAuthModal } = useAuth();

  const shortsList = videos.filter((v) => v.isShort);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const currentShort = shortsList[currentIndex] || shortsList[0];

  useEffect(() => {
    if (currentShort) {
      recordView(currentShort.id);
      setIsPlaying(true);
    }
  }, [currentIndex, currentShort?.id]);

  const handleNext = () => {
    if (currentIndex < shortsList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // loop back to first
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(shortsList.length - 1);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, shortsList.length]);

  if (!currentShort) {
    return (
      <div className="py-24 text-center">
        <p className="text-gray-400">No shorts available yet.</p>
      </div>
    );
  }

  const isLiked = userReactions[currentShort.id] === 'like';
  const isSubbed = isSubscribed(currentShort.creatorId);
  const comments = getVideoComments(currentShort.id);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (commentText.trim()) {
      addComment(currentShort.id, commentText);
      setCommentText('');
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-7.5rem)] md:h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden pb-4">
      {/* Navigation Buttons (Desktop) */}
      <div className="hidden md:flex flex-col gap-3 absolute right-6 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={handlePrev}
          className="p-3 rounded-full bg-gray-200/80 dark:bg-gray-800/80 hover:bg-[#FF2A38] text-gray-800 dark:text-gray-200 hover:text-white transition-all shadow-lg active:scale-90"
          title="Previous Short (Up Arrow)"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="p-3 rounded-full bg-gray-200/80 dark:bg-gray-800/80 hover:bg-[#FF2A38] text-gray-800 dark:text-gray-200 hover:text-white transition-all shadow-lg active:scale-90"
          title="Next Short (Down Arrow)"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Main 9:16 Shorts Container */}
      <div className="relative w-full max-w-[390px] h-full rounded-2xl md:rounded-3xl overflow-hidden bg-black shadow-2xl flex items-center justify-center">
        {/* Native Video */}
        <video
          ref={videoRef}
          key={currentShort.id + '_' + (currentShort.videoUrl || 'none')}
          autoPlay
          loop
          playsInline
          preload="auto"
          muted={isMuted}
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        >
          {currentShort.videoUrl && (
            <source
              src={currentShort.videoUrl}
              type={currentShort.videoUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4'}
            />
          )}
        </video>

        {/* Centered Play indicator on pause */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-[#FF2A38] text-white flex items-center justify-center shadow-xl">
              <Play className="w-8 h-8 fill-white translate-x-0.5" />
            </div>
          </div>
        )}

        {/* Top Sound Control & Index */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10 pointer-events-auto">
          <span className="text-[11px] font-bold text-white/80 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs">
            Short {currentIndex + 1} of {shortsList.length}
          </span>
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors backdrop-blur-xs"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Bottom Metadata & Creator Bar */}
        <div className="absolute bottom-4 left-4 right-16 z-10 space-y-2.5 text-white pointer-events-auto">
          {/* Creator Profile */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenCreator(currentShort.creatorId)}
              className="flex items-center gap-2 text-left focus:outline-none"
            >
              <img
                src={currentShort.creatorAvatar}
                alt={currentShort.creatorName}
                className="w-9 h-9 rounded-full object-cover border-2 border-white/60"
              />
              <div className="leading-tight">
                <span className="font-bold text-xs flex items-center gap-1 drop-shadow-md">
                  {currentShort.creatorName}
                  <CheckCircle2 className="w-3 h-3 text-[#FF2A38] fill-white" />
                </span>
                <span className="text-[10px] text-gray-300 drop-shadow-xs">
                  {currentShort.creatorHandle}
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                if (!isAuthenticated) openAuthModal('login');
                else toggleSubscribe(currentShort.creatorId);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-md ${
                isSubbed
                  ? 'bg-white/20 text-white backdrop-blur-xs'
                  : 'bg-[#FF2A38] text-white hover:bg-[#E51927]'
              }`}
            >
              {isSubbed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>

          {/* Title & Tags */}
          <p className="text-xs font-semibold leading-snug drop-shadow-md line-clamp-2">
            {currentShort.title}
          </p>
        </div>

        {/* Right Vertical Action Rail */}
        <div className="absolute right-3 bottom-6 flex flex-col items-center gap-4 z-10 pointer-events-auto">
          {/* Like */}
          <button
            onClick={() => {
              if (!isAuthenticated) openAuthModal('login');
              else toggleLike(currentShort.id);
            }}
            className="flex flex-col items-center gap-1 text-white group"
          >
            <div
              className={`p-3 rounded-full backdrop-blur-md transition-all shadow-lg ${
                isLiked ? 'bg-[#FF2A38] text-white scale-110' : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </div>
            <span className="text-[11px] font-bold drop-shadow-md">
              {currentShort.likesCount > 1000
                ? `${(currentShort.likesCount / 1000).toFixed(1)}k`
                : currentShort.likesCount}
            </span>
          </button>

          {/* Dislike */}
          <button
            onClick={() => {
              if (!isAuthenticated) openAuthModal('login');
              else toggleDislike(currentShort.id);
            }}
            className="flex flex-col items-center gap-1 text-white"
          >
            <div className="p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition-all shadow-lg">
              <ThumbsDown className="w-5 h-5" />
            </div>
          </button>

          {/* Comments Button */}
          <button
            onClick={() => setIsCommentsOpen(true)}
            className="flex flex-col items-center gap-1 text-white"
          >
            <div className="p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition-all shadow-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold drop-shadow-md">{comments.length}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex flex-col items-center gap-1 text-white"
          >
            <div className="p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition-all shadow-lg">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold drop-shadow-md">Share</span>
          </button>
        </div>

        {/* Slide-in Comments Drawer */}
        {isCommentsOpen && (
          <div className="absolute inset-x-0 bottom-0 top-1/3 bg-white dark:bg-[#16181D] rounded-t-3xl p-4 z-30 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                Comments ({comments.length})
              </h4>
              <button
                onClick={() => setIsCommentsOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60 py-2 space-y-2">
              {comments.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-8">
                  No comments yet. Start the conversation!
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="pt-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100">
                      <img src={c.userAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <span>{c.userName}</span>
                      <span className="text-[10px] text-gray-400 font-normal">{c.createdAt}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 pl-6">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handlePostComment} className="pt-2 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add comment..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-gray-100 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-[#FF2A38]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2 rounded-xl bg-[#FF2A38] text-white disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        video={currentShort}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
};
