import React from "react";
import { motion } from "framer-motion";

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

export const Loading = ({ message = "Loading..." }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-gray-100"
    >
      <div className="text-center">
        <motion.div
          variants={spinnerVariants}
          animate="animate"
          className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full mx-auto"
        />
        <p className="mt-md text-gray-600 text-base">{message}</p>
      </div>
    </motion.div>
  );
};

export default Loading;
