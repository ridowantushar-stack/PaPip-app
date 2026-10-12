import React, { useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  Eye,
  Video as VideoIcon,
  Flame,
  Info,
  Edit3,
  Share2,
  UserCheck,
  X,
  Plus,
} from 'lucide-react';
import { User, Video } from '../types';
import { useAuth } from '../context/AuthContext';
import { useVideos } from '../context/VideoContext';
import { VideoCard } from '../components/common/VideoCard';

interface CreatorProfilePageProps {
  creatorId: string;
  onSelectVideo: (video: Video) => void;
  onNavigate: (page: string, params?: any) => void;
  onShareVideo: (video: Video) => void;
  onReportVideo: (video: Video) => void;
}

export const CreatorProfilePage: React.FC<CreatorProfilePageProps> = ({
  creatorId,
  onSelectVideo,
  onNavigate,
  onShareVideo,
  onReportVideo,
}) => {
  const { allUsers, currentUser, updateProfile, isAuthenticated, openAuthModal } = useAuth();
  const { videos, toggleSubscribe, isSubscribed } = useVideos();

  const [activeTab, setActiveTab] = useState<'videos' | 'shorts' | 'about'>('videos');
  const [videoSort, setVideoSort] = useState<'latest' | 'popular'>('latest');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit profile form state
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBanner, setEditBanner] = useState('');

  const creator = allUsers.find((u) => u.id === creatorId) || allUsers[0];
  const isOwner = currentUser?.id === creator.id;
  const isSubbed = isSubscribed(creator.id);

  // Channel videos
  const creatorVideos = videos.filter((v) => v.creatorId === creator.id && !v.isShort);
  const creatorShorts = videos.filter((v) => v.creatorId === creator.id && v.isShort);

  const sortedVideos = [...creatorVideos].sort((a, b) => {
    if (videoSort === 'popular') return b.views - a.views;
    return 0; // default latest
  });

  const totalViews = [...creatorVideos, ...creatorShorts].reduce((acc, curr) => acc + curr.views, 0);

  const handleOpenEdit = () => {
    setEditName(creator.name);
    setEditBio(creator.bio);
    setEditAvatar(creator.avatarUrl);
    setEditBanner(creator.bannerUrl);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName.trim(),
      bio: editBio.trim(),
      avatarUrl: editAvatar.trim(),
      bannerUrl: editBanner.trim(),
    });
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 -mt-2">
      {/* Banner */}
      <div className="relative w-full h-36 sm:h-52 md:h-64 rounded-3xl overflow-hidden bg-gray-900 shadow-md">
        <img
          src={creator.bannerUrl}
          alt={creator.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Profile Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar */}
          <div className="relative -mt-14 sm:-mt-16">
            <img
              src={creator.avatarUrl}
              alt={creator.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-white dark:ring-[#0D0E11] shadow-xl bg-gray-800"
            />
          </div>

          {/* Text details */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {creator.name}
              </h1>
              {creator.isVerified && (
                <CheckCircle2 className="w-5 h-5 text-[#FF2A38] fill-white dark:fill-[#0D0E11]" />
              )}
            </div>

            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {creator.handle} • {creator.subscribersCount.toLocaleString()} subscribers • {creatorVideos.length + creatorShorts.length} videos
            </p>

            <p className="text-xs text-gray-600 dark:text-gray-300 max-w-xl line-clamp-2 pt-1 leading-relaxed">
              {creator.bio}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-shrink-0 pt-2 md:pt-0">
          {isOwner ? (
            <>
              <button
                onClick={handleOpenEdit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 dark:bg-[#16181D] hover:bg-gray-200 dark:hover:bg-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Customize Channel</span>
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF2A38] hover:bg-[#E51927] text-xs font-bold text-white shadow-md shadow-red-500/20"
              >
                <span>Creator Studio</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                if (!isAuthenticated) openAuthModal('login');
                else toggleSubscribe(creator.id);
              }}
              className={`px-6 py-2.5 rounded-full text-xs font-bold shadow-md transition-all active:scale-95 ${
                isSubbed
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  : 'bg-[#FF2A38] hover:bg-[#E51927] text-white shadow-red-500/20'
              }`}
            >
              {isSubbed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>

      {/* Channel Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'videos'
                ? 'border-[#FF2A38] text-[#FF2A38]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <VideoIcon className="w-4 h-4" />
            <span>Videos ({creatorVideos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shorts')}
            className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'shorts'
                ? 'border-[#FF2A38] text-[#FF2A38]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Shorts ({creatorShorts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'about'
                ? 'border-[#FF2A38] text-[#FF2A38]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About</span>
          </button>
        </div>

        {activeTab === 'videos' && creatorVideos.length > 0 && (
          <div className="flex items-center gap-1.5 pb-2">
            <button
              onClick={() => setVideoSort('latest')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                videoSort === 'latest'
                  ? 'bg-red-50 dark:bg-red-950/40 text-[#FF2A38]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setVideoSort('popular')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                videoSort === 'popular'
                  ? 'bg-red-50 dark:bg-red-950/40 text-[#FF2A38]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Popular
            </button>
          </div>
        )}
      </div>

      {/* Tab Contents */}
      {activeTab === 'videos' && (
        <div>
          {sortedVideos.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-gray-50 dark:bg-[#121418] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
              <VideoIcon className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300">
                No videos uploaded yet
              </h3>
              <p className="text-xs text-gray-500">
                {isOwner ? 'Click upload to publish your first video on PaPip!' : 'This channel has not posted any public videos.'}
              </p>
              {isOwner && (
                <button
                  onClick={() => onNavigate('upload')}
                  className="px-4 py-2 rounded-xl bg-[#FF2A38] text-white text-xs font-bold"
                >
                  Upload First Video
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7">
              {sortedVideos.map((v) => (
                <VideoCard
                  key={v.id}
                  video={v}
                  onSelect={onSelectVideo}
                  onOpenCreator={() => {}}
                  onShare={onShareVideo}
                  onReport={onReportVideo}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'shorts' && (
        <div>
          {creatorShorts.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-gray-50 dark:bg-[#121418] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
              <Flame className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300">No Shorts Yet</h3>
              <p className="text-xs text-gray-500">Shorts appear here once published.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {creatorShorts.map((short) => (
                <div
                  key={short.id}
                  onClick={() => onSelectVideo(short)}
                  className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-black cursor-pointer shadow-md"
                >
                  <img
                    src={short.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                    <p className="text-xs font-bold line-clamp-2">{short.title}</p>
                    <span className="text-[10px] text-gray-300 mt-1">{short.views.toLocaleString()} views</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="max-w-2xl space-y-6 bg-white dark:bg-[#16181D] p-6 rounded-3xl border border-gray-200 dark:border-gray-800">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Description</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {creator.bio || 'No bio provided.'}
            </p>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 text-[#FF2A38]" />
                <span>Joined {creator.joinedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Eye className="w-4 h-4 text-[#FF2A38]" />
                <span>{totalViews.toLocaleString()} total views</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-[#16181D] rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Customize Channel</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Channel Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-[#FF2A38]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Avatar Image URL</label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-[#FF2A38]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Banner Image URL</label>
                <input
                  type="url"
                  value={editBanner}
                  onChange={(e) => setEditBanner(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-[#FF2A38]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-[#FF2A38]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF2A38] text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
