import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { Button, Input, Card, CardBody } from "@/components/ui";

export function LoginPage() {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    gsap.fromTo(formRef.current,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
    );
  }, []);

  useEffect(() => { if (error) clearError(); }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {}
  };

  return (
    <div ref={formRef}>
      <Card>
        <CardBody className="p-6">
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold tracking-tight">Sign in</h1>
            <p className="text-[13px] text-[#8b8fa8] mt-1">Enter your registered email and password</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-mono uppercase tracking-wide text-[#8b8fa8]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8fa8]" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#0f1420] border border-[rgba(255,255,255,0.08)] rounded-xl text-[13.5px] text-[#e8eaf0] placeholder:text-[#3e4155] pl-10 pr-10 py-3 focus:outline-none focus:border-[rgba(0,229,160,0.4)] focus:ring-1 focus:ring-[rgba(0,229,160,0.2)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3e4155] hover:text-[#8b8fa8]"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-[rgba(255,87,87,0.08)] border border-[rgba(255,87,87,0.2)] rounded-xl px-4 py-3">
                <p className="text-[12.5px] text-[#ff5757]">{error}</p>
              </div>
            )}

            <Button type="submit" size="lg" loading={isLoading} className="w-full justify-center mt-1">
              Sign In
            </Button>
          </form>

          <p className="text-[12.5px] text-[#8b8fa8] text-center mt-5">
            New student?{" "}
            <Link to="/register" className="text-[#00e5a0] hover:underline">Create account</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
