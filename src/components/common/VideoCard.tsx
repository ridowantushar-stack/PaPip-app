import React, { useState } from 'react';
import { MoreVertical, CheckCircle2, Share2, Flag, HardDrive, Sparkles } from 'lucide-react';
import { Video } from '../../types';

interface VideoCardProps {
  video: Video;
  onSelect: (video: Video) => void;
  onOpenCreator: (creatorId: string) => void;
  onShare?: (video: Video) => void;
  onReport?: (video: Video) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelect,
  onOpenCreator,
  onShare,
  onReport,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Format duration into MM:SS or HH:MM:SS
  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const sStr = s < 10 ? `0${s}` : `${s}`;
    if (h > 0) {
      const mStr = m < 10 ? `0${m}` : `${m}`;
      return `${h}:${mStr}:${sStr}`;
    }
    return `${m}:${sStr}`;
  };

  // Format view count
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return `${views}`;
  };

  return (
    <div className="group flex flex-col w-full text-left cursor-pointer transition-all">
      {/* Thumbnail Container */}
      <div
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-xs group-hover:shadow-lg transition-all"
        onClick={() => onSelect(video)}
      >
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[11px] font-semibold text-white bg-black/80 rounded-md backdrop-blur-xs">
          {formatDuration(video.duration)}
        </span>

        {/* Uploaded / Demo Distinction Badge */}
        {video.isUserUploaded ? (
          <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-amber-200 bg-black/80 border border-amber-500/40 rounded-full shadow-xs backdrop-blur-xs">
            <HardDrive className="w-3 h-3 text-amber-400" />
            Uploaded Video
          </span>
        ) : (
          <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-red-200 bg-black/80 border border-red-500/30 rounded-full shadow-xs backdrop-blur-xs">
            <Sparkles className="w-3 h-3 text-[#FF2A38]" />
            Demo Stream
          </span>
        )}

        {/* Short indicator */}
        {video.isShort && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-600 rounded-md">
            Short
          </span>
        )}
      </div>

      {/* Video Details */}
      <div className="flex items-start gap-3 mt-3 px-0.5">
        {/* Creator Avatar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenCreator(video.creatorId);
          }}
          className="flex-shrink-0 mt-0.5 focus:outline-none"
          title={video.creatorName}
        >
          <img
            src={video.creatorAvatar}
            alt={video.creatorName}
            className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-[#FF2A38] transition-all"
            loading="lazy"
          />
        </button>

        {/* Metadata */}
        <div className="flex-1 min-w-0" onClick={() => onSelect(video)}>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-[#FF2A38] transition-colors">
            {video.title}
          </h3>

          <div className="mt-1 flex flex-col text-xs text-gray-500 dark:text-gray-400">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenCreator(video.creatorId);
              }}
              className="flex items-center gap-1 text-left hover:text-gray-900 dark:hover:text-gray-200 transition-colors w-fit"
            >
              <span className="truncate">{video.creatorName}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-gray-400 fill-gray-400 dark:fill-gray-600" />
            </button>

            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
              <span>{formatViews(video.views)} views</span>
              <span>•</span>
              <span>{video.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Options"
            aria-label="Video options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#16181D] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-1.5 z-30"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onShare?.(video);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share Video
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onReport?.(video);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Flag className="w-3.5 h-3.5" />
                Report Content
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
