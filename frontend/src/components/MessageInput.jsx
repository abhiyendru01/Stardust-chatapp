"use client"

import { useState, useRef, useEffect } from "react"
import { Image, Send, Mic, X, Pause } from "lucide-react"
import toast from "react-hot-toast"
import { useChatStore } from "../store/useChatStore"
import { cn } from "../lib/utils"

// ✅ Use relative path as frontend & backend share the same domain

const MessageInput = () => {
  const [text, setText] = useState("")
  const [imagePreview, setImagePreview] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [waveformValues, setWaveformValues] = useState(Array(20).fill(2))
  const fileInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)
  const animationFrameRef = useRef(null)
  const { sendMessage } = useChatStore()

  // ✅ Function to send audio to the backend
  const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    const audioFile = new File([audioBlob], "voice-note.wav", { type: "audio/wav" });
    formData.append("audio", audioFile);
  
    try {
      const uploadURL = `/api/messages/upload-audio`; // ✅ Use relative path
      console.log(`🔗 Correct Uploading to: ${uploadURL}`); // ✅ Debugging log

      const response = await fetch(uploadURL, { 
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Audio uploaded successfully:", data.url);
      return data.url;
    } catch (error) {
      console.error("❌ Error uploading audio:", error);
      return null;
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !audioBlob) return;
  
    let audioUrl = null;
    if (audioBlob) {
      audioUrl = await sendAudioToServer(audioBlob); // Ensure we get a valid Cloudinary URL
      if (!audioUrl) {
        toast.error("Audio upload failed! Please try again.");
        return;
      }
    }
  
    try {
      // Send the message using the sendMessage function and wait for a response
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        audio: audioUrl, // Send Cloudinary URL instead of blob
      });
  
      // After the message is successfully sent, reset the UI states
      setText(""); // Clear text input
      setImagePreview(null); // Remove image preview
      setAudioBlob(null); // Remove audio blob
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
  
      // Ensure the message is added once to the chat UI state (no duplication)
      // This is managed by the sendMessage function, so we don't need to manually add it here
    } catch (error) {
      console.error("❌ Failed to send message:", error);
    }
  }

  // Animate waveform
  useEffect(() => {
    if (isRecording) {
      const animateWaveform = () => {
        setWaveformValues((prev) => {
          return prev.map(() => Math.floor(Math.random() * 20) + 2)
        })
        animationFrameRef.current = requestAnimationFrame(animateWaveform)
      }
      animationFrameRef.current = requestAnimationFrame(animateWaveform)
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isRecording])

  // Timer for recording duration
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0)
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)
        audioChunksRef.current = []

        // Stop all tracks in the stream to release the microphone
        stream.getTracks().forEach((track) => track.stop())
      }
      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast.error("Microphone access denied")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleVoiceNoteClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div id="message-input-wrapper" className="p-4 w-full border-t-2 rounded-t-3xl border-primary/40 bg-base-200/80 backdrop-blur-md shadow-lg transition-all duration-300 pb-5 ">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2 animate-in slide-in-from-bottom duration-300">
          <div className="relative">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700 shadow-md"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base-300 hover:bg-base-400
              flex items-center justify-center text-sm shadow-md transition-all duration-200"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {audioBlob && (
        <div className="mb-3 flex items-center gap-2 p-3 bg-base-300/30 rounded-lg backdrop-blur-sm animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col items-start w-full">
            <div className="text-xs text-base-content/70 font-medium mb-1">Voice Recording</div>
            <div className="w-full flex items-center gap-2">
              <audio src={URL.createObjectURL(audioBlob)} controls className="w-full h-10" />
            </div>
          </div>
          <button
            onClick={() => setAudioBlob(null)}
            className="btn btn-circle btn-sm bg-base-300 hover:bg-base-400 text-base-content transition-all duration-200"
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {isRecording && (
        <div className="mb-3 p-3 bg-base-300/30 rounded-lg backdrop-blur-sm animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-base-content flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              Recording
            </div>
            <div className="text-xs text-base-content/70">{formatTime(recordingDuration)}</div>
          </div>

          <div className="flex items-end h-12 gap-[2px] justify-center w-full">
            {waveformValues.map((value, index) => (
              <div
                key={index}
                className="w-1 bg-primary rounded-full transition-all duration-150"
                style={{
                  height: `${value * 3}px`,
                  opacity: value / 20,
                }}
              ></div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
        {/* Voice Note Button */}
        <button
          type="button"
          className={cn(
            "btn btn-circle shadow-lg transition-all duration-300 flex items-center justify-center",
            isRecording
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-base-100/80 hover:bg-base-200 text-base-content",
          )}
          onClick={handleVoiceNoteClick}
        >
          {isRecording ? <Pause size={20} /> : <Mic size={20} />}
        </button>

        {/* Input Field */}
        <div className="flex-1 relative">
          <input
            type="text"
            className="w-full input input-bordered bg-base-100/80 backdrop-blur-md text-base-content rounded-lg placeholder:text-base-content/70 transition-all duration-200 focus:ring-2 focus:ring-primary/50 shadow-sm"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isRecording}
          />
        </div>

        {/* Image Upload */}
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
        <button
          type="button"
          className="btn btn-circle bg-base-100/80 hover:bg-base-200 text-base-content shadow-lg transition-all duration-200"
          onClick={() => fileInputRef.current?.click()}
          disabled={isRecording}
        >
          <Image size={20} />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          className="btn btn-circle bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200"
          disabled={(!text.trim() && !imagePreview && !audioBlob) || isRecording}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}

export default MessageInput
