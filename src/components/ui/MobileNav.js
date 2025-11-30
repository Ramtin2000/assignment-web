import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  MessageCircle,
  ClipboardCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/");
    setIsOpen(false);
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

  const handleNavClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const isActive = (path) => {
    return (
      location.pathname === path ||
      (path === "/evaluations" && location.pathname.startsWith("/evaluation")) ||
      (path === "/interview" && location.pathname.startsWith("/interview"))
    );
  };

  return (
    <div className="md:hidden">
      {/* Fixed Top Bar with Burger Menu */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md shadow-md"
            : "bg-white/95 backdrop-blur-sm"
        }`}
      >
        <div className="flex items-center justify-between px-lg py-md">
          <div className="flex items-center gap-md">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Interview AI</span>
          </div>
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-700" strokeWidth={2} />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" strokeWidth={2} />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-[190]"
            />
            {/* Mobile Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-[200] overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="px-lg pt-16 pb-lg border-b border-gray-200">
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-gray-900 leading-tight">
                        Interview AI
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        Assessment Platform
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="flex flex-col flex-1 px-md py-lg gap-xs">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                      >
                        <motion.div
                          onClick={() => handleNavClick(item.path)}
                          whileTap={{ scale: 0.97 }}
                          className={`group relative flex items-center gap-md px-md py-md rounded-xl cursor-pointer transition-all duration-300 ${
                            active
                              ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm"
                              : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                          }`}
                        >
                          {/* Active Indicator */}
                          {active && (
                            <motion.div
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-sm"
                            />
                          )}

                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 transition-all duration-300 ${
                              active
                                ? "text-primary"
                                : "text-gray-400 group-hover:text-gray-600"
                            }`}
                          >
                            <Icon className="w-5 h-5" strokeWidth={2} />
                          </div>

                          {/* Label */}
                          <span
                            className={`font-semibold text-sm transition-all duration-300 ${
                              active ? "text-primary" : "text-gray-700"
                            }`}
                          >
                            {item.label}
                          </span>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Logout Section */}
                <div className="mt-auto pt-md pb-lg px-md border-t border-gray-200">
                  <motion.button
                    onClick={handleLogout}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-md px-md py-md rounded-xl bg-gradient-to-r from-danger to-[#c82333] text-white font-semibold text-sm cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg hover:from-[#c82333] hover:to-danger"
                  >
                    <LogOut className="w-5 h-5" strokeWidth={2} />
                    <span>Logout</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileNav;

