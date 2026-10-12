export type VideoCategory =
  | 'All'
  | 'Gaming'
  | 'Music'
  | 'Tech & Coding'
  | 'Animation'
  | 'Podcasts'
  | 'Short Films'
  | 'Education'
  | 'Nature & Travel'
  | 'Comedy';

export type VideoVisibility = 'public' | 'unlisted' | 'private';

export interface User {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatarUrl: string;
  bannerUrl: string;
  bio: string;
  joinedDate: string;
  subscribersCount: number;
  isVerified?: boolean;
}

export interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likesCount: number;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likesCount: number;
  replies?: CommentReply[];
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // Direct video source URL or blob URL
  thumbnailUrl: string;
  duration: number; // in seconds
  views: number;
  likesCount: number;
  dislikesCount: number;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  category: VideoCategory;
  tags: string[];
  visibility: VideoVisibility;
  isShort: boolean;
  createdAt: string;
  isUserUploaded?: boolean;
  blobStorageKey?: string; // If stored in browser IndexedDB
}

export interface NotificationItem {
  id: string;
  type: 'upload' | 'like' | 'comment' | 'subscriber' | 'system';
  title: string;
  message: string;
  link?: string;
  timestamp: string;
  read: boolean;
  thumbnail?: string;
  avatar?: string;
}

export interface ReportItem {
  id: string;
  targetType: 'video' | 'comment' | 'channel';
  targetId: string;
  reason: string;
  details?: string;
  reportedAt: string;
  status: 'pending' | 'reviewed';
}
