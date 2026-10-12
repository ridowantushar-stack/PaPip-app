import React, { useState } from 'react';
import {
  LayoutDashboard,
  Video as VideoIcon,
  Eye,
  ThumbsUp,
  Users,
  HardDrive,
  Edit2,
  Trash2,
  ExternalLink,
  Plus,
  Globe,
  Lock,
  Link,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Video, VideoVisibility } from '../types';
import { useAuth } from '../context/AuthContext';
import { useVideos } from '../context/VideoContext';

interface CreatorDashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CreatorDashboardPage: React.FC<CreatorDashboardPageProps> = ({ onNavigate }) => {
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();
  const { videos, updateVideo, deleteVideo, storageUsageMB } = useVideos();

  const [filterVisibility, setFilterVisibility] = useState<'all' | VideoVisibility>('all');
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editVisibility, setEditVisibility] = useState<VideoVisibility>('public');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <LayoutDashboard className="w-12 h-12 text-[#FF2A38] mx-auto" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Creator Studio</h2>
        <p className="text-xs text-gray-500">
          Sign in to access channel analytics, video management, and publishing controls.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-full bg-[#FF2A38] text-white text-xs font-bold"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Owned videos
  const ownedVideos = videos.filter((v) => v.creatorId === currentUser.id);
  const filteredOwned = ownedVideos.filter((v) => {
    if (filterVisibility !== 'all' && v.visibility !== filterVisibility) return false;
    return true;
  });

  const totalViews = ownedVideos.reduce((acc, curr) => acc + curr.views, 0);
  const totalLikes = ownedVideos.reduce((acc, curr) => acc + curr.likesCount, 0);

  const handleOpenEdit = (v: Video) => {
    setEditingVideo(v);
    setEditTitle(v.title);
    setEditDesc(v.description);
    setEditVisibility(v.visibility);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVideo) {
      updateVideo(editingVideo.id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        visibility: editVisibility,
      });
      setEditingVideo(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      await deleteVideo(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Studio Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-[#FF2A38]" />
            <span>PaPip Creator Studio</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time analytics and management for {currentUser.name} ({currentUser.handle})
          </p>
        </div>

        <button
          onClick={() => onNavigate('upload')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF2A38] hover:bg-[#E51927] text-white text-xs font-bold shadow-md shadow-red-500/20 active:scale-95 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Video</span>
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Views */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Views</span>
            <Eye className="w-4 h-4 text-[#FF2A38]" />
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {totalViews.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-500 font-semibold">+12% this week</span>
        </div>

        {/* Total Likes */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Likes</span>
            <ThumbsUp className="w-4 h-4 text-[#FF2A38]" />
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {totalLikes.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-500 font-semibold">98.4% ratio</span>
        </div>

        {/* Subscribers */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Subscribers</span>
            <Users className="w-4 h-4 text-[#FF2A38]" />
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {currentUser.subscribersCount.toLocaleString()}
          </p>
          <span className="text-[10px] text-gray-400">Active audience</span>
        </div>

        {/* Published Videos */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Videos</span>
            <VideoIcon className="w-4 h-4 text-[#FF2A38]" />
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {ownedVideos.length}
          </p>
          <span className="text-[10px] text-gray-400">In channel</span>
        </div>

        {/* Storage Usage (IndexedDB MB) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Media Storage</span>
            <HardDrive className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-amber-500">
            {storageUsageMB} MB
          </p>
          <span className="text-[10px] text-gray-400">IndexedDB Blobs</span>
        </div>
      </div>

      {/* Video Management Section */}
      <div className="bg-white dark:bg-[#16181D] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
        {/* Table header bar with filters */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-sm text-gray-900 dark:text-white">
            Channel Content ({filteredOwned.length})
          </h2>

          <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#0D0E11] p-1 rounded-xl text-xs">
            {(['all', 'public', 'unlisted', 'private'] as const).map((vis) => (
              <button
                key={vis}
                onClick={() => setFilterVisibility(vis)}
                className={`px-3 py-1 rounded-lg capitalize font-bold transition-colors ${
                  filterVisibility === vis
                    ? 'bg-white dark:bg-[#252830] text-[#FF2A38] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {vis}
              </button>
            ))}
          </div>
        </div>

        {/* Video Table */}
        {filteredOwned.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-500 space-y-2">
            <p>No videos found matching this filter.</p>
            <button
              onClick={() => onNavigate('upload')}
              className="text-[#FF2A38] font-bold hover:underline"
            >
              Upload a new video
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-[#0D0E11] text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="py-3 px-4">Video</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4">Likes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredOwned.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    {/* Thumbnail + Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => onNavigate('watch', { id: v.id })}
                          className="relative w-24 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 cursor-pointer shadow-xs"
                        >
                          <img
                            src={v.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p
                            onClick={() => onNavigate('watch', { id: v.id })}
                            className="font-bold text-gray-900 dark:text-white truncate cursor-pointer hover:text-[#FF2A38]"
                          >
                            {v.title}
                          </p>
                          <span className="text-[11px] text-gray-400 block truncate">
                            {v.category} {v.isShort ? '• Short' : ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Visibility */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          v.visibility === 'public'
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : v.visibility === 'unlisted'
                            ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {v.visibility === 'public' ? (
                          <Globe className="w-3 h-3" />
                        ) : v.visibility === 'unlisted' ? (
                          <Link className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                        {v.visibility}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-gray-500">{v.createdAt}</td>

                    {/* Views */}
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      {v.views.toLocaleString()}
                    </td>

                    {/* Likes */}
                    <td className="py-3 px-4 text-gray-500">{v.likesCount}</td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onNavigate('watch', { id: v.id })}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          title="Watch Video"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#FF2A38]"
                          title="Edit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingId(v.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600"
                          title="Delete Video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-[#16181D] rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Edit Video Details</h3>
              <button
                onClick={() => setEditingVideo(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-[#FF2A38]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-[#FF2A38]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Visibility</label>
                <select
                  value={editVisibility}
                  onChange={(e: any) => setEditVisibility(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-[#FF2A38]"
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
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

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#16181D] rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Delete Video?</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                This will permanently remove the video and free up its binary storage from IndexedDB. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-md shadow-red-600/30"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
