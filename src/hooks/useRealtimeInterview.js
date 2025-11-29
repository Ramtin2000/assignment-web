import { useState, useEffect, useRef, useCallback } from "react";
import { RealtimeAgent, RealtimeSession, tool } from "@openai/agents-realtime";
import { z } from "zod";
import { realtimeInterviewService } from "../services/api.service";

export function useRealtimeInterview() {
  const [status, setStatus] = useState("idle"); // idle, connecting, active, error
  const [transcript, setTranscript] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [error, setError] = useState(null);
  const [skills, setSkills] = useState([]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [canEndInterview, setCanEndInterview] = useState(false);
  const [liveUserSpeech, setLiveUserSpeech] = useState(""); // Live voice-to-text
  const [liveAssistantSpeech, setLiveAssistantSpeech] = useState(""); // Live text-to-speech

  const sessionRef = useRef(null);
  const agentRef = useRef(null);
  const sessionIdRef = useRef(null);
  const skillsRef = useRef([]);
  const evaluationInProgressRef = useRef(false); // Track when evaluation is happening
  const lastEvaluationTimeRef = useRef(null); // Track when last evaluation completed
  const currentResponseIdRef = useRef(null); // Track current response ID for message boundaries
  const currentItemIdRef = useRef(null); // Track current item ID for message boundaries

  // Cleanup function
  useEffect(() => {
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

  const startInterview = useCallback(async (interviewSkills) => {
    if (!interviewSkills || interviewSkills.length === 0) {
      setError("Please add at least one skill before starting the interview");
      return;
    }

    try {
      setStatus("connecting");
      setError(null);
      setTranscript([]);
      setCurrentQuestion(null);
      setQuestionsAnswered(0);
      setCanEndInterview(false);
      setLiveUserSpeech("");
      setLiveAssistantSpeech("");
      skillsRef.current = interviewSkills;
      setSkills(interviewSkills);

      // Create session
      const session = await realtimeInterviewService.createSession();
      sessionIdRef.current = session.id;

      // Get token
      const { client_secret } = await realtimeInterviewService.getToken(
        session.id
      );

      // Reinitialize agent with skills (this will trigger the useEffect)
      const skillsList = interviewSkills.join(", ");
      const totalQuestions = interviewSkills.length * 2;

      const agent = new RealtimeAgent({
        name: "Interviewer",
        instructions: `You are a technical interviewer conducting an interview covering these skills: ${skillsList}.
        
        QUESTION GENERATION - CRITICAL RULES:
        - Generate UNIQUE, VARIED, and RANDOM questions for each skill. NEVER repeat the same question.
        - Cover a WIDE RANGE of topics within each skill domain. For example:
          * If skill is "React": Ask about hooks, state management, performance, lifecycle, context, routing, testing, architecture patterns, optimization, error boundaries, etc. - NOT just virtual DOM
          * If skill is "JavaScript": Ask about closures, async/await, promises, event loop, prototypes, ES6+ features, design patterns, memory management, etc.
          * If skill is "TypeScript": Ask about types, interfaces, generics, utility types, type inference, decorators, etc.
          * If skill is "Node.js": Ask about event loop, streams, modules, async patterns, security, performance, etc.
          * If skill is "Python": Ask about data structures, OOP, decorators, generators, async programming, etc.
          * For ANY skill: Cover fundamentals, advanced concepts, best practices, common pitfalls, real-world scenarios, and problem-solving
        - Vary question types across:
          * Conceptual: "What is X?", "Explain how X works", "What's the difference between X and Y?"
          * Practical: "How would you implement X?", "Show me how to do X", "Write code for X"
          * Problem-solving: "How would you debug X?", "What would you do if X happened?", "How would you optimize X?"
          * Best practices: "What are best practices for X?", "How do you handle X in production?", "What are common mistakes with X?"
          * Architecture: "How would you design X?", "What patterns work well with X?", "How do you structure X?"
        - For each skill, pick DIFFERENT topics for the 2 questions - don't ask about the same concept twice
        - Make questions challenging but fair - test real understanding, not memorization
        - Be creative and ask questions that reveal practical experience
        
        STARTING THE INTERVIEW:
        - CRITICAL: As soon as the WebRTC connection is established and you are ready, IMMEDIATELY greet the user warmly and ask the first question. Do not wait for them to speak first.
        - You must start speaking immediately after the session begins - this is your first action.
        - Example greeting: "Hello! Welcome to your technical interview. I'll be asking you questions about ${skillsList}. Let's begin with the first question: [generate a unique, random question about the first skill covering a specific topic]"
        - Do not wait for any user input - start the conversation yourself right away.
        
        IMPORTANT RULES:
        - You must ask exactly 2 questions per skill (${totalQuestions} questions total).
        - Ask one question at a time.
        - After asking a question, wait for the user's response.
        - Ensure the 2 questions for each skill cover DIFFERENT topics/aspects of that skill.
        
        CRITICAL EVALUATION RULES:
        - ONLY call the 'evaluate_answer' tool when the user provides an ACTUAL ANSWER to your question.
        - DO NOT call the tool when the user asks for clarification, elaboration, or says "I don't understand" (unless you've already provided one clarification - see below).
        
        HANDLING CLARIFICATION REQUESTS:
        - You may elaborate on a question ONCE if the user asks for clarification (e.g., "What do you mean?", "Can you elaborate?", "I'm not sure what you're asking"):
          * Explain the question in different words or provide more context
          * DO NOT call the 'evaluate_answer' tool yet
          * Wait for their actual answer after you've clarified
        - If they ask for clarification AGAIN after you've already provided one:
          * You must call 'evaluate_answer' with their clarification request as the answer (score it appropriately, e.g., 1-3)
          * Then immediately move to the next question
          * This prevents getting stuck in clarification loops
        
        HANDLING OFF-TOPIC ANSWERS:
        - If the user provides an answer that is completely off-topic or unrelated to the question:
          * Respectfully and gently redirect them by rephrasing the question or providing context
          * Example: "I appreciate your response, but I was asking about [topic]. Let me rephrase: [rephrased question]"
          * This counts as your one clarification/elaboration for that question
          * DO NOT call the 'evaluate_answer' tool yet - wait for their corrected answer
        - If they provide another off-topic answer after your redirection:
          * Call 'evaluate_answer' with their off-topic response (score it appropriately based on how off-topic it is)
          * Then move to the next question
        - If they ask follow-up questions: answer briefly, then wait for their answer (don't call tool yet)
        
        HANDLING ACTUAL ANSWERS:
        - If they provide an answer (even if incomplete or "I don't know"): call 'evaluate_answer' tool
        - If they say "I don't know" as an answer: call the tool with that, score it 1, and provide feedback
        - CRITICAL: After calling 'evaluate_answer', do NOT speak the evaluation details (score, feedback) out loud
        - Simply acknowledge briefly (e.g., "Thank you" or "Got it") and immediately ask the next question
        - NEVER say "I will now evaluate" or "I'm going to evaluate" - just acknowledge and move on
        - Evaluation details are logged via the tool - you don't need to repeat them verbally
        - DO NOT give multiple chances - one answer per question, then move forward
        
        WORKFLOW:
        1. When session starts: Immediately greet the user and ask the first question
        2. Ask a question
        3. Wait for user response
        4. If they ask for clarification (first time): explain it in other words, wait for their answer (DO NOT call tool)
        5. If they provide an off-topic answer (first time): respectfully redirect and rephrase the question, wait for their corrected answer (DO NOT call tool)
        6. If they ask for clarification AGAIN or provide another off-topic answer (after you've already clarified/redirected once): call 'evaluate_answer' with their response, then briefly acknowledge (e.g., "Thank you") and ask next question (DO NOT say "I will evaluate" or speak evaluation details)
        7. If they provide an on-topic answer: call 'evaluate_answer' tool, then briefly acknowledge (e.g., "Thank you" or "Got it") and immediately ask next question (DO NOT say "I will evaluate" or speak score or feedback)
        8. Continue until all ${totalQuestions} questions are asked and answered
        9. After the ${totalQuestions}th answer is evaluated, IMMEDIATELY call 'signal_interview_complete' tool
        
        - Cover all skills evenly - ask 2 questions about each skill before moving to the next.
        - CRITICAL: For each skill, ensure the 2 questions cover DIFFERENT topics. For example:
          * If first React question is about hooks, the second should be about something else (state management, performance, testing, etc.)
          * If first JavaScript question is about closures, the second should cover a different concept (async/await, prototypes, etc.)
          * Vary the question types and difficulty levels
        - IMPORTANT: The total number of questions is ${
          interviewSkills.length * 2
        }, not ${totalQuestions}.
        - Be conversational and natural.
        - Never answer questions yourself - you are the interviewer, not the interviewee.
        - CRITICAL: After evaluating the ${totalQuestions}th answer, you MUST call 'signal_interview_complete' tool. Do not ask any more questions after that.
        
        REMEMBER: Start speaking IMMEDIATELY when the session begins. Do not wait. Begin with your greeting and first question right away.`,
        tools: [
          tool({
            name: "evaluate_answer",
            description:
              "Evaluate the user's answer to an interview question. Call this ONLY when the user provides an actual answer.",
            parameters: z.object({
              question: z.string().describe("The question that was asked"),
              answer: z.string().describe("The user's answer"),
              score: z.number().min(1).max(10).describe("Score from 1-10"),
              feedback: z.string().describe("Detailed feedback on the answer"),
            }),
            strict: true,
            execute: async ({ question, answer, score, feedback }) => {
              console.log("[Tool] evaluate_answer called:", {
                question: question?.substring(0, 50) + "...",
                answer: answer?.substring(0, 50) + "...",
                score,
                feedback: feedback?.substring(0, 50) + "...",
                sessionId: sessionIdRef.current,
              });

              // Mark that evaluation is in progress - next assistant message should be filtered
              evaluationInProgressRef.current = true;

              if (sessionIdRef.current) {
                try {
                  console.log("[Tool] Calling backend to log evaluation...");
                  const result = await realtimeInterviewService.logEvaluation(
                    sessionIdRef.current,
                    question,
                    answer,
                    score,
                    feedback
                  );
                  console.log("[Tool] Evaluation logged successfully:", result);

                  // Update questions answered count
                  setQuestionsAnswered((prev) => {
                    const newCount = Math.min(
                      prev + 1,
                      skillsRef.current.length * 2
                    );
                    const totalQuestions = skillsRef.current.length * 2;
                    console.log(
                      `[Tool] Updating questionsAnswered: ${prev} -> ${newCount} (total: ${totalQuestions})`
                    );
                    if (newCount >= totalQuestions) {
                      console.log(
                        "[Tool] All questions answered, enabling end interview"
                      );
                      setCanEndInterview(true);
                    }
                    return newCount;
                  });

                  // Mark evaluation as complete - messages within next 3 seconds are likely evaluation-related
                  setTimeout(() => {
                    evaluationInProgressRef.current = false;
                    lastEvaluationTimeRef.current = Date.now();
                  }, 3000);

                  return { success: true, message: "Evaluation saved" };
                } catch (err) {
                  console.error("[Tool] Failed to log evaluation:", err);
                  return {
                    success: false,
                    error: err.message || "Failed to save evaluation",
                  };
                }
              } else {
                console.warn(
                  "[Tool] No sessionId available, cannot log evaluation"
                );
                return {
                  success: false,
                  error: "No active session",
                };
              }
            },
          }),
          tool({
            name: "signal_interview_complete",
            description: `Signal that the interview is complete. Call this IMMEDIATELY after evaluating the final (${totalQuestions}th) answer. Do not call this before all questions are answered.`,
            parameters: z.object({}),
            strict: true,
            execute: async () => {
              console.log("[Tool] signal_interview_complete called");

              if (sessionIdRef.current) {
                try {
                  console.log("[Tool] Completing interview session...");
                  await realtimeInterviewService.completeSession(
                    sessionIdRef.current
                  );
                  console.log(
                    "[Tool] Interview session completed successfully"
                  );

                  setCanEndInterview(true);
                  setStatus("idle");

                  return {
                    success: true,
                    message: "Interview completed successfully",
                  };
                } catch (err) {
                  console.error("[Tool] Failed to complete interview:", err);
                  return {
                    success: false,
                    error: err.message || "Failed to complete interview",
                  };
                }
              } else {
                console.warn(
                  "[Tool] No sessionId available, cannot complete interview"
                );
                return {
                  success: false,
                  error: "No active session",
                };
              }
            },
          }),
        ],
      });

      agentRef.current = agent;
      const realtimeSession = new RealtimeSession(agent, {
        model: "gpt-realtime-mini-2025-10-06",
      });

      sessionRef.current = realtimeSession;

      // Set up event listeners with debugging and fallbacks
      const transport = realtimeSession.transport;
      if (transport) {
        // Primary event listener for transcript deltas - CORRECT EVENT NAME
        // This event is for ASSISTANT speech only (has responseId)
        transport.on("audio_transcript_delta", (event) => {
          console.log("[Transport] audio_transcript_delta event:", event);
          const { delta, responseId, itemId } = event;

          if (delta && responseId) {
            // This is assistant speech (has responseId)
            const role = "assistant";

            // Check if this is a new response (different responseId or itemId)
            const isNewMessage =
              responseId !== currentResponseIdRef.current ||
              itemId !== currentItemIdRef.current;

            if (isNewMessage) {
              currentResponseIdRef.current = responseId;
              currentItemIdRef.current = itemId;
              console.log(
                "[Transport] New assistant message started:",
                responseId
              );
            }

            console.log(
              `[Transport] Received delta for ${role}:`,
              delta.substring(0, 50),
              `responseId: ${responseId}, itemId: ${itemId}`
            );

            // Update live speech display (only for current speaking)
            setLiveAssistantSpeech((prev) => {
              // If new message, start fresh (clear previous)
              if (isNewMessage) {
                console.log(
                  "[Transport] Starting new liveAssistantSpeech:",
                  delta.substring(0, 50)
                );
                return delta;
              } else {
                // Continue existing message
                const updated = prev + delta;
                console.log(
                  "[Transport] Updated liveAssistantSpeech:",
                  updated.substring(0, 50)
                );
                return updated;
              }
            });

            // Update transcript - filter evaluation messages
            setTranscript((prev) => {
              const lastMessage = prev[prev.length - 1];
              let newText;

              // If new message or different role, start fresh
              if (
                isNewMessage ||
                !lastMessage ||
                lastMessage.role !== role ||
                lastMessage.final
              ) {
                newText = delta;
              } else {
                // Continue existing message
                newText = lastMessage.text + delta;
              }

              // Filter out assistant messages that come right after evaluation
              if (role === "assistant" && evaluationInProgressRef.current) {
                const evaluationKeywords = [
                  "score",
                  "feedback",
                  "evaluate",
                  "I'm going to evaluate",
                  "I will now evaluate",
                  "I will evaluate",
                  "Thank you for your response. I'm going to evaluate",
                  "Thank you. I will now evaluate",
                ];
                const containsEvaluation = evaluationKeywords.some((keyword) =>
                  newText.toLowerCase().includes(keyword.toLowerCase())
                );

                if (containsEvaluation) {
                  console.log(
                    "[Transport] Filtered evaluation message:",
                    newText.substring(0, 50)
                  );
                  return prev; // Don't add evaluation messages to transcript
                }
              }

              // If new message, add it
              if (
                isNewMessage ||
                !lastMessage ||
                lastMessage.role !== role ||
                lastMessage.final
              ) {
                return [
                  ...prev,
                  {
                    role,
                    text: newText,
                    final: false,
                    responseId, // Store responseId to track message boundaries
                    itemId, // Store itemId to track message boundaries
                  },
                ];
              } else {
                // Update existing message
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastMessage,
                    text: newText,
                  },
                ];
              }
            });
          } else if (delta && !responseId) {
            // This might be user speech coming through audio_transcript_delta
            // Handle it as user speech
            console.log(
              "[Transport] audio_transcript_delta without responseId (user speech?):",
              event
            );
            // User speech should come through input_audio_buffer.transcript.delta
            // But we'll log it for debugging
          } else {
            console.warn(
              "[Transport] audio_transcript_delta event missing delta:",
              event
            );
          }
        });

        // Listen for user input audio transcription events
        // User speech comes through input_audio_buffer events
        transport.on("input_audio_buffer.transcript.delta", (event) => {
          console.log(
            "[Transport] input_audio_buffer.transcript.delta event:",
            event
          );
          if (event.delta) {
            // Update live user speech
            setLiveUserSpeech((prev) => {
              const updated = prev + event.delta;
              console.log(
                "[Transport] Updated liveUserSpeech from input:",
                updated.substring(0, 50)
              );
              return updated;
            });

            // Also add to transcript
            setTranscript((prev) => {
              const lastMessage = prev[prev.length - 1];
              const role = "user";

              // Check if we need a new message (different from last or last was assistant)
              if (
                !lastMessage ||
                lastMessage.role !== role ||
                lastMessage.final
              ) {
                return [
                  ...prev,
                  {
                    role,
                    text: event.delta,
                    final: false,
                  },
                ];
              } else {
                // Continue existing user message
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastMessage,
                    text: lastMessage.text + event.delta,
                  },
                ];
              }
            });
          }
        });

        // Listen for user speech started to clear previous speech and start new message
        transport.on("input_audio_buffer.speech_started", () => {
          console.log("[Transport] User speech started");
          setLiveUserSpeech("");
        });

        // Listen for user speech completed to finalize message
        transport.on("input_audio_buffer.speech_stopped", () => {
          console.log("[Transport] User speech stopped");
          setTranscript((prev) => {
            if (prev.length > 0) {
              const last = prev[prev.length - 1];
              if (last.role === "user" && !last.final) {
                return [...prev.slice(0, -1), { ...last, final: true }];
              }
            }
            return prev;
          });
          // Clear live speech after a short delay
          setTimeout(() => {
            setLiveUserSpeech("");
          }, 500);
        });

        // Listen to all events for debugging
        transport.on("*", (eventName, event) => {
          if (
            typeof eventName === "string" &&
            (eventName.includes("text") ||
              eventName.includes("transcript") ||
              eventName.includes("delta"))
          ) {
            console.log(`[Transport] Event: ${eventName}`, event);
          }
        });

        transport.on("response_started", () => {
          console.log(
            "[Transport] Response started - new assistant message beginning"
          );
          setCurrentQuestion(null);
          setLiveAssistantSpeech(""); // Clear previous live speech
          // Reset response tracking for new message
          currentResponseIdRef.current = null;
          currentItemIdRef.current = null;
        });

        transport.on("response_completed", () => {
          console.log("[Transport] Response completed");
          setLiveAssistantSpeech(""); // Clear live speech when response completes - prevent duplication
          setTranscript((prev) => {
            if (prev.length > 0) {
              const last = prev[prev.length - 1];
              if (last.role === "assistant" && !last.final) {
                const updated = [
                  ...prev.slice(0, -1),
                  { ...last, final: true },
                ];
                setCurrentQuestion(last.text);
                console.log(
                  "[Transport] Updated current question:",
                  last.text.substring(0, 50)
                );
                return updated;
              }
            }
            return prev;
          });
        });

        transport.on("user_speech_started", () => {
          console.log("[Transport] User speech started");
          setStatus("listening");
          setLiveUserSpeech(""); // Clear previous live speech when new speech starts
        });

        transport.on("user_speech_stopped", () => {
          console.log("[Transport] User speech stopped");
          setStatus("active");
          setLiveUserSpeech(""); // Clear live speech when user stops speaking
        });

        transport.on("response_audio_started", () => {
          setStatus("speaking");
        });

        transport.on("response_audio_stopped", () => {
          setStatus("active");
        });

        transport.on("error", (err) => {
          console.error("[Transport] Transport error:", err);
          const errorMessage =
            err.message || err.error?.message || "An error occurred";

          // Handle microphone permission errors
          if (
            errorMessage.includes("Permission denied") ||
            errorMessage.includes("NotAllowedError")
          ) {
            setError(
              "Microphone permission denied. Please allow microphone access and try again."
            );
          } else {
            setError(errorMessage);
          }
          setStatus("error");
        });
      }

      realtimeSession.on("error", (err) => {
        console.error("Realtime session error:", err);
        const errorMessage =
          err.message || err.error?.message || "An error occurred";

        // Handle microphone permission errors
        if (
          errorMessage.includes("Permission denied") ||
          errorMessage.includes("NotAllowedError")
        ) {
          setError(
            "Microphone permission denied. Please allow microphone access and try again."
          );
        } else {
          setError(errorMessage);
        }
        setStatus("error");
      });

      // Connect to realtime session
      await realtimeSession.connect({ apiKey: client_secret });
      setStatus("active");

      // Listen for session ready event and trigger agent to start
      realtimeSession.on("session_updated", (event) => {
        console.log("[Interview] Session updated:", event);
        if (event.session?.status === "ready") {
          console.log(
            "[Interview] Session is ready, agent should start speaking..."
          );
        }
      });

      // Also listen on transport for session updates and response events
      if (transport) {
        transport.on("session_updated", (event) => {
          console.log("[Transport] Session updated:", event);
        });

        // Note: response_started is already handled above in the transport event listeners
      }

      // Log that everything is set up
      console.log(
        "[Interview] All event listeners set up. Agent should start speaking based on instructions."
      );
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
      setQuestionsAnswered(0);
      setCanEndInterview(false);
      setLiveUserSpeech("");
      setLiveAssistantSpeech("");
      skillsRef.current = [];
      setSkills([]);
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
    skills,
    questionsAnswered,
    canEndInterview,
    totalQuestions: skills.length * 2,
    liveUserSpeech,
    liveAssistantSpeech,
    startInterview,
    stopInterview,
  };
}
