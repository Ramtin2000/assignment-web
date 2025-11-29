import React, { useEffect, useState } from "react";
import { interviewService } from "../services/api.service";
import { useNavigate } from "react-router-dom";
import EvaluationDetail from "./EvaluationDetail";

const EvaluationsDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await interviewService.getInterviewSessions();
      
      // Filter only completed sessions with evaluations
      const completedSessions = data.filter(
        (session) => session.status === "completed" && session.evaluations
      );
      
      // Sort by completed date (newest first)
      completedSessions.sort((a, b) => {
        const dateA = new Date(a.completedAt || 0);
        const dateB = new Date(b.completedAt || 0);
        return dateB - dateA;
      });
      
      setSessions(completedSessions);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError(
        err.response?.data?.message || "Failed to load interview evaluations"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = async (sessionId) => {
    try {
      const session = await interviewService.getInterviewSession(sessionId);
      setSelectedSession(session);
    } catch (err) {
      console.error("Error fetching session details:", err);
      setError("Failed to load session details");
    }
  };

  const handleBack = () => {
    setSelectedSession(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600 bg-green-50";
    if (score >= 6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (selectedSession) {
    return (
      <EvaluationDetail session={selectedSession} onBack={handleBack} />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading evaluations...</p>
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
            onClick={fetchSessions}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Interview Evaluations
            </h1>
            <p className="text-gray-600 mb-8">
              You don't have any completed interview evaluations yet.
            </p>
            <button
              onClick={() => navigate("/interviews")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Start an Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interview Evaluations
          </h1>
          <p className="text-gray-600">
            View your completed interview evaluations and detailed feedback
          </p>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSessionClick(session.id)}
            >
              <div className="p-6">
                {/* Score Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBadgeColor(
                      session.overallScore || 0
                    )} text-white`}
                  >
                    {session.overallScore
                      ? `${session.overallScore.toFixed(1)}/10`
                      : "N/A"}
                  </div>
                  <span className="text-xs text-gray-500">
                    {session.evaluations?.length || 0} questions
                  </span>
                </div>

                {/* Session Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Interview Session
                  </h3>
                  <p className="text-sm text-gray-600">
                    Completed: {formatDate(session.completedAt)}
                  </p>
                </div>

                {/* Summary Preview */}
                {session.summary && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {session.summary}
                    </p>
                  </div>
                )}

                {/* View Details Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSessionClick(session.id);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvaluationsDashboard;

