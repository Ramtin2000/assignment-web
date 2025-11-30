import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SideNavProvider, useSideNav } from "./context/SideNavContext";
import Login from "./components/Login";
import Register from "./components/Register";
import RealtimeInterview from "./components/RealtimeInterview";
import InterviewDashboard from "./components/InterviewDashboard";
import Evaluations from "./components/Evaluations";
import SessionEvaluations from "./components/SessionEvaluations";
import EvaluationDetail from "./components/EvaluationDetail";
import { SideNav } from "./components/ui/SideNav";
import { MobileNav } from "./components/ui/MobileNav";
import "./App.css";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/interviews" replace />;
};

const ProtectedLayout = ({ children }) => {
  const { navWidth } = useSideNav();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <SideNav />
      {/* Mobile Navigation */}
      <MobileNav />
      {/* Content Area */}
      <motion.div
        className="flex-1 w-full pt-16 md:pt-0"
        animate={{ marginLeft: isMobile ? 0 : navWidth }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={{
          marginLeft: isMobile ? 0 : navWidth,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SideNavProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/interview"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <RealtimeInterview />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evaluations"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <Evaluations />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evaluations/:sessionId"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <SessionEvaluations />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evaluations/:sessionId/:qaId"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <EvaluationDetail />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={<Navigate to="/interviews" replace />}
              />
            </Routes>
          </div>
        </Router>
      </SideNavProvider>
    </AuthProvider>
  );
}

export default App;
