const DEFAULT_API_URL = "https://tor2mega-api.onrender.com";
const DEFAULT_DASHBOARD_URL = "https://tor2web.netlify.app";

browser.storage.local.get(["apiUrl", "apiToken", "dashboardUrl"]).then((result) => {
  document.getElementById("api-url").value = result.apiUrl || DEFAULT_API_URL;
  document.getElementById("api-token").value = result.apiToken || "";
  document.getElementById("dashboard-url").value = result.dashboardUrl || DEFAULT_DASHBOARD_URL;
});

document.getElementById("save").addEventListener("click", () => {
  const apiUrl = document.getElementById("api-url").value.trim();
  const apiToken = document.getElementById("api-token").value.trim();
  const dashboardUrl = document.getElementById("dashboard-url").value.trim();

  browser.storage.local.set({ apiUrl, apiToken, dashboardUrl }).then(() => {
    const saved = document.getElementById("saved");
    saved.style.display = "block";
    setTimeout(() => { saved.style.display = "none"; }, 3000);
  });
});
