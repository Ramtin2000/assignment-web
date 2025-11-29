import React from "react";
import styled from "styled-components";
import { SideNav } from "./ui/SideNav";

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 240px;
  min-height: 100vh;
  width: calc(100% - 240px);
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
`;

export const Layout = ({ children }) => {
  return (
    <LayoutContainer>
      <SideNav />
      <MainContent>{children}</MainContent>
    </LayoutContainer>
  );
};

export default Layout;
