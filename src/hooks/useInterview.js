import { useState, useCallback } from "react";
import { interviewService } from "../services/api.service";

export const useInterview = (interviewId) => {
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, starting, ready, recording, processing, complete

  const startInterview = useCallback(async () => {
    if (!interviewId || interviewId === "undefined" || interviewId === "null") {
      console.error("Invalid interviewId in startInterview:", interviewId);
      setError("Interview ID is required");
      return;
    }
    setStatus("starting");
    setError(null);
    try {
      console.log("useInterview: Starting interview with ID:", interviewId);
      const data = await interviewService.startInterviewSession(interviewId);

      setCurrentQuestion({
        id: data.questionId || `question-${data.questionIndex}`,
        content: data.questionText,
        text: data.questionText,
        index: data.questionIndex,
        difficulty: data.difficulty || "intermediate",
        skill: data.skill || "general",
      });
      setCurrentQuestionIndex(data.questionIndex);
      setIsLastQuestion(data.questionIndex === data.totalQuestions - 1);
      setTotalQuestions(data.totalQuestions || 0);
      setSessionId(data.sessionId);
      setStatus("ready");
    } catch (error) {
      console.error("useInterview: Error starting interview:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to start interview"
      );
      setStatus("idle");
    }
  }, [interviewId]);

  const completeInterview = useCallback(async () => {
    if (!sessionId) {
      setError("Session ID is required");
      return;
    }
    try {
      const data = await interviewService.completeInterviewSession(sessionId);
      setEvaluations(data.evaluations || []);
      setStatus("complete");
      setIsComplete(true);
    } catch (error) {
      console.error("Error completing interview:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to complete interview"
      );
    }
  }, [sessionId]);

  const nextQuestion = useCallback(async () => {
    if (!sessionId) {
      setError("Session ID is required");
      return;
    }
    setStatus("processing");
    try {
      const data = await interviewService.getNextQuestion(sessionId);

      if (data.questionText === null) {
        // No more questions - automatically submit for evaluation
        setStatus("complete");
        setIsComplete(true);
        setIsLastQuestion(true);

        // Automatically submit for evaluation when complete
        setTimeout(async () => {
          try {
            await completeInterview();
          } catch (error) {
            console.error("Error completing interview:", error);
          }
        }, 1000);
        return;
      }

      setCurrentQuestion({
        id: data.questionId || `question-${data.questionIndex}`,
        content: data.questionText,
        text: data.questionText,
        index: data.questionIndex,
        difficulty: data.difficulty || "intermediate",
        skill: data.skill || "general",
      });
      setCurrentQuestionIndex(data.questionIndex);
      setIsLastQuestion(data.isLastQuestion || false);
      setTotalQuestions(data.totalQuestions || 0);
      setStatus("ready");
    } catch (error) {
      console.error("Error getting next question:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to get next question"
      );
      setStatus("ready");
    }
  }, [sessionId, completeInterview]);

  const submitAnswer = useCallback(
    async (transcription) => {
      if (!sessionId || !transcription) {
        setError("Session ID and transcription are required");
        return;
      }
      setStatus("processing");
      try {
        const questionId =
          currentQuestion?.id || `question-${currentQuestionIndex}`;
        await interviewService.submitAnswer(
          sessionId,
          questionId,
          currentQuestionIndex,
          transcription
        );
        setAnswers((prev) => [
          ...prev,
          {
            questionIndex: currentQuestionIndex,
            transcription,
          },
        ]);

        // Automatically advance to next question after successful submission
        // Wait a moment for the answer to be processed
        setTimeout(async () => {
          await nextQuestion();
        }, 500);
      } catch (error) {
        console.error("Error submitting answer:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to submit answer"
        );
        setStatus("ready");
      }
    },
    [sessionId, currentQuestionIndex, currentQuestion, nextQuestion]
  );

  return {
    sessionId,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    isLastQuestion,
    answers,
    evaluations,
    isComplete,
    error,
    status,
    startInterview,
    submitAnswer,
    nextQuestion,
    completeInterview,
  };
};
