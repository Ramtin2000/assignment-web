import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { realtimeInterviewService } from "../services/api.service";
import { Button } from "./ui/Button";
import {
  DashboardContainer,
  DashboardContent,
  DashboardHeader,
  DashboardTitle,
  DashboardSubtitle,
  DashboardCard,
  DashboardGrid,
  CardHeader,
  CardTitle,
  CardBody,
  EmptyState,
  EmptyStateTitle,
  EmptyStateText,
  LoadingState,
  LoadingSpinner,
  LoadingText,
  ErrorState,
  ErrorCard,
  ErrorTitle,
  ErrorText,
} from "./ui/Dashboard";

const getScoreColor = (score) => {
  if (score >= 8) return "text-success";
  if (score >= 5) return "text-warning";
  return "text-danger";
};

const getScoreBgColor = (score) => {
  if (score >= 8) return "bg-success/20 text-success border-success/30";
  if (score >= 5) return "bg-warning/20 text-warning border-warning/30";
  return "bg-danger/20 text-danger border-danger/30";
};

const getStatusBadgeClasses = (status) => {
  const base =
    "inline-flex items-center px-sm py-xs rounded-full text-sm font-medium";
  if (status === "completed") {
    return `${base} bg-success/20 text-success`;
  }
  return `${base} bg-primary/20 text-primary`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
      <DashboardContainer>
        <DashboardContent>
          <LoadingState>
            <div className="flex flex-col items-center">
              <LoadingSpinner />
              <LoadingText>Loading interview sessions...</LoadingText>
            </div>
          </LoadingState>
        </DashboardContent>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <DashboardContent>
          <ErrorState>
            <ErrorCard>
              <ErrorTitle>Error Loading Sessions</ErrorTitle>
              <ErrorText>{error}</ErrorText>
              <Button onClick={loadSessions} variant="primary">
                Retry
              </Button>
            </ErrorCard>
          </ErrorState>
        </DashboardContent>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardContent maxWidth="1280px">
        <DashboardHeader>
          <div className="flex justify-between items-start w-full">
            <div>
              <DashboardTitle>Interview Sessions</DashboardTitle>
              <DashboardSubtitle>
                View and review your past interview sessions
              </DashboardSubtitle>
            </div>
            <Button
              onClick={loadSessions}
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
          </div>
        </DashboardHeader>

        <DashboardGrid columns={3} className="mb-xl">
          <DashboardCard>
            <CardBody>
              <div className="flex flex-col gap-xs">
                <div className="text-4xl font-semibold text-primary">
                  {sessions.length}
                </div>
                <div className="text-sm text-gray-600 uppercase tracking-wider">
                  Total Sessions
                </div>
              </div>
            </CardBody>
          </DashboardCard>
          <DashboardCard>
            <CardBody>
              <div className="flex flex-col gap-xs">
                <div className="text-4xl font-semibold text-primary">
                  {totalQAs}
                </div>
                <div className="text-sm text-gray-600 uppercase tracking-wider">
                  Total Q&As
                </div>
              </div>
            </CardBody>
          </DashboardCard>
          <DashboardCard>
            <CardBody>
              <div className="flex flex-col gap-xs">
                <div className="text-4xl font-semibold text-primary">
                  {averageScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 uppercase tracking-wider">
                  Average Score
                </div>
              </div>
            </CardBody>
          </DashboardCard>
        </DashboardGrid>

        {sessions.length === 0 ? (
          <EmptyState>
            <EmptyStateTitle>No Interview Sessions</EmptyStateTitle>
            <EmptyStateText>
              Start an interview to see your sessions and results here.
            </EmptyStateText>
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-lg">
            {sessions.map((session) => (
              <DashboardCard key={session.id}>
                <CardHeader>
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
                </CardHeader>

                <CardBody>
                  <div className="flex flex-col gap-md">
                    <CardTitle className="text-base">
                      Q&As ({session.qas?.length || 0})
                    </CardTitle>
                    {session.qas && session.qas.length > 0 ? (
                      <div className="flex flex-col gap-md">
                        {session.qas.map((qa) => (
                          <DashboardCard key={qa.id} className="p-md">
                            <div className="font-semibold text-gray-900 mb-md">
                              <span className="text-primary">Q:</span>{" "}
                              {qa.question}
                            </div>
                            <div className="bg-gray-50 p-md rounded-md border border-gray-200 mb-md">
                              <div className="text-sm font-medium text-gray-600 mb-xs">
                                Your Answer:
                              </div>
                              <div className="text-gray-900">
                                {qa.answer || "No answer provided"}
                              </div>
                            </div>
                            {qa.evaluation && (
                              <div className="flex flex-col gap-xs pt-md border-t border-gray-200">
                                <div
                                  className={`font-semibold text-lg ${getScoreColor(
                                    qa.evaluation.score
                                  )}`}
                                >
                                  Score: {qa.evaluation.score}/10
                                </div>
                                {qa.evaluation.feedback && (
                                  <div className="p-md rounded-md border border-gray-200 bg-gray-50">
                                    <div className="text-sm font-medium text-gray-600 mb-xs">
                                      Feedback:
                                    </div>
                                    <div className="text-gray-700 text-sm leading-relaxed">
                                      {qa.evaluation.feedback}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DashboardCard>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-md text-gray-500">
                        No Q&As recorded for this session yet.
                      </div>
                    )}
                  </div>
                </CardBody>
              </DashboardCard>
            ))}
          </div>
        )}
      </DashboardContent>
    </DashboardContainer>
  );
}
