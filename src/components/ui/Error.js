import React from "react";
import { motion } from "framer-motion";
import { Button } from "./Button";

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const Error = ({
  title = "Error",
  message,
  onRetry,
  retryText = "Try Again",
  onBack,
  backText = "Go Back",
}) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
      className="min-h-screen flex items-center justify-center bg-gray-100 p-md"
    >
      <motion.div className="bg-white rounded-lg p-xl shadow-md max-w-[500px] w-full text-center">
        <h2 className="text-2xl font-semibold text-danger mb-md m-0">
          {title}
        </h2>
        {message && (
          <p className="text-base text-gray-700 mb-xl m-0">{message}</p>
        )}
        <div className="flex gap-2 justify-center flex-wrap">
          {onRetry && (
            <Button variant="primary" onClick={onRetry}>
              {retryText}
            </Button>
          )}
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              {backText}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Error;
