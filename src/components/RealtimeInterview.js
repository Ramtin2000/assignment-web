import React, { useRef, useEffect, useState } from "react";
import { useRealtimeInterview } from "../hooks/useRealtimeInterview";
import { Button } from "./ui/Button";
import { TagInput } from "./ui/TagInput";

const getStatusBadgeClasses = (status) => {
  const base =
    "inline-flex items-center gap-xs px-sm py-xs rounded-full text-sm font-medium";
  switch (status) {
    case "active":
    case "listening":
      return `${base} bg-success/20 text-success`;
    case "speaking":
      return `${base} bg-primary/20 text-primary`;
    case "connecting":
      return `${base} bg-warning/20 text-warning`;
    case "error":
      return `${base} bg-danger/20 text-danger`;
    default:
      return `${base} bg-gray-200 text-gray-600`;
  }
};

const StatusDot = ({ status }) => {
  const shouldPulse =
    status === "active" || status === "listening" || status === "speaking";
  return (
    <div
      className={`w-2 h-2 rounded-full bg-current ${
        shouldPulse ? "animate-pulse" : ""
      }`}
    />
  );
};

export default function RealtimeInterview() {
  const {
    status,
    transcript,
    currentQuestion,
    error,
    questionsAnswered,
    canEndInterview,
    totalQuestions,
    liveUserSpeech,
    liveAssistantSpeech,
    startInterview,
    stopInterview,
  } = useRealtimeInterview();

  const [interviewSkills, setInterviewSkills] = useState([]);
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript]);

  const getStatusText = () => {
    switch (status) {
      case "idle":
        return "Ready";
      case "connecting":
        return "Connecting...";
      case "active":
        return "Active";
      case "listening":
        return "Listening...";
      case "speaking":
        return "Speaking...";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-lg h-screen flex flex-col">
      <div className="flex justify-between items-center mb-lg pb-md border-b-2 border-gray-200">
        <h1 className="text-3xl font-semibold text-gray-900 m-0">
          Real-time Interview
        </h1>
        <div className={getStatusBadgeClasses(status)}>
          <StatusDot status={status} />
          {getStatusText()}
        </div>
      </div>

      {error && (
        <div className="p-md bg-danger/20 text-danger rounded-md border border-danger/40 mb-md">
          {error}
        </div>
      )}

      {status === "idle" && (
        <div className="bg-white rounded-lg p-lg shadow-md transition-all duration-normal mb-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-md m-0">
            Select Skills for Interview
          </h2>
          <p className="text-gray-600 mb-md leading-relaxed">
            Add the skills you want to be interviewed on. The AI will ask 2
            questions per skill.
          </p>
          <TagInput
            value={interviewSkills}
            onChange={setInterviewSkills}
            placeholder="Type a skill (e.g., React, JavaScript, TypeScript) and press Enter"
          />
        </div>
      )}

      {status !== "idle" && totalQuestions > 0 && (
        <>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-sm">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${(questionsAnswered / totalQuestions) * 100}%`,
              }}
            />
          </div>
          <div className="text-sm text-gray-600 text-center mb-md">
            Progress: {questionsAnswered} / {totalQuestions} questions answered
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col gap-lg overflow-hidden">
        {currentQuestion && (
          <div className="bg-gradient-to-br from-primary/15 to-primary/5 border-2 border-primary/30 rounded-lg p-lg shadow-md">
            <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-sm">
              Current Question
            </div>
            <div className="text-xl leading-relaxed text-gray-900 min-h-[60px]">
              {currentQuestion}
            </div>
          </div>
        )}

        {status !== "idle" && (
          <>
            {status === "active" && transcript.length === 0 && (
              <div className="p-6 text-center bg-gradient-to-br from-[#667eea]/15 to-[#764ba2]/5 border-2 border-[#667eea]/30 mb-5 rounded-xl">
                <div className="text-xl text-[#667eea] font-semibold mb-3">
                  Hello! How are you?
                </div>
                <div className="text-base text-gray-600 leading-relaxed">
                  Please speak into your microphone to begin the interview.
                  <br />
                  The AI interviewer will greet you and start asking questions
                  once you begin speaking.
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-lg p-lg shadow-md">
          <div className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-md pb-sm border-b border-gray-200">
            Transcript
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-md pr-sm [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
            {transcript.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-lg text-center">
                {status === "idle"
                  ? 'Click "Start Interview" to begin'
                  : "Waiting for conversation..."}
              </div>
            ) : (
              transcript.map((message, index) => (
                <div
                  key={index}
                  className={`flex flex-col gap-xs mb-md ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`text-xs font-semibold uppercase tracking-wider mb-xs ${
                      message.role === "user" ? "text-primary" : "text-gray-600"
                    }`}
                  >
                    {message.role}
                  </div>
                  <div
                    className={`max-w-[75%] px-lg py-md rounded-lg leading-relaxed break-words ${
                      message.role === "user"
                        ? "bg-primary text-white shadow-md"
                        : "bg-gray-100 text-gray-900 shadow-sm border-l-4 border-primary"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>

      <div className="flex gap-md justify-center pt-lg border-t-2 border-gray-200">
        {status === "idle" ? (
          <Button
            variant="primary"
            size="lg"
            onClick={() => startInterview(interviewSkills)}
            disabled={status === "connecting" || interviewSkills.length === 0}
          >
            Start Interview
          </Button>
        ) : (
          <Button
            variant="danger"
            size="lg"
            onClick={stopInterview}
            disabled={status === "connecting" || !canEndInterview}
            title={
              !canEndInterview
                ? `Complete all ${totalQuestions} questions before ending the interview`
                : "End the interview"
            }
          >
            {canEndInterview ? "End Interview" : "Complete Interview First"}
          </Button>
        )}
      </div>
    </div>
  );
}
