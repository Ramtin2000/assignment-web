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
  padding: ${(props) => props.theme.spacing.sm} 0;
  box-shadow: ${(props) => props.theme.shadows.sm};
  z-index: 100;
  overflow: hidden;
  box-sizing: border-box;
`;

const NavLinks = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const NavLink = styled(motion.div)`
  padding: ${(props) => props.theme.spacing.md};
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
  padding-top: ${(props) => props.theme.spacing.sm};
  border-top: 1px solid ${(props) => props.theme.colors.gray[200]};
  flex-shrink: 0;
`;

const LogoutButton = styled(motion.button)`
  width: 100%;
  padding: ${(props) => props.theme.spacing.md};
  border: none;
  background: ${(props) => props.theme.colors.danger};
  color: ${(props) => props.theme.colors.white};
  font-weight: 500;
  cursor: pointer;
  transition: all ${(props) => props.theme.transitions.fast};

  &:hover {
    background: #c82333;
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
