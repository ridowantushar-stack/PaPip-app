import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Flag,
  Download,
  Bell,
  CheckCircle2,
  CornerDownRight,
  Trash2,
  Send,
  Sparkles,
  HardDrive,
  MessageSquare,
} from 'lucide-react';
import { Video, Comment } from '../types';
import { useVideos } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { CustomVideoPlayer } from '../components/player/CustomVideoPlayer';
import { ShareModal } from '../components/common/ShareModal';
import { ReportModal } from '../components/common/ReportModal';

interface WatchPageProps {
  videoId: string;
  onSelectVideo: (video: Video) => void;
  onOpenCreator: (creatorId: string) => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({
  videoId,
  onSelectVideo,
  onOpenCreator,
}) => {
  const {
    videos,
    recordView,
    toggleLike,
    toggleDislike,
    userReactions,
    getVideoComments,
    addComment,
    addReply,
    likeComment,
    deleteComment,
    toggleSubscribe,
    isSubscribed,
  } = useVideos();

  const { currentUser, isAuthenticated, openAuthModal } = useAuth();

  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sortComments, setSortComments] = useState<'top' | 'newest'>('top');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);

  const video = videos.find((v) => v.id === videoId);

  // Trigger view increment once per video mount
  useEffect(() => {
    if (videoId) {
      recordView(videoId);
      window.scrollTo(0, 0);
    }
  }, [videoId]);

  if (!video) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Video not found</h2>
        <p className="text-xs text-gray-500">This video may have been removed or set to private.</p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 rounded-xl bg-[#FF2A38] text-white text-xs font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const rawComments = getVideoComments(video.id);
  const comments = [...rawComments].sort((a, b) => {
    if (sortComments === 'top') return b.likesCount - a.likesCount;
    return 0;
  });

  const isLiked = userReactions[video.id] === 'like';
  const isDisliked = userReactions[video.id] === 'dislike';
  const isSubbed = isSubscribed(video.creatorId);

  // Related videos (exclude current video)
  const relatedVideos = videos
    .filter((v) => v.id !== video.id && !v.isShort && v.visibility === 'public')
    .slice(0, 10);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (commentText.trim()) {
      addComment(video.id, commentText);
      setCommentText('');
    }
  };

  const handlePostReply = (commentId: string) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (replyText.trim()) {
      addReply(video.id, commentId, replyText);
      setReplyText('');
      setReplyingCommentId(null);
    }
  };

  return (
    <div className={`space-y-6 pb-16 ${isTheaterMode ? 'max-w-none' : ''}`}>
      {/* Theater or Regular Main Grid */}
      <div className={`grid grid-cols-1 ${isTheaterMode ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6`}>
        {/* Left / Player Column */}
        <div className={isTheaterMode ? 'w-full' : 'lg:col-span-2 space-y-4'}>
          {/* Custom Video Player */}
          <CustomVideoPlayer
            video={video}
            autoPlay={true}
            isTheaterMode={isTheaterMode}
            onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
            onTimeUpdate={(t) => setCurrentPlayTime(t)}
          />

          {/* Video Metadata Header */}
          <div className="space-y-3 pt-2">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
              {video.title}
            </h1>

            {/* Channel Bar & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-gray-100 dark:border-gray-800">
              {/* Creator Info */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenCreator(video.creatorId)}
                  className="flex-shrink-0 focus:outline-none"
                >
                  <img
                    src={video.creatorAvatar}
                    alt={video.creatorName}
                    className="w-11 h-11 rounded-full object-cover border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-[#FF2A38] transition-all"
                  />
                </button>

                <div className="flex flex-col">
                  <button
                    onClick={() => onOpenCreator(video.creatorId)}
                    className="flex items-center gap-1 font-bold text-sm text-gray-900 dark:text-white hover:text-[#FF2A38] transition-colors text-left"
                  >
                    <span>{video.creatorName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-gray-400 fill-gray-400 dark:fill-gray-600" />
                  </button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {video.creatorHandle}
                  </span>
                </div>

                {/* Subscribe Button */}
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      openAuthModal('login');
                    } else {
                      toggleSubscribe(video.creatorId);
                    }
                  }}
                  className={`ml-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
                    isSubbed
                      ? 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700'
                      : 'bg-[#FF2A38] hover:bg-[#E51927] text-white hover:shadow-red-500/20 active:scale-95'
                  }`}
                >
                  {isSubbed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>

              {/* Action Buttons: Like/Dislike, Share, Report, Download */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Like / Dislike Segment */}
                <div className="flex items-center bg-gray-100 dark:bg-[#16181D] rounded-full p-1 border border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => {
                      if (!isAuthenticated) openAuthModal('login');
                      else toggleLike(video.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      isLiked
                        ? 'text-[#FF2A38] bg-red-50 dark:bg-red-950/40'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                    title="Like video"
                  >
                    <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-[#FF2A38]' : ''}`} />
                    <span>{video.likesCount}</span>
                  </button>
                  <div className="w-[1px] h-4 bg-gray-300 dark:bg-gray-700 mx-1" />
                  <button
                    onClick={() => {
                      if (!isAuthenticated) openAuthModal('login');
                      else toggleDislike(video.id);
                    }}
                    className={`p-1.5 rounded-full text-xs font-bold transition-colors ${
                      isDisliked
                        ? 'text-[#FF2A38] bg-red-50 dark:bg-red-950/40'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                    title="Dislike video"
                  >
                    <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-[#FF2A38]' : ''}`} />
                  </button>
                </div>

                {/* Share */}
                <button
                  onClick={() => setIsShareOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-100 dark:bg-[#16181D] hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>

                {/* Download Direct Video */}
                <a
                  href={video.videoUrl}
                  download={`${video.title.replace(/\s+/g, '_')}.mp4`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-100 dark:bg-[#16181D] hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                  title="Download MP4 stream"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>

                {/* Report */}
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-[#16181D] hover:bg-red-50 dark:hover:bg-red-950/30 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-red-600 transition-colors"
                  title="Report Video"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Description Card */}
            <div className="p-4 bg-gray-100/80 dark:bg-[#16181D]/80 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-gray-200 flex-wrap">
                <span>{video.views.toLocaleString()} views</span>
                <span>•</span>
                <span>{video.createdAt}</span>
                <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                  {video.category}
                </span>

                {video.isUserUploaded ? (
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <HardDrive className="w-3 h-3" />
                    IndexedDB Stored Blob
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[#FF2A38] font-semibold">
                    <Sparkles className="w-3 h-3" />
                    Demo Public Stream
                  </span>
                )}
              </div>

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {video.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[#FF2A38] font-semibold hover:underline cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Description Content with toggle */}
              <p
                className={`whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed ${
                  !isDescExpanded ? 'line-clamp-2' : ''
                }`}
              >
                {video.description}
              </p>

              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="font-bold text-gray-900 dark:text-white hover:underline mt-1"
              >
                {isDescExpanded ? 'Show less' : '...Show more'}
              </button>
            </div>

            {/* Comments Section */}
            <div className="pt-4 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#FF2A38]" />
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    {comments.length} Comments
                  </h3>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <span className="text-gray-500">Sort by:</span>
                  <select
                    value={sortComments}
                    onChange={(e: any) => setSortComments(e.target.value)}
                    className="bg-transparent font-bold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
                  >
                    <option value="top">Top Comments</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handlePostComment} className="flex items-start gap-3">
                <img
                  src={
                    currentUser?.avatarUrl ||
                    'https://api.dicebear.com/7.x/identicon/svg?seed=guest'
                  }
                  alt=""
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 space-y-2">
                  <textarea
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={
                      isAuthenticated
                        ? 'Add a public comment to this video...'
                        : 'Sign in to join the conversation...'
                    }
                    className="w-full p-3 text-xs rounded-xl bg-gray-100 dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-[#FF2A38] text-gray-900 dark:text-gray-100"
                  />
                  <div className="flex justify-end gap-2">
                    {commentText && (
                      <button
                        type="button"
                        onClick={() => setCommentText('')}
                        className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-white"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FF2A38] hover:bg-[#E51927] disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Comment</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4 pt-2">
                {comments.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No comments yet. Be the first to start the discussion!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3 text-xs group">
                      <img
                        src={comment.userAvatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {comment.userName}
                          </span>
                          <span className="text-[11px] text-gray-400">{comment.userHandle}</span>
                          <span className="text-[10px] text-gray-400">• {comment.createdAt}</span>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {comment.content}
                        </p>

                        {/* Comment Actions */}
                        <div className="flex items-center gap-3 pt-1 text-gray-500">
                          <button
                            onClick={() => likeComment(video.id, comment.id)}
                            className="flex items-center gap-1 hover:text-[#FF2A38] transition-colors"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{comment.likesCount > 0 ? comment.likesCount : ''}</span>
                          </button>

                          <button
                            onClick={() =>
                              setReplyingCommentId(
                                replyingCommentId === comment.id ? null : comment.id
                              )
                            }
                            className="hover:text-gray-900 dark:hover:text-white font-semibold"
                          >
                            Reply
                          </button>

                          {currentUser && currentUser.id === comment.userId && (
                            <button
                              onClick={() => deleteComment(video.id, comment.id)}
                              className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Reply Form if open */}
                        {replyingCommentId === comment.id && (
                          <div className="flex items-center gap-2 pt-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Reply to ${comment.userName}...`}
                              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-gray-100 dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-[#FF2A38]"
                              autoFocus
                            />
                            <button
                              onClick={() => handlePostReply(comment.id)}
                              disabled={!replyText.trim()}
                              className="px-3 py-1.5 rounded-xl bg-[#FF2A38] text-white text-xs font-bold disabled:opacity-40"
                            >
                              Reply
                            </button>
                          </div>
                        )}

                        {/* Replies Thread */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 pl-3 border-l-2 border-gray-200 dark:border-gray-800 space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2 pt-1">
                                <CornerDownRight className="w-3.5 h-3.5 text-gray-400 mt-1 flex-shrink-0" />
                                <img
                                  src={reply.userAvatar}
                                  alt=""
                                  className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-gray-900 dark:text-white">
                                      {reply.userName}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {reply.createdAt}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300">
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right / Up Next Column */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
            Related & Up Next
          </h3>

          <div className="space-y-3">
            {relatedVideos.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectVideo(item)}
                className="flex gap-3 group cursor-pointer"
              >
                {/* Mini Thumbnail */}
                <div className="relative w-40 aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <span className="absolute bottom-1 right-1 px-1 py-0.5 text-[10px] font-semibold text-white bg-black/80 rounded">
                    {Math.floor(item.duration / 60)}:
                    {(item.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#FF2A38] line-clamp-2 leading-tight transition-colors">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {item.creatorName}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {item.views > 1000 ? `${(item.views / 1000).toFixed(1)}k` : item.views} views • {item.createdAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        video={video}
        currentTime={currentPlayTime}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Report Modal */}
      <ReportModal
        video={video}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};
