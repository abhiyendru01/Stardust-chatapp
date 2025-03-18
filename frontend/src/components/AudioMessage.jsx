import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

const AudioMessage = ({ audioSrc, isSender = true }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState("0:00");

  useEffect(() => {
    if (!audioSrc || !waveformRef.current) return;

    // ✅ Destroy previous instance to prevent overlapping waveforms
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }

    // ✅ Fetch DaisyUI colors dynamically
  

    
    const waveColor = "#cccccc"; // ✅ Hardcoded color
const progressColor = "#5acf0c";


    // ✅ Create a new WaveSurfer instance
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor,
      progressColor,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      height: 40,
      cursorWidth: 0,
      backend: "WebAudio",
      responsive: true,
      normalize: true,
      partialRender: true,
      barMinHeight: 3,
      debug: true,  // ✅ Enable debug logs
    });
    
    console.log("🔊 Audio Source:", audioSrc);
    wavesurfer.current.load(audioSrc);


    // ✅ Update duration when ready
    wavesurfer.current.on("ready", () => {
      const time = Math.ceil(wavesurfer.current.getDuration() || 0);
      setDuration(new Date(time * 1000).toISOString().substring(14, 19));
    });

    // ✅ Handle Play/Pause State
    wavesurfer.current.on("play", () => setIsPlaying(true));
    wavesurfer.current.on("pause", () => setIsPlaying(false));

    // ✅ Cleanup on unmount
    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [audioSrc]);

  const togglePlay = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  return (
    <div className={`chat ${isSender ? "chat-end" : "chat-start"} w-full max-w-[90%] sm:max-w-[75%]`}>
      <div
        className={`rounded-lg p-3 shadow-md flex items-center gap-3 
        ${isSender ? "bg-base-200 text-primary-content" : "bg-primary text-base-content"} 
        w-full max-w-[350px] sm:max-w-[400px] md:max-w-[450px]"`}
      >
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`btn btn-circle btn-sm flex items-center justify-center 
          ${isSender ? "bg-primary/20" : "bg-base-200 hover:bg-base-400"} 
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
          <div ref={waveformRef} className="w-full " />
        </div>

        {/* Duration */}
        <span className="text-xs text-base-content/80 font-medium opacity-90 min-w-[40px] text-right">
          {duration}
        </span>
      </div>
    </div>
  );
};

export default AudioMessage;
