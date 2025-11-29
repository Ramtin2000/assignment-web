import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";

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
  const utteranceRef = useRef(null);

  // Reset when question changes
  useEffect(() => {
    if (question?.text || question?.content) {
      const fullText = question.text || question.content;
      wordsRef.current = fullText.split(/(\s+)/);
      setDisplayedText("");
      setCurrentWordIndex(0);
      setIsSpeaking(false);
    }
  }, [question?.text, question?.content]);

  // TTS sync: Display words as they're spoken
  useEffect(() => {
    if (!isReading || !wordsRef.current.length) {
      if (!isReading) {
        // Reset when not reading
        setDisplayedText("");
        setCurrentWordIndex(0);
        setIsSpeaking(false);
      }
      return;
    }

    setIsSpeaking(true);
    setDisplayedText("");
    setCurrentWordIndex(0);

    // Progressive word display with timing estimation
    // Estimate: ~150 words per minute = ~400ms per word average
    // Adjust based on actual word length for better accuracy
    let wordIndex = 0;
    const startTime = Date.now();

    const displayNextWord = () => {
      if (wordIndex < wordsRef.current.length) {
        const word = wordsRef.current[wordIndex];
        // Estimate timing: base 300ms + 50ms per character (up to 800ms max)
        const wordTime = Math.min(300 + word.length * 50, 800);
        const elapsed = Date.now() - startTime;
        const expectedTime =
          wordIndex === 0
            ? 0
            : wordsRef.current
                .slice(0, wordIndex)
                .reduce(
                  (sum, w) => sum + Math.min(300 + w.length * 50, 800),
                  0
                );

        if (elapsed >= expectedTime) {
          setCurrentWordIndex(wordIndex + 1);
          setDisplayedText(wordsRef.current.slice(0, wordIndex + 1).join(""));
          wordIndex++;

          // Schedule next word
          const nextWordTime = Math.min(300 + word.length * 50, 800);
          setTimeout(
            displayNextWord,
            Math.max(0, nextWordTime - (Date.now() - startTime - expectedTime))
          );
        } else {
          // Check again soon
          setTimeout(displayNextWord, 50);
        }
      } else {
        // All words displayed
        setDisplayedText(wordsRef.current.join(""));
        setCurrentWordIndex(wordsRef.current.length);
        setIsSpeaking(false);
      }
    };

    // Start displaying words
    displayNextWord();

    // Fallback: ensure all text is shown after reasonable time (safety net)
    const fallbackTimeout = setTimeout(() => {
      setDisplayedText(wordsRef.current.join(""));
      setCurrentWordIndex(wordsRef.current.length);
      setIsSpeaking(false);
    }, wordsRef.current.length * 500); // Max 500ms per word

    return () => {
      clearTimeout(fallbackTimeout);
      setIsSpeaking(false);
    };
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
