import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  Mail,
  Lock,
  User,
  Hash,
  BookOpen,
  GraduationCap,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { Button, Input, Card, CardBody } from "@/components/ui";
import { cn } from "@/utils";

const PROGRAMMES = [
  "Software Engineering",
  "Computer Engineering",
  "Computer Science",
  "Information Technology",
  "Electrical Engineering",
  "Civil Engineering",
  "Mechanical Engineering",
  "Business Administration",
];

const LEVELS = ["Year 1", "Year 2", "Year 3", "Year 4"];

export function RegisterPage() {
  const { register, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    programme: "",
    level: "",
    department: "Administration",
    role: "student" as "student" | "admin",
  });
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    gsap.fromTo(
      formRef.current,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
    );
  }, []);

  useEffect(() => {
    if (error) clearError();
    setLocalError(null);
  }, [form]);

  const set =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        studentId: form.role === "student" ? form.studentId : undefined,
        programme: form.role === "student" ? form.programme : undefined,
        level: form.role === "student" ? form.level : undefined,
        department: form.role === "admin" ? form.department : undefined,
        role: form.role,
      });
      navigate(form.role === "admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
    } catch {}
  };

  const displayError = localError || error;

  return (
    <div ref={formRef}>
      <Card>
        <CardBody className="p-6">
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold tracking-tight">
              Create account
            </h1>
            <p className="text-[13px] text-[#8b8fa8] mt-1">
              Register as a student or admin
            </p>
          </div>

          <div className="flex gap-2 mb-2">
            {(["student", "admin"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, role }))}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[12.5px] font-medium transition-all",
                  form.role === role
                    ? "border-[rgba(0,229,160,0.3)] bg-[rgba(0,229,160,0.1)] text-[#00e5a0]"
                    : "border-[rgba(255,255,255,0.08)] text-[#8b8fa8] hover:border-[rgba(255,255,255,0.16)]",
                )}
              >
                {role === "admin" ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <GraduationCap className="w-4 h-4" />
                )}
                {role === "admin" ? "Admin" : "Student"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              placeholder="e.g. Achaleke Brian Tambe"
              value={form.fullName}
              onChange={set("fullName")}
              icon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={set("email")}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            {form.role === "student" ? (
              <>
                <Input
                  label="Student ID"
                  placeholder="e.g. UB23T1842"
                  value={form.studentId}
                  onChange={set("studentId")}
                  icon={<Hash className="w-4 h-4" />}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-mono uppercase tracking-wide text-[#8b8fa8]">
                    Programme
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8fa8] pointer-events-none" />
                    <select
                      value={form.programme}
                      onChange={set("programme")}
                      required
                      className="w-full bg-[#0f1420] border border-[rgba(255,255,255,0.08)] rounded-xl text-[13.5px] text-[#e8eaf0] pl-10 pr-4 py-3 focus:outline-none focus:border-[rgba(0,229,160,0.4)] transition-all appearance-none"
                    >
                      <option value="" disabled className="bg-[#0f1420]">
                        Select programme
                      </option>
                      {PROGRAMMES.map((p) => (
                        <option key={p} value={p} className="bg-[#0f1420]">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-mono uppercase tracking-wide text-[#8b8fa8]">
                    Year of Study
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {LEVELS.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, level: l }))
                        }
                        className={cn(
                          "py-2.5 rounded-xl text-[12.5px] font-medium border transition-all duration-150",
                          form.level === l
                            ? "bg-[rgba(0,229,160,0.1)] border-[rgba(0,229,160,0.3)] text-[#00e5a0]"
                            : "border-[rgba(255,255,255,0.08)] text-[#8b8fa8] hover:border-[rgba(255,255,255,0.16)]",
                        )}
                      >
                        {l.replace("Year ", "Y")}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <Input
                label="Department"
                placeholder="e.g. Finance Office"
                value={form.department}
                onChange={set("department")}
                icon={<ShieldCheck className="w-4 h-4" />}
                required
              />
            )}

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-mono uppercase tracking-wide text-[#8b8fa8]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8fa8]" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={set("password")}
                  required
                  className="w-full bg-[#0f1420] border border-[rgba(255,255,255,0.08)] rounded-xl text-[13.5px] text-[#e8eaf0] placeholder:text-[#3e4155] pl-10 pr-10 py-3 focus:outline-none focus:border-[rgba(0,229,160,0.4)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3e4155] hover:text-[#8b8fa8]"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            {displayError && (
              <div className="bg-[rgba(255,87,87,0.08)] border border-[rgba(255,87,87,0.2)] rounded-xl px-4 py-3">
                <p className="text-[12.5px] text-[#ff5757]">{displayError}</p>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              loading={isLoading}
              className="w-full justify-center mt-1"
            >
              {form.role === "admin"
                ? "Create Admin Account"
                : "Create Account"}
            </Button>
          </form>

          <p className="text-[12.5px] text-[#8b8fa8] text-center mt-5">
            Already registered?{" "}
            <Link to="/login" className="text-[#00e5a0] hover:underline">
              Sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
