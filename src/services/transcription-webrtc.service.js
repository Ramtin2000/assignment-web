class TranscriptionWebRTCService {
  constructor() {
    this.pc = null;
    this.dataChannel = null;
    this.clientSecret = null;
    this.sessionId = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.listeners = new Map();
    this.audioStream = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
  }

  // Event emitter methods (maintain same interface as WebSocket service)
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

  async connect(clientSecret, audioStream) {
    if (this.isConnected || this.isConnecting) {
      console.log("WebRTC already connected or connecting");
      return;
    }

    if (!clientSecret) {
      throw new Error("Client secret is required to connect");
    }

    if (!audioStream) {
      throw new Error("Audio stream is required for WebRTC connection");
    }

    this.clientSecret = clientSecret;
    this.audioStream = audioStream;
    this.isConnecting = true;

    try {
      // Create RTCPeerConnection
      this.pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // Add audio track to peer connection (for transcription input)
      audioStream.getTracks().forEach((track) => {
        this.pc.addTrack(track, audioStream);
      });

      // Create data channel for events
      this.dataChannel = this.pc.createDataChannel("oai-events", {
        ordered: true,
      });

      // Set up data channel handlers
      this.setupDataChannel();

      // Set up ICE connection state handlers
      this.setupICEHandlers();

      // Create SDP offer (only sending audio, not receiving)
      const offer = await this.pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      });
      await this.pc.setLocalDescription(offer);

      // Send SDP offer to OpenAI API
      // OpenAI expects raw SDP with application/sdp content type
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

      // Get SDP answer from OpenAI (should be plain text SDP)
      const answerSdp = await response.text();

      const answer = {
        type: "answer",
        sdp: answerSdp,
      };

      await this.pc.setRemoteDescription(answer);

      console.log("WebRTC connection established with OpenAI Realtime API");
    } catch (error) {
      console.error("Error establishing WebRTC connection:", error);
      this.isConnecting = false;
      this.cleanup();
      this.emit("error", error);
      throw error;
    }
  }

  setupDataChannel() {
    this.dataChannel.onopen = () => {
      console.log("Data channel opened - waiting for session.created event");
      // Session configuration will be triggered by session.created event handler
      // No need to call configureSession() here as sessionId won't be available yet
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error("Error parsing data channel message:", error);
        this.emit("error", error);
      }
    };

    this.dataChannel.onerror = (error) => {
      console.error("Data channel error:", error);
      this.emit("error", error);
    };

    this.dataChannel.onclose = () => {
      console.log("Data channel closed");
      if (this.isConnected) {
        this.isConnected = false;
        this.emit("disconnected", { reason: "Data channel closed" });
      }
    };
  }

  setupICEHandlers() {
    this.pc.oniceconnectionstatechange = () => {
      const state = this.pc.iceConnectionState;
      console.log("ICE connection state:", state);

      if (state === "connected" || state === "completed") {
        if (!this.isConnected) {
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          console.log("WebRTC connection established");
        }
      } else if (state === "disconnected" || state === "failed") {
        this.isConnected = false;
        this.emit("disconnected", { reason: `ICE ${state}` });

        // Attempt to reconnect if not a normal closure
        if (
          state === "failed" &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.reconnectAttempts++;
          console.log(
            `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
          );
          setTimeout(() => {
            if (this.clientSecret && this.audioStream) {
              this.connect(this.clientSecret, this.audioStream);
            }
          }, 1000 * this.reconnectAttempts);
        }
      }
    };

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        // ICE candidates are handled automatically by the browser
        // No need to send them manually for OpenAI Realtime API
      }
    };
  }

  configureSession() {
    // Send session configuration via data channel
    // This enables transcription on the session
    if (!this.sessionId) {
      console.warn("Session ID not available yet, cannot configure session");
      return;
    }

    console.log(`Configuring session ${this.sessionId} for transcription...`);

    const config = {
      type: "transcription_session.update",
      session: {
        input_audio_format: "pcm16",
        input_audio_transcription: {
          model: "gpt-4o-mini-transcribe",
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 2000,
        },
        input_audio_noise_reduction: {
          type: "near_field",
        },
      },
    };

    console.log("Sending session configuration for transcription:", config);
    this.send(config);
    console.log("Session configuration sent successfully");
  }

  send(message) {
    if (
      !this.isConnected ||
      !this.dataChannel ||
      this.dataChannel.readyState !== "open"
    ) {
      console.warn("Data channel not open, cannot send message");
      return;
    }

    try {
      this.dataChannel.send(JSON.stringify(message));
    } catch (error) {
      console.error("Error sending data channel message:", error);
      this.emit("error", error);
    }
  }

  handleMessage(message) {
    // Handle different message types from OpenAI Realtime API
    // For transcription, events are nested under conversation items

    // Check for transcription delta events
    if (message.type === "conversation.item.input_audio_transcription.delta") {
      // Partial transcription update
      const delta = message.delta || "";
      console.log("Transcription delta:", delta);
      this.emit("transcription-delta", delta);
    } else if (
      message.type === "conversation.item.input_audio_transcription.completed"
    ) {
      // Final transcription
      const transcript = message.transcript || message.text || "";
      console.log("Transcription completed:", transcript);
      this.emit("transcription-complete", transcript);
    } else if (message.type === "error") {
      // Error from API
      const error = new Error(
        message.error?.message || "Unknown error from OpenAI API"
      );
      this.emit("error", error);
    } else if (
      message.type === "session.created" ||
      message.type === "transcription_session.created"
    ) {
      // Session created - store session ID and update it with transcription settings
      if (message.session?.id) {
        this.sessionId = message.session.id;
        console.log(
          "Session created, ID:",
          this.sessionId,
          "- updating with transcription config..."
        );
        // Send configuration after session is created
        setTimeout(() => {
          this.configureSession();
        }, 100);
      } else {
        console.warn(
          "Session created but no session ID found in message:",
          message
        );
      }
    } else if (
      message.type === "session.updated" ||
      message.type === "transcription_session.updated"
    ) {
      // Session lifecycle events
      console.log("Session updated:", message.type);
    } else if (
      message.type === "conversation.item.created" ||
      message.type === "input_audio_buffer.speech_started" ||
      message.type === "input_audio_buffer.speech_stopped" ||
      message.type === "input_audio_buffer.committed"
    ) {
      // These are informational events, log but don't process
      // Suppress these logs to reduce noise
    } else {
      // Check if message contains transcription data in any format
      if (message.delta !== undefined) {
        // Found a delta, emit it
        console.log("Found transcription delta in message:", message);
        this.emit("transcription-delta", message.delta);
      } else if (
        message.transcript !== undefined ||
        message.text !== undefined
      ) {
        // Found a transcript, emit it
        const transcript = message.transcript || message.text;
        console.log("Found transcription in message:", transcript);
        this.emit("transcription-complete", transcript);
      } else if (
        message.type?.includes("transcription") ||
        message.type?.includes("transcript")
      ) {
        // Transcription-related message but format unknown
        console.log("Transcription-related message:", message.type, message);
      } else {
        // Only log non-transcription unhandled messages
        console.log("Unhandled message type:", message.type);
      }
    }
  }

  // This method is kept for compatibility but WebRTC streams audio automatically
  // No need to manually send audio chunks
  sendAudioChunk(audioData) {
    // WebRTC handles audio streaming automatically via the audio track
    // This method is kept for interface compatibility but does nothing
    console.warn(
      "sendAudioChunk called but WebRTC streams audio automatically"
    );
  }

  cleanup() {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
  }

  disconnect() {
    this.cleanup();
    this.clientSecret = null;
    this.sessionId = null;
    this.audioStream = null;
    this.reconnectAttempts = 0;
  }
}

// Export singleton instance
const realtimeService = new TranscriptionWebRTCService();
export default realtimeService;
