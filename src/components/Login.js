import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "./ui/Button";
import {
  DashboardContainer,
  DashboardCard,
  CardHeader,
  CardTitle,
  CardBody,
} from "./ui/Dashboard";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate("/interviews");
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <DashboardContainer>
      <div className="flex items-center justify-center flex-1 py-xl px-md">
        <div className="w-full max-w-md min-w-[420px]">
          <DashboardCard className="shadow-lg">
            <CardHeader className="pb-md">
              <CardTitle className="text-2xl">Login</CardTitle>
            </CardHeader>
            <CardBody className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-lg">
                <div className="space-y-xs">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-md py-sm bg-white border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-gray-400"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-xs">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-md py-sm bg-white border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-gray-400"
                    placeholder="Enter your password"
                  />
                </div>
                {error && (
                  <div className="p-sm bg-danger/10 text-danger rounded-lg border border-danger/30 text-sm">
                    {error}
                  </div>
                )}
                <div className="pt-sm">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </form>
              <div className="mt-lg pt-lg border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-primary hover:text-primary-dark font-medium transition-colors"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </CardBody>
          </DashboardCard>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default Login;
