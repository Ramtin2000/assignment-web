import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useInterview } from "../hooks/useInterview";
import { useAudioCapture } from "../hooks/useAudioCapture";
import { useAuth } from "../context/AuthContext";
import QuestionDisplay from "./QuestionDisplay";
import TranscriptDisplay from "./TranscriptDisplay";
import { useCallback } from "react";
import ttsService from "../services/tts-webrtc.service";

const InterviewSession = () => {
  const { interviewId } = useParams();
  const { token } = useAuth();
  const {
    sessionId,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    isLastQuestion,
    isComplete,
    error,
    status,
    startInterview,
    submitAnswer,
    nextQuestion,
  } = useInterview(interviewId);

  const [transcript, setTranscript] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [isReadingQuestion, setIsReadingQuestion] = useState(false);
  const transcriptRef = useRef("");
  const stopRecordingRef = useRef(null);
  const submitAnswerRef = useRef(null);
  const clearTranscriptionRef = useRef(null);
  const nextQuestionRef = useRef(null);
  const isLastQuestionRef = useRef(false);
  const startRecordingRef = useRef(null);
  const isRecordingRef = useRef(false);
  const hasReadQuestionRef = useRef(false);
  const currentQuestionIdRef = useRef(null);

  // Update refs when values change
  useEffect(() => {
    isLastQuestionRef.current = isLastQuestion;
  }, [isLastQuestion]);

  // Note: Frontend VAD removed - Realtime API has server-side VAD
  // The Realtime API automatically detects when user stops speaking
  // and sends 'transcription-complete' with turnCompleted: true

  const handleTranscriptionResult = useCallback((data) => {
    // Handle partial transcription updates
    if (data.isPartial) {
      setTranscript((prev) => prev + data.text);
    }
  }, []);

  const handleTranscriptionComplete = useCallback(async (data) => {
    // Handle final transcription
    const finalTranscript = data.text;
    setTranscript(finalTranscript);
    transcriptRef.current = finalTranscript;

    console.log(
      "Transcription complete:",
      finalTranscript,
      "Turn completed:",
      data.turnCompleted
    );

    // If server-side VAD detected end of turn, submit answer
    if (data.turnCompleted) {
      console.log("Turn completed detected, stopping recording...");
      if (stopRecordingRef.current) stopRecordingRef.current();

      // Wait a bit to ensure everything is clean then submit
      setTimeout(async () => {
        if (submitAnswerRef.current) {
          console.log("Submitting answer:", finalTranscript);
          await submitAnswerRef.current(finalTranscript);
          // After submitting, nextQuestion will be called automatically by useInterview
        }
      }, 500);
    }
  }, []);

  const handleTranscriptionError = useCallback((err) => {
    console.error("Transcription error:", err);
  }, []);

  const { isRecording, startRecording, stopRecording, clearTranscription } =
    useAudioCapture(sessionId, {
      onTranscriptionResult: handleTranscriptionResult,
      onTranscriptionComplete: handleTranscriptionComplete,
      onError: handleTranscriptionError,
    });

  // Update refs
  useEffect(() => {
    stopRecordingRef.current = stopRecording;
    submitAnswerRef.current = submitAnswer;
    nextQuestionRef.current = nextQuestion;
    clearTranscriptionRef.current = clearTranscription;
    startRecordingRef.current = startRecording;
    isRecordingRef.current = isRecording;
  }, [
    stopRecording,
    submitAnswer,
    nextQuestion,
    clearTranscription,
    startRecording,
    isRecording,
  ]);

  // Start interview when component mounts
  useEffect(() => {
    if (!hasStarted && token && interviewId) {
      startInterview();
      setHasStarted(true);
    }
  }, [hasStarted, startInterview, token, interviewId]);

  // Reset transcript, read question with TTS, then start recording when question changes
  useEffect(() => {
    // Only read if we have a question, status is ready, not already reading, and this is a new question
    if (
      currentQuestion &&
      status === "ready" &&
      !isReadingQuestion &&
      currentQuestion.id !== currentQuestionIdRef.current
    ) {
      // Mark this question as being processed
      currentQuestionIdRef.current = currentQuestion.id;
      hasReadQuestionRef.current = false;

      transcriptRef.current = "";
      setTranscript("");
      if (clearTranscriptionRef.current) clearTranscriptionRef.current();

      // Read question with TTS first, then start transcription
      const readQuestionAndStartRecording = async () => {
        // Prevent multiple calls
        if (hasReadQuestionRef.current) {
          console.log("Question already read, skipping...");
          return;
        }

        setIsReadingQuestion(true);
        hasReadQuestionRef.current = true;

        try {
          console.log("Reading question with TTS:", currentQuestion.text);

          // TTS service uses Web Speech API (no WebRTC connection needed)
          // Wait for TTS to complete
          await ttsService.speakText(currentQuestion.text);
          console.log("TTS completed, starting recording...");

          // Start recording after TTS completes
          if (startRecordingRef.current && !isRecordingRef.current) {
            startRecordingRef.current();
          }
        } catch (error) {
          console.error("Error reading question with TTS:", error);
          // If TTS fails, still start recording
          if (startRecordingRef.current && !isRecordingRef.current) {
            startRecordingRef.current();
          }
        } finally {
          setIsReadingQuestion(false);
        }
      };

      readQuestionAndStartRecording();
    }
  }, [currentQuestion, status, isReadingQuestion]);

  // Handle completion
  useEffect(() => {
    if (isComplete) {
      if (stopRecordingRef.current) stopRecordingRef.current();
    }
  }, [isComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stopRecordingRef.current) {
        stopRecordingRef.current();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-green-600 mb-6">
            Interview Complete!
          </h2>
          <p className="text-gray-700 text-lg mb-8">
            Thank you for completing the interview. Your responses have been
            recorded and will be evaluated.
          </p>
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">
              What happens next?
            </h3>
            <ul className="text-left text-blue-700 space-y-2">
              <li>• Our AI will analyze your responses</li>
              <li>• You will receive a detailed report via email</li>
              <li>• The hiring team will review your performance</li>
            </ul>
          </div>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Technical Interview
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Session ID: {sessionId}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
          </div>
        </div>

        {/* Question Display */}
        {currentQuestion && (
          <div className="space-y-4">
            <QuestionDisplay
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={totalQuestions}
            />
          </div>
        )}

        {/* Transcription Display */}
        <div className="bg-white shadow-sm rounded-lg p-6 min-h-[200px] flex flex-col">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Your Answer
          </h3>
          <TranscriptDisplay
            transcript={transcript}
            isListening={isRecording}
          />
          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <span>
              {isRecording
                ? "Listening..."
                : isReadingQuestion
                ? "Reading question..."
                : "Waiting for audio..."}
            </span>
            <span>VAD: Server-side (Realtime API)</span>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-white shadow-sm rounded-lg p-4">
          <p className="text-sm text-gray-500">Status: {status}</p>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
