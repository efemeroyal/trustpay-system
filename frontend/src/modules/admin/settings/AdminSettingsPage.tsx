import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Building, LogOut, Plus, Trash2, Settings,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/store/AuthContext";
import { requiredFeeApi } from "@/services/adminApi";
import { useNotifications } from "@/store/NotificationContext";
import {
  Card, CardHeader, CardTitle, CardBody, Button, Input, Badge,
} from "@/components/ui";
import { formatXAF, currentAcademicYear, cn } from "@/utils";

const PAYMENT_TYPES = ["tuition", "registration", "hostel", "library", "other"];
const LEVELS = ["Year 1", "Year 2", "Year 3", "Year 4"];

export function AdminSettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { add: addNotif } = useNotifications();
  const queryClient = useQueryClient();

  const [confirmLogout, setConfirmLogout] = useState(false);
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [feeForm, setFeeForm] = useState({
    paymentType: "tuition",
    academicYear: currentAcademicYear(),
    level: "Year 1",
    requiredAmount: "",
  });

  const initials = user?.fullName
    ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  const { data: feesData, isLoading: loadingFees } = useQuery({
    queryKey: ["required-fees"],
    queryFn: () => requiredFeeApi.getAll().then(r => r.data.data),
  });

  const { mutate: setFee, isPending: settingFee } = useMutation({
    mutationFn: () => requiredFeeApi.set({
      paymentType: feeForm.paymentType,
      academicYear: feeForm.academicYear,
      level: feeForm.level,
      requiredAmount: Number(feeForm.requiredAmount),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["required-fees"] });
      setShowFeeForm(false);
      setFeeForm({ paymentType: "tuition", academicYear: currentAcademicYear(), level: "Year 1", requiredAmount: "" });
      addNotif({ type: "success", title: "Fee target saved", message: "Required fee amount has been updated." });
    },
    onError: () => {
      addNotif({ type: "error", title: "Failed to save", message: "Please try again." });
    },
  });

  const handleLogout = () => { logout(); navigate("/login"); };

  const set = (key: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setFeeForm(prev => ({ ...prev, [key]: e.target.value }));

  const fees = feesData ?? [];

  return (
    <div className="flex flex-col gap-5 max-w-[680px]">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-[#8b8fa8] mt-0.5">Admin account and fee configuration</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle icon={<User className="w-4 h-4" />}>Admin Profile</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-[#4f9cf9] flex items-center justify-center flex-shrink-0">
              <span className="text-[18px] font-bold text-white">{initials}</span>
            </div>
            <div>
              <p className="text-[16px] font-semibold">{user?.fullName}</p>
              <p className="text-[12.5px] text-[#8b8fa8] mt-0.5">{user?.email}</p>
              <div className="mt-1.5">
                <Badge variant="info" dot>Bursary Staff</Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { icon: <User className="w-4 h-4" />, label: "Full Name", value: user?.fullName },
              { icon: <Mail className="w-4 h-4" />, label: "Email Address", value: user?.email },
              { icon: <Building className="w-4 h-4" />, label: "Department", value: user?.department ?? "Bursary" },
            ].map(({ icon, label, value }) => (
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

      {/* Required fees config */}
      <Card>
        <CardHeader>
          <CardTitle icon={<Settings className="w-4 h-4" />}>Required Fee Amounts</CardTitle>
          <Button
            size="sm"
            variant="outline"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowFeeForm(!showFeeForm)}
          >
            Add / Update
          </Button>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <p className="text-[12.5px] text-[#8b8fa8]">
            Set the total amount students must pay per fee category per academic year. The system uses this to calculate installment progress.
          </p>

          {/* Add fee form */}
          {showFeeForm && (
            <div className="bg-[#0f1420] rounded-xl p-4 border border-[rgba(79,156,249,0.15)] flex flex-col gap-4">
              <p className="text-[13px] font-semibold text-[#4f9cf9]">Configure Required Amount</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Payment type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wide text-[#8b8fa8]">Fee Type</label>
                  <select
                    value={feeForm.paymentType}
                    onChange={set("paymentType")}
                    className="bg-[#141926] border border-[rgba(255,255,255,0.08)] rounded-xl text-[13px] text-[#e8eaf0] px-3.5 py-2.5 focus:outline-none focus:border-[rgba(79,156,249,0.4)] transition-all appearance-none"
                  >
                    {PAYMENT_TYPES.map(t => (
                      <option key={t} value={t} className="bg-[#141926] capitalize">{t}</option>
                    ))}
                  </select>
                </div>

                {/* Level */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wide text-[#8b8fa8]">Year Level</label>
                  <select
                    value={feeForm.level}
                    onChange={set("level")}
                    className="bg-[#141926] border border-[rgba(255,255,255,0.08)] rounded-xl text-[13px] text-[#e8eaf0] px-3.5 py-2.5 focus:outline-none focus:border-[rgba(79,156,249,0.4)] transition-all appearance-none"
                  >
                    {LEVELS.map(l => (
                      <option key={l} value={l} className="bg-[#141926]">{l}</option>
                    ))}
                  </select>
                </div>

                {/* Academic year */}
                <Input
                  label="Academic Year"
                  placeholder="e.g. 2025/2026"
                  value={feeForm.academicYear}
                  onChange={set("academicYear")}
                />

                {/* Amount */}
                <Input
                  label="Required Amount (CFA)"
                  type="number"
                  placeholder="e.g. 150000"
                  value={feeForm.requiredAmount}
                  onChange={set("requiredAmount")}
                  min="0"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setFee()}
                  loading={settingFee}
                  disabled={!feeForm.requiredAmount || Number(feeForm.requiredAmount) <= 0}
                  className="justify-center"
                >
                  Save Fee Target
                </Button>
                <Button variant="ghost" onClick={() => setShowFeeForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Existing fees */}
          {loadingFees ? (
            <p className="text-[12.5px] text-[#8b8fa8]">Loading…</p>
          ) : fees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-[#3e4155]">No fee targets configured yet</p>
              <p className="text-[12px] text-[#3e4155] mt-1">Add required amounts for each fee category above</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {fees.map(fee => (
                <div
                  key={fee._id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#0f1420] border border-[rgba(255,255,255,0.06)]"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium capitalize">{fee.paymentType}</span>
                      <Badge variant="neutral">{fee.level}</Badge>
                    </div>
                    <span className="text-[11px] font-mono text-[#8b8fa8]">{fee.academicYear}</span>
                  </div>
                  <span className="text-[14px] font-mono font-bold text-[#00e5a0]">
                    {formatXAF(fee.requiredAmount)} CFA
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Sign out */}
      <Card>
        <CardBody>
          {!confirmLogout ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium">Sign out</p>
                <p className="text-[12px] text-[#8b8fa8] mt-0.5">You will be redirected to the login page</p>
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
                <Button variant="ghost" size="sm" onClick={() => setConfirmLogout(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
