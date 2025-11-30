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

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await register(formData);
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
              <CardTitle className="text-2xl">Register</CardTitle>
            </CardHeader>
            <CardBody className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-lg">
                <div className="grid grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-md py-sm bg-white border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-gray-400"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-md py-sm bg-white border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-gray-400"
                      placeholder="Doe"
                    />
                  </div>
                </div>
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-md py-sm bg-white border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-gray-400"
                    placeholder="At least 6 characters"
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
                    {loading ? "Registering..." : "Register"}
                  </Button>
                </div>
              </form>
              <div className="mt-lg pt-lg border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/"
                    className="text-primary hover:text-primary-dark font-medium transition-colors"
                  >
                    Login
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

export default Register;
