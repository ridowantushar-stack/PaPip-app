import React from 'react';
import { Tv, Play, Plus, Compass } from 'lucide-react';
import { Video } from '../types';
import { useVideos } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { VideoCard } from '../components/common/VideoCard';

interface SubscriptionsPageProps {
  onSelectVideo: (video: Video) => void;
  onOpenCreator: (creatorId: string) => void;
  onNavigate: (page: string, params?: any) => void;
  onShareVideo: (video: Video) => void;
  onReportVideo: (video: Video) => void;
}

export const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({
  onSelectVideo,
  onOpenCreator,
  onNavigate,
  onShareVideo,
  onReportVideo,
}) => {
  const { subscriptions, videos } = useVideos();
  const { allUsers } = useAuth();

  const subscribedCreators = allUsers.filter((u) => subscriptions.includes(u.id));

  // Videos uploaded by subscribed creators
  const feedVideos = videos.filter(
    (v) => subscriptions.includes(v.creatorId) && v.visibility === 'public'
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Tv className="w-5 h-5 text-[#FF2A38]" />
            <span>Subscriptions</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Latest uploads from the {subscribedCreators.length} creators you follow
          </p>
        </div>
      </div>

      {/* Subscribed Creators Carousel */}
      {subscribedCreators.length > 0 && (
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
          {subscribedCreators.map((creator) => (
            <button
              key={creator.id}
              onClick={() => onOpenCreator(creator.id)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
            >
              <div className="relative">
                <img
                  src={creator.avatarUrl}
                  alt={creator.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-[#FF2A38] transition-all"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#FF2A38] ring-2 ring-white dark:ring-[#0D0E11]" />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[70px]">
                {creator.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Feed Videos */}
      <div>
        {feedVideos.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-gray-50 dark:bg-[#121418] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
            <Tv className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300">
              No recent uploads from subscriptions
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Follow more channels or explore trending videos on Home.
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="mt-2 px-5 py-2 rounded-xl bg-[#FF2A38] text-white text-xs font-bold"
            >
              Explore Videos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7">
            {feedVideos.map((video) => (
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
