import { useState } from "react";
import BrandMark from "../components/BrandMark";
import WorkspaceIllustration from "../components/WorkspaceIllustration";
import { login } from "../services/authService";

function LoginPage({ onLogin }) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setAuthError("");

    try {
      const session = await login(credentials);
      onLogin(session);
    } catch (error) {
      setAuthError(error.response?.data?.error || "Could not sign in");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="login-title">
        <aside className="welcome-panel">
          <BrandMark />

          <div className="welcome-copy">
            <h1 id="login-title">Welcome Back!</h1>
            <p>Sign in to continue to your account and manage your work and attendance.</p>
          </div>

          <WorkspaceIllustration />
        </aside>

        <section className="login-panel">
          <form className="login-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                value={credentials.email}
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <span className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(event) =>
                    setCredentials((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Enter your password"
                  autoComplete={rememberMe ? "current-password" : "off"}
                  required
                />
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </span>
            </label>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                Remember me
              </label>
              <a href="#forgot-password">Forgot password?</a>
            </div>

            {authError && <p className="form-error">{authError}</p>}

            <button type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="copyright">(c) 2026 Team Attendance App. All rights reserved.</p>
        </section>
      </section>
    </main>
  );
}

export default LoginPage;
