import React from "react";
import { motion } from "framer-motion";

const BackIcon = () => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

export const BackButton = ({
  onClick,
  children = "Back",
  className = "",
  ...props
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center gap-sm bg-transparent border-none text-primary text-base font-medium cursor-pointer p-sm mb-md transition-all duration-fast hover:text-primaryDark text-left ${className}`.trim()}
      {...props}
    >
      <BackIcon />
      {children}
    </motion.button>
  );
};

export default BackButton;
