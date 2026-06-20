import { Link } from "react-router-dom";
import {
  Cloud, Download, Chrome, Globe as Firefox, Smartphone, Monitor,
  Check, ArrowLeft, Package, GitBranch, Smartphone as PhoneIcon,
} from "lucide-react";

export default function DownloadCenter() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 sticky top-0 bg-gray-950/90 backdrop-blur z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Cloud className="w-7 h-7 text-brand" />
            <span className="font-bold text-xl">TOR2MEGA</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <Link to="/login" className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2 rounded-lg">
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-3">Download Center</h1>
        <p className="text-gray-400 mb-12">Get TOR2MEGA on your preferred platform. One account, all devices.</p>

        {/* PWA Install */}
        <div className="bg-gradient-to-r from-brand/10 to-transparent border border-brand/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-brand/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Monitor className="w-6 h-6 text-brand-light" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">Install as PWA</h2>
              <p className="text-sm text-gray-400 mb-3">Install TOR2MEGA as a Progressive Web App on any device — Android, iOS, Windows, Mac, or Linux.</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {["Android", "iOS", "Windows", "macOS", "Linux"].map((p) => (
                  <span key={p} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{p}</span>
                ))}
              </div>
              <Link to="/login" className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2 rounded-lg">
                <Download className="w-4 h-4" /> Install PWA
              </Link>
              <p className="text-xs text-gray-500 mt-2">Open the dashboard in your browser and use "Add to Home Screen" or "Install App" from your browser menu.</p>
            </div>
          </div>
        </div>

        {/* Extensions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Tor Browser Extension */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Firefox className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Tor Browser Extension</h2>
                <p className="text-xs text-gray-500">Manifest V2 · Firefox-based</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Version</span>
                <span className="font-mono text-gray-300">1.5.0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Size</span>
                <span className="font-mono text-gray-300">~45 KB</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">License</span>
                <span className="font-mono text-gray-300">MIT</span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-gray-400 mb-2">Changelog v1.5.0</p>
              <ul className="space-y-1 text-xs text-gray-500">
                <li>• My Videos tab with search and grid view</li>
                <li>• Watch, Download, Rename, Delete actions</li>
                <li>• Context menu: Send to Mega</li>
                <li>• Destination selector</li>
                <li>• Badge notifications for queue</li>
              </ul>
            </div>
            <a href="#" className="block w-full text-center bg-brand hover:bg-brand-dark text-white font-semibold py-2.5 rounded-lg text-sm">
              Install for Tor Browser
            </a>
            <p className="text-xs text-gray-500 mt-2 text-center">Load via about:debugging → This Firefox → Load Temporary Add-on</p>
          </div>

          {/* Chrome Extension */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Chrome className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Chrome Extension</h2>
                <p className="text-xs text-gray-500">Manifest V3 · Chromium-based</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Version</span>
                <span className="font-mono text-gray-300">1.5.0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Size</span>
                <span className="font-mono text-gray-300">~45 KB</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">License</span>
                <span className="font-mono text-gray-300">MIT</span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-gray-400 mb-2">Changelog v1.5.0</p>
              <ul className="space-y-1 text-xs text-gray-500">
                <li>• My Videos tab with search and grid view</li>
                <li>• Watch, Download, Rename, Delete actions</li>
                <li>• Context menu: Send to Mega</li>
                <li>• Service worker (Manifest V3)</li>
                <li>• Badge notifications for queue</li>
              </ul>
            </div>
            <a href="#" className="block w-full text-center bg-brand hover:bg-brand-dark text-white font-semibold py-2.5 rounded-lg text-sm">
              Install for Chrome
            </a>
            <p className="text-xs text-gray-500 mt-2 text-center">Load via chrome://extensions → Developer mode → Load unpacked</p>
          </div>
        </div>

        {/* Android App */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-bold">Android App</h2>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">Expo / React Native</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">Browse your video library, watch videos, download new ones, and search — all from your Android device.</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">Current Version</p>
                  <p className="text-sm font-mono text-gray-300">1.5.0</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">Min Android</p>
                  <p className="text-sm font-mono text-gray-300">Android 8.0 (API 26)</p>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 mb-4">
                <p className="text-xs font-semibold text-gray-400 mb-2">Release Notes v1.5.0</p>
                <ul className="space-y-1 text-xs text-gray-500">
                  <li>• Videos library screen with 2-column grid</li>
                  <li>• Video player with playback speed control</li>
                  <li>• Search and pull-to-refresh</li>
                  <li>• Rename and delete videos</li>
                  <li>• Bottom tab navigation (Home, Add URL, Videos, Downloads)</li>
                </ul>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 mb-4">
                <p className="text-xs font-semibold text-gray-400 mb-2">Version History</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">v1.5.0</span>
                    <span className="text-gray-500">Video library + player + search</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">v1.0.0</span>
                    <span className="text-gray-500">Initial release: login, stats, downloads</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <a href="#" className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2.5 rounded-lg">
                  <Download className="w-4 h-4" /> Download APK
                </a>
                <a href="#" className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg">
                  <Package className="w-4 h-4" /> Play Store
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sync notice */}
        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 text-center">
          <h3 className="font-semibold mb-2">One Account. All Platforms.</h3>
          <p className="text-sm text-gray-400">Your video library, downloads, history, and settings sync automatically across all devices.</p>
          <div className="flex justify-center gap-6 mt-4">
            {[
              { icon: Monitor, label: "Web" },
              { icon: Firefox, label: "Tor" },
              { icon: Chrome, label: "Chrome" },
              { icon: Smartphone, label: "Android" },
              { icon: PhoneIcon, label: "PWA" },
            ].map((p) => (
              <div key={p.label} className="flex flex-col items-center gap-1">
                <p.icon className="w-5 h-5 text-gray-500" />
                <span className="text-xs text-gray-500">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
