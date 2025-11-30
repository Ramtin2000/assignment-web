import React, { createContext, useContext, useState, useEffect } from "react";

const SideNavContext = createContext();

export const useSideNav = () => {
  const context = useContext(SideNavContext);
  if (!context) {
    throw new Error("useSideNav must be used within SideNavProvider");
  }
  return context;
};

export const SideNavProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sideNavCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("sideNavCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSideNav = () => {
    setIsCollapsed((prev) => !prev);
  };

  const navWidth = isCollapsed ? 80 : 260;

  return (
    <SideNavContext.Provider value={{ isCollapsed, toggleSideNav, navWidth }}>
      {children}
    </SideNavContext.Provider>
  );
};
