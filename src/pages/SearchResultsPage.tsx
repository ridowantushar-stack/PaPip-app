import React, { useState } from 'react';
import { Search, Filter, CheckCircle2, UserCheck, Play } from 'lucide-react';
import { Video } from '../types';
import { useVideos } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { VideoCard } from '../components/common/VideoCard';

interface SearchResultsPageProps {
  query: string;
  onSelectVideo: (video: Video) => void;
  onOpenCreator: (creatorId: string) => void;
  onShareVideo: (video: Video) => void;
  onReportVideo: (video: Video) => void;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  query,
  onSelectVideo,
  onOpenCreator,
  onShareVideo,
  onReportVideo,
}) => {
  const { videos, toggleSubscribe, isSubscribed } = useVideos();
  const { allUsers, isAuthenticated, openAuthModal } = useAuth();

  const [sortBy, setSortBy] = useState<'relevance' | 'views' | 'date'>('relevance');

  const cleanQuery = query.toLowerCase().trim();

  // Matched creators
  const matchedCreators = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(cleanQuery) ||
      u.handle.toLowerCase().includes(cleanQuery) ||
      u.bio.toLowerCase().includes(cleanQuery)
  );

  // Matched videos
  const matchedVideos = videos.filter((v) => {
    if (v.visibility !== 'public') return false;
    const titleMatch = v.title.toLowerCase().includes(cleanQuery);
    const descMatch = v.description.toLowerCase().includes(cleanQuery);
    const creatorMatch = v.creatorName.toLowerCase().includes(cleanQuery);
    const tagMatch = v.tags.some((t) => t.toLowerCase().includes(cleanQuery));
    const catMatch = v.category.toLowerCase().includes(cleanQuery);
    return titleMatch || descMatch || creatorMatch || tagMatch || catMatch;
  });

  const sortedVideos = [...matchedVideos].sort((a, b) => {
    if (sortBy === 'views') return b.views - a.views;
    return 0;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-[#FF2A38]" />
            <span>Search results for: "{query}"</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Found {sortedVideos.length} videos and {matchedCreators.length} channels
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="p-1.5 rounded-xl bg-gray-100 dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 font-bold text-gray-800 dark:text-gray-200 focus:outline-none"
          >
            <option value="relevance">Relevance</option>
            <option value="views">Most Views</option>
            <option value="date">Upload Date</option>
          </select>
        </div>
      </div>

      {/* Matched Creators Bar */}
      {matchedCreators.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Channels
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matchedCreators.map((creator) => {
              const isSubbed = isSubscribed(creator.id);
              return (
                <div
                  key={creator.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 shadow-xs"
                >
                  <div
                    onClick={() => onOpenCreator(creator.id)}
                    className="flex items-center gap-3 cursor-pointer min-w-0"
                  >
                    <img
                      src={creator.avatarUrl}
                      alt={creator.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1 truncate">
                        {creator.name}
                        {creator.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FF2A38]" />
                        )}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{creator.handle}</p>
                      <p className="text-[10px] text-gray-400">
                        {creator.subscribersCount.toLocaleString()} subscribers
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!isAuthenticated) openAuthModal('login');
                      else toggleSubscribe(creator.id);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                      isSubbed
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                        : 'bg-[#FF2A38] text-white hover:bg-[#E51927]'
                    }`}
                  >
                    {isSubbed ? 'Subscribed' : 'Subscribe'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Matched Videos */}
      <div className="space-y-4">
        {sortedVideos.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-gray-50 dark:bg-[#121418] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
            <Search className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300">
              No matching videos found
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Try searching with different keywords, tags, creator names, or categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7">
            {sortedVideos.map((video) => (
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
