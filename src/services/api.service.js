import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
      console.log(
        "Token saved to localStorage:",
        response.data.access_token.substring(0, 20) + "..."
      );
    } else {
      console.error("No access_token in response:", response.data);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
      console.log(
        "Token saved to localStorage:",
        response.data.access_token.substring(0, 20) + "..."
      );
    } else {
      console.error("No access_token in response:", response.data);
    }
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  getToken: () => {
    return localStorage.getItem("token");
  },
};

export const interviewService = {
  generateInterview: async (
    skills,
    questionsPerSkill = 3,
    difficulty = "intermediate",
    context = ""
  ) => {
    const response = await api.post("/interviews/generate", {
      skills,
      questionsPerSkill,
      difficulty,
      context,
    });
    return response.data;
  },

  getInterviews: async () => {
    const response = await api.get("/interviews");
    return response.data;
  },

  getInterview: async (interviewId) => {
    const response = await api.get(`/interviews/${interviewId}`);
    return response.data;
  },

  startInterviewSession: async (interviewId) => {
    const response = await api.post(`/interviews/${interviewId}/start`);
    return response.data;
  },

  getInterviewSessions: async () => {
    const response = await api.get("/interviews/sessions");
    return response.data;
  },

  getInterviewSession: async (sessionId) => {
    const response = await api.get(`/interviews/sessions/${sessionId}`);
    return response.data;
  },

  getSessionAnswers: async (sessionId) => {
    const response = await api.get(`/interviews/sessions/${sessionId}/answers`);
    return response.data;
  },

  completeInterviewSession: async (sessionId) => {
    const response = await api.post(
      `/interviews/sessions/${sessionId}/complete`
    );
    return response.data;
  },

  submitAnswer: async (sessionId, questionId, questionIndex, answer) => {
    const response = await api.post(
      `/interviews/sessions/${sessionId}/answers`,
      {
        questionId,
        questionIndex,
        answer,
      }
    );
    return response.data;
  },

  getNextQuestion: async (sessionId) => {
    const response = await api.post(`/interviews/sessions/${sessionId}/next`);
    return response.data;
  },

  getSessionStatus: async (sessionId) => {
    const response = await api.get(`/interviews/sessions/${sessionId}/status`);
    return response.data;
  },
};

export const transcriptionService = {
  createTranscriptionSession: async () => {
    const response = await api.post("/transcription/session");
    return response.data.client_secret.value;
  },
};

export const realtimeInterviewService = {
  createSession: async () => {
    const response = await api.post("/interview/session");
    return response.data;
  },

  getToken: async (sessionId) => {
    const response = await api.post("/interview/token", { sessionId });
    return response.data;
  },

  logEvaluation: async (sessionId, question, answer, score, feedback) => {
    const response = await api.post("/interview/log-evaluation", {
      sessionId,
      question,
      answer,
      score,
      feedback,
    });
    return response.data;
  },

  getSession: async (sessionId) => {
    const response = await api.get(`/interview/session/${sessionId}`);
    return response.data;
  },

  completeSession: async (sessionId) => {
    const response = await api.post(`/interview/session/${sessionId}/complete`);
    return response.data;
  },

  getAllSessions: async () => {
    const response = await api.get("/interview/sessions");
    return response.data;
  },
};

export default api;
