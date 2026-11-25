import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAFn20x4pX5QH2WKZZLUE7LbLTd0PTM_7o",
  authDomain: "aplusphysics-36f56.firebaseapp.com",
  projectId: "aplusphysics-36f56",
  storageBucket: "aplusphysics-36f56.firebasestorage.app",
  messagingSenderId: "219890764537",
  appId: "1:219890764537:web:24bc82bceaba0711d33028",
  measurementId: "G-80HYR14WEY"
};

const ADMIN_UID = "0mCJIJtI7aYErn2jv8ywAILQNCh2";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const webConfigRef = doc(db, "system", "web_config");

// DOM Elements
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const loginEmailInput = document.getElementById("login-email");
const loginPasswordInput = document.getElementById("login-password");
const loginSubmitBtn = document.getElementById("login-submit-btn");
const loginErrorBox = document.getElementById("login-error");

const adminEmailDisplay = document.getElementById("admin-email-display");
const logoutBtn = document.getElementById("logout-btn");

const statDownloadCount = document.getElementById("stat-download-count");
const statCurrentVersion = document.getElementById("stat-current-version");
const statUpdatedAt = document.getElementById("stat-updated-at");

const configForm = document.getElementById("config-form");
const cfgVersion = document.getElementById("cfg-version");
const cfgDownloadUrl = document.getElementById("cfg-download-url");
const cfgChangelog = document.getElementById("cfg-changelog");
const cfgBannerActive = document.getElementById("cfg-banner-active");
const cfgBannerText = document.getElementById("cfg-banner-text");
const configFeedback = document.getElementById("config-feedback");
const saveConfigBtn = document.getElementById("save-config-btn");
const reloadConfigBtn = document.getElementById("reload-config-btn");

let authErrorOverride = "";

function showLoginError(message) {
  if (!message) {
    loginErrorBox.textContent = "";
    loginErrorBox.classList.add("hidden");
    return;
  }
  loginErrorBox.textContent = message;
  loginErrorBox.classList.remove("hidden");
}

function showConfigFeedback(message, isError = false) {
  if (!message) {
    configFeedback.textContent = "";
    configFeedback.className = "alert hidden";
    return;
  }
  configFeedback.textContent = message;
  configFeedback.className = `alert ${isError ? "alert-error" : "alert-success"}`;
}

function mapAuthError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Địa chỉ email không hợp lệ.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email hoặc mật khẩu không chính xác.";
    case "auth/too-many-requests":
      return "Đăng nhập thất bại quá nhiều lần. Vui lòng thử lại sau ít phút.";
    case "auth/network-request-failed":
      return "Lỗi kết nối mạng. Vui lòng kiểm tra Internet và thử lại.";
    case "auth/user-disabled":
      return "Tài khoản này đã bị vô hiệu hóa.";
    default:
      return "Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.";
  }
}

function formatIsoTime(isoStr) {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  return d.toLocaleString("vi-VN");
}

async function loadWebConfig() {
  showConfigFeedback("");
  try {
    const snap = await getDoc(webConfigRef);
    if (!snap.exists()) {
      statDownloadCount.textContent = "0";
      statCurrentVersion.textContent = "Chưa thiết lập";
      statUpdatedAt.textContent = "Chưa có";
      cfgVersion.value = "";
      cfgDownloadUrl.value = "";
      cfgChangelog.value = "";
      cfgBannerActive.checked = false;
      cfgBannerText.value = "";
      return;
    }

    const data = snap.data() || {};
    const count = typeof data.downloadCount === "number" ? data.downloadCount : 0;
    statDownloadCount.textContent = count.toLocaleString("vi-VN");
    statCurrentVersion.textContent = data.version || "—";
    statUpdatedAt.textContent = formatIsoTime(data.updatedAt);

    cfgVersion.value = data.version || "";
    cfgDownloadUrl.value = data.downloadUrl || "";
    cfgChangelog.value = data.changelog || "";
    cfgBannerActive.checked = Boolean(data.bannerActive);
    cfgBannerText.value = data.bannerText || "";
  } catch (err) {
    showConfigFeedback("Không thể tải dữ liệu từ Firestore. Vui lòng kiểm tra quyền truy cập hoặc kết nối mạng.", true);
  }
}

// Two-layer client auth guard
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    dashboardSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
    adminEmailDisplay.textContent = "";
    if (authErrorOverride) {
      showLoginError(authErrorOverride);
      authErrorOverride = "";
    }
    return;
  }

  if (user.uid !== ADMIN_UID) {
    authErrorOverride = "Tài khoản này không có quyền quản trị hệ thống.";
    try {
      await signOut(auth);
    } catch {
      dashboardSection.classList.add("hidden");
      loginSection.classList.remove("hidden");
      showLoginError(authErrorOverride);
    }
    return;
  }

  showLoginError("");
  loginSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  adminEmailDisplay.textContent = user.email || user.uid;
  await loadWebConfig();
});

// Login submit
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoginError("");
  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value;

  loginSubmitBtn.disabled = true;
  loginSubmitBtn.textContent = "Đang xác thực...";

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (cred.user && cred.user.uid !== ADMIN_UID) {
      authErrorOverride = "Tài khoản này không có quyền quản trị hệ thống.";
      await signOut(auth);
    }
  } catch (err) {
    showLoginError(mapAuthError(err?.code));
  } finally {
    loginSubmitBtn.disabled = false;
    loginSubmitBtn.textContent = "Đăng nhập";
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    loginPasswordInput.value = "";
  } catch {
    showConfigFeedback("Không thể đăng xuất lúc này. Vui lòng thử lại.", true);
  }
});

// Reload config
reloadConfigBtn.addEventListener("click", async () => {
  reloadConfigBtn.disabled = true;
  await loadWebConfig();
  reloadConfigBtn.disabled = false;
});

// Save config (merge: true preserves downloadCount)
configForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showConfigFeedback("");

  const downloadUrl = cfgDownloadUrl.value.trim();
  if (downloadUrl && !/^https?:\/\/.+/i.test(downloadUrl)) {
    showConfigFeedback("Đường dẫn tải ứng dụng phải bắt đầu bằng http:// hoặc https://", true);
    return;
  }

  const payload = {
    version: cfgVersion.value.trim(),
    downloadUrl,
    changelog: cfgChangelog.value.trim(),
    bannerActive: cfgBannerActive.checked,
    bannerText: cfgBannerText.value.trim(),
    updatedAt: new Date().toISOString()
  };

  saveConfigBtn.disabled = true;
  saveConfigBtn.textContent = "Đang lưu...";

  try {
    await setDoc(webConfigRef, payload, { merge: true });
    statCurrentVersion.textContent = payload.version || "—";
    statUpdatedAt.textContent = formatIsoTime(payload.updatedAt);
    showConfigFeedback("Đã lưu cấu hình lên hệ thống thành công!");
  } catch (err) {
    showConfigFeedback("Lưu cấu hình thất bại. Vui lòng kiểm tra Firestore Rules và quyền quản trị.", true);
  } finally {
    saveConfigBtn.disabled = false;
    saveConfigBtn.textContent = "Lưu cấu hình";
  }
});
