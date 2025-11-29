import { useEffect, useRef, useState, useCallback } from "react";
import realtimeService from "../services/transcription-webrtc.service";
import { transcriptionService } from "../services/api.service";

export const useAudioCapture = (sessionId, options = {}) => {
  const {
    onTranscriptionResult,
    onTranscriptionComplete,
    onError,
    autoStart = false,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const audioStreamRef = useRef(null);
  const clientSecretRef = useRef(null);
  const transcriptionRef = useRef("");

  useEffect(() => {
    // Set up Realtime Service listeners
    const handleTranscriptionDelta = (delta) => {
      // Delta is the incremental text update
      // Update ref immediately for synchronous access
      transcriptionRef.current = transcriptionRef.current + delta;
      const newText = transcriptionRef.current;

      // Update state
      setTranscription(newText);

      // Call callback immediately with the new accumulated value
      if (onTranscriptionResult) {
        onTranscriptionResult({ text: newText, isPartial: true, sessionId });
      }
    };

    const handleTranscriptionComplete = (text) => {
      // Final transcription replaces the accumulated text
      transcriptionRef.current = text;
      setTranscription(text);
      if (onTranscriptionComplete) {
        onTranscriptionComplete({
          text,
          isPartial: false,
          sessionId,
          turnCompleted: true,
        });
      }
    };

    const handleError = (error) => {
      if (onError) {
        onError(error);
      }
    };

    realtimeService.on("transcription-delta", handleTranscriptionDelta);
    realtimeService.on("transcription-complete", handleTranscriptionComplete);
    realtimeService.on("error", handleError);

    return () => {
      realtimeService.off("transcription-delta", handleTranscriptionDelta);
      realtimeService.off(
        "transcription-complete",
        handleTranscriptionComplete
      );
      realtimeService.off("error", handleError);
    };
  }, [sessionId, onTranscriptionResult, onTranscriptionComplete, onError]);

  const startRecording = useCallback(async () => {
    // Prevent multiple simultaneous start attempts
    if (isRecording) {
      console.log("Already recording, skipping...");
      return;
    }

    try {
      // Fetch transcription session and get client_secret
      if (!clientSecretRef.current) {
        console.log("Fetching transcription session...");
        clientSecretRef.current =
          await transcriptionService.createTranscriptionSession();
        console.log("Transcription session created");
      }

      // Get user media first (required for WebRTC)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 24000, // OpenAI recommended rate
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      audioStreamRef.current = stream;

      // Connect to Realtime API via WebRTC (passes audio stream)
      // WebRTC handles audio streaming automatically, no manual chunk processing needed
      if (!realtimeService.isConnected && !realtimeService.isConnecting) {
        await realtimeService.connect(clientSecretRef.current, stream);
      }

      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      if (onError) {
        onError(error);
      }
    }
  }, [isRecording, onError]);

  const stopRecording = useCallback(() => {
    // Check if we're actually recording
    if (audioStreamRef.current || isRecording) {
      // Stop audio stream tracks
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
      }

      // Disconnect WebRTC service
      realtimeService.disconnect();
      setIsRecording(false);

      // Reset client secret so a new session is created on next start
      clientSecretRef.current = null;
    }
  }, [isRecording]);

  useEffect(() => {
    if (autoStart && sessionId) {
      startRecording();
    }

    return () => {
      stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, sessionId]);

  const clearTranscription = () => {
    transcriptionRef.current = "";
    setTranscription("");
  };

  return {
    isRecording,
    transcription,
    startRecording,
    stopRecording,
    clearTranscription,
  };
};
