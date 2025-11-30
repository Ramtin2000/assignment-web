import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRealtimeInterview } from "../hooks/useRealtimeInterview";
import { Button } from "./ui/Button";
import { TagInput } from "./ui/TagInput";
import { BackButton } from "./ui/BackButton";
import {
  DashboardContainer,
  DashboardContent,
  DashboardHeader,
  DashboardTitle,
  DashboardSubtitle,
  DashboardCard,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardBody,
  EmptyState,
  EmptyStateTitle,
  EmptyStateText,
} from "./ui/Dashboard";
import {
  Target,
  CheckCircle2,
  ArrowRight,
  Play,
  X,
  Clock,
  MessageSquare,
  Home,
  Trophy,
  Mic,
  MicOff,
} from "lucide-react";

const getStatusBadgeClasses = (status) => {
  const base =
    "inline-flex items-center gap-xs px-sm py-xs rounded-full text-sm font-medium";
  switch (status) {
    case "active":
    case "listening":
      return `${base} bg-success/20 text-success`;
    case "speaking":
      return `${base} bg-primary/20 text-primary`;
    case "connecting":
      return `${base} bg-warning/20 text-warning`;
    case "error":
      return `${base} bg-danger/20 text-danger`;
    default:
      return `${base} bg-gray-200 text-gray-600`;
  }
};

const StatusDot = ({ status }) => {
  const shouldPulse =
    status === "active" || status === "listening" || status === "speaking";
  return (
    <div
      className={`w-2 h-2 rounded-full bg-current ${
        shouldPulse ? "animate-pulse" : ""
      }`}
    />
  );
};

