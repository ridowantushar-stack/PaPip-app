import React, { useState } from 'react';
import { History, ThumbsUp, Video as VideoIcon, Trash2, ArrowRight } from 'lucide-react';
import { Video } from '../types';
import { useVideos } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { VideoCard } from '../components/common/VideoCard';

interface LibraryPageProps {
  onSelectVideo: (video: Video) => void;
  onOpenCreator: (creatorId: string) => void;
  onNavigate: (page: string, params?: any) => void;
  onShareVideo: (video: Video) => void;
  onReportVideo: (video: Video) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  onSelectVideo,
  onOpenCreator,
  onNavigate,
  onShareVideo,
  onReportVideo,
}) => {
  const { videos, watchHistory, userReactions } = useVideos();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'history' | 'liked' | 'uploads'>('history');

  // History videos in chronological order
  const historyVideos = watchHistory
    .map((id) => videos.find((v) => v.id === id))
    .filter((v): v is Video => !!v);

  // Liked videos
  const likedVideos = videos.filter((v) => userReactions[v.id] === 'like');

  // User uploaded videos
  const uploadedVideos = currentUser
    ? videos.filter((v) => v.creatorId === currentUser.id)
    : [];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-[#FF2A38]" />
            <span>Library</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Your watch history, liked videos, and channel uploads
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
            activeTab === 'history'
              ? 'bg-[#FF2A38] text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History ({historyVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('liked')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
            activeTab === 'liked'
              ? 'bg-[#FF2A38] text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Liked Videos ({likedVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('uploads')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
            activeTab === 'uploads'
              ? 'bg-[#FF2A38] text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          <VideoIcon className="w-3.5 h-3.5" />
          <span>Your Uploads ({uploadedVideos.length})</span>
        </button>
      </div>

      {/* Grid */}
      <div>
        {activeTab === 'history' && (
          <div>
            {historyVideos.length === 0 ? (
              <div className="py-20 text-center text-xs text-gray-400">
                No videos in your watch history yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7">
                {historyVideos.map((video) => (
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
        )}

        {activeTab === 'liked' && (
          <div>
            {likedVideos.length === 0 ? (
              <div className="py-20 text-center text-xs text-gray-400">
                No liked videos yet. Tap thumbs-up on any video!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7">
                {likedVideos.map((video) => (
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
        )}

        {activeTab === 'uploads' && (
          <div>
            {uploadedVideos.length === 0 ? (
              <div className="py-20 text-center text-xs text-gray-400 space-y-2">
                <p>You have not published any videos yet.</p>
                <button
                  onClick={() => onNavigate('upload')}
                  className="px-4 py-2 rounded-xl bg-[#FF2A38] text-white text-xs font-bold"
                >
                  Upload Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7">
                {uploadedVideos.map((video) => (
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
        )}
      </div>
    </div>
  );
};
