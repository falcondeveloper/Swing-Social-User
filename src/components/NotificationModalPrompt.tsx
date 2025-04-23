import { useEffect, useState } from "react";

// Detect platform + browser
const detectBrowser = () => {
  const ua = navigator.userAgent;

  if (/android/i.test(ua)) {
    if (/chrome/i.test(ua) && !/opera|opr/i.test(ua)) return "android-chrome";
    if (/firefox/i.test(ua)) return "android-firefox";
    if (/duckduckgo/i.test(ua)) return "android-duckduckgo";
    if (/opera|opr/i.test(ua)) return "android-opera";
  }

  if (/iphone|ipad|ipod/i.test(ua)) {
    if (/safari/i.test(ua) && !/crios|fxios|duckduckgo/i.test(ua)) return "ios-safari";
    if (/crios/i.test(ua)) return "ios-chrome";
    if (/fxios/i.test(ua)) return "ios-firefox";
    if (/duckduckgo/i.test(ua)) return "ios-duckduckgo";
  }

  if (/windows/i.test(ua)) {
    if (/edg/i.test(ua)) return "win-edge";
    if (/chrome/i.test(ua) && !/edg/i.test(ua)) return "win-chrome";
    if (/firefox/i.test(ua)) return "win-firefox";
    if (/opera|opr/i.test(ua)) return "win-opera";
  }

  return "unknown";
};

type BrowserKey = keyof typeof instructions;

// Browser-specific instructions
const instructions = {
  "android-chrome": "⋮ > Settings > Site settings > Notifications > Allow this site",
  "android-firefox": "⋮ > Settings > Site permissions > Notifications > Allow",
  "android-opera": "⋮ > Site settings > Notifications > Allow this site",
  "android-duckduckgo": "DuckDuckGo may block notifications. Try Chrome or Firefox.",
  "ios-safari": "aA > Website Settings > Allow Notifications or iOS Settings > Safari > Notifications",
  "ios-chrome": "Chrome on iOS does not support notifications. Use Safari.",
  "ios-firefox": "Firefox on iOS does not support notifications. Use Safari.",
  "ios-duckduckgo": "DuckDuckGo on iOS does not support notifications. Use Safari.",
  "win-chrome": "Click 🔒 > Site settings > Notifications > Allow",
  "win-edge": "Click 🔒 > Permissions > Notifications > Allow",
  "win-firefox": "Click 🔒 > Connection secure > More information > Permissions",
  "win-opera": "Click 🔒 > Site settings > Notifications > Allow",
  "unknown": "Your browser may not support notifications or could not be detected.",
};

export default function NotificationModalPrompt() {
  const [status, setStatus] = useState("checking");
  const [browser, setBrowser] = useState<BrowserKey>("unknown");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("notificationPromptDismissed");
    if (dismissed === "true") return;

    const detected = detectBrowser();
    setBrowser(detected);

    if (!("Notification" in window)) {
      setStatus("unsupported");
      setVisible(true);
      return;
    }

    const permission = Notification.permission;

    if (permission === "granted") {
      setStatus("granted");
    } else if (permission === "denied") {
      setStatus("blocked");
      setVisible(true);
    } else if (permission === "default") {
      if (["ios-chrome", "ios-firefox", "ios-duckduckgo"].includes(detected)) {
        setStatus("manual");
        setVisible(true);
        return;
      }

      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          setStatus("granted");
          localStorage.setItem("notificationPromptDismissed", "true");
          setVisible(false); // Auto-close on grant
        } else {
          setStatus("prompted");
          setVisible(true);
        }
      });
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem("notificationPromptDismissed", "true");
  };

  if (!visible || status === "granted") return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      height: "100vh",
      width: "100vw",
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "1.5rem",
        maxWidth: "90%",
        width: "400px",
        borderRadius: "10px",
        boxShadow: "0 0 20px rgba(0,0,0,0.3)",
        textAlign: "center",
        color: "#444"
      }}>
        <h2>🔔 Enable Notifications</h2>
        <p style={{ margin: "1rem 0" }}>
          {instructions[browser] || instructions["unknown"]}
        </p>
        <button
          onClick={handleClose}
          style={{
            backgroundColor: "#222",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1.2rem",
            borderRadius: "6px",
            fontSize: "1rem",
            cursor: "pointer"
          }}
        >
          Don't show again
        </button>
      </div>
    </div>
  );
}