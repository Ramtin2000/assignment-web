import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { realtimeInterviewService } from "../services/api.service";
import { Card } from "../lib/styled";
import { Button } from "./ui/Button";
import { Loading } from "./ui/Loading";
import { Error } from "./ui/Error";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.lg};
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

const SessionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
`;

const SessionCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

const SessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: ${(props) => props.theme.spacing.sm};
  border-bottom: 1px solid ${(props) => props.theme.colors.gray[200]};
`;

const SessionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const SessionId = styled.div`
  font-size: 0.875rem;
  font-family: monospace;
  color: ${(props) => props.theme.colors.gray[600]};
`;

const SessionDate = styled.div`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.gray[500]};
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: 0.875rem;
  font-weight: 500;
  background: ${(props) =>
    props.status === "completed"
      ? props.theme.colors.success + "20"
      : props.theme.colors.primary + "20"};
  color: ${(props) =>
    props.status === "completed"
      ? props.theme.colors.success
      : props.theme.colors.primary};
`;

const QAsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

const QAsHeader = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.gray[700]};
`;

const QACard = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.gray[50]};
  border-radius: ${(props) => props.theme.borderRadius.md};
  border-left: 4px solid ${(props) => props.theme.colors.primary};
`;

const Question = styled.div`
  font-weight: 600;
  color: ${(props) => props.theme.colors.gray[900]};
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;

const Answer = styled.div`
  color: ${(props) => props.theme.colors.gray[700]};
  margin-bottom: ${(props) => props.theme.spacing.sm};
  font-style: italic;
`;

const Evaluation = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
  padding-top: ${(props) => props.theme.spacing.sm};
  border-top: 1px solid ${(props) => props.theme.colors.gray[200]};
`;

const Score = styled.div`
  font-weight: 600;
  color: ${(props) => {
    if (props.score >= 8) return props.theme.colors.success;
    if (props.score >= 5) return props.theme.colors.warning;
    return props.theme.colors.danger;
  }};
`;

const Feedback = styled.div`
  color: ${(props) => props.theme.colors.gray[600]};
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${(props) => props.theme.spacing.xl};
  color: ${(props) => props.theme.colors.gray[500]};
`;

const Stats = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.lg};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  padding: ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.gray[50]};
  border-radius: ${(props) => props.theme.borderRadius.md};
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.primary};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.gray[600]};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

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

  const totalQAs = sessions.reduce((sum, session) => sum + (session.qas?.length || 0), 0);
  const averageScore = sessions.reduce((sum, session) => {
    const sessionScores = session.qas
      ?.map((qa) => qa.evaluation?.score)
      .filter((score) => score !== undefined) || [];
    const sessionAvg = sessionScores.length > 0
      ? sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length
      : 0;
    return sum + sessionAvg;
  }, 0) / (sessions.length || 1);

  if (loading) {
    return (
      <Container>
        <Loading />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Error message={error} />
        <Button onClick={loadSessions} variant="primary" style={{ marginTop: "1rem" }}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Interview Sessions Dashboard</Title>
        <Button onClick={loadSessions} variant="outline" size="sm">
          Refresh
        </Button>
      </Header>

      <Stats>
        <StatItem>
          <StatValue>{sessions.length}</StatValue>
          <StatLabel>Total Sessions</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{totalQAs}</StatValue>
          <StatLabel>Total Q&As</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{averageScore.toFixed(1)}</StatValue>
          <StatLabel>Average Score</StatLabel>
        </StatItem>
      </Stats>

      {sessions.length === 0 ? (
        <EmptyState>
          <p>No interview sessions found.</p>
          <p>Start an interview to see results here.</p>
        </EmptyState>
      ) : (
        <SessionsList>
          {sessions.map((session) => (
            <SessionCard key={session.id}>
              <SessionHeader>
                <SessionInfo>
                  <SessionId>Session: {session.id.substring(0, 8)}...</SessionId>
                  <SessionDate>{formatDate(session.createdAt)}</SessionDate>
                </SessionInfo>
                <StatusBadge status={session.status}>
                  {session.status}
                </StatusBadge>
              </SessionHeader>

              <QAsSection>
                <QAsHeader>
                  Q&As ({session.qas?.length || 0})
                </QAsHeader>
                {session.qas && session.qas.length > 0 ? (
                  session.qas.map((qa) => (
                    <QACard key={qa.id}>
                      <Question>Q: {qa.question}</Question>
                      <Answer>A: {qa.answer}</Answer>
                      {qa.evaluation && (
                        <Evaluation>
                          <Score score={qa.evaluation.score}>
                            Score: {qa.evaluation.score}/10
                          </Score>
                          {qa.evaluation.feedback && (
                            <Feedback>{qa.evaluation.feedback}</Feedback>
                          )}
                        </Evaluation>
                      )}
                    </QACard>
                  ))
                ) : (
                  <EmptyState style={{ padding: "1rem" }}>
                    No Q&As recorded for this session yet.
                  </EmptyState>
                )}
              </QAsSection>
            </SessionCard>
          ))}
        </SessionsList>
      )}
    </Container>
  );
}

