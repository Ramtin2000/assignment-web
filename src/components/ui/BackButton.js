import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const BackButtonContainer = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  background: transparent;
  border: none;
  color: ${(props) => props.theme.colors.primary};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: ${(props) => props.theme.spacing.sm};
  margin-bottom: ${(props) => props.theme.spacing.md};
  transition: all ${(props) => props.theme.transitions.fast};

  &:hover {
    color: ${(props) => props.theme.colors.primaryDark};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const BackIcon = () => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

export const BackButton = ({ onClick, children = "Back", ...props }) => {
  return (
    <BackButtonContainer
      onClick={onClick}
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      <BackIcon />
      {children}
    </BackButtonContainer>
  );
};

export default BackButton;
