class TTSWebRTCService {
  constructor() {
    this.pc = null;
    this.dataChannel = null;
    this.clientSecret = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    // TTS audio playback
    this.audioContext = null;
    this.ttsAudioElement = null;
    this.currentUtterance = null;
    this.ttsStartTime = null;
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  async connect(clientSecret) {
    if (this.isConnected || this.isConnecting) {
      console.log("TTS WebRTC already connected or connecting");
      return;
    }

    if (!clientSecret) {
      throw new Error("Client secret is required to connect");
    }

    this.clientSecret = clientSecret;
    this.isConnecting = true;

    try {
      // Create RTCPeerConnection for TTS (output audio only)
      this.pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // Set up audio context for TTS playback
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)({
        sampleRate: 24000,
      });

      // Handle incoming audio tracks (TTS output)
      this.pc.ontrack = (event) => {
        console.log("Received remote audio track for TTS");
        const remoteStream = event.streams[0];
        this.handleRemoteAudio(remoteStream);
      };

      // Create data channel for events
      this.dataChannel = this.pc.createDataChannel("oai-events", {
        ordered: true,
      });

      // Set up data channel handlers
      this.setupDataChannel();

      // Set up ICE connection state handlers
      this.setupICEHandlers();

      // Create SDP offer (we want to receive audio for TTS)
      const offer = await this.pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });
      await this.pc.setLocalDescription(offer);