const StepIndicator = ({ currentStep, totalSteps = 4 }) => {
  const steps = ["Select Skills", "Review", "Interview", "Done"];
  return (
    <div className="flex items-center justify-center gap-sm mb-xl">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-xs">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-normal ${
                  isActive
                    ? "bg-primary text-white shadow-md scale-110"
                    : isCompleted
                    ? "bg-success text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-primary" : "text-gray-600"
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-16 transition-all duration-normal ${
                  isCompleted ? "bg-success" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Skills Selection Step
const SkillsSelectionStep = ({ skills, onSkillsChange, onContinue }) => {
  const estimatedQuestions = skills.length * 2;
  const estimatedMinutes = Math.ceil(estimatedQuestions * 2.5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <DashboardCard>
        <CardHeader>
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Select Interview Skills</CardTitle>
              <CardSubtitle>
                Add the skills you want to be interviewed on
              </CardSubtitle>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="mb-lg">
            <TagInput
              value={skills}
              onChange={onSkillsChange}
              placeholder="Type a skill (e.g., React, JavaScript, TypeScript) and press Enter"
            />
          </div>

          {skills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-md bg-primary/5 rounded-lg border border-primary/20"
            >
              <div className="flex items-center gap-md text-sm text-gray-700">
                <div className="flex items-center gap-xs">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{estimatedQuestions}</span>
                  <span>questions</span>
                </div>
                <div className="flex items-center gap-xs">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-semibold">~{estimatedMinutes}</span>
                  <span>minutes</span>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mt-lg pt-md border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-md">
              <strong>Note:</strong> The AI will ask 2 questions per skill. Make
              sure to add all the skills you want to be assessed on.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={onContinue}
              disabled={skills.length === 0}
              fullWidth
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            >
              Continue to Review
            </Button>
          </div>
        </CardBody>
      </DashboardCard>
    </motion.div>
  );
};

// Preparation Step
const PreparationStep = ({
  skills,
  onBack,
  onStartInterview,
  isConnecting,
}) => {
  const estimatedQuestions = skills.length * 2;
  const estimatedMinutes = Math.ceil(estimatedQuestions * 2.5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <BackButton onClick={onBack}>Back to Skills Selection</BackButton>

      <DashboardCard>
        <CardHeader>
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Review Your Interview</CardTitle>
              <CardSubtitle>
                Confirm your selections before starting
              </CardSubtitle>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="mb-lg">
            <h3 className="text-base font-semibold text-gray-900 mb-md">
              Selected Skills ({skills.length})
            </h3>
            <div className="flex flex-wrap gap-xs">
              {skills.map((skill, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center px-md py-sm bg-primary text-white rounded-full text-sm font-medium"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="p-md bg-gray-50 rounded-lg border border-gray-200 mb-lg">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <div className="text-sm text-gray-600 mb-xs">
                  Total Questions
                </div>
                <div className="text-2xl font-semibold text-gray-900">
                  {estimatedQuestions}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-xs">
                  Estimated Duration
                </div>
                <div className="text-2xl font-semibold text-gray-900">
                  ~{estimatedMinutes} min
                </div>
              </div>
            </div>
          </div>

          <div className="p-md bg-primary/5 rounded-lg border border-primary/20 mb-lg">
            <h4 className="text-sm font-semibold text-gray-900 mb-xs">
              Interview Tips
            </h4>
            <ul className="text-sm text-gray-600 space-y-xs list-disc list-inside">
              <li>Speak clearly into your microphone</li>
              <li>Take your time to think before answering</li>
              <li>The AI will ask questions automatically</li>
              <li>You can end the interview after completing all questions</li>
            </ul>
          </div>

          <div className="pt-md border-t border-gray-200">
            <Button
              variant="primary"
              size="lg"
              onClick={onStartInterview}
              disabled={isConnecting}
              fullWidth
              icon={<Play className="w-5 h-5" />}
              iconPosition="left"
            >
              {isConnecting ? "Connecting..." : "Start Interview"}
            </Button>
          </div>
        </CardBody>
      </DashboardCard>
    </motion.div>
  );
};

// Speaking Indicator Component
const SpeakingIndicator = ({ isActive, status, isAssistantSpeaking }) => {
  // Don't show indicator when assistant is speaking
  if (isAssistantSpeaking || status === "idle" || status === "connecting") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mb-md"
    >
      <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 overflow-hidden">
        {/* Subtle pulse animation */}
        {isActive && status === "active" && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Microphone icon */}
        <motion.div
          className="relative z-10"
          animate={
            isActive && status === "active"
              ? {
                  scale: [1, 1.1, 1],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Mic
            className={`w-4 h-4 ${
              status === "listening"
                ? "text-primary"
                : isActive
                ? "text-primary"
                : "text-gray-400"
            }`}
            strokeWidth={2}
          />
        </motion.div>

        {/* Status text */}
        <span className="relative z-10 text-sm font-medium text-gray-700 whitespace-nowrap">
          {status === "listening"
            ? "Listening..."
            : isActive
            ? "Your turn"
            : "Ready"}
        </span>

        {/* Pulse dots when active */}
        {isActive && status === "active" && (
          <div className="relative z-10 flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Active Interview Step
const ActiveInterviewStep = ({
  status,
  transcript,
  currentQuestion,
  error,
  questionsAnswered,
  canEndInterview,
  totalQuestions,
  isAssistantSpeaking,
  onStopInterview,
  onInterviewComplete,
  transcriptEndRef,
}) => {
  const getStatusText = () => {
    switch (status) {
      case "idle":
        return "Ready";
      case "connecting":
        return "Connecting...";
      case "active":
        return "Active";
      case "listening":
        return "Listening...";
      case "speaking":
        return "Speaking...";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col min-h-0"
    >
      {error && (
        <div className="p-md bg-danger/20 text-danger rounded-md border border-danger/40 mb-md">
          {error}
        </div>
      )}

      {totalQuestions > 0 && (
        <div className="mb-lg">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-sm">
            <motion.div
              key={`progress-${questionsAnswered}`}
              className="h-full bg-primary transition-all duration-300"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(
                  (questionsAnswered / totalQuestions) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <div className="text-sm text-gray-600 text-center">
            Progress: {questionsAnswered} / {totalQuestions} questions answered
          </div>
        </div>
      )}

      <SpeakingIndicator
        isActive={!isAssistantSpeaking && status === "active"}
        status={status}
        isAssistantSpeaking={isAssistantSpeaking}
      />

      <div className="flex-1 flex flex-col gap-lg min-h-0">
        {currentQuestion && (
          <DashboardCard className="shrink-0">
            <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-sm">
              Current Question
            </div>
            <div className="text-xl leading-relaxed text-gray-900 min-h-[60px]">
              {currentQuestion}
            </div>
          </DashboardCard>
        )}

        {status === "active" && transcript.length === 0 && (
          <DashboardCard className="shrink-0">
            <EmptyStateTitle>Welcome to Your Interview</EmptyStateTitle>
            <EmptyStateText>
              The AI interviewer will greet you and start asking questions
              shortly. Please speak clearly into your microphone.
            </EmptyStateText>
          </DashboardCard>
        )}

        <DashboardCard className="flex-1 flex flex-col min-h-0 p-0">
          <div className="px-lg pt-lg pb-md border-b border-gray-200 shrink-0">
            <CardTitle>Transcript</CardTitle>
          </div>
          <div className="flex-1 overflow-y-auto px-lg py-md min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
            {transcript.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <EmptyStateText>Waiting for conversation...</EmptyStateText>
              </div>
            ) : (
              <div className="flex flex-col gap-md">
                {transcript.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-xs"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-xs">
                      {message.role === "user" ? "You" : "Assistant"}
                    </div>
                    <div
                      className={`w-full px-lg py-md rounded-lg leading-relaxed wrap-break-word text-left ${
                        message.role === "user"
                          ? "bg-primary text-white shadow-md"
                          : "bg-gray-100 text-gray-900 shadow-sm border-l-4 border-primary"
                      }`}
                    >
                      {message.text}
                    </div>
                  </motion.div>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            )}
          </div>
        </DashboardCard>
      </div>

      <div className="flex gap-md justify-center pt-lg border-t border-gray-200 mt-lg">
        <Button
          variant="danger"
          size="lg"
          onClick={() => {
            if (canEndInterview && questionsAnswered >= totalQuestions) {
              onStopInterview();
              // Small delay to ensure interview stops, then transition to done
              setTimeout(() => {
                onInterviewComplete?.();
              }, 300);
            } else {
              onStopInterview();
            }
          }}
          disabled={status === "connecting" || !canEndInterview}
          icon={<X className="w-5 h-5" />}
          iconPosition="left"
          title={
            !canEndInterview
              ? `Complete all ${totalQuestions} questions before ending the interview`
              : "End the interview"
          }
        >
          {canEndInterview ? "End Interview" : "Complete Interview First"}
        </Button>
      </div>
    </motion.div>
  );
};

// Done Step
const DoneStep = ({ onGoToHome, onStartNew }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <DashboardCard>
        <CardBody>
          <div className="flex flex-col items-center text-center py-xl">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mb-lg">
              <Trophy className="w-10 h-10 text-success" />
            </div>
            <CardTitle className="text-2xl mb-md">
              Interview Completed!
            </CardTitle>
            <CardSubtitle className="text-base mb-xl">
              Great job completing your interview. Your responses have been
              evaluated and saved. You can view your results in the Evaluations
              section.
            </CardSubtitle>
            <div className="flex flex-col sm:flex-row gap-md max-w-md mx-auto justify-center">
              <Button
                variant="primary"
                size="lg"
                className="w-full min-w-fit"
                onClick={onGoToHome}
                fullWidth
                icon={<Home className="w-5 h-5" />}
                iconPosition="left"
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full min-w-fit"
                onClick={onStartNew}
                fullWidth
                icon={<Play className="w-5 h-5" />}
                iconPosition="left"
              >
                Start New Interview
              </Button>
            </div>
          </div>
        </CardBody>
      </DashboardCard>
    </motion.div>
  );
};

export default function RealtimeInterview() {
  const navigate = useNavigate();
  const {
    status,
    transcript,
    currentQuestion,
    error,
    questionsAnswered,
    canEndInterview,
    totalQuestions,
    isAssistantSpeaking,
    startInterview,
    stopInterview,
  } = useRealtimeInterview();

  const [currentStep, setCurrentStep] = useState("selection"); // 'selection' | 'preparation' | 'active' | 'done'
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [wasInterviewActive, setWasInterviewActive] = useState(false);
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript]);

  // Auto-end interview when all questions are answered
  useEffect(() => {
    if (
      currentStep === "active" &&
      questionsAnswered > 0 &&
      questionsAnswered >= totalQuestions &&
      canEndInterview &&
      status !== "idle"
    ) {
      // Small delay to ensure the last evaluation is processed
      const timer = setTimeout(() => {
        stopInterview();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    questionsAnswered,
    totalQuestions,
    canEndInterview,
    currentStep,
    status,
    stopInterview,
  ]);

  // Move to active step when interview starts
  useEffect(() => {
    if (
      status !== "idle" &&
      currentStep !== "active" &&
      currentStep !== "done"
    ) {
      setCurrentStep("active");
      setWasInterviewActive(true);
    }
  }, [status, currentStep]);

  // Move to done step when interview completes
  useEffect(() => {
    // Check if interview is complete: status is idle, we were active, and all questions are answered
    if (
      status === "idle" &&
      wasInterviewActive &&
      currentStep === "active" &&
      questionsAnswered > 0 &&
      questionsAnswered >= totalQuestions
    ) {
      setTimeout(() => {
        setCurrentStep("done");
        setWasInterviewActive(false);
      }, 500); // Small delay to ensure state is settled
    }
  }, [
    status,
    currentStep,
    wasInterviewActive,
    questionsAnswered,
    totalQuestions,
  ]);

  // Also check canEndInterview as a trigger
  useEffect(() => {
    if (
      canEndInterview &&
      currentStep === "active" &&
      status === "idle" &&
      wasInterviewActive
    ) {
      setTimeout(() => {
        setCurrentStep("done");
        setWasInterviewActive(false);
      }, 500);
    }
  }, [canEndInterview, currentStep, status, wasInterviewActive]);

  const handleContinue = () => {
    if (selectedSkills.length > 0) {
      setCurrentStep("preparation");
    }
  };

  const handleStartInterview = () => {
    startInterview(selectedSkills);
    setCurrentStep("active");
  };

  const handleBack = () => {
    setCurrentStep("selection");
  };

  const handleGoToHome = () => {
    // Navigate to interviews dashboard
    navigate("/interviews");
  };

  const handleStartNew = () => {
    // Reset to first step
    setCurrentStep("selection");
    setSelectedSkills([]);
    setWasInterviewActive(false);
  };

  const getStatusText = () => {
    switch (status) {
      case "idle":
        return "Ready";
      case "connecting":
        return "Connecting...";
      case "active":
        return "Active";
      case "listening":
        return "Listening...";
      case "speaking":
        return "Speaking...";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  const getCurrentStepNumber = () => {
    switch (currentStep) {
      case "selection":
        return 1;
      case "preparation":
        return 2;
      case "active":
        return 3;
      case "done":
        return 4;
      default:
        return 1;
    }
  };

  return (
    <DashboardContainer>
      <DashboardContent maxWidth="1280px">
        <DashboardHeader>
          <div className="flex justify-between items-start w-full">
            <div>
              <DashboardTitle>Interview</DashboardTitle>
              <DashboardSubtitle>
                Practice your technical skills with AI-powered interviews
              </DashboardSubtitle>
            </div>
            {currentStep === "active" && (
              <div className={getStatusBadgeClasses(status)}>
                <StatusDot status={status} />
                {getStatusText()}
              </div>
            )}
          </div>
        </DashboardHeader>

        {currentStep !== "active" && (
          <StepIndicator currentStep={getCurrentStepNumber()} />
        )}

        <AnimatePresence mode="wait">
          {currentStep === "selection" && (
            <SkillsSelectionStep
              key="selection"
              skills={selectedSkills}
              onSkillsChange={setSelectedSkills}
              onContinue={handleContinue}
            />
          )}

          {currentStep === "preparation" && (
            <PreparationStep
              key="preparation"
              skills={selectedSkills}
              onBack={handleBack}
              onStartInterview={handleStartInterview}
              isConnecting={status === "connecting"}
            />
          )}

          {currentStep === "active" && (
            <ActiveInterviewStep
              key="active"
              status={status}
              transcript={transcript}
              currentQuestion={currentQuestion}
              error={error}
              questionsAnswered={questionsAnswered}
              canEndInterview={canEndInterview}
              totalQuestions={totalQuestions}
              isAssistantSpeaking={isAssistantSpeaking}
              onStopInterview={stopInterview}
              onInterviewComplete={() => {
                if (questionsAnswered >= totalQuestions) {
                  setCurrentStep("done");
                  setWasInterviewActive(false);
                }
              }}
              transcriptEndRef={transcriptEndRef}
            />
          )}

          {currentStep === "done" && (
            <DoneStep
              key="done"
              onGoToHome={handleGoToHome}
              onStartNew={handleStartNew}
            />
          )}
        </AnimatePresence>
      </DashboardContent>
    </DashboardContainer>
  );
}
