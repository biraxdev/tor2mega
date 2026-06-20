import { useRef, useState, useEffect } from "react";
import { X, Maximize2, Play, Pause } from "lucide-react";
import type { Video } from "../api";
import { api } from "../api";

interface Props {
  video: Video;
  onClose: () => void;
}

export default function VideoPlayer({ video, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const streamUrl = api.getVideoStreamUrl(video.id);

  useEffect(() => {
    const saved = localStorage.getItem(`video-progress:${video.id}`);
    if (saved && videoRef.current) {
      videoRef.current.currentTime = parseFloat(saved);
    }
  }, [video.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        localStorage.setItem(`video-progress:${video.id}`, String(videoRef.current.currentTime));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [video.id]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const fullscreen = () => {
    videoRef.current?.requestFullscreen();
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={onClose}>
      <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white truncate">{video.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="relative bg-black rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            src={streamUrl}
            autoPlay
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            className="w-full max-h-[70vh]"
            onClick={togglePlay}
          />
        </div>
        <div className="bg-gray-900 rounded-b-xl p-3 flex items-center gap-3">
          <button onClick={togglePlay} className="p-2 hover:bg-gray-800 rounded-lg text-white">
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <span className="text-xs text-gray-400 w-16 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={seek}
            className="flex-1 accent-brand"
          />
          <span className="text-xs text-gray-400 w-16">{formatTime(duration)}</span>
          <select
            value={playbackRate}
            onChange={(e) => changeRate(parseFloat(e.target.value))}
            className="bg-gray-800 text-white text-xs rounded px-2 py-1 border border-gray-700"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
          <button onClick={fullscreen} className="p-2 hover:bg-gray-800 rounded-lg text-white">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