      // Send SDP offer to OpenAI API
      const response = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${clientSecret}`,
          "Content-Type": "application/sdp",
          "OpenAI-Beta": "realtime=v1",
        },
        body: offer.sdp,
      });

      if (!response.ok) {
        let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
          const errorText = await response.text();
          errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      // Get SDP answer from OpenAI
      const answerSdp = await response.text();
      const answer = {
        type: "answer",
        sdp: answerSdp,
      };

      await this.pc.setRemoteDescription(answer);

      console.log("TTS WebRTC connection established with OpenAI Realtime API");
    } catch (error) {
      console.error("Error establishing TTS WebRTC connection:", error);
      this.isConnecting = false;
      this.cleanup();
      this.emit("error", error);
      throw error;
    }
  }

  setupDataChannel() {
    this.dataChannel.onopen = () => {
      console.log("TTS Data channel opened");
      // Configure session for TTS
      this.configureSession();
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error("Error parsing TTS data channel message:", error);
        this.emit("error", error);
      }
    };

    this.dataChannel.onerror = (error) => {
      console.error("TTS Data channel error:", error);
      this.emit("error", error);
    };

    this.dataChannel.onclose = () => {
      console.log("TTS Data channel closed");
      if (this.isConnected) {
        this.isConnected = false;
        this.emit("disconnected", { reason: "Data channel closed" });
      }
    };
  }

  setupICEHandlers() {
    this.pc.oniceconnectionstatechange = () => {
      const state = this.pc.iceConnectionState;
      console.log("TTS ICE connection state:", state);

      if (state === "connected" || state === "completed") {
        if (!this.isConnected) {
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          console.log("TTS WebRTC connection established");
        }
      } else if (state === "disconnected" || state === "failed") {
        this.isConnected = false;
        this.emit("disconnected", { reason: `ICE ${state}` });
      }
    };

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        // ICE candidates are handled automatically
      }
    };
  }

  configureSession() {
    // For TTS, we can use the Realtime API directly without session configuration
    // The transcription session client_secret can be used, but we need to handle it differently
    // We'll skip session.update and go straight to creating conversation items
    console.log("TTS session ready - skipping session configuration for TTS");
  }

  send(message) {
    if (
      !this.isConnected ||
      !this.dataChannel ||
      this.dataChannel.readyState !== "open"
    ) {
      console.warn("TTS Data channel not open, cannot send message");
      return;
    }

    try {
      this.dataChannel.send(JSON.stringify(message));
    } catch (error) {
      console.error("Error sending TTS data channel message:", error);
      this.emit("error", error);
    }
  }

  handleMessage(message) {
    // Handle TTS-related messages
    if (
      message.type === "session.created" ||
      message.type === "session.updated" ||
      message.type === "transcription_session.created"
    ) {
      console.log("TTS Session event:", message.type);
      // If we get transcription_session.created, we can still use it for TTS
      // by creating conversation items directly
    } else if (message.type === "conversation.item.output_audio.delta") {
      // TTS audio chunk received
      if (message.delta) {
        this.handleTTSAudioDelta(message.delta);
      }
    } else if (
      message.type === "conversation.item.output_audio.completed" ||
      message.type === "conversation.item.completed" ||
      message.type === "response.audio_transcript.done" ||
      message.type === "response.done"
    ) {
      // TTS audio completed
      console.log("TTS audio completed");
      this.emit("tts-completed");
    } else if (message.type === "response.created") {
      console.log("TTS Response created, waiting for audio...");
    } else if (message.type === "response.audio_transcript.delta") {
      // TTS transcript delta (for debugging)
      console.log("TTS transcript delta:", message.delta);
    } else if (message.type === "response.output_item.added") {
      console.log("TTS Output item added:", message.item);
    } else if (message.type === "response.output_item.done") {
      console.log("TTS Output item done");
      this.emit("tts-completed");
    } else if (message.type === "error") {
      const error = new Error(
        message.error?.message || "Unknown error from OpenAI API"
      );
      this.emit("error", error);
    } else {
      // Log unhandled messages for debugging
      console.log("TTS Unhandled message type:", message.type);
    }
  }

  // TTS: Send text to be spoken
  // Since transcription sessions don't support TTS, we use Web Speech API
  // This is a simpler and more reliable solution for TTS
  async speakText(text) {
    console.log("Using Web Speech API for TTS");
    return this.speakTextWithWebSpeech(text);
  }

  // Handle remote audio stream (TTS output)
  handleRemoteAudio(stream) {
    const audioElement = new Audio();
    audioElement.srcObject = stream;
    audioElement.autoplay = true;

    audioElement.onloadedmetadata = () => {
      console.log("TTS audio stream ready");
    };

    audioElement.onerror = (error) => {
      console.error("Error playing TTS audio:", error);
    };

    audioElement.onended = () => {
      console.log("TTS audio playback ended");
      this.emit("tts-completed");
    };

    // Store reference for cleanup
    this.ttsAudioElement = audioElement;
  }

  // Handle TTS audio delta (if received as base64)
  handleTTSAudioDelta(base64Audio) {
    // If audio comes as base64 chunks, decode and play
    // For WebRTC, audio typically comes through the track, but this is a fallback
    if (this.audioContext && base64Audio) {
      try {
        const audioData = this.base64ToArrayBuffer(base64Audio);
        this.playAudioChunk(audioData);
      } catch (error) {
        console.error("Error handling TTS audio delta:", error);
      }
    }
  }

  // Play audio chunk
  async playAudioChunk(audioData) {
    if (!this.audioContext) return;

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.error("Error playing TTS audio chunk:", error);
    }
  }

  // Convert base64 to ArrayBuffer
  base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Fallback: Use Web Speech API for TTS
  speakTextWithWebSpeech(text) {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) {
        reject(new Error("Web Speech API not supported"));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Store utterance reference for timing access
      this.currentUtterance = utterance;
      this.ttsStartTime = null;

      utterance.onstart = () => {
        this.ttsStartTime = Date.now();
        console.log("Web Speech TTS started");
        // Emit tts-started event with timing information
        this.emit("tts-started", {
          startTime: this.ttsStartTime,
          text: text,
          textLength: text.length,
          utterance: utterance,
        });
      };

      utterance.onend = () => {
        const duration = this.ttsStartTime ? Date.now() - this.ttsStartTime : null;
        console.log("Web Speech TTS completed", duration ? `(duration: ${duration}ms)` : "");
        this.currentUtterance = null;
        this.ttsStartTime = null;
        this.emit("tts-completed", { duration });
        resolve();
      };

      utterance.onerror = (error) => {
        console.error("Web Speech TTS error:", error);
        this.currentUtterance = null;
        this.ttsStartTime = null;
        reject(error);
      };

      console.log("Using Web Speech API for TTS:", text);
      window.speechSynthesis.speak(utterance);
    });
  }

  cleanup() {
    // Cancel any ongoing TTS
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    if (this.ttsAudioElement) {
      this.ttsAudioElement.pause();
      this.ttsAudioElement.srcObject = null;
      this.ttsAudioElement = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.currentUtterance = null;
    this.ttsStartTime = null;
    this.isConnected = false;
    this.isConnecting = false;
  }

  disconnect() {
    this.cleanup();
    this.clientSecret = null;
    this.reconnectAttempts = 0;
  }
}

// Export singleton instance
const ttsService = new TTSWebRTCService();
export default ttsService;
