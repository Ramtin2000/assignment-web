import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import ttsService from "../services/tts-webrtc.service";

// Word fade-in animation for TTS sync
const fadeInWord = keyframes`
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const QuestionContainer = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(248, 249, 250, 0.9) 100%
  );
  transition: all 0.3s ease;
`;

const QuestionHeader = styled.div`
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const QuestionText = styled.div`
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 10px;
  color: #212529;
`;

const Word = styled.span`
  display: inline;
  animation: ${fadeInWord} 0.4s ease-out;
  transition: opacity 0.2s ease;

  ${(props) =>
    props.isSpeaking &&
    css`
      background: linear-gradient(
        120deg,
        rgba(0, 123, 255, 0.15) 0%,
        rgba(111, 66, 193, 0.15) 100%
      );
      padding: 2px 4px;
      border-radius: 3px;
      font-weight: 500;
    `}
`;

const QuestionDisplay = ({
  question,
  questionNumber,
  totalQuestions,
  isReading = false,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const wordsRef = useRef([]);
  const animationTimerRef = useRef(null);
  const ttsStartTimeRef = useRef(null);
  const wordTimingsRef = useRef([]);
  const currentQuestionIdRef = useRef(null);
  const currentQuestionTextRef = useRef(null);
  const isReadingRef = useRef(false);

  // Reset when question changes
  useEffect(() => {
    if (question?.text || question?.content) {
      const fullText = question.text || question.content;
      const questionId = question?.id || question?.index || questionNumber;

      // Update question tracking refs
      currentQuestionIdRef.current = questionId;
      currentQuestionTextRef.current = fullText;

      wordsRef.current = fullText.split(/(\s+)/);
      setDisplayedText("");
      setCurrentWordIndex(0);
      setIsSpeaking(false);
      ttsStartTimeRef.current = null;
      wordTimingsRef.current = [];

      // Clear any pending animation timers
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }

      // Calculate word timings based on character count
      // Speech rate: ~150 words/min = ~400ms/word average
      // Adjust for word length: base 200ms + ~30ms per character
      const words = wordsRef.current;
      let cumulativeTime = 0;
      wordTimingsRef.current = words.map((word) => {
        const trimmedWord = word.trim();
        // Calculate duration: base 200ms + ~30ms per character (for non-whitespace words)
        const wordTime =
          trimmedWord.length > 0
            ? Math.min(200 + trimmedWord.length * 30, 1200) // Cap at 1.2s per word
            : 0; // Whitespace has no duration
        const startTime = cumulativeTime;
        cumulativeTime += wordTime;

        return {
          word,
          duration: wordTime,
          startTime: startTime,
          endTime: cumulativeTime,
        };
      });
    }
  }, [
    question?.text,
    question?.content,
    question?.id,
    question?.index,
    questionNumber,
  ]);

  // Update isReading ref when prop changes
  useEffect(() => {
    isReadingRef.current = isReading;
  }, [isReading]);

  // Listen to TTS events and sync animation - ALWAYS active listeners
  useEffect(() => {
    const handleTTSStarted = (data) => {
      // Check if we should respond to this TTS event
      const ttsText = data?.text || "";
      const currentText = currentQuestionTextRef.current || "";

      // Match TTS text with current question text to ensure we're responding to the right question
      // Allow for minor differences (whitespace, etc.)
      const normalizeText = (text) => text.trim().replace(/\s+/g, " ");
      const ttsTextNormalized = normalizeText(ttsText);
      const currentTextNormalized = normalizeText(currentText);

      // First check: Do we have basic requirements (words array populated)?
      if (!wordsRef.current.length) {
        console.log("Not ready for animation - missing words:", {
          wordsLength: wordsRef.current.length,
        });
        return;
      }

      // Second check: Verify this TTS event is for the current question
      // Use text matching if we have both, otherwise allow if we have words and TTS text
      if (currentTextNormalized && ttsTextNormalized) {
        // We have both texts - they must match
        if (ttsTextNormalized !== currentTextNormalized) {
          console.log(
            "TTS event text doesn't match current question, ignoring",
            {
              ttsText: ttsTextNormalized.substring(0, 50) + "...",
              currentText: currentTextNormalized.substring(0, 50) + "...",
            }
          );
          return;
        }
      } else if (!currentTextNormalized && ttsTextNormalized) {
        // We have TTS text but not current question text yet
        // This can happen when question just changed - try to match against words we have
        const wordsText = wordsRef.current.join("").trim();
        const wordsTextNormalized = normalizeText(wordsText);

        if (wordsTextNormalized && ttsTextNormalized !== wordsTextNormalized) {
          console.log(
            "TTS text doesn't match words we have, waiting for question text"
          );
          // Still proceed - it might be a timing issue
        }
      }

      // Store the actual TTS start time
      ttsStartTimeRef.current = data.startTime || Date.now();

      // Reset display
      setDisplayedText("");
      setCurrentWordIndex(0);
      setIsSpeaking(true);

      // Clear any existing animation timer
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }

      // Start the synchronized word display animation
      let wordIndex = 0;

      const displayNextWord = () => {
        // Check if question has changed during animation
        const stillCurrent =
          currentQuestionTextRef.current === normalizeText(ttsText);
        if (!stillCurrent) {
          console.log("Question changed during animation, stopping");
          return;
        }

        if (
          !ttsStartTimeRef.current ||
          wordIndex >= wordTimingsRef.current.length
        ) {
          // All words displayed or TTS not started
          if (wordIndex >= wordTimingsRef.current.length) {
            setDisplayedText(wordsRef.current.join(""));
            setCurrentWordIndex(wordsRef.current.length);
            setIsSpeaking(false);
          }
          return;
        }

        const currentTime = Date.now();
        const elapsed = currentTime - ttsStartTimeRef.current;

        // Catch up: find the current word that should be displayed
        while (wordIndex < wordTimingsRef.current.length) {
          const wordTiming = wordTimingsRef.current[wordIndex];

          if (elapsed >= wordTiming.startTime) {
            // This word should be displayed
            wordIndex++;
            setCurrentWordIndex(wordIndex);
            setDisplayedText(wordsRef.current.slice(0, wordIndex).join(""));
          } else {
            // Reached a word that hasn't been spoken yet
            break;
          }
        }

        // Check if all words are displayed
        if (wordIndex >= wordTimingsRef.current.length) {
          setDisplayedText(wordsRef.current.join(""));
          setCurrentWordIndex(wordsRef.current.length);
          setIsSpeaking(false);
          return;
        }

        // Schedule next check
        const nextWordTiming = wordTimingsRef.current[wordIndex];
        const delay = Math.max(
          10,
          Math.min(50, nextWordTiming.startTime - elapsed)
        );
        animationTimerRef.current = setTimeout(displayNextWord, delay);
      };

      // Start animation immediately
      displayNextWord();
    };

    const handleTTSCompleted = () => {
      // Only complete animation if we're still on the same question
      if (!currentQuestionTextRef.current) return;

      // Ensure all text is displayed when TTS completes
      setDisplayedText(wordsRef.current.join(""));
      setCurrentWordIndex(wordsRef.current.length);
      setIsSpeaking(false);

      // Clear any pending timers
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    };

    // Register event listeners - these are always active
    ttsService.on("tts-started", handleTTSStarted);
    ttsService.on("tts-completed", handleTTSCompleted);

    return () => {
      ttsService.off("tts-started", handleTTSStarted);
      ttsService.off("tts-completed", handleTTSCompleted);

      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    };
  }, []); // Empty dependency array - listeners are always active

  // Reset when not reading - but preserve question text display
  useEffect(() => {
    if (!isReading) {
      // Don't reset displayedText if we have question content - keep it visible
      // Only reset animation state
      setIsSpeaking(false);
      ttsStartTimeRef.current = null;

      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    }
  }, [isReading]);

  if (!question) {
    return <div>Loading question...</div>;
  }

  const fullText = question.text || question.content;
  const words = displayedText ? displayedText.split(/(\s+)/) : [];

  return (
    <QuestionContainer>
      <QuestionHeader>
        Question {questionNumber} of {totalQuestions}
      </QuestionHeader>
      <QuestionText>
        {isReading && words.length > 0
          ? words.map((word, index) => (
              <Word
                key={index}
                isSpeaking={index === words.length - 1 && isSpeaking}
              >
                {word}
              </Word>
            ))
          : fullText}
      </QuestionText>
    </QuestionContainer>
  );
};

export default QuestionDisplay;
