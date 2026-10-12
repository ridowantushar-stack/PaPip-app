import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Video, Comment, NotificationItem, ReportItem, VideoCategory, VideoVisibility } from '../types';
import { INITIAL_VIDEOS, INITIAL_COMMENTS, INITIAL_NOTIFICATIONS } from '../data/initialData';
import { mediaStorage, captureVideoFrame } from '../services/storage';
import { useAuth } from './AuthContext';

interface UploadVideoParams {
  file: File;
  title: string;
  description: string;
  category: VideoCategory;
  tags: string[];
  visibility: VideoVisibility;
  isShort: boolean;
  customThumbnailUrl?: string;
  onProgress?: (percent: number) => void;
}

interface VideoContextType {
  videos: Video[];
  comments: Record<string, Comment[]>;
  notifications: NotificationItem[];
  reports: ReportItem[];
  subscriptions: string[]; // creator IDs
  userReactions: Record<string, 'like' | 'dislike'>; // videoId -> reaction
  watchHistory: string[]; // video IDs

  // Actions
  uploadVideo: (params: UploadVideoParams) => Promise<Video>;
  updateVideo: (videoId: string, updates: Partial<Video>) => void;
  deleteVideo: (videoId: string) => Promise<void>;
  recordView: (videoId: string) => void;
  toggleLike: (videoId: string) => void;
  toggleDislike: (videoId: string) => void;

  // Comments
  getVideoComments: (videoId: string) => Comment[];
  addComment: (videoId: string, content: string) => void;
  addReply: (videoId: string, commentId: string, content: string) => void;
  likeComment: (videoId: string, commentId: string) => void;
  deleteComment: (videoId: string, commentId: string) => void;

  // Subscriptions
  toggleSubscribe: (creatorId: string) => void;
  isSubscribed: (creatorId: string) => boolean;

  // Notifications & Reports
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  submitReport: (report: Omit<ReportItem, 'id' | 'reportedAt' | 'status'>) => void;

  // Hydration state
  isStorageReady: boolean;
  storageUsageMB: number;
  refreshStorageStats: () => Promise<void>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

const VIDEOS_STORAGE_KEY = 'papip_videos_meta_v1';
const COMMENTS_STORAGE_KEY = 'papip_comments_v1';
const NOTIFS_STORAGE_KEY = 'papip_notifs_v1';
const SUBS_STORAGE_KEY = 'papip_subs_v1';
const REACTIONS_STORAGE_KEY = 'papip_reactions_v1';
const HISTORY_STORAGE_KEY = 'papip_history_v1';

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [videos, setVideos] = useState<Video[]>(() => {
    try {
      const stored = localStorage.getItem(VIDEOS_STORAGE_KEY);
      if (stored) {
        const parsed: Video[] = JSON.parse(stored);
        // Replace any stale 403 commondatastorage URLs with fresh verified URLs
        const migrated = parsed.map((item) => {
          if (!item.isUserUploaded) {
            const fresh = INITIAL_VIDEOS.find((iv) => iv.id === item.id);
            if (fresh) {
              return { ...item, videoUrl: fresh.videoUrl, duration: fresh.duration };
            }
          }
          if (item.videoUrl && item.videoUrl.includes('commondatastorage.googleapis.com')) {
            const fresh = INITIAL_VIDEOS.find((iv) => iv.id === item.id) || INITIAL_VIDEOS[0];
            return { ...item, videoUrl: fresh.videoUrl };
          }
          return item;
        });
        return migrated;
      }
    } catch {}
    return INITIAL_VIDEOS;
  });

