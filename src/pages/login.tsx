import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authAPI } from "@/services/api";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        console.log("🔐 Checking authentication...");
        await authAPI.getCurrentUser();
        // If successful, user is logged in, redirect to home
        console.log("✅ User already authenticated, redirecting to home");
        router.push("/");
      } catch (err) {
        // User is not logged in, stay on login page
        console.log("ℹ️ User not authenticated, showing login page");
        setChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🚀 Attempting login with email:", formData.email);
      const response = await authAPI.login(formData);
      console.log("✅ Login successful:", response.message);
      router.push("/");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
      console.error("❌ Login failed:", errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-sm text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full space-y-8 animate-slideUp">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">Welcome back</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Don't have an account?{" "}
            <Link href="/register" className="text-[var(--foreground)] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] px-4 py-3 rounded-xl text-sm animate-scaleIn">
              {error}
            </div>
          )}
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
