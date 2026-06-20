import { useState, useRef } from "react";
import { Globe, ArrowLeft, ArrowRight, RefreshCw, Plus, AlertCircle } from "lucide-react";
import { api } from "../api";

export default function Browser() {
  const [url, setUrl] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");
  const [detectedVideos, setDetectedVideos] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigate = (e: React.FormEvent) => {
    e.preventDefault();
    let target = url.trim();
    if (!target) return;
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      target = "https://" + target;
    }
    setIframeUrl(target);
    setDetectedVideos([]);
  };

  const detectVideos = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;
      const doc = iframe.contentDocument;
      if (!doc) {
        setMessage("Cannot inspect this page (cross-origin restriction)");
        return;
      }
      const videos = doc.querySelectorAll("video");
      const sources: string[] = [];
      videos.forEach((v) => {
        if (v.src) sources.push(v.src);
        v.querySelectorAll("source").forEach((s) => {
          if (s.src) sources.push(s.src);
        });
      });
      const links = doc.querySelectorAll("a[href]");
      links.forEach((a) => {
        const href = (a as HTMLAnchorElement).href;
        if (href.match(/\.(mp4|webm|mkv|mov|m3u8)(\?|$)/i)) {
          sources.push(href);
        }
      });
      setDetectedVideos([...new Set(sources)]);
      if (sources.length === 0) setMessage("No videos detected on this page");
      else setMessage("");
    } catch {
      setMessage("Cannot inspect this page (cross-origin restriction)");
    }
  };

  const importVideo = async (videoUrl: string) => {
    setImporting(true);
    setMessage("");
    try {
      await api.createDownload(videoUrl);
      setMessage("Video added to library!");
      setDetectedVideos(detectedVideos.filter((v) => v !== videoUrl));
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setImporting(false);
    }
  };

  const goBack = () => {
    try { iframeRef.current?.contentWindow?.history.back(); } catch {}
  };
  const goForward = () => {
    try { iframeRef.current?.contentWindow?.history.forward(); } catch {}
  };
  const reload = () => {
    if (iframeRef.current) iframeRef.current.src = iframeUrl;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white mb-3">Browser</h1>
        <form onSubmit={navigate} className="flex gap-2">
          <button type="button" onClick={goBack} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button type="button" onClick={goForward} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400">
            <ArrowRight className="w-4 h-4" />
          </button>
          <button type="button" onClick={reload} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL or search..."
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <button type="submit" className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold">Go</button>
          <button type="button" onClick={detectVideos} className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm">
            Detect Videos
          </button>
        </form>
      </div>

      {message && (
        <div className="px-4 py-2 bg-blue-900/20 border-b border-blue-800/50 text-blue-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {message}
        </div>
      )}

      {detectedVideos.length > 0 && (
        <div className="px-4 py-3 bg-gray-900/50 border-b border-gray-800 space-y-2">
          <p className="text-xs text-gray-500 font-semibold uppercase">Detected Videos</p>
          {detectedVideos.map((v) => (
            <div key={v} className="flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-2">
              <span className="flex-1 text-sm text-gray-300 truncate">{v}</span>
              <button
                onClick={() => importVideo(v)}
                disabled={importing}
                className="flex items-center gap-1 bg-brand hover:bg-brand-dark text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                <Plus className="w-3 h-3" /> Add To Library
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 bg-white">
        {iframeUrl ? (
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            title="Browser"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-950">
            <div className="text-center">
              <Globe className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500">Enter a URL to start browsing</p>
              <p className="text-gray-600 text-sm mt-1">Detect videos and add them to your library</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