  const [comments, setComments] = useState<Record<string, Comment[]>>(() => {
    try {
      const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    const initialMap: Record<string, Comment[]> = {};
    INITIAL_COMMENTS.forEach((c) => {
      if (!initialMap[c.videoId]) initialMap[c.videoId] = [];
      initialMap[c.videoId].push(c);
    });
    return initialMap;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem(NOTIFS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  const [subscriptions, setSubscriptions] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SUBS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return ['user_alex', 'user_blender']; // Default subscribed to high quality creators
  });

  const [userReactions, setUserReactions] = useState<Record<string, 'like' | 'dislike'>>(() => {
    try {
      const stored = localStorage.getItem(REACTIONS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { vid_1: 'like' };
  });

  const [watchHistory, setWatchHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return ['vid_1', 'vid_2'];
  });

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [storageUsageMB, setStorageUsageMB] = useState(0);

  // Hydrate blob URLs for user-uploaded videos from IndexedDB
  useEffect(() => {
    let isMounted = true;
    const hydrateBlobs = async () => {
      try {
        const usage = await mediaStorage.getStorageUsageMB();
        if (isMounted) setStorageUsageMB(usage);

        // Check any user uploaded video that needs an active blob URL
        const updatedVideos = await Promise.all(
          videos.map(async (v) => {
            if (v.isUserUploaded && v.blobStorageKey) {
              const liveUrl = await mediaStorage.getVideoBlobUrl(v.blobStorageKey);
              if (liveUrl) {
                return { ...v, videoUrl: liveUrl };
              }
            }
            return v;
          })
        );

        if (isMounted) {
          setVideos(updatedVideos);
          setIsStorageReady(true);
        }
      } catch (err) {
        console.warn('Hydration warning:', err);
        if (isMounted) setIsStorageReady(true);
      }
    };

    hydrateBlobs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    // Strip temporary object URLs before saving metadata so keys remain clean
    const serializableVideos = videos.map((v) => ({
      ...v,
      videoUrl: v.blobStorageKey ? '' : v.videoUrl, // Keep empty in json if blobStorageKey is present
    }));
    localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(serializableVideos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(SUBS_STORAGE_KEY, JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(userReactions));
  }, [userReactions]);

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(watchHistory));
  }, [watchHistory]);

  const refreshStorageStats = useCallback(async () => {
    const usage = await mediaStorage.getStorageUsageMB();
    setStorageUsageMB(usage);
  }, []);

  // Upload Real Video
  const uploadVideo = async ({
    file,
    title,
    description,
    category,
    tags,
    visibility,
    isShort,
    customThumbnailUrl,
    onProgress,
  }: UploadVideoParams): Promise<Video> => {
    if (!currentUser) {
      throw new Error('You must be signed in to upload a video.');
    }

    const videoId = `vid_upload_${Date.now()}`;
    const blobKey = `blob_${videoId}`;

    // Simulate progress ticks
    if (onProgress) {
      onProgress(15);
      await new Promise((r) => setTimeout(r, 200));
      onProgress(45);
    }

    // Capture thumbnail from first second of the video if no custom thumb provided
    let thumbUrl = customThumbnailUrl;
    let durationSec = 15;

    try {
      const extracted = await captureVideoFrame(file, 1.0);
      durationSec = extracted.duration || 15;
      if (!thumbUrl) {
        thumbUrl = extracted.dataUrl;
        await mediaStorage.saveThumbnail(videoId, extracted.dataUrl);
      }
    } catch (e) {
      console.warn('Canvas frame extraction fallback:', e);
      if (!thumbUrl) {
        thumbUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
      }
    }

    if (onProgress) {
      onProgress(75);
    }

    // Save actual video blob to IndexedDB
    await mediaStorage.saveVideoBlob(blobKey, file, file.type);

    if (onProgress) {
      onProgress(100);
    }

    // Create live ObjectURL for immediate playback
    const blobPlayUrl = URL.createObjectURL(file);

    const newVideo: Video = {
      id: videoId,
      title: title.trim(),
      description: description.trim(),
      videoUrl: blobPlayUrl,
      thumbnailUrl: thumbUrl,
      duration: durationSec,
      views: 0,
      likesCount: 0,
      dislikesCount: 0,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorHandle: currentUser.handle,
      creatorAvatar: currentUser.avatarUrl,
      category,
      tags,
      visibility,
      isShort,
      createdAt: 'Just now',
      isUserUploaded: true,
      blobStorageKey: blobKey,
    };

    setVideos((prev) => [newVideo, ...prev]);

    // Send notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      type: 'system',
      title: 'Video Upload Complete',
      message: `"${title}" has been successfully processed and published as ${visibility}.`,
      link: videoId,
      timestamp: 'Just now',
      read: false,
      thumbnail: thumbUrl,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    await refreshStorageStats();
    return newVideo;
  };

  const updateVideo = (videoId: string, updates: Partial<Video>) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, ...updates } : v))
    );
  };

  const deleteVideo = async (videoId: string) => {
    const video = videos.find((v) => v.id === videoId);
    if (video?.blobStorageKey) {
      await mediaStorage.deleteVideoBlob(video.blobStorageKey);
    }
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
    await refreshStorageStats();
  };

  const recordView = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, views: v.views + 1 } : v))
    );
    setWatchHistory((prev) => {
      const filtered = prev.filter((id) => id !== videoId);
      return [videoId, ...filtered].slice(0, 50);
    });
  };

  const toggleLike = (videoId: string) => {
    const current = userReactions[videoId];
    setUserReactions((prev) => {
      const next = { ...prev };
      if (current === 'like') {
        delete next[videoId];
      } else {
        next[videoId] = 'like';
      }
      return next;
    });

    setVideos((prev) =>
      prev.map((v) => {
        if (v.id !== videoId) return v;
        if (current === 'like') {
          return { ...v, likesCount: Math.max(0, v.likesCount - 1) };
        } else if (current === 'dislike') {
          return {
            ...v,
            likesCount: v.likesCount + 1,
            dislikesCount: Math.max(0, v.dislikesCount - 1),
          };
        } else {
          return { ...v, likesCount: v.likesCount + 1 };
        }
      })
    );
  };

  const toggleDislike = (videoId: string) => {
    const current = userReactions[videoId];
    setUserReactions((prev) => {
      const next = { ...prev };
      if (current === 'dislike') {
        delete next[videoId];
      } else {
        next[videoId] = 'dislike';
      }
      return next;
    });

    setVideos((prev) =>
      prev.map((v) => {
        if (v.id !== videoId) return v;
        if (current === 'dislike') {
          return { ...v, dislikesCount: Math.max(0, v.dislikesCount - 1) };
        } else if (current === 'like') {
          return {
            ...v,
            dislikesCount: v.dislikesCount + 1,
            likesCount: Math.max(0, v.likesCount - 1),
          };
        } else {
          return { ...v, dislikesCount: v.dislikesCount + 1 };
        }
      })
    );
  };

  // Comments
  const getVideoComments = (videoId: string): Comment[] => {
    return comments[videoId] || [];
  };

  const addComment = (videoId: string, content: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      videoId,
      userId: currentUser.id,
      userName: currentUser.name,
      userHandle: currentUser.handle,
      userAvatar: currentUser.avatarUrl,
      content: content.trim(),
      createdAt: 'Just now',
      likesCount: 0,
      replies: [],
    };

    setComments((prev) => ({
      ...prev,
      [videoId]: [newComment, ...(prev[videoId] || [])],
    }));
  };

  const addReply = (videoId: string, commentId: string, content: string) => {
    if (!currentUser) return;
    setComments((prev) => {
      const list = prev[videoId] || [];
      const updated = list.map((c) => {
        if (c.id === commentId) {
          const replies = c.replies || [];
          return {
            ...c,
            replies: [
              ...replies,
              {
                id: `rep_${Date.now()}`,
                commentId,
                userId: currentUser.id,
                userName: currentUser.name,
                userHandle: currentUser.handle,
                userAvatar: currentUser.avatarUrl,
                content: content.trim(),
                createdAt: 'Just now',
                likesCount: 0,
              },
            ],
          };
        }
        return c;
      });
      return { ...prev, [videoId]: updated };
    });
  };

  const likeComment = (videoId: string, commentId: string) => {
    setComments((prev) => {
      const list = prev[videoId] || [];
      const updated = list.map((c) =>
        c.id === commentId ? { ...c, likesCount: c.likesCount + 1 } : c
      );
      return { ...prev, [videoId]: updated };
    });
  };

  const deleteComment = (videoId: string, commentId: string) => {
    setComments((prev) => ({
      ...prev,
      [videoId]: (prev[videoId] || []).filter((c) => c.id !== commentId),
    }));
  };

  // Subscriptions
  const toggleSubscribe = (creatorId: string) => {
    setSubscriptions((prev) => {
      const isSub = prev.includes(creatorId);
      if (isSub) {
        return prev.filter((id) => id !== creatorId);
      } else {
        return [...prev, creatorId];
      }
    });
  };

  const isSubscribed = (creatorId: string): boolean => {
    return subscriptions.includes(creatorId);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Reports
  const submitReport = (report: Omit<ReportItem, 'id' | 'reportedAt' | 'status'>) => {
    const newReport: ReportItem = {
      ...report,
      id: `rep_${Date.now()}`,
      reportedAt: new Date().toISOString(),
      status: 'pending',
    };
    setReports((prev) => [newReport, ...prev]);
  };

  return (
    <VideoContext.Provider
      value={{
        videos,
        comments,
        notifications,
        reports,
        subscriptions,
        userReactions,
        watchHistory,
        uploadVideo,
        updateVideo,
        deleteVideo,
        recordView,
        toggleLike,
        toggleDislike,
        getVideoComments,
        addComment,
        addReply,
        likeComment,
        deleteComment,
        toggleSubscribe,
        isSubscribed,
        markNotificationRead,
        markAllNotificationsRead,
        submitReport,
        isStorageReady,
        storageUsageMB,
        refreshStorageStats,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideos = () => {
  const context = useContext(VideoContext);
  if (!context) throw new Error('useVideos must be used within VideoProvider');
  return context;
};
