import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const StyledButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.sm};
  padding: ${(props) => {
    if (props.size === "sm")
      return `${props.theme.spacing.xs} ${props.theme.spacing.sm}`;
    if (props.size === "lg")
      return `${props.theme.spacing.md} ${props.theme.spacing.xl}`;
    return `${props.theme.spacing.sm} ${props.theme.spacing.md}`;
  }};
  font-size: ${(props) => {
    if (props.size === "sm") return "0.875rem";
    if (props.size === "lg") return "1.125rem";
    return "1rem";
  }};
  font-weight: 500;
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${(props) => props.theme.transitions.fast};
  white-space: nowrap;

  ${(props) => {
    switch (props.variant) {
      case "primary":
        return `
          background: ${props.theme.colors.primary};
          color: ${props.theme.colors.white};
          &:hover:not(:disabled) {
            background: ${props.theme.colors.primaryDark};
            transform: translateY(-2px);
            box-shadow: ${props.theme.shadows.md};
          }
        `;
      case "secondary":
        return `
          background: ${props.theme.colors.secondary};
          color: ${props.theme.colors.white};
          &:hover:not(:disabled) {
            background: ${props.theme.colors.gray[700]};
            transform: translateY(-2px);
            box-shadow: ${props.theme.shadows.md};
          }
        `;
      case "outline":
        return `
          background: transparent;
          color: ${props.theme.colors.primary};
          border: 2px solid ${props.theme.colors.primary};
          &:hover:not(:disabled) {
            background: ${props.theme.colors.primary};
            color: ${props.theme.colors.white};
            transform: translateY(-2px);
            box-shadow: ${props.theme.shadows.md};
          }
        `;
      case "ghost":
        return `
          background: transparent;
          color: ${props.theme.colors.primary};
          &:hover:not(:disabled) {
            background: ${props.theme.colors.gray[100]};
          }
        `;
      case "danger":
        return `
          background: ${props.theme.colors.danger};
          color: ${props.theme.colors.white};
          &:hover:not(:disabled) {
            background: #c82333;
            transform: translateY(-2px);
            box-shadow: ${props.theme.shadows.md};
          }
        `;
      case "success":
        return `
          background: ${props.theme.colors.success};
          color: ${props.theme.colors.white};
          &:hover:not(:disabled) {
            background: #218838;
            transform: translateY(-2px);
            box-shadow: ${props.theme.shadows.md};
          }
        `;
      default:
        return `
          background: ${props.theme.colors.primary};
          color: ${props.theme.colors.white};
        `;
    }
  }}

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${(props) => props.fullWidth && "width: 100%;"}
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  ${(props) => props.iconPosition === "right" && "order: 2;"}
`;

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
  ...props
}) => {
  const buttonProps = {
    variant,
    size,
    fullWidth,
    onClick,
    disabled,
    type,
    whileHover: !disabled ? { scale: 1.01 } : {},
    whileTap: !disabled ? { scale: 0.99 } : {},
    transition: { duration: 0.15 },
    ...props,
  };

  return (
    <StyledButton {...buttonProps}>
      {icon && iconPosition === "left" && <IconWrapper>{icon}</IconWrapper>}
      {children}
      {icon && iconPosition === "right" && (
        <IconWrapper iconPosition="right">{icon}</IconWrapper>
      )}
    </StyledButton>
  );
};

export default Button;
