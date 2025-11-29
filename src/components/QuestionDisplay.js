import React from "react";

const QuestionDisplay = ({ question, questionNumber, totalQuestions }) => {
  if (!question) {
    return <div>Loading question...</div>;
  }

  return (
    <div
      style={{
        marginBottom: "30px",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <div style={{ marginBottom: "10px", fontSize: "14px", color: "#666" }}>
        Question {questionNumber} of {totalQuestions}
      </div>
      <div
        style={{ fontSize: "18px", lineHeight: "1.6", marginBottom: "10px" }}
      >
        {question.text || question.content}
      </div>
    </div>
  );
};

export default QuestionDisplay;
