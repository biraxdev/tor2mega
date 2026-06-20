import { Link } from "react-router-dom";
import {
  Cloud, Film, Globe, Download, Smartphone, Shield, Zap, Search,
  Play, Chrome, Globe as Globe2, Monitor, Check, ArrowRight, Star, Menu, X,
} from "lucide-react";
import { useState } from "react";

export default function Landing() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Cloud className="w-7 h-7 text-brand" />
            <span className="font-bold text-xl">TOR2MEGA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white">Features</a>
            <a href="#library" className="text-sm text-gray-400 hover:text-white">Video Library</a>
            <a href="#platforms" className="text-sm text-gray-400 hover:text-white">Platforms</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white">Pricing</a>
            <a href="#faq" className="text-sm text-gray-400 hover:text-white">FAQ</a>
            <Link to="/downloads" className="text-sm text-gray-400 hover:text-white">Downloads</Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-300 hover:text-white">Login</Link>
            <Link to="/login" className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2 rounded-lg">
              Start Free
            </Link>
          </div>
          <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800 px-6 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-400">Features</a>
            <a href="#library" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-400">Video Library</a>
            <a href="#platforms" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-400">Platforms</a>
            <a href="#pricing" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-400">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-400">FAQ</a>
            <Link to="/downloads" className="block text-sm text-gray-400">Downloads</Link>
            <Link to="/login" className="block bg-brand text-white text-center font-semibold py-2 rounded-lg">Start Free</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/30 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-4 h-4 text-brand-light" />
            <span className="text-sm text-brand-light">Personal Video Cloud — V1.5</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Your Personal<br />
            <span className="bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent">Video Cloud</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Send videos from anywhere, store them in the cloud, and stream them on any device.
            Mega-powered storage, invisible to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-3.5 rounded-xl text-lg flex items-center justify-center gap-2">
              Start Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/downloads" className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3.5 rounded-xl text-lg flex items-center justify-center gap-2">
              <Download className="w-5 h-5" /> Get Apps
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">No credit card required · Free plan includes 50 downloads</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Everything you need to manage your videos</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">One platform, all your videos. Download, store, search, and stream from anywhere.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Film, title: "Video Library", desc: "All your videos indexed with metadata, thumbnails, and duration. Search and filter instantly." },
              { icon: Globe, title: "Built-in Browser", desc: "Browse any site, detect videos automatically, and add them to your library in one click." },
              { icon: Download, title: "Auto-Download", desc: "Send videos from Tor Browser, Chrome, or the web dashboard. yt-dlp powered extraction." },
              { icon: Play, title: "Stream Anywhere", desc: "Watch your videos directly from the cloud. No download needed. Proxy streaming on all devices." },
              { icon: Shield, title: "Private Storage", desc: "Mega-powered backend storage with end-to-end encryption. Your videos, your cloud." },
              { icon: Zap, title: "Lightning Fast", desc: "Background workers process downloads and uploads in parallel. Redis-powered queue system." },
            ].map((f) => (
              <div key={f.title} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-brand-light" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Library Showcase */}
      <section id="library" className="py-20 px-6 bg-gradient-to-b from-gray-900/50 to-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Your Video Library, Indexed</h2>
              <p className="text-gray-400 mb-6">Every video you send is automatically indexed with title, thumbnail, duration, and file size. Search across your entire collection instantly.</p>
              <ul className="space-y-3">
                {["Automatic thumbnail extraction", "Full-text search by title or URL", "Filter by status, sort by date/size/duration", "Rename, delete, and organize", "Stream directly from the cloud"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="inline-flex items-center gap-2 mt-6 text-brand-light hover:text-white font-semibold">
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <div className="grid grid-cols-3 gap-3">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="aspect-video bg-gradient-to-br from-gray-800 to-gray-850 rounded-lg flex items-center justify-center group cursor-pointer">
                    <Play className="w-6 h-6 text-gray-600 group-hover:text-brand-light transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browser Integration */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="bg-gray-800 rounded-lg p-3 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">https://video-site.com/watch/123</span>
              </div>
              <div className="space-y-2">
                <div className="bg-brand/10 border border-brand/30 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm text-gray-300">video_123.mp4 — 480p</span>
                  <button className="text-xs bg-brand text-white px-3 py-1 rounded">Add to Library</button>
                </div>
                <div className="bg-brand/10 border border-brand/30 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm text-gray-300">video_123_hd.mp4 — 1080p</span>
                  <button className="text-xs bg-brand text-white px-3 py-1 rounded">Add to Library</button>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-4">Browser Integration</h2>
              <p className="text-gray-400 mb-6">Right-click any video on any website and send it to your cloud. Or use the built-in browser to detect videos automatically.</p>
              <ul className="space-y-3">
                {["Context menu integration (Tor + Chrome)", "Built-in browser with auto video detection", "One-click import to your library", "Works with 1000+ sites via yt-dlp"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Downloads / Platforms */}
      <section id="platforms" className="py-20 px-6 bg-gradient-to-b from-gray-900/50 to-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Available Everywhere</h2>
          <p className="text-gray-400 text-center mb-12">One account, all platforms. Your library syncs automatically.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Monitor, title: "Web Dashboard", desc: "Full-featured PWA. Install on any device.", link: "/login", cta: "Open Dashboard" },
              { icon: Globe2, title: "Tor Extension", desc: "Right-click to send videos from Tor Browser.", link: "/downloads", cta: "Install" },
              { icon: Chrome, title: "Chrome Extension", desc: "Send videos from any website in one click.", link: "/downloads", cta: "Install" },
              { icon: Smartphone, title: "Android App", desc: "Browse, watch, and download on mobile.", link: "/downloads", cta: "Download APK" },
            ].map((p) => (
              <div key={p.title} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center">
                <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <p.icon className="w-7 h-7 text-brand-light" />
                </div>
                <h3 className="font-semibold mb-2">{p.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{p.desc}</p>
                <Link to={p.link} className="text-sm text-brand-light hover:text-white font-semibold">{p.cta} →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Is TOR2MEGA free?", a: "Yes! The Free plan includes 50 downloads per month and 5GB of storage. Upgrade to Pro for 500 downloads and 50GB." },
              { q: "Where are my videos stored?", a: "Videos are stored on Mega's encrypted cloud storage. The storage layer is completely invisible — you interact with your video library, not file systems." },
              { q: "Can I stream videos without downloading?", a: "Yes. TOR2MEGA includes a streaming proxy that lets you watch videos directly from the cloud on any device." },
              { q: "Does it work with Tor Browser?", a: "Yes. We provide a dedicated Tor Browser extension (Manifest V2) plus a Chrome extension (Manifest V3)." },
              { q: "Is my data private?", a: "All storage is on Mega which provides end-to-end encryption. Your API traffic is secured with JWT authentication." },
              { q: "Can I use the same account on all platforms?", a: "Yes. One account works across web, Tor extension, Chrome extension, Android, and PWA. Your library syncs automatically." },
            ].map((item) => (
              <details key={item.q} className="bg-gray-900 rounded-xl border border-gray-800 p-5 group">
                <summary className="font-semibold cursor-pointer flex items-center justify-between">
                  {item.q}
                  <span className="text-brand-light group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="text-sm text-gray-400 mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-gray-900/50 to-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 text-center mb-12">Start free. Upgrade when you need more.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Free", price: "$0", features: ["50 downloads/mo", "5GB storage", "1 member", "Basic support"], cta: "Start Free", highlight: false },
              { name: "Pro", price: "$9", features: ["500 downloads/mo", "50GB storage", "5 members", "Priority support", "Streaming proxy"], cta: "Upgrade", highlight: true },
              { name: "Team", price: "$29", features: ["5,000 downloads/mo", "500GB storage", "20 members", "API access", "Team management"], cta: "Upgrade", highlight: false },
              { name: "Enterprise", price: "$99", features: ["Unlimited downloads", "Unlimited storage", "Unlimited members", "Dedicated support", "Custom integrations"], cta: "Contact Us", highlight: false },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-6 border ${plan.highlight ? "border-brand bg-brand/5" : "border-gray-800 bg-gray-900"}`}>
                {plan.highlight && <span className="text-xs bg-brand text-white px-3 py-1 rounded-full mb-3 inline-block">Popular</span>}
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <p className="text-3xl font-bold mb-4">{plan.price}<span className="text-sm text-gray-500 font-normal">/mo</span></p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-green-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login" className={`block text-center py-2.5 rounded-lg font-semibold text-sm ${plan.highlight ? "bg-brand text-white" : "bg-gray-800 text-white hover:bg-gray-700"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to build your video cloud?</h2>
          <p className="text-gray-400 mb-8">Join TOR2MEGA and turn your video collection into a personal streaming platform.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-3.5 rounded-xl text-lg flex items-center justify-center gap-2">
              Start Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/downloads" className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3.5 rounded-xl text-lg flex items-center justify-center gap-2">
              <Download className="w-5 h-5" /> Download Apps
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Cloud className="w-6 h-6 text-brand" />
                <span className="font-bold">TOR2MEGA</span>
              </div>
              <p className="text-sm text-gray-500">Your personal video cloud. Store, stream, and manage videos from anywhere.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#library" className="hover:text-white">Video Library</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><Link to="/downloads" className="hover:text-white">Downloads</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Platforms</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/login" className="hover:text-white">Web Dashboard</Link></li>
                <li><Link to="/downloads" className="hover:text-white">Tor Extension</Link></li>
                <li><Link to="/downloads" className="hover:text-white">Chrome Extension</Link></li>
                <li><Link to="/downloads" className="hover:text-white">Android App</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/login" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-600">
            © 2026 TOR2MEGA. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
