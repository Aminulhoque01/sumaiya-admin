 
import {
  useEffect,
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLoginMutation } from "../../redux/features/auth/authApi";
import { setAdminUser, setToken } from "../../lib/auth";

 

export default function Login() {
  const navigate = useNavigate();

  const [
    login,
    {
      isLoading,
    },
  ] = useLoginMutation();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem("admin_token");

    if (token) {
      navigate(
        "/admin/dashboard",
        {
          replace: true,
        }
      );
    }
  }, [navigate]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error(
        "Please enter your email."
      );
      return;
    }

    if (!password) {
      toast.error(
        "Please enter your password."
      );
      return;
    }

    try {
      const response =
        await login({
          email: email.trim(),
          password,
        }).unwrap();

      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.token ||
        response.accessToken;

      const user =
        response.data?.user ||
        response.data?.admin ||
        response.user ||
        response.admin;

      if (!token) {
        toast.error(
          "Login succeeded but no token was returned."
        );
        return;
      }

      setToken(token);

      if (user) {
        setAdminUser(user);
      }

      toast.success(
        response.message ||
          "Welcome back!"
      );

      navigate(
        "/admin/dashboard",
        {
          replace: true,
        }
      );
    } catch (error) {
      const apiError = error as {
        data?: {
          message?: string;
        };
      };

      toast.error(
        apiError?.data?.message ||
          "Invalid email or password."
      );
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f2ee] text-[#111] dark:bg-[#090909] dark:text-[#f4f4f0]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-black/[0.04] blur-3xl dark:bg-white/[0.04]" />

        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-black/[0.05] blur-3xl dark:bg-white/[0.04]" />

        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)",
            backgroundSize:
              "70px 70px",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-black/[0.08] bg-white/80 shadow-[0_30px_100px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#111]/80 dark:shadow-black/40 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left */}
          <section className="relative hidden min-h-[680px] overflow-hidden bg-[#111] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
            <div className="absolute inset-0">
              <div className="absolute -left-20 top-10 h-72 w-72 rounded-full border border-white/10" />
              <div className="absolute left-10 top-32 h-96 w-96 rounded-full border border-white/[0.06]" />
              <div className="absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full border border-white/[0.07]" />

              <div className="absolute left-[22%] top-[28%] h-2 w-2 rounded-full bg-white" />
              <div className="absolute right-[24%] top-[18%] h-1.5 w-1.5 rounded-full bg-white/60" />
              <div className="absolute bottom-[30%] left-[35%] h-1.5 w-1.5 rounded-full bg-white/50" />
            </div>

            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <Sparkles size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold tracking-wide">
                  SUMAIYA HAQUE
                </p>
                <p className="text-[11px] text-white/45">
                  CREATIVE PORTFOLIO CMS
                </p>
              </div>
            </div>

            <div className="relative z-10">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
                Admin workspace
              </p>

              <h1 className="max-w-xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] xl:text-7xl">
                Shape the
                <br />
                <span className="text-white/40">
                  visual story.
                </span>
              </h1>

              <p className="mt-7 max-w-md text-sm leading-7 text-white/55">
                Manage projects, services, skills,
                experiences, testimonials and
                portfolio content from one beautiful
                workspace.
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/35">
              <span>
                Portfolio Admin
              </span>

              <span>
                2026
              </span>
            </div>
          </section>

          {/* Right */}
          <section className="flex min-h-[680px] items-center justify-center p-6 sm:p-10 lg:p-14">
            <div className="w-full max-w-md">
              {/* Mobile brand */}
              <div className="mb-12 lg:hidden">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#111] text-white dark:bg-white dark:text-black">
                  <Sparkles size={18} />
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/40 dark:text-white/40">
                  Sumaiya Haque
                </p>
              </div>

              <div className="mb-10">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-black/[0.02] px-3 py-1.5 text-xs text-black/50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/45">
                  <ShieldCheck size={14} />
                  Secure admin access
                </div>

                <h2 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                  Welcome back.
                </h2>

                <p className="mt-4 text-sm leading-6 text-black/45 dark:text-white/45">
                  Sign in to manage your portfolio
                  content and creative workspace.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-black/50 dark:text-white/45"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="admin@example.com"
                    className="h-14 w-full rounded-2xl border border-black/[0.1] bg-black/[0.025] px-4 text-sm outline-none transition placeholder:text-black/25 focus:border-black/30 focus:bg-white dark:border-white/[0.1] dark:bg-white/[0.035] dark:placeholder:text-white/20 dark:focus:border-white/30 dark:focus:bg-white/[0.05]"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-black/50 dark:text-white/45"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter your password"
                      className="h-14 w-full rounded-2xl border border-black/[0.1] bg-black/[0.025] px-4 pr-12 text-sm outline-none transition placeholder:text-black/25 focus:border-black/30 focus:bg-white dark:border-white/[0.1] dark:bg-white/[0.035] dark:placeholder:text-white/20 dark:focus:border-white/30 dark:focus:bg-white/[0.05]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-black/40 transition hover:bg-black/5 hover:text-black dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group mt-3 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#111] text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
                >
                  {isLoading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight
                        size={18}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-xs text-black/35 dark:text-white/30">
                Authorized administrators only.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
 
