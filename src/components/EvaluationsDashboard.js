import React, { useEffect, useState } from "react";
import { interviewService } from "../services/api.service";
import { useNavigate } from "react-router-dom";
import {
  DashboardContainer,
  DashboardContent,
  DashboardHeader,
  DashboardTitle,
  DashboardSubtitle,
  DashboardGrid,
  DashboardCard,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardBody,
  CardFooter,
  EmptyState,
  EmptyStateTitle,
  EmptyStateText,
  ScoreBadge,
  containerVariants,
  itemVariants,
} from "./ui";
import { Button } from "./ui";
import { Loading } from "./ui";
import { Error } from "./ui";
import styled from "styled-components";

const QuestionCount = styled.span`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.gray[500]};
`;

const SummaryPreview = styled.p`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.gray[700]};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
`;

const EvaluationsDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const handleSessionClick = (sessionId) => {
    navigate(`/evaluation/${sessionId}`);
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

  if (loading) {
    return <Loading message="Loading evaluations..." />;
  }

  if (error) {
    return (
      <Error
        title="Error"
        message={error}
        onRetry={fetchSessions}
        retryText="Try Again"
      />
    );
  }

  if (sessions.length === 0) {
    return (
      <DashboardContainer>
        <DashboardContent>
          <EmptyState
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <EmptyStateTitle>Interview Evaluations</EmptyStateTitle>
            <EmptyStateText>
              You don't have any completed interview evaluations yet.
            </EmptyStateText>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/interviews")}
            >
              Start an Interview
            </Button>
          </EmptyState>
        </DashboardContent>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardContent>
        <DashboardHeader
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <DashboardTitle>Interview Evaluations</DashboardTitle>
          <DashboardSubtitle>
            View your completed interview evaluations and detailed feedback
          </DashboardSubtitle>
        </DashboardHeader>

        <DashboardGrid
          columns={3}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sessions.map((session) => (
            <DashboardCard
              key={session.id}
              clickable
              onClick={() => handleSessionClick(session.id)}
              variants={itemVariants}
            >
              <CardHeader>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <ScoreBadge score={session.overallScore || 0} size="md">
                    {session.overallScore
                      ? `${session.overallScore.toFixed(1)}/10`
                      : "N/A"}
                  </ScoreBadge>
                </div>
                <QuestionCount>
                  {session.evaluations?.length || 0} questions
                </QuestionCount>
              </CardHeader>

              <CardBody>
                {session.summary && (
                  <div style={{ marginTop: "1rem" }}>
                    <SummaryPreview>{session.summary}</SummaryPreview>
                  </div>
                )}
                <CardSubtitle>
                  Completed: {formatDate(session.completedAt)}
                </CardSubtitle>
              </CardBody>

              <CardFooter>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSessionClick(session.id);
                  }}
                >
                  View Details
                </Button>
              </CardFooter>
            </DashboardCard>
          ))}
        </DashboardGrid>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default EvaluationsDashboard;
