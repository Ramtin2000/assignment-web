import React from "react";
import { motion } from "framer-motion";

const getVariantClasses = (variant) => {
  switch (variant) {
    case "success":
      return "bg-success text-white";
    case "warning":
      return "bg-warning text-dark";
    case "danger":
      return "bg-danger text-white";
    case "info":
      return "bg-info text-white";
    case "primary":
      return "bg-primary text-white";
    case "secondary":
      return "bg-secondary text-white";
    case "outline":
      return "bg-transparent text-primary border border-primary";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

const getSizeClasses = (size) => {
  switch (size) {
    case "sm":
      return "px-sm py-xs text-xs";
    case "lg":
      return "px-md py-sm text-base";
    default:
      return "px-sm py-xs text-sm";
  }
};

export const Badge = ({
  children,
  variant = "default",
  size = "md",
  bold = false,
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-full whitespace-nowrap";
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);
  const weightClass = bold ? "font-semibold" : "font-medium";

  const badgeClasses =
    `${baseClasses} ${variantClasses} ${sizeClasses} ${weightClass} ${className}`.trim();

  return (
    <motion.span className={badgeClasses} {...props}>
      {children}
    </motion.span>
  );
};

export const ScoreBadge = ({
  score = 0,
  children,
  className = "",
  ...props
}) => {
  let variant = "danger";
  if (score >= 8) variant = "success";
  else if (score >= 6) variant = "warning";

  return (
    <Badge variant={variant} className={className} {...props}>
      {children}
    </Badge>
  );
};

export default Badge;
