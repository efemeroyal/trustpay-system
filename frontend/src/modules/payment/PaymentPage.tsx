import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import {
  Phone,
  CheckCircle2,
  ChevronRight,
  Smartphone,
  MoveLeft,
  Zap,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/store/AuthContext";
import { useNotifications } from "@/store/NotificationContext";
import { paymentApi } from "@/services/api";
import { MintingScreen } from "../minting/MintingScreen";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Badge,
} from "@/components/ui";
import { FEE_CATALOG, formatXAF, currentAcademicYear, cn } from "@/utils";
import type { FeeItem, MoMoProvider, PaymentResponse, MintStep } from "@/types";

const DEFAULT_STEPS: MintStep[] = [
  {
    id: "payment",
    label: "Payment received",
    description: "Waiting for confirmation",
    status: "queued",
  },
  {
    id: "verify",
    label: "Amount confirmed",
    description: "Verifying payment amount",
    status: "queued",
  },
  {
    id: "ipfs",
    label: "Receipt saved securely",
    description: "Storing receipt details",
    status: "queued",
  },
  {
    id: "mint",
    label: "Receipt being issued",
    description: "Securing your receipt",
    status: "queued",
  },
  {
    id: "notify",
    label: "Receipt delivered",
    description: "All done",
    status: "queued",
  },
];

type Step = "select" | "confirm" | "processing";

