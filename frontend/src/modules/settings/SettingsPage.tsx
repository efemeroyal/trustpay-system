import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Hash, BookOpen, GraduationCap, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { Card, CardHeader, CardTitle, CardBody, Button, Badge } from "@/components/ui";
import { cn } from "@/utils";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "TK";

  const fields = [
    { icon: <User className="w-4 h-4" />, label: "Full Name", value: user?.fullName },
    { icon: <Mail className="w-4 h-4" />, label: "Email Address", value: user?.email },
    { icon: <Hash className="w-4 h-4" />, label: "Student ID", value: user?.studentId },
    { icon: <BookOpen className="w-4 h-4" />, label: "Programme", value: user?.programme },
    { icon: <GraduationCap className="w-4 h-4" />, label: "Year of Study", value: user?.level },
  ];

  return (
    <div className="flex flex-col gap-5 max-w-[600px]">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-[#8b8fa8] mt-0.5">Your account details</p>
      </div>

      {/* Profile card */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#00e5a0] flex items-center justify-center flex-shrink-0">
              <span className="text-[18px] font-bold text-[#050708]">{initials}</span>
            </div>
            <div>
              <p className="text-[16px] font-semibold">{user?.fullName}</p>
              <p className="text-[12.5px] text-[#8b8fa8] mt-0.5">{user?.email}</p>
              <div className="mt-1.5">
                <Badge variant="success" dot>Account Active</Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {fields.map(({ icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0f1420] border border-[rgba(255,255,255,0.06)]"
              >
                <span className="text-[#8b8fa8] flex-shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10.5px] font-mono uppercase tracking-wide text-[#3e4155]">{label}</p>
                  <p className="text-[13px] font-medium mt-0.5 truncate">{value ?? "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle icon={<ShieldCheck className="w-4 h-4" />}>Security</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[rgba(0,229,160,0.04)] border border-[rgba(0,229,160,0.1)]">
            <ShieldCheck className="w-4 h-4 text-[#00e5a0] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-[#00e5a0]">Receipts are secured</p>
              <p className="text-[12px] text-[#8b8fa8] mt-0.5 leading-relaxed">
                Every payment receipt you receive is tamper-proof and permanently stored. It cannot be modified, copied, or transferred to anyone else.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Sign out */}
      <Card>
        <CardBody>
          {!confirmLogout ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium">Sign out</p>
                <p className="text-[12px] text-[#8b8fa8] mt-0.5">You can sign back in at any time</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={<LogOut className="w-3.5 h-3.5" />}
                onClick={() => setConfirmLogout(true)}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-[13.5px] font-medium">Are you sure you want to sign out?</p>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={handleLogout} icon={<LogOut className="w-3.5 h-3.5" />}>
                  Yes, sign out
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmLogout(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
