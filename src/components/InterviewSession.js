import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInterview } from "../hooks/useInterview";
import { useAudioCapture } from "../hooks/useAudioCapture";
import { useAuth } from "../context/AuthContext";
import QuestionDisplay from "./QuestionDisplay";
import TranscriptDisplay from "./TranscriptDisplay";
import ttsService from "../services/tts-webrtc.service";
import {
  DashboardContainer,
  DashboardContent,
  DashboardCard,
  CardBody,
  Error,
} from "./ui";
import { Button } from "./ui";
import styled from "styled-components";
import { motion } from "framer-motion";

const SessionHeader = styled(DashboardCard)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const SessionTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.gray[900]};
  margin: 0 0 ${(props) => props.theme.spacing.xs} 0;
`;

const SessionId = styled.p`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.gray[500]};
  margin: 0;
`;

const QuestionCounter = styled.span`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.gray[500]};
  font-weight: 500;
`;

const TranscriptCard = styled(DashboardCard)`
  min-height: 200px;
  display: flex;
  flex-direction: column;
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const TranscriptTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.gray[900]};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.gray[500]};
  margin-top: ${(props) => props.theme.spacing.md};
`;

const StatusCard = styled(DashboardCard)`
  padding: ${(props) => props.theme.spacing.md};
`;

const StatusText = styled.p`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.gray[500]};
  margin: 0;
`;

const CompleteCard = styled(motion.div)`
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  padding: ${(props) => props.theme.spacing.xxl};
`;

const CompleteTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.success};
  margin: 0 0 ${(props) => props.theme.spacing.lg} 0;
`;

const CompleteText = styled.p`
  font-size: 1.125rem;
  color: ${(props) => props.theme.colors.gray[700]};
  margin: 0 0 ${(props) => props.theme.spacing.xl} 0;
`;

const InfoBox = styled.div`
  background: ${(props) => props.theme.colors.info}15;
  padding: ${(props) => props.theme.spacing.lg};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const InfoTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.info};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
`;

const InfoList = styled.ul`
  text-align: left;
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
  color: ${(props) => props.theme.colors.info};

  li::before {
    content: "•";
    margin-right: ${(props) => props.theme.spacing.sm};
    font-weight: bold;
  }
`;

const InterviewSession = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
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

  const handleTranscriptionResult = useCallback((data) => {
    if (data.isPartial) {
      setTranscript((prev) => prev + data.text);
    }
  }, []);

  const handleTranscriptionComplete = useCallback(async (data) => {
    const finalTranscript = data.text;
    setTranscript(finalTranscript);
    transcriptRef.current = finalTranscript;

    console.log(
      "Transcription complete:",
      finalTranscript,
      "Turn completed:",
      data.turnCompleted
    );

    if (data.turnCompleted) {
      console.log("Turn completed detected, stopping recording...");
      if (stopRecordingRef.current) stopRecordingRef.current();

      setTimeout(async () => {
        if (submitAnswerRef.current) {
          console.log("Submitting answer:", finalTranscript);
          await submitAnswerRef.current(finalTranscript);
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

  useEffect(() => {
    if (!hasStarted && token && interviewId) {
      startInterview();
      setHasStarted(true);
    }
  }, [hasStarted, startInterview, token, interviewId]);

  useEffect(() => {
    if (
      currentQuestion &&
      status === "ready" &&
      !isReadingQuestion &&
      currentQuestion.id !== currentQuestionIdRef.current
    ) {
      currentQuestionIdRef.current = currentQuestion.id;
      hasReadQuestionRef.current = false;

      transcriptRef.current = "";
      setTranscript("");
      if (clearTranscriptionRef.current) clearTranscriptionRef.current();

      const readQuestionAndStartRecording = async () => {
        if (hasReadQuestionRef.current) {
          console.log("Question already read, skipping...");
          return;
        }

        setIsReadingQuestion(true);
        hasReadQuestionRef.current = true;

        try {
          console.log("Reading question with TTS:", currentQuestion.text);
          await ttsService.speakText(currentQuestion.text);
          console.log("TTS completed, starting recording...");

          if (startRecordingRef.current && !isRecordingRef.current) {
            startRecordingRef.current();
          }
        } catch (error) {
          console.error("Error reading question with TTS:", error);
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

  useEffect(() => {
    if (isComplete) {
      if (stopRecordingRef.current) stopRecordingRef.current();
    }
  }, [isComplete]);

  useEffect(() => {
    return () => {
      if (stopRecordingRef.current) {
        stopRecordingRef.current();
      }
    };
  }, []);

  if (error) {
    return (
      <DashboardContainer>
        <DashboardContent>
          <Error title="Error" message={error} />
        </DashboardContent>
      </DashboardContainer>
    );
  }

  if (isComplete) {
    return (
      <DashboardContainer>
        <DashboardContent maxWidth="600px">
          <CompleteCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CompleteTitle>Interview Complete!</CompleteTitle>
            <CompleteText>
              Thank you for completing the interview. Your responses have been
              recorded and will be evaluated.
            </CompleteText>
            <InfoBox>
              <InfoTitle>What happens next?</InfoTitle>
              <InfoList>
                <li>Our AI will analyze your responses</li>
                <li>The hiring team will review your performance</li>
              </InfoList>
            </InfoBox>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/evaluations")}
            >
              View Evaluations
            </Button>
          </CompleteCard>
        </DashboardContent>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardContent maxWidth="1024px">
        <SessionHeader>
          <HeaderInfo>
            <SessionTitle>Technical Interview</SessionTitle>
            <SessionId>Session ID: {sessionId}</SessionId>
          </HeaderInfo>
          <QuestionCounter>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </QuestionCounter>
        </SessionHeader>

        {currentQuestion && (
          <div style={{ marginBottom: "1.5rem" }}>
            <QuestionDisplay
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={totalQuestions}
            />
          </div>
        )}

        <TranscriptCard>
          <TranscriptTitle>Your Answer</TranscriptTitle>
          <CardBody>
            <TranscriptDisplay
              transcript={transcript}
              isListening={isRecording}
            />
          </CardBody>
          <StatusBar>
            <span>
              {isRecording
                ? "Listening..."
                : isReadingQuestion
                ? "Reading question..."
                : "Waiting for audio..."}
            </span>
            <span>VAD: Server-side (Realtime API)</span>
          </StatusBar>
        </TranscriptCard>

        <StatusCard>
          <StatusText>Status: {status}</StatusText>
        </StatusCard>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default InterviewSession;