export function PaymentPage() {
  const { user } = useAuth();
  const { add: addNotif } = useNotifications();
  const cardsRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>("select");
  const [selectedFee, setSelectedFee] = useState<FeeItem | null>(null);
  const [provider, setProvider] = useState<MoMoProvider>("MTN");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [result, setResult] = useState<PaymentResponse | null>(null);
  const [mintSteps, setMintSteps] = useState<MintStep[]>(DEFAULT_STEPS);

  // ── Card entrance animation ────────────────────────────────────────────────
  useEffect(() => {
    if (step !== "select" || !cardsRef.current) return;
    const cards = cardsRef.current.querySelectorAll(".fee-card");
    gsap.fromTo(
      cards,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.07, duration: 0.4, ease: "power2.out" },
    );
  }, [step]);

  // ── Confirm pane entrance ──────────────────────────────────────────────────
  useEffect(() => {
    if (step !== "confirm" || !confirmRef.current) return;
    gsap.fromTo(
      confirmRef.current,
      { x: 16, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.35, ease: "power2.out" },
    );
  }, [step]);

  // ── Simulate mint progress steps (replace with real WebSocket later) ───────
  const simulateMintSteps = () => {
    const delays = [600, 1800, 3200, 5000, 6800];
    DEFAULT_STEPS.forEach((s, i) => {
      setTimeout(() => {
        setMintSteps((prev) =>
          prev.map((ms, j) => {
            if (j === i) return { ...ms, status: "active" };
            if (j < i) return { ...ms, status: "done" };
            return ms;
          }),
        );
        if (i === DEFAULT_STEPS.length - 1) {
          setTimeout(() => {
            setMintSteps((prev) =>
              prev.map((ms) => ({ ...ms, status: "done" })),
            );
          }, 900);
        }
      }, delays[i]);
    });
  };

  // ── Payment mutation ───────────────────────────────────────────────────────
  const { mutate: initiatePayment, isPending } = useMutation({
    mutationFn: () => {
      if (!selectedFee || !user) throw new Error("Missing data");
      return paymentApi
        .initiate({
          amount: selectedFee.amount,
          paymentType: selectedFee.paymentType,
          academicYear: currentAcademicYear(),
          level: user.level ?? "Year 1",
          momoProvider: provider,
          momoNumber: phone,
        })
        .then((r) => r.data.data);
    },
    onSuccess: (data) => {
      setResult(data);
      setStep("processing");
      setMintSteps(DEFAULT_STEPS.map((s) => ({ ...s, status: "queued" })));
      simulateMintSteps();
      if (data.sbt?.mintStatus === "minted") {
        addNotif({
          type: "success",
          title: "Payment confirmed!",
          message: `Your ${selectedFee?.label} receipt is ready.`,
        });
      }
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Payment could not be processed. Please try again.";
      addNotif({ type: "error", title: "Payment failed", message: msg });
    },
  });

  const validatePhone = (val: string) => {
    setPhone(val);
    if (val.length > 0 && !/^[0-9]{9}$/.test(val.replace(/\s/g, ""))) {
      setPhoneError("Enter a valid 9-digit phone number");
    } else {
      setPhoneError("");
    }
  };

  const handlePay = () => {
    if (!phone.trim()) {
      setPhoneError("Phone number is required");
      return;
    }
    if (!/^[0-9]{9}$/.test(phone.replace(/\s/g, ""))) {
      setPhoneError("Enter a valid 9-digit phone number");
      return;
    }
    initiatePayment();
  };

  const handleBack = () => {
    setStep("select");
    setSelectedFee(null);
    setPhone("");
    setPhoneError("");
    setResult(null);
    setMintSteps(DEFAULT_STEPS.map((s) => ({ ...s, status: "queued" })));
  };

  // ── Processing screen ──────────────────────────────────────────────────────
  if (step === "processing" && selectedFee) {
    return (
      <MintingScreen
        fee={selectedFee}
        result={result}
        steps={mintSteps}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Pay Fees</h1>
        <p className="text-sm text-[#8b8fa8] mt-0.5">
          {step === "select"
            ? "Choose a fee category to pay"
            : "Confirm your payment details"}
        </p>
      </div>

      {/* ── Fee selection ── */}
      {step === "select" && (
        <div
          ref={cardsRef}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
        >
          {FEE_CATALOG.map((fee) => (
            <button
              key={fee.id}
              onClick={() => {
                setSelectedFee(fee);
                setStep("confirm");
              }}
              className={cn(
                "fee-card text-left bg-[#0b0f17] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4",
                "hover:border-[rgba(0,229,160,0.3)] hover:shadow-[0_0_24px_rgba(0,229,160,0.05)]",
                "transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e5a0]",
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center",
                    fee.mandatory
                      ? "bg-[rgba(0,229,160,0.1)]"
                      : "bg-[rgba(79,156,249,0.1)]",
                  )}
                >
                  <Zap
                    className={cn(
                      "w-4 h-4",
                      fee.mandatory ? "text-[#00e5a0]" : "text-[#4f9cf9]",
                    )}
                  />
                </div>
                <Badge variant={fee.mandatory ? "success" : "info"}>
                  {fee.mandatory ? "Required" : "Optional"}
                </Badge>
              </div>
              <h3 className="text-[13.5px] font-semibold mb-1">{fee.label}</h3>
              <p className="text-[11.5px] text-[#8b8fa8] mb-4 leading-relaxed">
                {fee.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[16px] text-[#00e5a0]">
                  {formatXAF(fee.amount)} CFA
                </span>
                <ChevronRight className="w-4 h-4 text-[#3e4155] group-hover:text-[#00e5a0] group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Confirmation ── */}
      {step === "confirm" && selectedFee && (
        <div ref={confirmRef} className="max-w-[520px]">
          <Card>
            <CardHeader>
              <CardTitle icon={<Phone className="w-4 h-4" />}>
                Confirm Payment
              </CardTitle>
              <button
                onClick={() => setStep("select")}
                className="flex items-center gap-1.5 text-[12px] text-[#8b8fa8] hover:text-[#e8eaf0] transition-colors"
              >
                <MoveLeft className="w-3.5 h-3.5" /> Back
              </button>
            </CardHeader>

            <CardBody className="flex flex-col gap-5">
              {/* Summary */}
              <div className="bg-[#0f1420] rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
                <p className="text-[10.5px] font-mono uppercase tracking-wide text-[#8b8fa8] mb-1">
                  Paying for
                </p>
                <p className="text-[15px] font-semibold">{selectedFee.label}</p>
                <p className="text-[11.5px] text-[#8b8fa8] mt-0.5">
                  {selectedFee.description}
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <span className="text-[13px] text-[#8b8fa8]">
                    Total amount
                  </span>
                  <span className="font-mono font-bold text-[22px] text-[#00e5a0]">
                    {formatXAF(selectedFee.amount)} CFA
                  </span>
                </div>
              </div>

              {/* Provider */}
              <div>
                <p className="text-[11.5px] font-mono uppercase tracking-wide text-[#8b8fa8] mb-2.5">
                  Payment method
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      id: "MTN" as MoMoProvider,
                      label: "MTN Mobile Money",
                      color: "#ffb53e",
                      prefix: "67x / 68x",
                    },
                    {
                      id: "Orange" as MoMoProvider,
                      label: "Orange Money",
                      color: "#ff7a00",
                      prefix: "69x / 65x",
                    },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProvider(p.id)}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-150",
                        provider === p.id
                          ? "border-current bg-[rgba(255,255,255,0.04)]"
                          : "border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.13)]",
                      )}
                      style={{ color: provider === p.id ? p.color : "#8b8fa8" }}
                    >
                      <Smartphone className="w-4 h-4 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <p
                          className="text-[13px] font-semibold"
                          style={{
                            color: provider === p.id ? p.color : "#e8eaf0",
                          }}
                        >
                          {p.label}
                        </p>
                        <p className="text-[10.5px] font-mono opacity-60">
                          {p.prefix}
                        </p>
                      </div>
                      {provider === p.id && (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <Input
                label="Phone Number"
                type="tel"
                placeholder={provider === "MTN" ? "677 000 000" : "699 000 000"}
                value={phone}
                onChange={(e) => validatePhone(e.target.value)}
                icon={<Phone className="w-4 h-4" />}
                error={phoneError}
                maxLength={9}
              />

              {/* Info box */}
              <div className="flex items-start gap-2.5 bg-[rgba(0,229,160,0.05)] border border-[rgba(0,229,160,0.12)] rounded-xl p-3.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00e5a0] mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-[#8b8fa8] leading-relaxed">
                  You will receive a prompt on your phone to confirm the
                  payment. Your receipt will be ready instantly after
                  confirmation.
                </p>
              </div>

              <Button
                onClick={handlePay}
                loading={isPending}
                size="lg"
                className="w-full justify-center"
              >
                Pay {formatXAF(selectedFee.amount)} CFA via{" "}
                {provider === "MTN" ? "MTN MoMo" : "Orange Money"}
              </Button>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
