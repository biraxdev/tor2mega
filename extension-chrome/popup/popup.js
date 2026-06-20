let SITE_BASE = "https://tor2web.netlify.app";
let API_BASE = "https://tor2mega-api.onrender.com";
let queueCount = 0;

chrome.storage.local.get(["apiUrl", "apiToken", "dashboardUrl"]).then((result) => {
  if (result.apiUrl) API_BASE = result.apiUrl.replace(/\/$/, "");
  if (result.dashboardUrl) SITE_BASE = result.dashboardUrl.replace(/\/$/, "");
  if (!result.apiToken) {
    document.getElementById("no-token").style.display = "block";
    document.getElementById("main").style.display = "none";
    document.getElementById("open-options").addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });
  } else {
    document.getElementById("no-token").style.display = "none";
    document.getElementById("main").style.display = "block";
    setupActions();
    updateQueueBadge();
    setInterval(updateQueueBadge, 5000);
  }
});

function setupActions() {
  document.getElementById("action-add").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab && tab.url) {
        chrome.runtime.sendMessage({ type: "sendToMega", url: tab.url });
        showStatus("Added to queue", "processing");
      }
    });
  });

  document.getElementById("action-library").addEventListener("click", () => {
    chrome.tabs.create({ url: `${SITE_BASE}/dashboard/videos` });
  });

  document.getElementById("action-dashboard").addEventListener("click", () => {
    chrome.tabs.create({ url: `${SITE_BASE}/dashboard` });
  });

  document.getElementById("action-queue").addEventListener("click", () => {
    chrome.tabs.create({ url: `${SITE_BASE}/dashboard/downloads` });
  });
}

function updateQueueBadge() {
  chrome.runtime.sendMessage({ type: "getDownloads" }, (response) => {
    if (response && response.downloads) {
      const active = response.downloads.filter(
        (d) => d.status === "queued" || d.status === "downloading" || d.status === "uploading"
      );
      queueCount = active.length;
      const badge = document.getElementById("queue-badge");
      if (queueCount > 0) {
        badge.textContent = queueCount;
        badge.style.display = "inline-block";
        showStatus(`${queueCount} processing`, "processing");
      } else {
        badge.style.display = "none";
        const failed = response.downloads.filter((d) => d.status === "failed");
        if (failed.length > 0) {
          showStatus(`${failed.length} failed`, "error");
        } else {
          showStatus("Ready", "ok");
        }
      }
    }
  });
}

function showStatus(text, type) {
  const bar = document.getElementById("status-bar");
  bar.textContent = text;
  bar.className = "status-bar";
  if (type === "ok") bar.classList.add("status-ok");
  else if (type === "processing") bar.classList.add("status-processing");
  else if (type === "error") bar.classList.add("status-error");
}
