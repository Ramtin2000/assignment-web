import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { interviewService } from "../services/api.service";
import {
  DashboardContainer,
  DashboardContent,
  DashboardCard,
  DashboardHeader,
  DashboardTitle,
  DashboardSubtitle,
  CardTitle,
  CardSubtitle,
  CardBody,
  ScoreBadge,
  Loading,
  Error,
} from "./ui";
import styled from "styled-components";
import { motion } from "framer-motion";
import { itemVariants } from "./ui";

const ScoreCard = styled(DashboardCard)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const ScoreContent = styled.div`
  flex: 1;
`;

const ScoreValue = styled(ScoreBadge)`
  font-size: 2rem;
  padding: ${(props) => props.theme.spacing.md}
    ${(props) => props.theme.spacing.lg};
  font-weight: 700;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.gray[900]};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
`;

const RecommendationsCard = styled(DashboardCard)`
  background: ${(props) => props.theme.colors.info}15;
  border: 1px solid ${(props) => props.theme.colors.info}40;
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const RecommendationsTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.info};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
`;

const RecommendationsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
`;

const RecommendationItem = styled.li`
  display: flex;
  align-items: flex-start;
  color: ${(props) => props.theme.colors.info};
  font-size: 1rem;

  &::before {
    content: "•";
    margin-right: ${(props) => props.theme.spacing.sm};
    font-weight: bold;
  }
`;

const QuestionCard = styled(DashboardCard)`
  overflow: hidden;
  margin-bottom: ${(props) => props.theme.spacing.lg};
  text-align: left;
`;

const QuestionHeader = styled.div`
  padding: ${(props) => props.theme.spacing.lg};
  border-bottom: 1px solid ${(props) => props.theme.colors.gray[200]};
  text-align: left;
`;

const QuestionHeaderContent = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const QuestionNumber = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.gray[900]};
  margin: 0;
`;

const QuestionText = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.colors.gray[700]};
  line-height: 1.6;
  margin: 0;
  text-align: left;
`;

const AnswerSection = styled.div`
  padding: ${(props) => props.theme.spacing.lg};
  border-bottom: 1px solid ${(props) => props.theme.colors.gray[200]};
  background: ${(props) => props.theme.colors.gray[100]};
  text-align: left;
`;

const SectionLabel = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.gray[700]};
  margin: 0 0 ${(props) => props.theme.spacing.sm} 0;
  text-align: left;
`;

const AnswerText = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.colors.gray[600]};
  line-height: 1.6;
  margin: 0;
  text-align: left;
`;

const FeedbackSection = styled.div`
  padding: ${(props) => props.theme.spacing.lg};
  text-align: left;
`;

const FeedbackText = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.colors.gray[700]};
  line-height: 1.6;
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
  text-align: left;
`;

const StrengthsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const StrengthItem = styled.li`
  display: flex;
  align-items: flex-start;
  color: ${(props) => props.theme.colors.success};
  font-size: 1rem;

  &::before {
    content: "✓";
    margin-right: ${(props) => props.theme.spacing.sm};
    font-weight: bold;
  }
`;

const WeaknessesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const WeaknessItem = styled.li`
  display: flex;
  align-items: flex-start;
  color: ${(props) => props.theme.colors.danger};
  font-size: 1rem;

  &::before {
    content: "•";
    margin-right: ${(props) => props.theme.spacing.sm};
    font-weight: bold;
  }
`;

const StrengthsLabel = styled(SectionLabel)`
  color: ${(props) => props.theme.colors.success};
`;

const WeaknessesLabel = styled(SectionLabel)`
  color: ${(props) => props.theme.colors.danger};
`;

const QuestionsSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
`;

const EvaluationDetail = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionData = await interviewService.getInterviewSession(id);
      setSession(sessionData);
    } catch (err) {
      console.error("Error fetching session:", err);
      setError("Failed to load session details");
      setLoading(false);
    }
  }, [id]);

  const fetchAnswers = useCallback(async () => {
    if (!id) return;
    try {
      const data = await interviewService.getSessionAnswers(id);

      // Sort by questionIndex
      const sortedAnswers = data.sort(
        (a, b) => a.questionIndex - b.questionIndex
      );
      setAnswers(sortedAnswers);
    } catch (err) {
      console.error("Error fetching answers:", err);
      setError("Failed to load session answers");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (session) {
      fetchAnswers();
    }
  }, [session, fetchAnswers]);

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

  if (loading || !session) {
    return <Loading message="Loading evaluation details..." />;
  }

  if (error) {
    return <Error title="Error" message={error} />;
  }

  return (
    <DashboardContainer>
      <DashboardContent maxWidth="1024px">
        <DashboardHeader
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <DashboardTitle>Interview Evaluation Details</DashboardTitle>
          <DashboardSubtitle>
            Completed: {formatDate(session.completedAt)}
          </DashboardSubtitle>
        </DashboardHeader>

        <ScoreCard
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <ScoreContent>
            <CardTitle style={{ marginBottom: "0.5rem" }}>
              Overall Score
            </CardTitle>
            <CardSubtitle>
              Based on {session.evaluations?.length || 0} question
              {session.evaluations?.length !== 1 ? "s" : ""}
            </CardSubtitle>
          </ScoreContent>
          <ScoreValue score={session.overallScore || 0} size="lg">
            {session.overallScore
              ? `${session.overallScore.toFixed(1)}/10`
              : "N/A"}
          </ScoreValue>
        </ScoreCard>

        {session.summary && (
          <DashboardCard
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }}
            style={{ marginBottom: "1.5rem" }}
          >
            <CardTitle style={{ marginBottom: "0.75rem" }}>Summary</CardTitle>
            <CardBody>{session.summary}</CardBody>
          </DashboardCard>
        )}

        {session.recommendations && session.recommendations.length > 0 && (
          <RecommendationsCard
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
          >
            <RecommendationsTitle>Recommendations</RecommendationsTitle>
            <RecommendationsList>
              {session.recommendations.map((recommendation, index) => (
                <RecommendationItem key={index}>
                  {recommendation}
                </RecommendationItem>
              ))}
            </RecommendationsList>
          </RecommendationsCard>
        )}

        <QuestionsSection
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.15, ease: "easeOut" }}
        >
          <SectionTitle>Question-by-Question Evaluation</SectionTitle>

          {answers.map((answer, index) => {
            const evaluation = answer.evaluation;
            if (!evaluation) return null;

            return (
              <QuestionCard
                key={answer.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.03 }}
              >
                <QuestionHeader>
                  <QuestionHeaderContent>
                    <QuestionNumber>
                      Question {answer.questionIndex + 1}
                    </QuestionNumber>
                    <ScoreBadge score={evaluation.score} size="md">
                      {evaluation.score.toFixed(1)}/10
                    </ScoreBadge>
                  </QuestionHeaderContent>
                  <QuestionText>{answer.questionText}</QuestionText>
                </QuestionHeader>

                <AnswerSection>
                  <SectionLabel>Your Answer:</SectionLabel>
                  <AnswerText>
                    {answer.transcription || "No answer provided"}
                  </AnswerText>
                </AnswerSection>

                <FeedbackSection>
                  <SectionLabel>Feedback:</SectionLabel>
                  <FeedbackText>{evaluation.feedback}</FeedbackText>

                  {evaluation.strengths && evaluation.strengths.length > 0 && (
                    <div>
                      <StrengthsLabel>Strengths:</StrengthsLabel>
                      <StrengthsList>
                        {evaluation.strengths.map((strength, idx) => (
                          <StrengthItem key={idx}>{strength}</StrengthItem>
                        ))}
                      </StrengthsList>
                    </div>
                  )}

                  {evaluation.weaknesses &&
                    evaluation.weaknesses.length > 0 && (
                      <div>
                        <WeaknessesLabel>
                          Areas for Improvement:
                        </WeaknessesLabel>
                        <WeaknessesList>
                          {evaluation.weaknesses.map((weakness, idx) => (
                            <WeaknessItem key={idx}>{weakness}</WeaknessItem>
                          ))}
                        </WeaknessesList>
                      </div>
                    )}
                </FeedbackSection>
              </QuestionCard>
            );
          })}
        </QuestionsSection>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default EvaluationDetail;
