import React from "react";
import { motion } from "framer-motion";

const getVariantClasses = (variant) => {
  switch (variant) {
    case "primary":
      return "bg-primary text-white hover:bg-primaryDark hover:-translate-y-0.5 hover:shadow-md active:translate-y-0";
    case "secondary":
      return "bg-secondary text-white hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0";
    case "outline":
      return "bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white hover:-translate-y-0.5 hover:shadow-md active:translate-y-0";
    case "ghost":
      return "bg-transparent text-primary hover:bg-gray-100";
    case "danger":
      return "bg-danger text-white hover:bg-[#c82333] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0";
    case "success":
      return "bg-success text-white hover:bg-[#218838] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0";
    default:
      return "bg-primary text-white";
  }
};

const getSizeClasses = (size) => {
  switch (size) {
    case "sm":
      return "px-sm py-xs text-sm";
    case "lg":
      return "px-xl py-md text-lg";
    default:
      return "px-md py-sm text-base";
  }
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  iconPosition = "left",
  onClick,
  disabled = false,
  type = "button",
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-sm font-medium border-none rounded-md cursor-pointer transition-all duration-fast whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed";
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);
  const widthClass = fullWidth ? "w-full" : "";

  const buttonClasses =
    `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`.trim();

  const buttonProps = {
    onClick,
    disabled,
    type,
    whileHover: !disabled ? { scale: 1.01 } : {},
    whileTap: !disabled ? { scale: 0.99 } : {},
    transition: { duration: 0.15 },
    className: buttonClasses,
    ...props,
  };

  return (
    <motion.button {...buttonProps}>
      {icon && iconPosition === "left" && (
        <span className="inline-flex items-center">{icon}</span>
      )}
      {children}
      {icon && iconPosition === "right" && (
        <span className="inline-flex items-center order-2">{icon}</span>
      )}
    </motion.button>
  );
};

export default Button;
