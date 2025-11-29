import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import { useRealtimeInterview } from "../hooks/useRealtimeInterview";
import { Button } from "./ui/Button";
import { Card } from "../lib/styled";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.lg};
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.lg};
  padding-bottom: ${(props) => props.theme.spacing.md};
  border-bottom: 2px solid ${(props) => props.theme.colors.gray[200]};
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.gray[900]};
  margin: 0;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  padding: ${(props) => props.theme.spacing.xs}
    ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: 0.875rem;
  font-weight: 500;
  background: ${(props) => {
    switch (props.status) {
      case "active":
      case "listening":
        return props.theme.colors.success + "20";
      case "speaking":
        return props.theme.colors.primary + "20";
      case "connecting":
        return props.theme.colors.warning + "20";
      case "error":
        return props.theme.colors.danger + "20";
      default:
        return props.theme.colors.gray[200];
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case "active":
      case "listening":
        return props.theme.colors.success;
      case "speaking":
        return props.theme.colors.primary;
      case "connecting":
        return props.theme.colors.warning;
      case "error":
        return props.theme.colors.danger;
      default:
        return props.theme.colors.gray[600];
    }
  }};
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: ${(props) =>
    props.status === "active" ||
    props.status === "listening" ||
    props.status === "speaking"
      ? "pulse 2s infinite"
      : "none"};

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
  overflow: hidden;
`;

const QuestionCard = styled(Card)`
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary}15 0%,
    ${(props) => props.theme.colors.primary}05 100%
  );
  border: 2px solid ${(props) => props.theme.colors.primary}30;
`;

const QuestionLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.primary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${(props) => props.theme.spacing.sm};
`;

const QuestionText = styled.div`
  font-size: 1.25rem;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.gray[900]};
  min-height: 60px;
`;

const TranscriptCard = styled(Card)`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TranscriptHeader = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.gray[700]};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${(props) => props.theme.spacing.md};
  padding-bottom: ${(props) => props.theme.spacing.sm};
  border-bottom: 1px solid ${(props) => props.theme.colors.gray[200]};
`;

const TranscriptContent = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
  padding-right: ${(props) => props.theme.spacing.sm};

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${(props) => props.theme.colors.gray[100]};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.gray[300]};
    border-radius: 4px;

    &:hover {
      background: ${(props) => props.theme.colors.gray[400]};
    }
  }
`;

const MessageBubble = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) =>
    props.role === "user" ? "flex-end" : "flex-start"};
  gap: ${(props) => props.theme.spacing.xs};
`;

const MessageContent = styled.div`
  max-width: 75%;
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  background: ${(props) =>
    props.role === "user"
      ? props.theme.colors.primary
      : props.theme.colors.gray[100]};
  color: ${(props) =>
    props.role === "user"
      ? props.theme.colors.white
      : props.theme.colors.gray[900]};
  line-height: 1.6;
  word-wrap: break-word;
`;

const MessageRole = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${(props) => props.theme.colors.gray[500]};
  text-transform: capitalize;
`;

const Controls = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  justify-content: center;
  padding-top: ${(props) => props.theme.spacing.lg};
  border-top: 2px solid ${(props) => props.theme.colors.gray[200]};
`;

const ErrorMessage = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.danger}20;
  color: ${(props) => props.theme.colors.danger};
  border-radius: ${(props) => props.theme.borderRadius.md};
  border: 1px solid ${(props) => props.theme.colors.danger}40;
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.colors.gray[500]};
  font-size: 1.125rem;
  text-align: center;
`;

export default function RealtimeInterview() {
  const {
    status,
    transcript,
    currentQuestion,
    error,
    startInterview,
    stopInterview,
  } = useRealtimeInterview();

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
    <Container>
      <Header>
        <Title>Real-time Interview</Title>
        <StatusBadge status={status}>
          <StatusDot status={status} />
          {getStatusText()}
        </StatusBadge>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <MainContent>
        {currentQuestion && (
          <QuestionCard>
            <QuestionLabel>Current Question</QuestionLabel>
            <QuestionText>{currentQuestion}</QuestionText>
          </QuestionCard>
        )}

        <TranscriptCard>
          <TranscriptHeader>Conversation Transcript</TranscriptHeader>
          <TranscriptContent>
            {transcript.length === 0 ? (
              <EmptyState>
                {status === "idle"
                  ? 'Click "Start Interview" to begin'
                  : "Waiting for conversation..."}
              </EmptyState>
            ) : (
              transcript.map((message, index) => (
                <MessageBubble key={index} role={message.role}>
                  <MessageRole>{message.role}</MessageRole>
                  <MessageContent role={message.role}>
                    {message.text}
                  </MessageContent>
                </MessageBubble>
              ))
            )}
            <div ref={transcriptEndRef} />
          </TranscriptContent>
        </TranscriptCard>
      </MainContent>

      <Controls>
        {status === "idle" ? (
          <Button
            variant="primary"
            size="lg"
            onClick={startInterview}
            disabled={status === "connecting"}
          >
            Start Interview
          </Button>
        ) : (
          <Button
            variant="danger"
            size="lg"
            onClick={stopInterview}
            disabled={status === "connecting"}
          >
            End Interview
          </Button>
        )}
      </Controls>
    </Container>
  );
}
