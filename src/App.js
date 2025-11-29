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
import RealtimeInterview from "./components/RealtimeInterview";
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
                path="/interview"
                element={
                  <ProtectedRoute>
                    <RealtimeInterview />
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
