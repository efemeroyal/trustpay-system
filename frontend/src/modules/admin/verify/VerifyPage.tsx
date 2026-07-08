import React, { useState, useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import {
  ScanLine,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Hash,
  CreditCard,
  Calendar,
  GraduationCap,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { verifyApi } from "@/services/adminApi";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Input,
  Badge,
} from "@/components/ui";
import { formatXAF, formatDate, cn } from "@/utils";
import jsQR from "jsqr";

type VerifyMode = "manual" | "qr";
type VerifyStatus = "idle" | "loading" | "valid" | "invalid" | "duplicate";

interface VerifyResult {
  status: "VALID" | "INVALID" | "DUPLICATE";
  message: string;
  data?: {
    referenceNumber: string;
    studentName: string;
    studentId: string;
    amount: number;
    paymentType: string;
    academicYear: string;
    level: string;
    verifiedAt: string;
  };
}

export function VerifyPage() {
  const [mode, setMode] = useState<VerifyMode>("manual");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [studentId, setStudentId] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("idle");
  const [qrError, setQrError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      formRef.current,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
    );
  }, []);

  // ── Animate result in ─────────────────────────────────────────────────────
  useEffect(() => {
    if (result && resultRef.current) {
      gsap.fromTo(
        resultRef.current,
        { y: 16, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" },
      );
    }
  }, [result]);

  // ── Start QR camera ───────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setQrError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      // Poll canvas for QR data every 500ms
      scanIntervalRef.current = setInterval(() => scanFrame(), 500);
    } catch {
      setQrError("Camera access denied. Please use manual entry instead.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (streamRef.current)
      streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (mode === "qr") startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [mode]);

  // ── Scan frame for QR ─────────────────────────────────────────────────────
  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== 4) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    // In production, use a library like jsQR here:
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) handleQRResult(code.data);
  };

  // ── Handle scanned QR payload ─────────────────────────────────────────────
  const handleQRResult = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    let nextReference = "";
    let nextStudentId = "";

    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "object" && parsed !== null) {
        nextReference = String(
          parsed.referenceNumber ||
            parsed.reference ||
            parsed.ref ||
            parsed.receiptReference ||
            parsed.receipt ||
            "",
        );
        nextStudentId = String(
          parsed.studentId ||
            parsed.student ||
            parsed.id ||
            parsed.studentID ||
            parsed.studentIdNumber ||
            "",
        );
      } else if (typeof parsed === "string") {
        nextReference = parsed;
      }
    } catch {
      nextReference = trimmed;
    }

    if (nextReference.includes("TRP") || nextReference.includes("receipt")) {
      setReferenceNumber(nextReference);
      setStudentId(nextStudentId);
      setQrError("");
      setMode("manual");
      stopCamera();

      if (nextReference && nextStudentId) {
        window.setTimeout(() => {
          handleVerify();
        }, 250);
      }
      return;
    }

    setQrError("Could not read QR code. Try manual entry.");
  };

  // ── Verify mutation ───────────────────────────────────────────────────────
  const { mutate: verify, isPending } = useMutation({
    mutationFn: () =>
      verifyApi
        .verifyReceipt(referenceNumber.trim(), studentId.trim())
        .then((r) => r.data),
    onSuccess: (data) => {
      const payload = data as unknown as {
        status: "VALID" | "INVALID" | "DUPLICATE";
        message: string;
        data?: VerifyResult["data"];
      };

      setResult({
        status: payload.status,
        message: payload.message,
        data: payload.data,
      });
      setVerifyStatus(
        payload.status === "VALID"
          ? "valid"
          : payload.status === "DUPLICATE"
            ? "duplicate"
            : "invalid",
      );
    },
    onError: () => {
      setResult({
        status: "INVALID",
        message: "Receipt not found in the system.",
      });
      setVerifyStatus("invalid");
    },
  });

  const handleVerify = () => {
    if (!referenceNumber.trim() || !studentId.trim()) return;
    setResult(null);
    setVerifyStatus("loading");
    verify();
  };

  const handleReset = () => {
    setReferenceNumber("");
    setStudentId("");
    setResult(null);
    setVerifyStatus("idle");
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Verify Receipt</h1>
        <p className="text-sm text-[#8b8fa8] mt-0.5">
          Scan a student QR code or enter details manually
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
        {/* Left: input */}
        <div ref={formRef} className="flex flex-col gap-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            {(["manual", "qr"] as VerifyMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium border transition-all",
                  mode === m
                    ? "bg-[rgba(79,156,249,0.1)] border-[rgba(79,156,249,0.3)] text-[#4f9cf9]"
                    : "border-[rgba(255,255,255,0.07)] text-[#8b8fa8] hover:border-[rgba(255,255,255,0.14)]",
                )}
              >
                {m === "manual" ? (
                  <Search className="w-4 h-4" />
                ) : (
                  <ScanLine className="w-4 h-4" />
                )}
                {m === "manual" ? "Manual Entry" : "Scan QR Code"}
              </button>
            ))}
          </div>

          {/* QR scanner */}
          {mode === "qr" && (
            <Card>
              <CardBody>
                <div className="relative rounded-xl overflow-hidden bg-[#0f1420] aspect-video flex items-center justify-center">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {/* Scan overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#4f9cf9] rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#4f9cf9] rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#4f9cf9] rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#4f9cf9] rounded-br-lg" />
                      {/* Scan line */}
                      <div
                        className="absolute inset-x-0 top-1/2 h-0.5 bg-[#4f9cf9] opacity-70"
                        style={{
                          animation: "scan-line 2s ease-in-out infinite",
                        }}
                      />
                    </div>
                  </div>
                </div>
                {qrError && (
                  <p className="text-[12px] text-[#ff5757] mt-3 text-center">
                    {qrError}
                  </p>
                )}
                <p className="text-[12px] text-[#8b8fa8] text-center mt-3">
                  Point camera at the student's TrustPay QR code
                </p>
              </CardBody>
            </Card>
          )}

          {/* Manual entry */}
          {mode === "manual" && (
            <Card>
              <CardHeader>
                <CardTitle icon={<Search className="w-4 h-4" />}>
                  Receipt Lookup
                </CardTitle>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                <Input
                  label="Reference Number"
                  placeholder="e.g. TRP-2026-00001"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  icon={<Hash className="w-4 h-4" />}
                />
                <Input
                  label="Student ID"
                  placeholder="e.g. UB23T1842"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  icon={<User className="w-4 h-4" />}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleVerify}
                    loading={isPending}
                    disabled={!referenceNumber.trim() || !studentId.trim()}
                    className="flex-1 justify-center"
                    icon={<Search className="w-4 h-4" />}
                  >
                    Verify Receipt
                  </Button>
                  {(referenceNumber || studentId || result) && (
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      icon={<RotateCcw className="w-4 h-4" />}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right: result */}
        <div>
          {!result && verifyStatus === "idle" && (
            <Card>
              <CardBody>
                <div className="flex flex-col items-center py-10 gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[rgba(79,156,249,0.08)] flex items-center justify-center">
                    <ScanLine className="w-6 h-6 text-[#4f9cf9]" />
                  </div>
                  <p className="text-[13.5px] font-semibold">
                    Awaiting verification
                  </p>
                  <p className="text-[12px] text-[#8b8fa8] leading-relaxed max-w-[220px]">
                    Enter a reference number and student ID, or scan a QR code
                    to verify a receipt.
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {result && (
            <div ref={resultRef}>
              <VerifyResultCard result={result} />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan-line {
          0%, 100% { transform: translateY(-60px); opacity: 0.4; }
          50% { transform: translateY(60px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Verify result card ───────────────────────────────────────────────────────
function VerifyResultCard({ result }: { result: VerifyResult }) {
  const isValid = result.status === "VALID";
  const isDuplicate = result.status === "DUPLICATE";
  const isInvalid = result.status === "INVALID";

  const statusConfig = {
    VALID: {
      icon: <CheckCircle2 className="w-6 h-6 text-[#00e5a0]" />,
      bg: "bg-[rgba(0,229,160,0.06)] border-[rgba(0,229,160,0.2)]",
      iconBg: "bg-[rgba(0,229,160,0.1)]",
      title: "Payment Verified",
      badge: (
        <Badge variant="success" dot>
          Valid
        </Badge>
      ),
    },
    DUPLICATE: {
      icon: <AlertTriangle className="w-6 h-6 text-[#f5a623]" />,
      bg: "bg-[rgba(245,166,35,0.06)] border-[rgba(245,166,35,0.2)]",
      iconBg: "bg-[rgba(245,166,35,0.1)]",
      title: "Already Verified",
      badge: (
        <Badge variant="pending" dot>
          Duplicate
        </Badge>
      ),
    },
    INVALID: {
      icon: <XCircle className="w-6 h-6 text-[#ff5757]" />,
      bg: "bg-[rgba(255,87,87,0.06)] border-[rgba(255,87,87,0.2)]",
      iconBg: "bg-[rgba(255,87,87,0.1)]",
      title: "Invalid Receipt",
      badge: (
        <Badge variant="failed" dot>
          Invalid
        </Badge>
      ),
    },
  }[result.status];

  return (
    <Card className={cn("border", statusConfig.bg)}>
      <CardBody className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
              statusConfig.iconBg,
            )}
          >
            {statusConfig.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-semibold">{statusConfig.title}</p>
              {statusConfig.badge}
            </div>
            <p className="text-[12px] text-[#8b8fa8] mt-0.5">
              {result.message}
            </p>
          </div>
        </div>

        {/* Details — only for valid/duplicate */}
        {result.data && (isValid || isDuplicate) && (
          <div className="bg-[#0f1420] rounded-xl p-4 border border-[rgba(255,255,255,0.06)] flex flex-col gap-3">
            {[
              {
                icon: <User className="w-3.5 h-3.5" />,
                label: "Student",
                value: result.data.studentName,
              },
              {
                icon: <Hash className="w-3.5 h-3.5" />,
                label: "Student ID",
                value: result.data.studentId,
              },
              {
                icon: <CreditCard className="w-3.5 h-3.5" />,
                label: "Amount",
                value: `${formatXAF(result.data.amount)} CFA`,
              },
              {
                icon: <CreditCard className="w-3.5 h-3.5" />,
                label: "Fee Type",
                value: result.data.paymentType,
              },
              {
                icon: <Calendar className="w-3.5 h-3.5" />,
                label: "Academic Year",
                value: result.data.academicYear,
              },
              {
                icon: <GraduationCap className="w-3.5 h-3.5" />,
                label: "Level",
                value: result.data.level,
              },
              {
                icon: <Hash className="w-3.5 h-3.5" />,
                label: "Reference",
                value: result.data.referenceNumber,
              },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="text-[#3e4155] flex-shrink-0">{icon}</span>
                <span className="text-[11px] font-mono text-[#8b8fa8] w-24 flex-shrink-0">
                  {label}
                </span>
                <span className="text-[12.5px] font-medium capitalize truncate">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
