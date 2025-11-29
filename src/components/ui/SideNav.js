import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const NavContainer = styled.nav`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 240px;
  background: ${(props) => props.theme.colors.white};
  border-right: 1px solid ${(props) => props.theme.colors.gray[200]};
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing.lg};
  box-shadow: ${(props) => props.theme.shadows.sm};
  z-index: 100;
  overflow: hidden;
  box-sizing: border-box;
`;

const NavHeader = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.md};
  padding-bottom: ${(props) => props.theme.spacing.md};
  border-bottom: 1px solid ${(props) => props.theme.colors.gray[200]};
  flex-shrink: 0;
`;

const NavTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.gray[900]};
  margin: 0;
`;

const NavLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const NavLink = styled(motion.div)`
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.md};
  cursor: pointer;
  font-weight: 500;
  color: ${(props) =>
    props.active ? props.theme.colors.primary : props.theme.colors.gray[700]};
  background: ${(props) =>
    props.active ? `${props.theme.colors.primary}15` : "transparent"};
  transition: all ${(props) => props.theme.transitions.fast};

  &:hover {
    background: ${(props) =>
      props.active
        ? `${props.theme.colors.primary}20`
        : props.theme.colors.gray[100]};
    color: ${(props) =>
      props.active ? props.theme.colors.primary : props.theme.colors.gray[900]};
  }
`;

const NavFooter = styled.div`
  margin-top: auto;
  padding-top: ${(props) => props.theme.spacing.lg};
  border-top: 1px solid ${(props) => props.theme.colors.gray[200]};
  flex-shrink: 0;
`;

const LogoutButton = styled(motion.button)`
  width: 100%;
  padding: ${(props) => props.theme.spacing.md};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  background: ${(props) => props.theme.colors.danger};
  color: ${(props) => props.theme.colors.white};
  font-weight: 500;
  cursor: pointer;
  transition: all ${(props) => props.theme.transitions.fast};

  &:hover {
    background: #c82333;
    transform: translateY(-1px);
    box-shadow: ${(props) => props.theme.shadows.md};
  }
`;

export const SideNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/");
  };

  const navItems = [
    { path: "/interviews", label: "Interviews" },
    { path: "/evaluations", label: "Evaluations" },
  ];

  return (
    <NavContainer>
      <NavHeader>
        <NavTitle>Interview App</NavTitle>
      </NavHeader>
      <NavLinks>
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/evaluations" &&
              location.pathname.startsWith("/evaluation"));
          return (
            <NavLink
              key={item.path}
              active={isActive}
              onClick={() => navigate(item.path)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {item.label}
            </NavLink>
          );
        })}
      </NavLinks>
      <NavFooter>
        <LogoutButton
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Logout
        </LogoutButton>
      </NavFooter>
    </NavContainer>
  );
};

export default SideNav;
