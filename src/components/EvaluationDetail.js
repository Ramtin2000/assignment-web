import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { realtimeInterviewService } from "../services/api.service";
import { Loading } from "./ui/Loading";
import { Error } from "./ui/Error";
import { BackButton } from "./ui/BackButton";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageSquare,
  Calendar,
  Hash,
  ChevronDown,
  ChevronUp,
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

export default function EvaluationDetail() {
  const { sessionId, qaId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    feedback: true,
    sessionContext: false,
  });

  useEffect(() => {
    loadEvaluation();
  }, [sessionId, qaId]);

  const loadEvaluation = async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionData = await realtimeInterviewService.getSession(sessionId);
      setSession(sessionData);

      // Find the specific QA
      const qa = sessionData.qas?.find((q) => q.id === qaId);
      if (qa && qa.evaluation) {
        setEvaluation({
          ...qa,
          sessionId: sessionData.id,
          sessionDate: sessionData.createdAt,
          sessionStatus: sessionData.status,
        });
      } else {
        setError("Evaluation not found");
      }
    } catch (err) {
      console.error("Failed to load evaluation:", err);
      setError(err.message || "Failed to load evaluation");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto p-lg">
        <Loading message="Loading evaluation details..." />
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="max-w-[1200px] mx-auto p-lg">
        <Error
          message={error || "Evaluation not found"}
          onBack={() => navigate(-1)}
        />
      </div>
    );
  }

  const ScoreIcon = getScoreIcon(evaluation.evaluation.score);
  const otherQAs = session.qas?.filter((qa) => qa.id !== qaId) || [];

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
        <div className="flex items-start justify-between mb-lg">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 m-0 mb-sm">
              Evaluation Details
            </h1>
            <p className="text-gray-600 text-lg m-0">
              Review your answer and feedback
            </p>
          </div>
          <div
            className={`flex items-center gap-md px-lg py-md rounded-xl border-2 font-bold text-2xl ${getScoreBgColor(
              evaluation.evaluation.score
            )}`}
          >
            <ScoreIcon className="w-6 h-6" strokeWidth={2.5} />
            <span>{evaluation.evaluation.score}/10</span>
          </div>
        </div>

        {/* Session Info */}
        <div className="flex flex-wrap items-center gap-md text-sm text-gray-600 bg-gray-50 rounded-lg p-md border border-gray-200 justify-start">
          <div className="flex items-center gap-xs">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(evaluation.sessionDate)}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-xs">
            <Hash className="w-4 h-4" />
            <span className="font-mono">
              {evaluation.sessionId.substring(0, 8)}...
            </span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-xs">
            <MessageSquare className="w-4 h-4" />
            <span>{session.qas?.length || 0} Q&As in session</span>
          </div>
        </div>
      </motion.div>

      {/* Question Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-lg border border-primary/20 shadow-sm mb-lg"
      >
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-md flex items-center gap-xs">
          <MessageSquare className="w-4 h-4" />
          Question
        </h2>
        <p className="text-xl text-gray-900 leading-relaxed">
          {evaluation.question}
        </p>
      </motion.div>

      {/* Answer Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-xl p-lg border border-gray-200 shadow-sm mb-lg"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-md">
          Your Answer
        </h2>
        <div className="bg-gray-50 rounded-lg p-md border border-gray-200">
          <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
            {evaluation.answer || "No answer provided"}
          </p>
        </div>
      </motion.div>

      {/* Feedback Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm mb-lg overflow-hidden"
      >
        <button
          onClick={() => toggleSection("feedback")}
          className="w-full flex items-center justify-between p-lg hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900">
            Detailed Feedback
          </h2>
          {expandedSections.feedback ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.feedback && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-lg pb-lg"
          >
            <div className="bg-gray-50 rounded-lg p-md border border-gray-200">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {evaluation.evaluation.feedback || "No feedback available"}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Session Context Section */}
      {otherQAs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <button
            onClick={() => toggleSection("sessionContext")}
            className="w-full flex items-center justify-between p-lg hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Other Q&As in This Session ({otherQAs.length})
            </h2>
            {expandedSections.sessionContext ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {expandedSections.sessionContext && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-lg pb-lg"
            >
              <div className="flex flex-col gap-md">
                {otherQAs.map((qa) => (
                  <div
                    key={qa.id}
                    onClick={() =>
                      navigate(`/evaluations/${sessionId}/${qa.id}`)
                    }
                    className="p-md bg-gray-50 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-gray-100 cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between gap-md">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 mb-xs line-clamp-2">
                          {qa.question}
                        </p>
                        {qa.evaluation && (
                          <div
                            className={`inline-flex items-center gap-xs px-sm py-xs rounded-lg border-2 font-semibold text-sm ${getScoreBgColor(
                              qa.evaluation.score
                            )}`}
                          >
                            <span>Score: {qa.evaluation.score}/10</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
