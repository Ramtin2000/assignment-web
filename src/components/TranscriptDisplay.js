import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes, css } from "styled-components";

// Animated gradient keyframes (Google AI-style)
const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Pulsing glow animation
const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 123, 255, 0.3),
                0 0 40px rgba(111, 66, 193, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 123, 255, 0.5),
                0 0 60px rgba(111, 66, 193, 0.4);
  }
`;

// Blinking cursor animation
const blink = keyframes`
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
`;

// Word fade-in animation
const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// Status indicator pulse
const statusPulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
`;

const Container = styled.div`
  margin-bottom: 20px;
`;

const Header = styled.div`
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatusIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${(props) => {
    if (props.isRecording) return "#007bff";
    return "#6c757d";
  }};
  transition: color 0.3s ease;
`;

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => {
    if (props.isRecording) return "#007bff";
    return "#6c757d";
  }};
  animation: ${(props) => (props.isRecording ? statusPulse : "none")} 1.5s
    ease-in-out infinite;
  transition: background-color 0.3s ease;
`;

const TranscriptContainer = styled.div`
  position: relative;
  min-height: 100px;
  max-height: 200px;
  overflow-y: auto;
  padding: 15px;
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.6;
  transition: all 0.3s ease;

  /* Base styles */
  border: 1px solid
    ${(props) => (props.isRecording ? "rgba(0, 123, 255, 0.3)" : "#ddd")};
  background-color: ${(props) =>
    props.isRecording ? "rgba(249, 249, 249, 0.95)" : "#f9f9f9"};

  /* Animated gradient background when recording */
  ${(props) =>
    props.isRecording &&
    css`
      background: linear-gradient(
        135deg,
        rgba(0, 123, 255, 0.05) 0%,
        rgba(111, 66, 193, 0.05) 25%,
        rgba(0, 123, 255, 0.05) 50%,
        rgba(111, 66, 193, 0.05) 75%,
        rgba(0, 123, 255, 0.05) 100%
      );
      background-size: 400% 400%;
      animation: ${gradientShift} 8s ease infinite;
    `}

  /* Pulsing glow effect when recording */
  ${(props) =>
    props.isRecording &&
    css`
      animation: ${gradientShift} 8s ease infinite,
        ${pulseGlow} 2s ease-in-out infinite;
    `}
  
  /* Smooth scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 123, 255, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 123, 255, 0.5);
    }
  }
`;

const TranscriptText = styled.div`
  position: relative;
  word-wrap: break-word;
  white-space: pre-wrap;
`;

const Word = styled.span`
  display: inline;
  animation: ${fadeInScale} 0.3s ease-out;
  transition: all 0.2s ease;

  /* Highlight newly added words briefly */
  ${(props) =>
    props.isNew &&
    css`
      background: linear-gradient(
        120deg,
        rgba(0, 123, 255, 0.2) 0%,
        rgba(111, 66, 193, 0.2) 100%
      );
      padding: 2px 4px;
      border-radius: 3px;
      animation: ${fadeInScale} 0.5s ease-out;
    `}
`;

const Cursor = styled.span`
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background-color: ${(props) =>
    props.isRecording ? "#007bff" : "transparent"};
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: ${(props) => (props.isRecording ? blink : "none")} 1s step-end
    infinite;
`;

const Placeholder = styled.span`
  color: #999;
  font-style: italic;
`;

const TranscriptDisplay = ({ transcript, isRecording }) => {
  const transcriptRef = useRef(null);
  const [words, setWords] = useState([]);
  const [newWordIndices, setNewWordIndices] = useState(new Set());

  // Split transcript into words and track new ones
  useEffect(() => {
    if (transcript) {
      const newWords = transcript.split(/(\s+)/);
      setWords((prevWords) => {
        const currentWordCount = prevWords.length;

        if (newWords.length > currentWordCount) {
          // Mark new words
          const newIndices = new Set();
          for (let i = currentWordCount; i < newWords.length; i++) {
            newIndices.add(i);
          }
          setNewWordIndices(newIndices);

          // Clear highlight after animation
          setTimeout(() => {
            setNewWordIndices(new Set());
          }, 500);
        }

        return newWords;
      });
    } else {
      setWords([]);
      setNewWordIndices(new Set());
    }
  }, [transcript]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript, words]);

  return (
    <Container>
      <Header>
        <span>Your Answer:</span>
        <StatusIndicator isRecording={isRecording}>
          <StatusDot isRecording={isRecording} />
          <span>{isRecording ? "Recording..." : "Ready"}</span>
        </StatusIndicator>
      </Header>
      <TranscriptContainer ref={transcriptRef} isRecording={isRecording}>
        <TranscriptText>
          {words.length > 0 ? (
            words.map((word, index) => (
              <Word key={index} isNew={newWordIndices.has(index)}>
                {word}
              </Word>
            ))
          ) : (
            <Placeholder>Your answer will appear here...</Placeholder>
          )}
          {isRecording && transcript && <Cursor isRecording={isRecording} />}
        </TranscriptText>
      </TranscriptContainer>
    </Container>
  );
};

export default TranscriptDisplay;
