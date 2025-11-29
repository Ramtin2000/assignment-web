import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./lib/ThemeProvider";
import Login from "./components/Login";
import Register from "./components/Register";
import InterviewGenerator from "./components/InterviewGenerator";
import InterviewSession from "./components/InterviewSession";
import EvaluationsDashboard from "./components/EvaluationsDashboard";
import EvaluationDetail from "./components/EvaluationDetail";
import Layout from "./components/Layout";
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
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
                path="/interviews"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <InterviewGenerator />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interview/:interviewId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <InterviewSession />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evaluations"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <EvaluationsDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evaluation/:id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <EvaluationDetail />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
