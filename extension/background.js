const DEFAULT_API_URL = "http://localhost:3000";
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mkv", ".mov", ".m3u8"];

let apiToken = null;
let apiUrl = DEFAULT_API_URL;

browser.storage.local.get(["apiUrl", "apiToken"]).then((result) => {
  if (result.apiUrl) apiUrl = result.apiUrl;
  if (result.apiToken) apiToken = result.apiToken;
});

browser.storage.onChanged.addListener((changes) => {
  if (changes.apiUrl) apiUrl = changes.apiUrl.newValue || DEFAULT_API_URL;
  if (changes.apiToken) apiToken = changes.apiToken.newValue;
});

function isVideoUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase().split("?")[0].split("#")[0];
  return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

browser.contextMenus.onShown.addListener((info, tab) => {
  browser.contextMenus.removeAll();
  if (!apiToken) return;

  const url = info.mediaUrl || info.linkUrl || info.srcUrl;
  if (!url || !isVideoUrl(url)) return;

  browser.contextMenus.create({
    id: "tor2mega-send",
    title: "Send to TOR2MEGA",
    contexts: ["link", "video", "image", "media"],
  });

  browser.contextMenus.create({
    id: "tor2mega-add-open",
    title: "Add & Open",
    contexts: ["link", "video", "image", "media"],
  });

  browser.contextMenus.create({
    id: "tor2mega-sep",
    type: "separator",
    contexts: ["link", "video", "image", "media"],
  });

  browser.contextMenus.create({
    id: "tor2mega-copy",
    title: "Copy Video Link",
    contexts: ["link", "video", "image", "media"],
  });
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  const url = info.mediaUrl || info.linkUrl || info.srcUrl;
  if (!url) return;

  if (info.menuItemId === "tor2mega-send") {
    sendToMega(url, null);
  } else if (info.menuItemId === "tor2mega-add-open") {
    sendToMega(url, null);
    browser.tabs.create({ url: `${apiUrl}/dashboard/videos` });
  } else if (info.menuItemId === "tor2mega-copy") {
    navigator.clipboard.writeText(url);
    showNotification("Link Copied", url);
  }
});

async function fetchDestinations() {
  try {
    const res = await fetch(`${apiUrl}/api/destinations`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    const data = await res.json();
    return data.destinations || [];
  } catch {
    return [];
  }
}

async function sendToMega(url, destinationId) {
  if (!apiToken) {
    showNotification("Error", "No API token configured. Set it in extension options.");
    return;
  }

  try {
    const body = { url };
    if (destinationId) body.destinationId = destinationId;

    const res = await fetch(`${apiUrl}/api/downloads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      showNotification("Added to Queue", data.download.title || url);
      updateBadge();
    } else {
      const err = await res.json().catch(() => ({}));
      showNotification("Error", err.error || "Failed to add download");
    }
  } catch (err) {
    showNotification("Connection Error", String(err.message || err));
  }
}

function showNotification(title, message) {
  browser.notifications.create({
    type: "basic",
    iconUrl: "assets/icon.svg",
    title: `TOR2MEGA: ${title}`,
    message: String(message).substring(0, 200),
  });
}

async function updateBadge() {
  try {
    const res = await fetch(`${apiUrl}/api/downloads?status=queued`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    const data = await res.json();
    const count = data.downloads ? data.downloads.length : 0;
    browser.browserAction.setBadgeText({ text: count > 0 ? String(count) : "" });
    browser.browserAction.setBadgeBackgroundColor({ color: "#6d28d9" });
  } catch {}
}

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "sendToMega") {
    sendToMega(msg.url, null);
    return false;
  }
  if (msg.type === "getDownloads") {
    fetch(`${apiUrl}/api/downloads`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    })
      .then((r) => r.json())
      .then((data) => sendResponse({ downloads: data.downloads || [] }))
      .catch(() => sendResponse({ downloads: [], error: true }));
    return true;
  }
  if (msg.type === "getDestinations") {
    fetch(`${apiUrl}/api/destinations`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    })
      .then((r) => r.json())
      .then((data) => sendResponse({ destinations: data.destinations || [] }))
      .catch(() => sendResponse({ destinations: [], error: true }));
    return true;
  }
  if (msg.type === "getStats") {
    fetch(`${apiUrl}/api/stats`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    })
      .then((r) => r.json())
      .then((data) => sendResponse({ stats: data.stats }))
      .catch(() => sendResponse({ error: true }));
    return true;
  }
  if (msg.type === "getVideos") {
    const search = msg.search ? `?search=${encodeURIComponent(msg.search)}` : "";
    fetch(`${apiUrl}/api/videos${search}`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    })
      .then((r) => r.json())
      .then((data) => sendResponse({ videos: data.videos || [] }))
      .catch(() => sendResponse({ videos: [], error: true }));
    return true;
  }
  if (msg.type === "deleteVideo") {
    fetch(`${apiUrl}/api/videos/${msg.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiToken}` },
    })
      .then((r) => r.json())
      .then((data) => sendResponse(data))
      .catch(() => sendResponse({ error: true }));
    return true;
  }
  if (msg.type === "renameVideo") {
    fetch(`${apiUrl}/api/videos/${msg.id}/rename`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiToken}` },
      body: JSON.stringify({ title: msg.title }),
    })
      .then((r) => r.json())
      .then((data) => sendResponse(data))
      .catch(() => sendResponse({ error: true }));
    return true;
  }
  if (msg.type === "watchVideo") {
    browser.tabs.create({ url: `${apiUrl}/api/videos/${msg.id}/proxy` });
    return false;
  }
  if (msg.type === "downloadVideo") {
    fetch(`${apiUrl}/api/videos/${msg.id}/download`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.downloadUrl) {
          browser.tabs.create({ url: data.downloadUrl });
        }
      })
      .catch(() => sendResponse({ error: true }));
    return true;
  }
});

setInterval(updateBadge, 30000);
