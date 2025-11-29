import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { realtimeInterviewService } from "../services/api.service";
import { Loading } from "./ui/Loading";
import { Error } from "./ui/Error";
import { BackButton } from "./ui/BackButton";
import {
  Calendar,
  Hash,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

const getScoreBgColor = (score) => {
  if (score >= 8) return "bg-success/20 text-success border-success/30";
  if (score >= 5) return "bg-warning/20 text-warning border-warning/30";
  return "bg-danger/20 text-danger border-danger/30";
};

const getScoreIcon = (score) => {
  if (score >= 8) return CheckCircle2;
  if (score >= 5) return AlertCircle;
  return XCircle;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function SessionEvaluations() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionData = await realtimeInterviewService.getSession(sessionId);
      setSession(sessionData);
    } catch (err) {
      console.error("Failed to load session:", err);
      setError(err.message || "Failed to load session");
    } finally {
      setLoading(false);
    }
  };

  // Get QAs with evaluations
  const qasWithEvaluations = useMemo(() => {
    if (!session?.qas) return [];
    return session.qas.filter((qa) => qa.evaluation);
  }, [session]);

  // Calculate session statistics
  const sessionStats = useMemo(() => {
    const scores = qasWithEvaluations.map((qa) => qa.evaluation.score);
    const averageScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const excellent = scores.filter((s) => s >= 8).length;
    const good = scores.filter((s) => s >= 5 && s < 8).length;
    const needsImprovement = scores.filter((s) => s < 5).length;

    return {
      total: qasWithEvaluations.length,
      averageScore,
      excellent,
      good,
      needsImprovement,
    };
  }, [qasWithEvaluations]);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto p-lg text-left">
        <Loading message="Loading session evaluations..." />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-[1200px] mx-auto p-lg text-left">
        <Error
          message={error || "Session not found"}
          onBack={() => navigate(-1)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-lg text-left">
      {/* Back Button */}
      <div className="flex justify-start mb-md">
        <BackButton onClick={() => navigate(-1)}>Back</BackButton>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-xl"
      >
        <div className="mb-lg">
          <h1 className="text-4xl font-bold text-gray-900 m-0 mb-sm">
            Session Evaluations
          </h1>
          <p className="text-gray-600 text-lg m-0">
            Review all evaluations from this interview session
          </p>
        </div>

        {/* Session Info */}
        <div className="flex flex-wrap items-center gap-md text-sm text-gray-600 bg-gray-50 rounded-lg p-md border border-gray-200 mb-lg">
          <div className="flex items-center gap-xs">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(session.createdAt)}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-xs">
            <Hash className="w-4 h-4" />
            <span className="font-mono">{session.id.substring(0, 8)}...</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-xs">
            <MessageSquare className="w-4 h-4" />
            <span>
              {session.qas?.length || 0} Q&As • {qasWithEvaluations.length}{" "}
              evaluated
            </span>
          </div>
          <span>•</span>
          <span
            className={`inline-flex items-center px-sm py-xs rounded-full text-xs font-medium ${
              session.status === "completed"
                ? "bg-success/20 text-success"
                : "bg-primary/20 text-primary"
            }`}
          >
            {session.status}
          </span>
        </div>

        {/* Session Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-lg">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-md border border-primary/20">
            <div className="flex items-center gap-xs mb-xs">
              <TrendingUp className="w-5 h-5 text-primary" strokeWidth={2} />
              <span className="text-sm font-medium text-gray-600">
                Average Score
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {sessionStats.averageScore.toFixed(1)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-xl p-md border border-success/20">
            <div className="flex items-center gap-xs mb-xs">
              <CheckCircle2 className="w-5 h-5 text-success" strokeWidth={2} />
              <span className="text-sm font-medium text-gray-600">
                Excellent
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {sessionStats.excellent}
            </div>
          </div>
          <div className="bg-gradient-to-br from-warning/10 to-warning/5 rounded-xl p-md border border-warning/20">
            <div className="flex items-center gap-xs mb-xs">
              <AlertCircle className="w-5 h-5 text-warning" strokeWidth={2} />
              <span className="text-sm font-medium text-gray-600">Good</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {sessionStats.good}
            </div>
          </div>
          <div className="bg-gradient-to-br from-danger/10 to-danger/5 rounded-xl p-md border border-danger/20">
            <div className="flex items-center gap-xs mb-xs">
              <XCircle className="w-5 h-5 text-danger" strokeWidth={2} />
              <span className="text-sm font-medium text-gray-600">
                Needs Work
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {sessionStats.needsImprovement}
            </div>
          </div>
        </div>
      </motion.div>

      {/* QAs List */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-lg">
          Evaluations ({qasWithEvaluations.length})
        </h2>

        {qasWithEvaluations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-xxl text-center border border-gray-200 shadow-sm"
          >
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-md" />
            <p className="text-lg text-gray-600 mb-xs">
              No evaluations found in this session
            </p>
            <p className="text-sm text-gray-500">
              This session doesn't have any evaluated Q&As yet
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-md">
            {qasWithEvaluations.map((qa, index) => {
              const ScoreIcon = getScoreIcon(qa.evaluation.score);
              return (
                <motion.div
                  key={qa.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => navigate(`/evaluations/${sessionId}/${qa.id}`)}
                  className="bg-white rounded-xl p-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group hover:border-primary/50"
                >
                  <div className="flex items-start justify-between gap-md">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-md mb-sm">
                        <div
                          className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center border-2 font-bold text-lg ${getScoreBgColor(
                            qa.evaluation.score
                          )}`}
                        >
                          <ScoreIcon className="w-8 h-8" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-md mb-xs">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors text-left">
                              {qa.question}
                            </h3>
                            <div
                              className={`flex-shrink-0 inline-flex items-center gap-xs px-sm py-xs rounded-lg border-2 font-semibold text-sm ${getScoreBgColor(
                                qa.evaluation.score
                              )}`}
                            >
                              <span>{qa.evaluation.score}/10</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-sm">
                            {qa.answer || "No answer provided"}
                          </p>
                          {qa.evaluation.feedback && (
                            <p className="text-sm text-gray-500 line-clamp-1 italic">
                              {qa.evaluation.feedback.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
