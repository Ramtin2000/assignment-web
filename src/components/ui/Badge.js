import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const StyledBadge = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${(props) => {
    if (props.size === "sm")
      return `${props.theme.spacing.xs} ${props.theme.spacing.sm}`;
    if (props.size === "lg")
      return `${props.theme.spacing.sm} ${props.theme.spacing.md}`;
    return `${props.theme.spacing.xs} ${props.theme.spacing.sm}`;
  }};
  font-size: ${(props) => {
    if (props.size === "sm") return "0.75rem";
    if (props.size === "lg") return "1rem";
    return "0.875rem";
  }};
  font-weight: ${(props) => (props.bold ? "600" : "500")};
  border-radius: ${(props) => props.theme.borderRadius.full};
  white-space: nowrap;

  ${(props) => {
    switch (props.variant) {
      case "success":
        return `
          background: ${props.theme.colors.success};
          color: ${props.theme.colors.white};
        `;
      case "warning":
        return `
          background: ${props.theme.colors.warning};
          color: ${props.theme.colors.dark};
        `;
      case "danger":
        return `
          background: ${props.theme.colors.danger};
          color: ${props.theme.colors.white};
        `;
      case "info":
        return `
          background: ${props.theme.colors.info};
          color: ${props.theme.colors.white};
        `;
      case "primary":
        return `
          background: ${props.theme.colors.primary};
          color: ${props.theme.colors.white};
        `;
      case "secondary":
        return `
          background: ${props.theme.colors.secondary};
          color: ${props.theme.colors.white};
        `;
      case "outline":
        return `
          background: transparent;
          color: ${props.theme.colors.primary};
          border: 1px solid ${props.theme.colors.primary};
        `;
      default:
        return `
          background: ${props.theme.colors.gray[200]};
          color: ${props.theme.colors.gray[800]};
        `;
    }
  }}
`;

// Score Badge with automatic color based on score
export const ScoreBadge = styled(StyledBadge)`
  ${(props) => {
    const score = props.score || 0;
    if (score >= 8) {
      return `
        background: ${props.theme.colors.success};
        color: ${props.theme.colors.white};
      `;
    }
    if (score >= 6) {
      return `
        background: ${props.theme.colors.warning};
        color: ${props.theme.colors.dark};
      `;
    }
    return `
      background: ${props.theme.colors.danger};
      color: ${props.theme.colors.white};
    `;
  }}
`;

export const Badge = ({
  children,
  variant = "default",
  size = "md",
  bold = false,
  ...props
}) => {
  return (
    <StyledBadge variant={variant} size={size} bold={bold} {...props}>
      {children}
    </StyledBadge>
  );
};

export default Badge;
