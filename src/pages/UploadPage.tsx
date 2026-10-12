import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileVideo,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  HardDrive,
  Info,
  Play,
  ArrowRight,
  X,
} from 'lucide-react';
import { VideoCategory, VideoVisibility, Video } from '../types';
import { useVideos } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { captureVideoFrame } from '../services/storage';

interface UploadPageProps {
  onNavigate: (page: string, params?: any) => void;
}

const CATEGORIES: VideoCategory[] = [
  'Animation',
  'Tech & Coding',
  'Gaming',
  'Short Films',
  'Nature & Travel',
  'Podcasts',
  'Comedy',
  'Education',
];

export const UploadPage: React.FC<UploadPageProps> = ({ onNavigate }) => {
  const { uploadVideo } = useVideos();
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [customThumbFile, setCustomThumbFile] = useState<File | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<VideoCategory>('Animation');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['papip', 'creators']);
  const [visibility, setVisibility] = useState<VideoVisibility>('public');
  const [isShort, setIsShort] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [uploadedVideo, setUploadedVideo] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-[#FF2A38] flex items-center justify-center mx-auto">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sign In to Upload</h2>
        <p className="text-xs text-gray-500">
          You need a PaPip creator channel to upload, manage, and share original videos.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-full bg-[#FF2A38] text-white text-xs font-bold shadow-lg shadow-red-500/20 hover:bg-[#E51927]"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const handleFileSelect = async (selectedFile: File) => {
    setError(null);
    if (!selectedFile.type.startsWith('video/')) {
      setError('Please choose a valid video file (.mp4, .webm, or .mov).');
      return;
    }

    setFile(selectedFile);
    setTitle(selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));

    // Create preview
    const previewUrl = URL.createObjectURL(selectedFile);
    setVideoPreviewUrl(previewUrl);

    // Auto extract thumbnail from first second
    try {
      const extracted = await captureVideoFrame(selectedFile, 1.0);
      setThumbnailPreview(extracted.dataUrl);
      if (extracted.duration && extracted.duration <= 60) {
        setIsShort(true); // Auto-suggest short if under 60 seconds
      }
    } catch (e) {
      console.warn('Frame capture notice:', e);
    }
  };

  const handleCustomThumbSelect = (thumbFile: File) => {
    if (!thumbFile.type.startsWith('image/')) return;
    setCustomThumbFile(thumbFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string);
    };
    reader.readAsDataURL(thumbFile);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a video file.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a title for your video.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadStage('Reading video stream and validating frames...');

    try {
      const result = await uploadVideo({
        file,
        title,
        description,
        category,
        tags,
        visibility,
        isShort,
        customThumbnailUrl: thumbnailPreview || undefined,
        onProgress: (p) => {
          setUploadProgress(p);
          if (p < 50) setUploadStage('Buffering video track...');
          else if (p < 85) setUploadStage('Committing media blob to IndexedDB store...');
          else setUploadStage('Finalizing publishing metadata...');
        },
      });

      setUploadedVideo(result);
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Upload Video
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Post an original video to PaPip. Files are saved in high-capacity IndexedDB media store.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
          <HardDrive className="w-3.5 h-3.5 text-amber-500" />
          <span>Real Local Blob Storage</span>
        </div>
      </div>

      {/* Cloud Architecture Notice Banner */}
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#FF2A38] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-gray-900 dark:text-white">
            Storage Provider Architecture & Free Tier Guidelines
          </h4>
          <p className="leading-relaxed">
            In compliance with cloud database best practices, large video files are never packed inside Firestore document limits (1MB cap). PaPip uses native binary Blobs in IndexedDB for 100% offline & local capacity. For production cloud distribution, connect Google Cloud Storage / Firebase Storage (5 GB free tier, 1 GB/day bandwidth) or Cloudflare R2 via Settings.
          </p>
        </div>
      </div>

      {uploadedVideo ? (
        /* Success Screen */
        <div className="py-12 px-6 text-center space-y-5 bg-white dark:bg-[#16181D] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Video Published Successfully!
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              "{uploadedVideo.title}" is now available on PaPip under the {uploadedVideo.category} category.
            </p>
          </div>

          {/* Mini Card Preview */}
          <div className="max-w-sm mx-auto aspect-video rounded-2xl overflow-hidden relative shadow-lg bg-black">
            <img
              src={uploadedVideo.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Play className="w-10 h-10 text-white fill-white" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onNavigate('watch', { id: uploadedVideo.id })}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF2A38] hover:bg-[#E51927] text-white text-xs font-bold shadow-lg shadow-red-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Watch Video</span>
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold"
            >
              Creator Studio
            </button>
          </div>
        </div>
      ) : (
        /* Upload Form */
        <form onSubmit={handlePublish} className="space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Video Dropzone */}
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#FF2A38] dark:hover:border-[#FF2A38] rounded-3xl p-10 text-center cursor-pointer transition-all bg-gray-50/50 dark:bg-[#121418] group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-[#FF2A38] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-gray-900 dark:text-white">
                Drag and drop video files to upload
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Supports MP4, WebM, MOV. Up to 500 MB stored locally in IndexedDB.
              </p>
              <button
                type="button"
                className="mt-4 px-5 py-2 rounded-full bg-[#FF2A38] text-white text-xs font-bold shadow-md shadow-red-500/20"
              >
                Select File
              </button>
            </div>
          ) : (
            /* Selected File Summary + Live Preview */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 rounded-3xl bg-gray-50 dark:bg-[#16181D] border border-gray-200 dark:border-gray-800">
              <div className="md:col-span-1 aspect-video rounded-2xl overflow-hidden bg-black shadow-md">
                {videoPreviewUrl && (
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <div className="md:col-span-2 flex flex-col justify-center space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-white truncate max-w-xs">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setVideoPreviewUrl(null);
                      setThumbnailPreview(null);
                    }}
                    className="text-red-500 hover:underline font-semibold"
                  >
                    Change File
                  </button>
                </div>
                <p className="text-gray-500">
                  Size: {(file.size / (1024 * 1024)).toFixed(2)} MB • Type: {file.type || 'video/mp4'}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                    Validated & Ready
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Metadata Section */}
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                Title (Required)
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your video a catchy title..."
                className="w-full p-3 text-xs bg-gray-50 dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-[#FF2A38] text-gray-900 dark:text-gray-100"
              />
              <div className="text-right text-[10px] text-gray-400">
                {title.length} / 100
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers what happens in your video, add credits, and links..."
                className="w-full p-3 text-xs bg-gray-50 dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-[#FF2A38] text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Thumbnail Generator / Custom Thumbnail */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                Thumbnail
              </label>
              <p className="text-[11px] text-gray-500">
                Set a thumbnail that stands out. Automatically captured from frame 1s or upload a custom image.
              </p>
              <div className="flex items-center gap-4 pt-1">
                {thumbnailPreview && (
                  <div className="w-36 aspect-video rounded-xl overflow-hidden bg-black border border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleCustomThumbSelect(e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => thumbInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:border-[#FF2A38] text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <span>Upload Custom Image</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Grid of Settings: Category, Visibility, IsShort */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Category */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full p-2.5 text-xs bg-gray-50 dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-[#FF2A38] text-gray-900 dark:text-gray-100"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visibility */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e: any) => setVisibility(e.target.value)}
                  className="w-full p-2.5 text-xs bg-gray-50 dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-[#FF2A38] text-gray-900 dark:text-gray-100"
                >
                  <option value="public">Public (Everyone)</option>
                  <option value="unlisted">Unlisted (Anyone with link)</option>
                  <option value="private">Private (Only you)</option>
                </select>
              </div>

              {/* Short toggle */}
              <div className="space-y-1 flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isShort}
                    onChange={(e) => setIsShort(e.target.checked)}
                    className="rounded text-[#FF2A38] focus:ring-[#FF2A38]"
                  />
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Publish as PaPip Short (Vertical 9:16)
                  </span>
                </label>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                Tags
              </label>
              <div className="flex items-center gap-2 flex-wrap p-2 bg-gray-50 dark:bg-[#16181D] border border-gray-200 dark:border-gray-800 rounded-xl min-h-[42px]">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-[#FF2A38] text-[11px] font-bold"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type tag & press enter..."
                  className="flex-1 bg-transparent text-xs focus:outline-none min-w-[120px] text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Progress Bar (during upload) */}
          {isUploading && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
                <span>{uploadStage}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C91420] to-[#FF3B48] transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUploading || !file}
              className="flex items-center gap-2 px-7 py-2.5 rounded-full bg-gradient-to-tr from-[#C91420] to-[#FF3B48] hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all"
            >
              <span>{isUploading ? 'Publishing Video...' : 'Publish to PaPip'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
