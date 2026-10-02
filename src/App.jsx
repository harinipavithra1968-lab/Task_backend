import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Tasks from "./pages/Tasks";

// Only logged-in users can see the page
const Protected = ({ children }) => {
  const { user } = useAuth();

  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [checkingGoogleLogin, setCheckingGoogleLogin] = useState(true);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      // No Google token
      if (!token) {
        setCheckingGoogleLogin(false);
        return;
      }

      try {
        // Save JWT token
        localStorage.setItem("token", token);

        // Remove ?token=... from browser URL
        window.history.replaceState(
          {},
          document.title,
          "/"
        );

        // Get logged-in user from backend
        const apiUrl =
          import.meta.env.VITE_API_URL ||
          "https://task-frontend-gyqw.onrender.com/api";

        const response = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Google login failed");
        }

        // Store user in AuthContext
        setUser(data.user || data);

        // Go to Task Management page
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Google login error:", error);

        localStorage.removeItem("token");

        navigate("/login", {
          replace: true,
        });
      } finally {
        setCheckingGoogleLogin(false);
      }
    };

    handleGoogleCallback();
  }, [navigate, setUser]);

  if (checkingGoogleLogin) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Signing you in...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/"
        element={
          <Protected>
            <Tasks />
          </Protected>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}