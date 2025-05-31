import { create } from "zustand";

const themeColorMap = {
  light: "#ffffff",
  dark: "#1d232a",
  cupcake: "#faf7f5",
  bumblebee: "#FFFFFF",
  emerald: "#FFFFFF",
  corporate: "#FFFFFF",
  synthwave: "#09002f",
  retro: "#ece3ca",
  cyberpunk: "#fff248",
  valentine: "#fcf2f8",
  halloween: "#1b1816",
  garden: "#e9e7e7",
  forest: "#171212",
  aqua: "#1a368b",
  lofi: "#ffffff",
  pastel: "#ffffff",
  fantasy: "#ffffff",
  wireframe: "#ffffff",
  black: "#000000",
  luxury: "#09090b",
  dracula: "#282a36",
  cmyk: "#ffffff",
  autumn: "#F4F4F4",
  business: "#202020",
  acid: "#ffffff",
  lemonade: "#f8fdef",
  night: "#0f172a",
  coffee: "#160d05",
  winter: "#ffffff",
  dim: "#2a303c",
  nord: "#eceff4",
  sunset: "#0b151b",
};

// ✅ Function to update theme-color meta tag & manifest.json dynamically
const updateThemeColors = (theme) => {
  const themeColor = themeColorMap[theme] || themeColorMap["light"];

  // 🔥 Update <meta name="theme-color">
  let themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeColorMeta) {
    themeColorMeta = document.createElement("meta");
    themeColorMeta.setAttribute("name", "theme-color");
    document.head.appendChild(themeColorMeta);
  }
  themeColorMeta.setAttribute("content", themeColor);

  // 🔥 Update Manifest Dynamically
  const manifest = {
    short_name: "Stardust",
    name: "Chat Application by Abhiyendru",
    icons: [
      { src: "/stardust_appicon.png", sizes: "192x192", type: "image/png" },
      { src: "/stardust_appicon.png", sizes: "512x512", type: "image/png" },
    ],
    start_url: "/",
    background_color: themeColor,
    theme_color: themeColor,
    display: "standalone",
  };

  const manifestBlob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
  const manifestURL = URL.createObjectURL(manifestBlob);
  const timestamp = new Date().getTime();
  
  let manifestLink = document.querySelector('link[rel="manifest"]');
  if (!manifestLink) {
    manifestLink = document.createElement("link");
    manifestLink.setAttribute("rel", "manifest");
    document.head.appendChild(manifestLink);
  }
  manifestLink.setAttribute("href", `${manifestURL}?v=${timestamp}`);

  console.log("🔄 Theme Updated:", theme, " | Theme-Color:", themeColor);
};

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "wireframe",

  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeColors(theme);
    
    set({ theme });
  },

  // ✅ Load saved theme on app start
  initTheme: () => {
    const savedTheme = localStorage.getItem("chat-theme") || "wireframe";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeColors(savedTheme);
  },
}));

// ✅ Apply Theme on App Load
useThemeStore.getState().initTheme();
