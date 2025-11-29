import styled from "styled-components";
import { motion } from "framer-motion";

// Dashboard Container
export const DashboardContainer = styled.div`
  background: ${(props) => props.theme.colors.gray[100]};
  padding: ${(props) => props.theme.spacing.xl}
    ${(props) => props.theme.spacing.md};
  box-sizing: border-box;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  @media (min-width: ${(props) => props.theme.breakpoints.sm}) {
    padding: ${(props) => props.theme.spacing.xl}
      ${(props) => props.theme.spacing.lg};
  }

  ${(props) => props.noPadding && "padding: 0;"}
`;

// Main Content Wrapper
export const DashboardContent = styled.div`
  max-width: ${(props) => props.maxWidth || "1280px"};
  margin: 0 auto;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

// Dashboard Header
export const DashboardHeader = styled(motion.div)`
  margin-bottom: ${(props) => props.theme.spacing.xl};
  text-align: left;
  align-self: flex-start;
  width: 100%;
`;

export const DashboardTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.gray[900]};
  margin: 0 0 ${(props) => props.theme.spacing.sm} 0;

  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    font-size: 2.5rem;
  }
`;

export const DashboardSubtitle = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.colors.gray[600]};
  margin: 0;
`;

// Dashboard Grid
export const DashboardGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${(props) => props.theme.spacing.lg};

  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: ${(props) => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(${(props) => props.columns || 3}, 1fr);
  }
`;

// Dashboard Card
export const DashboardCard = styled(motion.div)`
  background: ${(props) => props.theme.colors.white};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.lg};
  box-shadow: ${(props) => props.theme.shadows.sm};
  transition: all ${(props) => props.theme.transitions.normal};
  cursor: ${(props) => (props.clickable ? "pointer" : "default")};
  border: 1px solid ${(props) => props.theme.colors.gray[200]};

  &:hover {
    ${(props) =>
      props.clickable &&
      `
      box-shadow: ${props.theme.shadows.md};
      transform: translateY(-2px);
      border-color: ${props.theme.colors.primary};
    `}
  }
`;

// Card Header
export const CardHeader = styled.div`
  display: flex;
  align-items: ${(props) => props.align || "flex-start"};
  justify-content: ${(props) => props.justify || "space-between"};
  margin-bottom: ${(props) => props.theme.spacing.md};
  gap: ${(props) => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

export const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.gray[900]};
  margin: 0;
  text-align: left;
`;

export const CardSubtitle = styled.p`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.gray[600]};
  margin: ${(props) => props.theme.spacing.xs} 0 0 0;
  text-align: left;
`;

// Card Body
export const CardBody = styled.div`
  color: ${(props) => props.theme.colors.gray[700]};
  line-height: 1.6;
  text-align: left;
`;

// Card Footer
export const CardFooter = styled.div`
  margin-top: ${(props) => props.theme.spacing.md};
  padding-top: ${(props) => props.theme.spacing.md};
  border-top: 1px solid ${(props) => props.theme.colors.gray[200]};
  display: flex;
  align-items: center;
  justify-content: ${(props) => props.justify || "flex-end"};
  gap: ${(props) => props.theme.spacing.sm};
`;

// Empty State
export const EmptyState = styled(motion.div)`
  background: ${(props) => props.theme.colors.white};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xxl};
  text-align: center;
  box-shadow: ${(props) => props.theme.shadows.sm};
`;

export const EmptyStateTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.gray[900]};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
`;

export const EmptyStateText = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.colors.gray[600]};
  margin: 0 0 ${(props) => props.theme.spacing.xl} 0;
`;

// Loading State
export const LoadingState = styled(motion.div)`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.colors.gray[100]};
`;

export const LoadingSpinner = styled(motion.div)`
  width: 48px;
  height: 48px;
  border: 4px solid ${(props) => props.theme.colors.gray[200]};
  border-top-color: ${(props) => props.theme.colors.primary};
  border-radius: 50%;
`;

export const LoadingText = styled.p`
  margin-top: ${(props) => props.theme.spacing.md};
  color: ${(props) => props.theme.colors.gray[600]};
  font-size: 1rem;
`;

// Error State
export const ErrorState = styled(motion.div)`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.colors.gray[100]};
  padding: ${(props) => props.theme.spacing.md};
`;

export const ErrorCard = styled(motion.div)`
  background: ${(props) => props.theme.colors.white};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  box-shadow: ${(props) => props.theme.shadows.md};
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

export const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.danger};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
`;

export const ErrorText = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.colors.gray[700]};
  margin: 0 0 ${(props) => props.theme.spacing.xl} 0;
`;

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
