import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAFn20x4pX5QH2WKZZlUE7LbLTd0PTM_7o",
  authDomain: "aplusphysics-36f56.firebaseapp.com",
  projectId: "aplusphysics-36f56",
  storageBucket: "aplusphysics-36f56.firebasestorage.app",
  messagingSenderId: "219890764537",
  appId: "1:219890764537:web:24bc82bceaba0711d33028",
  measurementId: "G-80HYR14WEY"
};

const SESSION_COUNTED_KEY = "aphysics_download_counted_v1";

function isValidHttpUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function formatUpdatedAt(isoStr) {
  if (!isoStr || typeof isoStr !== "string") return "";
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  return d.toLocaleDateString("vi-VN");
}

function initAnnouncementBanner(data) {
  const banner = document.getElementById("announcement-banner");
  const textEl = document.getElementById("announcement-text");
  const closeBtn = document.getElementById("announcement-close");
  if (!banner || !textEl) return;

  const text = typeof data.bannerText === "string" ? data.bannerText.trim() : "";
  if (data.bannerActive === true && text.length > 0) {
    textEl.textContent = text;
    banner.classList.remove("hidden");
    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = "1";
      closeBtn.addEventListener("click", () => {
        banner.classList.add("hidden");
      });
    }
  } else {
    banner.classList.add("hidden");
  }
}

function initReleaseInfo(data) {
  const box = document.getElementById("app-release-info");
  const verEl = document.getElementById("app-version-badge");
  const logEl = document.getElementById("app-changelog-text");
  const updatedEl = document.getElementById("app-updated-at");
  const countEl = document.getElementById("app-download-count");

  const version = typeof data.version === "string" ? data.version.trim() : "";
  const changelog = typeof data.changelog === "string" ? data.changelog.trim() : "";

  if (updatedEl && data.updatedAt) {
    const formatted = formatUpdatedAt(data.updatedAt);
    if (formatted) updatedEl.textContent = formatted;
  }
  if (countEl && typeof data.downloadCount === "number") {
    countEl.textContent = data.downloadCount.toLocaleString("vi-VN");
  }

  if (verEl && version) {
    verEl.textContent = version;
    verEl.classList.remove("hidden");
  }
  if (logEl && changelog) {
    logEl.textContent = changelog;
    logEl.classList.remove("hidden");
  }
  if (box && (version || changelog)) {
    box.classList.remove("hidden");
  }
}

function wireDownloadButtons(webConfigRef, data) {
  // On tai-xuong.html, actual download file links use [data-download-file]
  const fileButtons = document.querySelectorAll("a[data-download-file]");
  const validUrl = isValidHttpUrl(data?.downloadUrl) ? data.downloadUrl.trim() : "";

  fileButtons.forEach((btn) => {
    if (btn.dataset.downloadFile === "latest" && validUrl) {
      btn.setAttribute("href", validUrl);
      btn.setAttribute("target", "_blank");
      btn.setAttribute("rel", "noopener noreferrer");
    }

    if (!btn.dataset.dlBound) {
      btn.dataset.dlBound = "1";
      btn.addEventListener("click", async () => {
        try {
          if (sessionStorage.getItem(SESSION_COUNTED_KEY) === "1") return;
          sessionStorage.setItem(SESSION_COUNTED_KEY, "1");
          await updateDoc(webConfigRef, {
            downloadCount: increment(1)
          });
        } catch {
          // Silently ignore telemetry failure on public page
        }
      });
    }
  });
}

async function initFirebasePublic() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const webConfigRef = doc(db, "system", "web_config");

    let data = {};
    try {
      const snap = await getDoc(webConfigRef);
      if (snap.exists()) {
        data = snap.data() || {};
      }
    } catch {
      // Fallback gracefully to static HTML if Firestore read fails or offline
    }

    initAnnouncementBanner(data);
    initReleaseInfo(data);
    wireDownloadButtons(webConfigRef, data);
  } catch {
    // Keep static page running smoothly even if Firebase fails to initialize
  }
}

initFirebasePublic();
