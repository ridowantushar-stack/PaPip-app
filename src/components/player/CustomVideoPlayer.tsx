import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings as SettingsIcon,
  PictureInPicture2,
  Tv,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Video } from '../../types';

interface CustomVideoPlayerProps {
  video: Video;
  autoPlay?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  video,
  autoPlay = true,
  onEnded,
  onTimeUpdate,
  isTheaterMode = false,
  onToggleTheater,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Format time MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const sStr = s < 10 ? `0${s}` : `${s}`;
    if (h > 0) {
      const mStr = m < 10 ? `0${m}` : `${m}`;
      return `${h}:${mStr}:${sStr}`;
    }
    return `${m}:${sStr}`;
  };

  // Autoplay and src switch
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    setCurrentTime(0);

    if (!video.videoUrl) {
      setIsLoading(false);
      return;
    }

    if (videoRef.current) {
      try {
        videoRef.current.load();
        if (autoPlay) {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => setIsPlaying(true))
              .catch(() => {
                // Browser may block unmuted autoplay; fallback to muted
                if (videoRef.current) {
                  videoRef.current.muted = true;
                  setIsMuted(true);
                  videoRef.current
                    .play()
                    .then(() => setIsPlaying(true))
                    .catch(() => setIsPlaying(false));
                }
              });
          }
        }
      } catch (e) {
        console.warn('Video load notice:', e);
      }
    }
  }, [video.id, video.videoUrl, autoPlay]);

  // Video event listeners
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime;
      setCurrentTime(curr);
      onTimeUpdate?.(curr);

      // Buffered progress calculation
      if (videoRef.current.buffered.length > 0) {
        try {
          const buf = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
          setBufferedEnd(buf);
        } catch {}
      }
    }
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newRatio = clickX / rect.width;
    const newTime = newRatio * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const hoverX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = hoverX / rect.width;
    setHoverTime(ratio * duration);
    setHoverPosition(hoverX);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    videoRef.current.muted = nextMute;
    setIsMuted(nextMute);
    if (!nextMute && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const skipSeconds = (sec: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + sec, duration));
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const togglePictureInPicture = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not available', err);
    }
  };

  // Keyboard shortcut controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'j':
        case 'arrowleft':
          e.preventDefault();
          skipSeconds(-5);
          break;
        case 'l':
        case 'arrowright':
          e.preventDefault();
          skipSeconds(5);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume((v) => {
            const next = Math.min(1, v + 0.1);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume((v) => {
            const next = Math.max(0, v - 0.1);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  // Controls auto-hide
  const triggerControlsActivity = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 2800);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerControlsActivity}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative w-full aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl select-none group ${
        isTheaterMode ? 'max-h-[82vh]' : ''
      }`}
    >
      {/* HTML5 Native Video Element */}
      <video
        ref={videoRef}
        key={video.id + '_' + (video.videoUrl || 'none')}
        poster={video.thumbnailUrl}
        playsInline
        preload="auto"
        onClick={togglePlay}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
        onError={(e) => {
          console.warn('Video playback notice for', video.title, e);
          setHasError(true);
          setIsLoading(false);
        }}
        className="w-full h-full object-contain cursor-pointer"
      >
        {video.videoUrl && (
          <source
            src={video.videoUrl}
            type={video.videoUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4'}
          />
        )}
        Your browser does not support HTML5 video streaming.
      </video>

      {/* Loading Spinner */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-[#FF2A38] animate-spin" />
        </div>
      )}

      {/* Error Fallback Banner */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/85 text-white text-center">
          <AlertCircle className="w-12 h-12 text-[#FF2A38] mb-3" />
          <h3 className="text-base font-bold">Playback Error</h3>
          <p className="text-xs text-gray-300 max-w-sm mt-1">
            Unable to stream this video track. It may be processing or the source network was interrupted.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              videoRef.current?.load();
              videoRef.current?.play();
            }}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF2A38] hover:bg-[#E51927] text-white text-xs font-bold transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Stream
          </button>
        </div>
      )}

      {/* Centered Quick Play/Pause Flash Overlay */}
      {!isPlaying && !isLoading && !hasError && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30 backdrop-blur-xs transition-opacity"
        >
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#FF2A38] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all">
            <Play className="w-9 h-9 fill-white translate-x-1" />
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-10 pb-2 px-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Seek Bar / Progress Bar */}
        <div
          ref={progressBarRef}
          onClick={handleSeek}
          onMouseMove={handleProgressMouseMove}
          onMouseLeave={() => setHoverTime(null)}
          className="relative w-full h-1.5 hover:h-2.5 bg-white/20 rounded-full cursor-pointer transition-all mb-3 group/progress"
        >
          {/* Buffered track */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-white/40 rounded-full"
            style={{ width: `${bufferedPercent}%` }}
          />

          {/* Current playhead track */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-[#FF2A38] rounded-full"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Scrubber thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#FF2A38] ring-2 ring-white shadow-md scale-0 group-hover/progress:scale-100 transition-transform"
            style={{ left: `calc(${progressPercent}% - 7px)` }}
          />

          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-7 -translate-x-1/2 px-1.5 py-0.5 rounded-md bg-black/90 text-white text-[10px] font-mono pointer-events-none"
              style={{ left: `${hoverPosition}px` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Buttons Bar */}
        <div className="flex items-center justify-between text-white">
          {/* Left Buttons: Play, Skips, Volume, Time */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1 hover:text-[#FF2A38] transition-colors"
              title={isPlaying ? 'Pause (k)' : 'Play (k)'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              onClick={() => skipSeconds(-10)}
              className="p-1 hover:text-[#FF2A38] transition-colors hidden sm:block"
              title="Rewind 10s (j)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => skipSeconds(10)}
              className="p-1 hover:text-[#FF2A38] transition-colors hidden sm:block"
              title="Fast Forward 10s (l)"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/volume">
              <button
                onClick={toggleMute}
                className="p-1 hover:text-[#FF2A38] transition-colors"
                title={isMuted ? 'Unmute (m)' : 'Mute (m)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 sm:group-hover/volume:w-16 transition-all duration-200 accent-[#FF2A38] h-1.5 cursor-pointer"
                title="Volume"
              />
            </div>

            {/* Time readout */}
            <div className="text-xs font-mono font-medium text-gray-200 select-none pl-1">
              <span>{formatTime(currentTime)}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Buttons: Speed, Theater, PiP, Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Playback speed selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors"
                title="Playback Speed"
              >
                <SettingsIcon className="w-4 h-4" />
                <span>{playbackSpeed}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute right-0 bottom-8 w-28 bg-[#16181D]/95 backdrop-blur-md border border-gray-700 rounded-xl py-1 shadow-2xl z-50 text-xs">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`w-full text-left px-3 py-1.5 hover:bg-white/10 transition-colors ${
                        playbackSpeed === s ? 'text-[#FF2A38] font-bold' : 'text-gray-200'
                      }`}
                    >
                      {s === 1 ? '1x (Normal)' : `${s}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Picture in Picture */}
            <button
              onClick={togglePictureInPicture}
              className="p-1 hover:text-[#FF2A38] transition-colors hidden sm:block"
              title="Picture in Picture"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            {/* Theater Mode */}
            {onToggleTheater && (
              <button
                onClick={onToggleTheater}
                className="p-1 hover:text-[#FF2A38] transition-colors hidden sm:block"
                title={isTheaterMode ? 'Default View' : 'Theater Mode'}
              >
                <Tv className={`w-4 h-4 ${isTheaterMode ? 'text-[#FF2A38]' : ''}`} />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1 hover:text-[#FF2A38] transition-colors"
              title={isFullscreen ? 'Exit Fullscreen (f)' : 'Fullscreen (f)'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
