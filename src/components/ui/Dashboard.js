import { motion } from "framer-motion";

// Animation variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

export const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Dashboard Container
export const DashboardContainer = ({
  children,
  noPadding = false,
  className = "",
}) => {
  const paddingClass = noPadding ? "" : "p-xl md:p-lg";
  return (
    <div
      className={`bg-gray-100 ${paddingClass} box-border min-h-screen flex flex-col ${className}`.trim()}
    >
      {children}
    </div>
  );
};

// Main Content Wrapper
export const DashboardContent = ({
  children,
  maxWidth = "1280px",
  className = "",
}) => {
  return (
    <div
      style={{ maxWidth }}
      className={`mx-auto w-full flex-1 flex flex-col ${className}`.trim()}
    >
      {children}
    </div>
  );
};

// Dashboard Header
export const DashboardHeader = ({ children, className = "" }) => {
  return (
    <motion.div
      className={`mb-xl text-left self-start w-full ${className}`.trim()}
    >
      {children}
    </motion.div>
  );
};

export const DashboardTitle = ({ children, className = "" }) => {
  return (
    <h1
      className={`text-3xl md:text-4xl font-bold text-gray-900 mb-sm m-0 ${className}`.trim()}
    >
      {children}
    </h1>
  );
};

export const DashboardSubtitle = ({ children, className = "" }) => {
  return (
    <p className={`text-base text-gray-600 m-0 ${className}`.trim()}>
      {children}
    </p>
  );
};

// Dashboard Grid
export const DashboardGrid = ({ children, columns = 3, className = "" }) => {
  const gridCols =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
      ? "grid-cols-2"
      : "grid-cols-3";
  return (
    <motion.div
      className={`grid grid-cols-1 md:grid-cols-2 lg:${gridCols} gap-lg ${className}`.trim()}
    >
      {children}
    </motion.div>
  );
};

// Dashboard Card
export const DashboardCard = ({
  children,
  clickable = false,
  className = "",
}) => {
  const hoverClasses = clickable
    ? "hover:shadow-md hover:-translate-y-0.5 hover:border-primary cursor-pointer"
    : "cursor-default";
  return (
    <motion.div
      className={`bg-white rounded-lg p-lg shadow-sm transition-all duration-normal border border-gray-200 ${hoverClasses} ${className}`.trim()}
    >
      {children}
    </motion.div>
  );
};

// Card Header
export const CardHeader = ({
  children,
  align = "flex-start",
  justify = "space-between",
  className = "",
}) => {
  const alignClass =
    align === "center"
      ? "items-center"
      : align === "flex-end"
      ? "items-end"
      : "items-start";
  const justifyClass =
    justify === "center"
      ? "justify-center"
      : justify === "flex-start"
      ? "justify-start"
      : "justify-between";
  return (
    <div
      className={`flex ${alignClass} ${justifyClass} mb-md gap-sm flex-wrap ${className}`.trim()}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = "" }) => {
  return (
    <h3
      className={`text-lg font-semibold text-gray-900 m-0 text-left ${className}`.trim()}
    >
      {children}
    </h3>
  );
};

export const CardSubtitle = ({ children, className = "" }) => {
  return (
    <p
      className={`text-sm text-gray-600 mt-xs mb-0 text-left ${className}`.trim()}
    >
      {children}
    </p>
  );
};

// Card Body
export const CardBody = ({ children, className = "" }) => {
  return (
    <div
      className={`text-gray-700 leading-relaxed text-left ${className}`.trim()}
    >
      {children}
    </div>
  );
};

// Card Footer
export const CardFooter = ({
  children,
  justify = "flex-end",
  className = "",
}) => {
  const justifyClass =
    justify === "center"
      ? "justify-center"
      : justify === "flex-start"
      ? "justify-start"
      : "justify-end";
  return (
    <div
      className={`mt-md pt-md border-t border-gray-200 flex items-center ${justifyClass} gap-sm ${className}`.trim()}
    >
      {children}
    </div>
  );
};

// Empty State
export const EmptyState = ({ children, className = "" }) => {
  return (
    <motion.div
      className={`bg-white rounded-lg p-xxl text-center shadow-sm ${className}`.trim()}
    >
      {children}
    </motion.div>
  );
};

export const EmptyStateTitle = ({ children, className = "" }) => {
  return (
    <h2
      className={`text-2xl font-semibold text-gray-900 mb-md m-0 ${className}`.trim()}
    >
      {children}
    </h2>
  );
};

export const EmptyStateText = ({ children, className = "" }) => {
  return (
    <p className={`text-base text-gray-600 mb-xl m-0 ${className}`.trim()}>
      {children}
    </p>
  );
};

// Loading State
export const LoadingState = ({ children, className = "" }) => {
  return (
    <motion.div
      className={`min-h-screen flex items-center justify-center bg-gray-100 ${className}`.trim()}
    >
      {children}
    </motion.div>
  );
};

export const LoadingSpinner = ({ className = "" }) => {
  return (
    <motion.div
      variants={spinnerVariants}
      animate="animate"
      className={`w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full ${className}`.trim()}
    />
  );
};

export const LoadingText = ({ children, className = "" }) => {
  return (
    <p className={`mt-md text-gray-600 text-base ${className}`.trim()}>
      {children}
    </p>
  );
};

// Error State
export const ErrorState = ({ children, className = "" }) => {
  return (
    <motion.div
      className={`min-h-screen flex items-center justify-center bg-gray-100 p-md ${className}`.trim()}
    >
      {children}
    </motion.div>
  );
};

export const ErrorCard = ({ children, className = "" }) => {
  return (
    <motion.div
      className={`bg-white rounded-lg p-xl shadow-md max-w-[500px] w-full text-center ${className}`.trim()}
    >
      {children}
    </motion.div>
  );
};

export const ErrorTitle = ({ children, className = "" }) => {
  return (
    <h2
      className={`text-2xl font-semibold text-danger mb-md m-0 ${className}`.trim()}
    >
      {children}
    </h2>
  );
};

export const ErrorText = ({ children, className = "" }) => {
  return (
    <p className={`text-base text-gray-700 mb-xl m-0 ${className}`.trim()}>
      {children}
    </p>
  );
};
