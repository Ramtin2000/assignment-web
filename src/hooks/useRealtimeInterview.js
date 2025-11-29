import { useState, useEffect, useRef, useCallback } from "react";
import { RealtimeAgent, RealtimeSession, tool } from "@openai/agents-realtime";
import { z } from "zod";
import { realtimeInterviewService } from "../services/api.service";

export function useRealtimeInterview() {
  const [status, setStatus] = useState("idle"); // idle, connecting, active, error
  const [transcript, setTranscript] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [error, setError] = useState(null);

  const sessionRef = useRef(null);
  const agentRef = useRef(null);
  const sessionIdRef = useRef(null);

  // Initialize agent with tool
  useEffect(() => {
    const agent = new RealtimeAgent({
      name: "Interviewer",
      instructions: `You are a technical interviewer conducting a React interview. 
      - Ask one question at a time.
      - Wait for the user to answer before asking the next question.
      - When the user provides an answer, call the 'evaluate_answer' tool with the question, answer, your score (1-10), and feedback.
      - After the tool call completes, ask the next question.
      - Be conversational and natural.
      - Never answer questions yourself - you are the interviewer, not the interviewee.
      - You can elaborate on questions if the user asks for clarification, but do not provide answers.`,
      tools: [
        tool({
          name: "evaluate_answer",
          description: "Evaluate the user's answer to an interview question",
          parameters: z.object({
            question: z.string().describe("The question that was asked"),
            answer: z.string().describe("The user's answer"),
            score: z.number().min(1).max(10).describe("Score from 1-10"),
            feedback: z.string().describe("Detailed feedback on the answer"),
          }),
          strict: true,
          execute: async ({ question, answer, score, feedback }) => {
            // Log evaluation to backend
            if (sessionIdRef.current) {
              try {
                await realtimeInterviewService.logEvaluation(
                  sessionIdRef.current,
                  question,
                  answer,
                  score,
                  feedback
                );
              } catch (err) {
                console.error("Failed to log evaluation:", err);
              }
            }
            return { success: true };
          },
        }),
      ],
    });

    agentRef.current = agent;
    const realtimeSession = new RealtimeSession(agent, {
      model: "gpt-realtime-mini-2025-10-06",
    });

    sessionRef.current = realtimeSession;

    // Listen to transport layer events for transcript updates
    const transport = realtimeSession.transport;

    if (transport) {
      transport.on("transcript_delta", (event) => {
        const { delta, role } = event;
        if (delta) {
          setTranscript((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (
              lastMessage &&
              lastMessage.role === role &&
              !lastMessage.final
            ) {
              // Update existing message
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMessage,
                  text: lastMessage.text + delta,
                },
              ];
            } else {
              // Add new message
              return [
                ...prev,
                {
                  role,
                  text: delta,
                  final: false,
                },
              ];
            }
          });
        }
      });

      transport.on("response_completed", () => {
        // Mark last message as final and update current question
        setTranscript((prev) => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            if (last.role === "assistant" && !last.final) {
              const updated = [...prev.slice(0, -1), { ...last, final: true }];
              // Update current question from last assistant message
              setCurrentQuestion(last.text);
              return updated;
            }
          }
          return prev;
        });
      });

      transport.on("response_started", () => {
        // Clear current question when new response starts
        setCurrentQuestion(null);
      });

      transport.on("user_speech_started", () => {
        setStatus("listening");
      });

      transport.on("user_speech_stopped", () => {
        setStatus("active");
      });

      transport.on("response_audio_started", () => {
        setStatus("speaking");
      });

      transport.on("response_audio_stopped", () => {
        setStatus("active");
      });

      transport.on("error", (err) => {
        console.error("Transport error:", err);
        setError(err.message || "An error occurred");
        setStatus("error");
      });
    }

    // Also listen to session-level events
    realtimeSession.on("error", (err) => {
      console.error("Realtime session error:", err);
      setError(err.message || "An error occurred");
      setStatus("error");
    });

    return () => {
      if (sessionRef.current) {
        try {
          sessionRef.current.close();
        } catch (err) {
          console.error("Error closing session:", err);
        }
      }
    };
  }, []);

  const startInterview = useCallback(async () => {
    try {
      setStatus("connecting");
      setError(null);
      setTranscript([]);
      setCurrentQuestion(null);

      // Create session
      const session = await realtimeInterviewService.createSession();
      sessionIdRef.current = session.id;

      // Get token
      const { client_secret } = await realtimeInterviewService.getToken(
        session.id
      );

      // Connect to realtime session
      if (sessionRef.current) {
        await sessionRef.current.connect({ apiKey: client_secret });
        setStatus("active");
      }
    } catch (err) {
      console.error("Failed to start interview:", err);
      setError(err.message || "Failed to start interview");
      setStatus("error");
    }
  }, []);

  const stopInterview = useCallback(async () => {
    try {
      if (sessionRef.current) {
        sessionRef.current.close();
      }
      if (sessionIdRef.current) {
        await realtimeInterviewService.completeSession(sessionIdRef.current);
        sessionIdRef.current = null;
      }
      setStatus("idle");
      setTranscript([]);
      setCurrentQuestion(null);
    } catch (err) {
      console.error("Failed to stop interview:", err);
      setError(err.message || "Failed to stop interview");
    }
  }, []);

  return {
    status,
    transcript,
    currentQuestion,
    error,
    startInterview,
    stopInterview,
  };
}
