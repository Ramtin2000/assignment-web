import React, { useEffect, useState } from "react";
import { interviewService } from "../services/api.service";

const EvaluationDetail = ({ session, onBack }) => {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnswers();
  }, [session.id]);

  const fetchAnswers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await interviewService.getSessionAnswers(session.id);
      
      // Sort by questionIndex
      const sortedAnswers = data.sort((a, b) => a.questionIndex - b.questionIndex);
      setAnswers(sortedAnswers);
    } catch (err) {
      console.error("Error fetching answers:", err);
      setError("Failed to load session answers");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 6) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading evaluation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="mb-4 text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interview Evaluation Details
          </h1>
          <p className="text-gray-600">
            Completed: {formatDate(session.completedAt)}
          </p>
        </div>

        {/* Overall Score Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Overall Score
              </h2>
              <p className="text-gray-600">
                Based on {session.evaluations?.length || 0} question
                {session.evaluations?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div
              className={`px-6 py-4 rounded-lg text-3xl font-bold ${getScoreBadgeColor(
                session.overallScore || 0
              )} text-white`}
            >
              {session.overallScore
                ? `${session.overallScore.toFixed(1)}/10`
                : "N/A"}
            </div>
          </div>
        </div>

        {/* Summary */}
        {session.summary && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{session.summary}</p>
          </div>
        )}

        {/* Recommendations */}
        {session.recommendations && session.recommendations.length > 0 && (
          <div className="bg-blue-50 rounded-lg shadow-sm p-6 mb-6 border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">
              Recommendations
            </h2>
            <ul className="space-y-2">
              {session.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-blue-800">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Question Evaluations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Question-by-Question Evaluation
          </h2>

          {answers.map((answer, index) => {
            const evaluation = answer.evaluation;
            if (!evaluation) return null;

            return (
              <div
                key={answer.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Question Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Question {answer.questionIndex + 1}
                    </h3>
                    <div
                      className={`px-4 py-2 rounded-lg border-2 font-semibold ${getScoreColor(
                        evaluation.score
                      )}`}
                    >
                      {evaluation.score.toFixed(1)}/10
                    </div>
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed">
                    {answer.questionText}
                  </p>
                </div>

                {/* Your Answer */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Your Answer:
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {answer.transcription || "No answer provided"}
                  </p>
                </div>

                {/* Evaluation Feedback */}
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Feedback:
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {evaluation.feedback}
                    </p>
                  </div>

                  {/* Strengths */}
                  {evaluation.strengths && evaluation.strengths.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-green-700 mb-2">
                        Strengths:
                      </h4>
                      <ul className="space-y-1">
                        {evaluation.strengths.map((strength, idx) => (
                          <li
                            key={idx}
                            className="flex items-start text-green-800"
                          >
                            <span className="text-green-600 mr-2">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {evaluation.weaknesses &&
                    evaluation.weaknesses.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-red-700 mb-2">
                          Areas for Improvement:
                        </h4>
                        <ul className="space-y-1">
                          {evaluation.weaknesses.map((weakness, idx) => (
                            <li
                              key={idx}
                              className="flex items-start text-red-800"
                            >
                              <span className="text-red-600 mr-2">•</span>
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EvaluationDetail;

