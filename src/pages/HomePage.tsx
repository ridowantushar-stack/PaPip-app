import React, { useState } from 'react';
import { Video, VideoCategory } from '../types';
import { useVideos } from '../context/VideoContext';
import { VideoCard } from '../components/common/VideoCard';
import { Sparkles, HardDrive, Filter, Play } from 'lucide-react';

interface HomePageProps {
  onSelectVideo: (video: Video) => void;
  onOpenCreator: (creatorId: string) => void;
  onShareVideo: (video: Video) => void;
  onReportVideo: (video: Video) => void;
}

const CATEGORIES: VideoCategory[] = [
  'All',
  'Animation',
  'Tech & Coding',
  'Gaming',
  'Short Films',
  'Nature & Travel',
  'Podcasts',
  'Comedy',
];

export const HomePage: React.FC<HomePageProps> = ({
  onSelectVideo,
  onOpenCreator,
  onShareVideo,
  onReportVideo,
}) => {
  const { videos } = useVideos();
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('All');
  const [filterSource, setFilterSource] = useState<'all' | 'uploads' | 'demo'>('all');

  // Filter public videos that are not shorts (or mixed)
  const regularVideos = videos.filter((v) => !v.isShort && v.visibility === 'public');

  const filteredVideos = regularVideos.filter((v) => {
    // Source filter
    if (filterSource === 'uploads' && !v.isUserUploaded) return false;
    if (filterSource === 'demo' && v.isUserUploaded) return false;

    // Category filter
    if (selectedCategory !== 'All' && v.category !== selectedCategory) return false;

    return true;
  });

  const featuredVideo = regularVideos[0];
  const uploadedCount = videos.filter((v) => v.isUserUploaded).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Category Pills Bar */}
      <div className="sticky top-14 md:top-16 z-20 -mx-4 px-4 py-2 bg-white/90 dark:bg-[#0D0E11]/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 flex-shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xs'
                  : 'bg-gray-100 dark:bg-[#1C1F26] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Source Filter Switch */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#16181D] p-1 rounded-full flex-shrink-0 border border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setFilterSource('all')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-colors ${
              filterSource === 'all'
                ? 'bg-white dark:bg-[#252830] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterSource('uploads')}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full transition-colors ${
              filterSource === 'uploads'
                ? 'bg-white dark:bg-[#252830] text-amber-500 shadow-xs'
                : 'text-gray-500 hover:text-amber-500'
            }`}
          >
            <HardDrive className="w-3 h-3" />
            Uploaded ({uploadedCount})
          </button>
          <button
            onClick={() => setFilterSource('demo')}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full transition-colors ${
              filterSource === 'demo'
                ? 'bg-white dark:bg-[#252830] text-[#FF2A38] shadow-xs'
                : 'text-gray-500 hover:text-[#FF2A38]'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Demo Streams
          </button>
        </div>
      </div>

      {/* Hero Featured Video Spotlight Banner (if All is active) */}
      {selectedCategory === 'All' && filterSource === 'all' && featuredVideo && (
        <div
          onClick={() => onSelectVideo(featuredVideo)}
          className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-red-950 via-gray-950 to-black text-white p-6 md:p-8 cursor-pointer shadow-xl group border border-red-900/30"
        >
          <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-50 transition-opacity">
            <img
              src={featuredVideo.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover blur-xs scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF2A38] text-white text-[10px] font-black uppercase tracking-wider">
                Trending Spotlight
              </span>
              <span className="text-xs text-gray-300 font-medium">
                {featuredVideo.category}
              </span>
            </div>

            <h2 className="text-xl md:text-3xl font-extrabold tracking-tight group-hover:text-red-400 transition-colors line-clamp-2">
              {featuredVideo.title}
            </h2>

            <p className="text-xs md:text-sm text-gray-300 line-clamp-2 leading-relaxed">
              {featuredVideo.description}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF2A38] hover:bg-[#E51927] text-white text-xs font-bold shadow-lg shadow-red-500/30 group-hover:scale-105 transition-all">
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Now</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-gray-300">
                <img
                  src={featuredVideo.creatorAvatar}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="font-semibold">{featuredVideo.creatorName}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>Recommended Videos</span>
            <span className="text-xs font-normal text-gray-400">({filteredVideos.length})</span>
          </h2>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-gray-50 dark:bg-[#121418] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
            <Filter className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300">
              No videos found in this category
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Try switching back to "All" or upload a video from your device to see it appear here!
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setFilterSource('all');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onSelect={onSelectVideo}
                onOpenCreator={onOpenCreator}
                onShare={onShareVideo}
                onReport={onReportVideo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
