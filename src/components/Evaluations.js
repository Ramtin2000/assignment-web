import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { realtimeInterviewService } from "../services/api.service";
import { Button } from "./ui/Button";
import { Loading } from "./ui/Loading";
import { Error } from "./ui/Error";
import {
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  ArrowRight,
  Calendar,
  Hash,
} from "lucide-react";

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

const formatShortDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function Evaluations() {
  const navigate = useNavigate();
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
      setError(err.message || "Failed to load evaluations");
    } finally {
      setLoading(false);
    }
  };

  // Calculate all evaluations from all sessions (for stats)
  const allEvaluations = useMemo(() => {
    const evaluations = [];
    sessions.forEach((session) => {
      if (session.qas && session.qas.length > 0) {
        session.qas.forEach((qa) => {
          if (qa.evaluation) {
            evaluations.push({
              ...qa,
              sessionId: session.id,
              sessionDate: session.createdAt,
              sessionStatus: session.status,
            });
          }
        });
      }
    });
    return evaluations;
  }, [sessions]);

  // Process sessions with their evaluation stats
  const sessionsWithStats = useMemo(() => {
    return sessions
      .map((session) => {
        const qasWithEvaluations =
          session.qas?.filter((qa) => qa.evaluation) || [];
        const scores = qasWithEvaluations.map((qa) => qa.evaluation.score);
        const averageScore =
          scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0;

        return {
          ...session,
          evaluationCount: qasWithEvaluations.length,
          averageScore,
        };
      })
      .filter((session) => session.evaluationCount > 0)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [sessions]);

  // Calculate totals and statistics
  const stats = useMemo(() => {
    const totalEvaluations = allEvaluations.length;
    const totalSessions = sessions.length;

    const scores = allEvaluations.map((e) => e.evaluation.score);
    const averageScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const excellent = scores.filter((s) => s >= 8).length;
    const good = scores.filter((s) => s >= 5 && s < 8).length;
    const needsImprovement = scores.filter((s) => s < 5).length;

    const recentEvaluations = allEvaluations.filter((e) => {
      const date = new Date(e.sessionDate);
      const now = new Date();
      const diffDays = (now - date) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    }).length;

    return {
      totalEvaluations,
      totalSessions,
      averageScore,
      excellent,
      good,
      needsImprovement,
      recentEvaluations,
    };
  }, [allEvaluations, sessions]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto p-lg">
        <Loading message="Loading evaluations..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1400px] mx-auto p-lg">
        <Error message={error} onRetry={loadSessions} />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-lg">
      {/* Header */}
      <div className="flex justify-between text-left mb-xl pb-lg border-b-2 border-gray-200">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 m-0 mb-sm">
            Evaluations
          </h1>
          <p className="text-gray-600 text-lg m-0">
            Review your interview performance and feedback
          </p>
        </div>
        <Button onClick={loadSessions} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Totals Section */}
      <div className="mb-xl">
        {/* Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-lg"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-lg">
            Score Distribution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="flex items-center gap-md p-md bg-success/10 rounded-lg border border-success/20">
              <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2
                  className="w-5 h-5 text-success"
                  strokeWidth={2}
                />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.excellent}
                </div>
                <div className="text-sm text-gray-600">Excellent (8-10)</div>
              </div>
            </div>
            <div className="flex items-center gap-md p-md bg-warning/10 rounded-lg border border-warning/20">
              <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-warning" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.good}
                </div>
                <div className="text-sm text-gray-600">Good (5-7)</div>
              </div>
            </div>
            <div className="flex items-center gap-md p-md bg-danger/10 rounded-lg border border-danger/20">
              <div className="w-10 h-10 bg-danger/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-danger" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.needsImprovement}
                </div>
                <div className="text-sm text-gray-600">
                  Needs Improvement (1-4)
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Details Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-lg">
          All Sessions ({sessionsWithStats.length})
        </h2>

        {sessionsWithStats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-xxl text-center border border-gray-200 shadow-sm"
          >
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-md" />
            <p className="text-lg text-gray-600 mb-xs">No sessions found</p>
            <p className="text-sm text-gray-500">
              Complete an interview to see sessions here
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-md">
            {sessionsWithStats.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                onClick={() => navigate(`/evaluations/${session.id}`)}
                className="bg-white rounded-xl p-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group hover:border-primary/50"
              >
                <div className="flex items-start justify-between gap-md">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-md mb-sm">
                      <div className="flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center border-2 border-primary/30 bg-primary/10">
                        <div className="text-2xl font-bold text-primary">
                          {session.averageScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-primary font-medium">
                          Avg
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-md mb-xs">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors text-left">
                            Session Evaluation
                          </h3>
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
                        <div className="flex flex-wrap items-center gap-md text-sm text-gray-600 mb-sm">
                          <div className="flex items-center gap-xs">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(session.createdAt)}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-xs">
                            <Hash className="w-4 h-4" />
                            <span className="font-mono">
                              {session.id.substring(0, 8)}...
                            </span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-xs">
                            <MessageSquare className="w-4 h-4" />
                            <span>
                              {session.evaluationCount} evaluation
                              {session.evaluationCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
