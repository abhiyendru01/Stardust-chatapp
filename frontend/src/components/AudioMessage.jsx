import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

const AudioMessage = ({ audioSrc, isSender = true }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState("0:00");
  useEffect(() => {
    if (!audioSrc || !waveformRef.current) return; // Prevent errors if audioSrc is missing
  
    console.log("🎵 Loading audio from URL:", audioSrc); // Debugging
  
    // Function to fetch DaisyUI colors
    const getThemeColor = (variable, fallback) => 
      getComputedStyle(document.documentElement).getPropertyValue(variable)?.trim() || fallback;
  
    let waveColor = getThemeColor("--bc", "#ffffff"); // base-content fallback: white
    let progressColor = getThemeColor("--pc", "#22c1c3"); // primary-content fallback: teal
  
    // Cleanup previous instance before creating a new one
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }
  
    // Create a new WaveSurfer instance
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor,
      progressColor,
      barWidth: 2,
      barGap: 3,
      barRadius: 3,
      height: 40,
      cursorWidth: 0,
      backend: "WebAudio",
      responsive: true,
      normalize: true,
      partialRender: true,
      barMinHeight: 3,
    });
  
    // Load the audio file
    wavesurfer.current.load(audioSrc);
  
    // Handle errors in loading audio
    wavesurfer.current.on("error", (error) => {
      console.error("❌ Error loading audio:", error);
    });
  
    // Get duration
    wavesurfer.current.on("ready", () => {
      const time = Math.ceil(wavesurfer.current.getDuration() || 0);
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      setDuration(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    });
  
    // Play/Pause event listeners
    wavesurfer.current.on("play", () => setIsPlaying(true));
    wavesurfer.current.on("pause", () => setIsPlaying(false));
    wavesurfer.current.on("finish", () => setIsPlaying(false));
  
    // Cleanup function to prevent memory leaks
    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    };
  }, [audioSrc]); // Only reload when `audioSrc` changes
  
  // Update colors when theme changes
  useEffect(() => {
    const updateColors = () => {
      if (wavesurfer.current) {
        wavesurfer.current.setOptions({
          waveColor: getComputedStyle(document.documentElement).getPropertyValue("--bc") || "#ffffff",
          progressColor: getComputedStyle(document.documentElement).getPropertyValue("--pc") || "#22c1c3",
        });
      }
    };

    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  return (
    <div className={`chat ${isSender ? "chat-end" : "chat-start"} w-full max-w-[90%] sm:max-w-[75%]`}>
      <div className={`
        rounded-lg p-3 shadow-md flex items-center gap-3 
        ${isSender ? "bg-base-200 text-primary-content" : "bg-primary text-base-content"}
        w-full max-w-[350px] sm:max-w-[400px] md:max-w-[450px]
      `}>
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`btn btn-circle btn-sm flex items-center justify-center 
            ${isSender ? "btn-ghost" : "btn-primary"} 
            hover:bg-opacity-90 transition-all duration-200`}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Waveform */}
        <div className="flex-1 h-10 min-w-[100px]">
          <div ref={waveformRef} className="w-full" />
        </div>

        {/* Duration */}
        <span className="text-xs font-medium opacity-90 min-w-[40px] text-right">
          {duration}
        </span>
      </div>
    </div>
  );
};

export default AudioMessage;
