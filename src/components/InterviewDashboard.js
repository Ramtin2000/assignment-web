import React, { useState, useEffect } from "react";
import { realtimeInterviewService } from "../services/api.service";
import { Button } from "./ui/Button";
import { Loading } from "./ui/Loading";
import { Error } from "./ui/Error";

const getScoreColor = (score) => {
  if (score >= 8) return "text-success";
  if (score >= 5) return "text-warning";
  return "text-danger";
};

const getStatusBadgeClasses = (status) => {
  const base =
    "inline-flex items-center px-sm py-xs rounded-full text-sm font-medium";
  if (status === "completed") {
    return `${base} bg-success/20 text-success`;
  }
  return `${base} bg-primary/20 text-primary`;
};

export default function InterviewDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await realtimeInterviewService.getAllSessions();
      setSessions(data);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setError(err.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const totalQAs = sessions.reduce(
    (sum, session) => sum + (session.qas?.length || 0),
    0
  );
  const averageScore =
    sessions.reduce((sum, session) => {
      const sessionScores =
        session.qas
          ?.map((qa) => qa.evaluation?.score)
          .filter((score) => score !== undefined) || [];
      const sessionAvg =
        sessionScores.length > 0
          ? sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length
          : 0;
      return sum + sessionAvg;
    }, 0) / (sessions.length || 1);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto p-lg">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto p-lg">
        <Error message={error} />
        <Button onClick={loadSessions} variant="primary" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-lg">
      <div className="flex justify-between items-center mb-lg pb-md border-b-2 border-gray-200">
        <h1 className="text-3xl font-semibold text-gray-900 m-0">
          Interview Sessions Dashboard
        </h1>
        <Button onClick={loadSessions} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <div className="flex gap-lg mb-lg p-md bg-gray-50 rounded-md">
        <div className="flex flex-col gap-xs">
          <div className="text-4xl font-semibold text-primary">
            {sessions.length}
          </div>
          <div className="text-sm text-gray-600 uppercase tracking-wider">
            Total Sessions
          </div>
        </div>
        <div className="flex flex-col gap-xs">
          <div className="text-4xl font-semibold text-primary">{totalQAs}</div>
          <div className="text-sm text-gray-600 uppercase tracking-wider">
            Total Q&As
          </div>
        </div>
        <div className="flex flex-col gap-xs">
          <div className="text-4xl font-semibold text-primary">
            {averageScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 uppercase tracking-wider">
            Average Score
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center p-xl text-gray-500">
          <p>No interview sessions found.</p>
          <p>Start an interview to see results here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-lg">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-lg p-lg shadow-md transition-all duration-normal flex flex-col gap-md"
            >
              <div className="flex justify-between items-center pb-sm border-b border-gray-200">
                <div className="flex flex-col gap-xs">
                  <div className="text-sm font-mono text-gray-600">
                    Session: {session.id.substring(0, 8)}...
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(session.createdAt)}
                  </div>
                </div>
                <span className={getStatusBadgeClasses(session.status)}>
                  {session.status}
                </span>
              </div>

              <div className="flex flex-col gap-md">
                <div className="text-base font-semibold text-gray-700">
                  Q&As ({session.qas?.length || 0})
                </div>
                {session.qas && session.qas.length > 0 ? (
                  session.qas.map((qa) => (
                    <div
                      key={qa.id}
                      className="p-md bg-gray-50 rounded-md border-l-4 border-primary"
                    >
                      <div className="font-semibold text-gray-900 mb-2">
                        <span className="text-primary">Q:</span> {qa.question}
                      </div>
                      <div className="bg-white p-3 rounded border border-gray-200 mb-3">
                        <div className="text-sm font-medium text-gray-600 mb-1">
                          Your Answer:
                        </div>
                        <div className="text-gray-900">
                          {qa.answer || "No answer provided"}
                        </div>
                      </div>
                      {qa.evaluation && (
                        <div className="flex flex-col gap-xs pt-sm border-t border-gray-200">
                          <div
                            className={`font-semibold ${getScoreColor(
                              qa.evaluation.score
                            )}`}
                          >
                            Score: {qa.evaluation.score}/10
                          </div>
                          {qa.evaluation.feedback && (
                            <div className="text-gray-600 text-sm">
                              {qa.evaluation.feedback}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    No Q&As recorded for this session yet.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
