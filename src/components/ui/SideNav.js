import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useSideNav } from "../../context/SideNavContext";
import {
  MessageCircle,
  ClipboardCheck,
  LogOut,
  CheckCircle2,
  Menu,
  ChevronLeft,
} from "lucide-react";

export const SideNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { isCollapsed, toggleSideNav, navWidth } = useSideNav();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/");
  };

  const navItems = [
    {
      path: "/interview",
      label: "Interview",
      icon: MessageCircle,
    },
    {
      path: "/evaluations",
      label: "Evaluations",
      icon: ClipboardCheck,
    },
  ];

  return (
    <motion.nav
      initial={{ x: -240 }}
      animate={{ x: 0, width: navWidth }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="hidden md:flex fixed left-0 top-0 h-screen bg-gradient-to-b from-white to-gray-50/50 border-r border-gray-200/80 flex-col shadow-lg z-50 overflow-hidden box-border backdrop-blur-sm"
      style={{ width: navWidth }}
    >
      {/* Logo/Brand Section */}
      <div
        className={`px-lg pt-xl pb-lg border-b border-gray-200/60 ${
          isCollapsed ? "px-md" : ""
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-md"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col overflow-hidden"
              >
                <span className="text-lg font-bold text-gray-900 leading-tight whitespace-nowrap">
                  Interview AI
                </span>
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                  Assessment Platform
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Toggle Button */}
      <div className="px-md pt-md pb-sm border-b border-gray-200/60">
        <motion.button
          onClick={toggleSideNav}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center justify-center p-sm rounded-lg hover:bg-gray-100 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5 text-gray-600" strokeWidth={2} />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" strokeWidth={2} />
          )}
        </motion.button>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto px-md py-lg gap-xs">
        {navItems.map((item, index) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/evaluations" &&
              location.pathname.startsWith("/evaluation")) ||
            (item.path === "/interview" &&
              location.pathname.startsWith("/interview"));
          const Icon = item.icon;

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
            >
              <motion.div
                onClick={() => navigate(item.path)}
                whileHover={{ x: isCollapsed ? 0 : 4 }}
                whileTap={{ scale: 0.97 }}
                className={`group relative flex items-center ${
                  isCollapsed ? "justify-center" : "gap-md"
                } px-md py-md rounded-xl cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm"
                    : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                }`}
                title={isCollapsed ? item.label : ""}
              >
                {/* Active Indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      exit={{ scaleY: 0 }}
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-sm"
                    />
                  )}
                </AnimatePresence>

                {/* Icon */}
                <div
                  className={`flex-shrink-0 transition-all duration-300 ${
                    isActive
                      ? "text-primary"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>

                {/* Label */}
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`font-semibold text-sm transition-all duration-300 whitespace-nowrap overflow-hidden ${
                        isActive ? "text-primary" : "text-gray-700"
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Hover Glow Effect */}
                {!isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  />
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Logout Section */}
      <div
        className={`mt-auto pt-md pb-lg border-t border-gray-200/60 flex-shrink-0 ${
          isCollapsed ? "px-md" : "px-md"
        }`}
      >
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 2 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center" : "justify-center gap-md"
          } px-md py-md rounded-xl bg-gradient-to-r from-danger to-[#c82333] text-white font-semibold text-sm cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg hover:from-[#c82333] hover:to-danger group`}
          title="Logout"
        >
          <LogOut
            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 flex-shrink-0"
            strokeWidth={2}
          />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default SideNav;
