import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { CheckCircle2, Loader2, Clock, ArrowLeft, ExternalLink } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { formatXAF, polygonscanTx, cn } from "@/utils";
import type { FeeItem, MintStep, PaymentResponse } from "@/types";

interface MintingScreenProps {
  fee: FeeItem;
  result: PaymentResponse | null;
  steps: MintStep[];
  onBack: () => void;
}

export function MintingScreen({ fee, result, steps, onBack }: MintingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hexRef = useRef<SVGSVGElement>(null);
  const hexInnerRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  const isMinted = result?.sbt?.mintStatus === "minted";
  const isFailed = result?.sbt?.mintStatus === "failed";
  const completedCount = steps.filter(s => s.status === "done").length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  // ── Mount animation ────────────────────────────────────────────────────────
  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }
    );

    // Rotating hex — outer ring
    if (hexRef.current) {
      gsap.to(hexRef.current, {
        rotation: 360,
        duration: 14,
        repeat: -1,
        ease: "none",
        transformOrigin: "center center",
      });
    }

    // Inner hex — counter-rotate slowly
    if (hexInnerRef.current) {
      gsap.to(hexInnerRef.current, {
        rotation: -360,
        duration: 22,
        repeat: -1,
        ease: "none",
        transformOrigin: "center center",
      });
    }

    // Glow pulse while processing
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        scale: 1.15,
        opacity: 0.4,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }, []);

  // ── Success burst ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isMinted || !particlesRef.current) return;

    // Flash glow
    if (glowRef.current) {
      gsap.killTweensOf(glowRef.current);
      gsap.to(glowRef.current, {
        scale: 1.6, opacity: 0.8, duration: 0.3,
        onComplete: () => {
          gsap.to(glowRef.current, { scale: 1.1, opacity: 0.25, duration: 0.6, ease: "power2.out" });
        }
      });
    }

    // Center icon flip
    if (centerRef.current) {
      gsap.fromTo(centerRef.current,
        { scale: 0, rotation: -15 },
        { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)", delay: 0.1 }
      );
    }

    // Particle burst
    const parent = particlesRef.current;
    const colors = ["#00e5a0", "#4f9cf9", "#f5a623", "#00e5a0", "#00e5a0"];
    for (let i = 0; i < 22; i++) {
      const p = document.createElement("div");
      p.style.cssText = `
        position:absolute; width:${4 + Math.random() * 4}px; height:${4 + Math.random() * 4}px;
        border-radius:50%; left:50%; top:50%;
        background:${colors[i % colors.length]};
      `;
      parent.appendChild(p);
      const angle = (i / 22) * Math.PI * 2;
      const dist = 55 + Math.random() * 65;
      gsap.fromTo(p,
        { x: 0, y: 0, opacity: 1, scale: 1 },
        {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          opacity: 0, scale: 0,
          duration: 0.7 + Math.random() * 0.5,
          ease: "power2.out",
          delay: Math.random() * 0.15,
          onComplete: () => p.remove(),
        }
      );
    }

    // Hex flash
    if (hexRef.current) {
      gsap.to(hexRef.current, {
        filter: "brightness(2.5) drop-shadow(0 0 12px #00e5a0)",
        duration: 0.25, yoyo: true, repeat: 1,
        onComplete: () => gsap.set(hexRef.current, { filter: "none" }),
      });
    }
  }, [isMinted]);

  const hexColor = isMinted ? "#00e5a0" : isFailed ? "#ff5757" : "#4f9cf9";
  const glowColor = isMinted
    ? "rgba(0,229,160,0.18)"
    : isFailed
    ? "rgba(255,87,87,0.12)"
    : "rgba(79,156,249,0.12)";

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6 py-4">
      {isMinted && (
        <div className="w-full">
          <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Payments
          </Button>
        </div>
      )}

      <div className="w-full max-w-[500px]">
        {/* ── Hero visual ── */}
        <div className="relative flex items-center justify-center h-[220px] mb-6">
          {/* Outer glow */}
          <div
            ref={glowRef}
            className="absolute w-[160px] h-[160px] rounded-full"
            style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
          />

          {/* Particles */}
          <div ref={particlesRef} className="absolute inset-0 flex items-center justify-center pointer-events-none" />

          {/* Rotating hex SVG */}
          <svg ref={hexRef} width="150" height="150" viewBox="0 0 150 150" fill="none" className="absolute">
            {/* Outer hex — dashed */}
            <path
              d="M75 8L138 43V113L75 148L12 113V43L75 8Z"
              stroke={hexColor}
              strokeWidth="1"
              strokeDasharray="8 5"
              fill="none"
              opacity="0.5"
            />
            {/* Mid hex — solid thin */}
            <path
              d="M75 22L124 49.5V104.5L75 132L26 104.5V49.5L75 22Z"
              stroke={hexColor}
              strokeWidth="0.5"
              fill="none"
              opacity="0.25"
            />
          </svg>

          {/* Inner counter-rotating hex */}
          <svg width="150" height="150" viewBox="0 0 150 150" fill="none" className="absolute">
            <path
              ref={hexInnerRef}
              d="M75 36L108 55V93L75 112L42 93V55L75 36Z"
              stroke={hexColor}
              strokeWidth="1"
              strokeDasharray="4 6"
              fill="none"
              opacity="0.3"
            />
          </svg>

          {/* Center icon */}
          <div
            ref={centerRef}
            className={cn(
              "w-[72px] h-[72px] rounded-[20px] flex items-center justify-center z-10 transition-colors duration-500",
              isMinted
                ? "bg-[#00e5a0]"
                : isFailed
                ? "bg-[rgba(255,87,87,0.15)] border border-[rgba(255,87,87,0.3)]"
                : "bg-[#0f1420] border border-[rgba(79,156,249,0.3)]"
            )}
          >
            {isMinted ? (
              <CheckCircle2 className="w-9 h-9 text-[#050708]" />
            ) : isFailed ? (
              <span className="text-[#ff5757] text-[28px]">✕</span>
            ) : (
              <Loader2 className="w-8 h-8 text-[#4f9cf9] animate-spin" />
            )}
          </div>
        </div>

        {/* ── Status text ── */}
        <div className="text-center mb-6">
          <h2 className="text-[18px] font-semibold mb-1.5">
            {isMinted
              ? "Payment Confirmed! 🎉"
              : isFailed
              ? "Receipt saved — verification pending"
              : "Processing your payment…"}
          </h2>
          <p className="text-[13px] text-[#8b8fa8] leading-relaxed max-w-[360px] mx-auto">
            {isMinted
              ? "Your receipt is permanently secured and tamper-proof. It can never be modified or shared."
              : isFailed
              ? "Your payment was recorded successfully. Receipt verification will complete shortly."
              : "This usually takes a few seconds. Please keep this page open."}
          </p>
        </div>

        {/* ── Progress bar ── */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-[#8b8fa8] uppercase tracking-wide">Progress</span>
            <span className="text-[11px] font-mono text-[#8b8fa8]">{completedCount}/{steps.length} steps</span>
          </div>
          <div className="h-1 bg-[#141926] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: isMinted ? "#00e5a0" : "linear-gradient(90deg, #4f9cf9, #00e5a0)",
              }}
            />
          </div>
        </div>

        {/* ── Fee summary ── */}
        <div className="bg-[#0f1420] rounded-xl p-4 mb-5 border border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10.5px] font-mono uppercase tracking-wide text-[#8b8fa8] mb-0.5">Paying for</p>
              <p className="text-[14px] font-semibold">{fee.label}</p>
            </div>
            <div className="text-right">
              <p className="text-[10.5px] font-mono uppercase tracking-wide text-[#8b8fa8] mb-0.5">Amount</p>
              <p className="font-mono font-bold text-[17px] text-[#00e5a0]">{formatXAF(fee.amount)} CFA</p>
            </div>
          </div>
          {result && (
            <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <span className="text-[11px] text-[#8b8fa8]">Reference</span>
              <span className="text-[11.5px] font-mono text-[#e8eaf0]">{result.referenceNumber}</span>
            </div>
          )}
        </div>

        {/* ── Steps ── */}
        <div className="flex flex-col mb-6">
          {steps.map((step, i) => (
            <StepRow key={step.id} step={step} isLast={i === steps.length - 1} />
          ))}
        </div>

        {/* ── Actions on success ── */}
        {isMinted && result && (
          <div className="flex gap-3">
            {result.sbt?.transactionHash && (
              <a
                href={polygonscanTx(result.sbt.transactionHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" size="md" icon={<ExternalLink className="w-3.5 h-3.5" />} className="w-full justify-center">
                  Verify Receipt
                </Button>
              </a>
            )}
            <Button size="md" className="flex-1 justify-center" onClick={onBack}>
              Done
            </Button>
          </div>
        )}

        {isFailed && (
          <Button size="md" className="w-full justify-center" onClick={onBack}>
            Back to Payments
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Step row ─────────────────────────────────────────────────────────────────
function StepRow({ step, isLast }: { step: MintStep; isLast: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step.status === "active" && ref.current) {
      gsap.fromTo(ref.current,
        { backgroundColor: "rgba(79,156,249,0.0)" },
        { backgroundColor: "rgba(79,156,249,0.04)", duration: 0.3, yoyo: true, repeat: 1 }
      );
    }
  }, [step.status]);

  const iconMap = {
    done: <CheckCircle2 className="w-3.5 h-3.5 text-[#00e5a0]" />,
    active: <Loader2 className="w-3.5 h-3.5 text-[#f5a623] animate-spin" />,
    queued: <span className="w-1.5 h-1.5 rounded-full bg-[#3e4155]" />,
    error: <span className="text-[#ff5757] text-[13px]">✕</span>,
  };

  const bgMap = {
    done: "bg-[rgba(0,229,160,0.10)]",
    active: "bg-[rgba(245,166,35,0.10)]",
    queued: "bg-[rgba(255,255,255,0.04)]",
    error: "bg-[rgba(255,87,87,0.10)]",
  };

  // Plain language labels — no blockchain jargon
  const friendlyLabel: Record<string, string> = {
    payment: "Payment received",
    verify: "Amount confirmed",
    ipfs: "Receipt saved securely",
    mint: "Receipt being issued",
    notify: "Receipt delivered",
  };

  const friendlyDetail: Record<string, string> = {
    payment: "Mobile Money payment confirmed",
    verify: "Payment amount verified",
    ipfs: "Receipt details stored permanently",
    mint: "Securing your receipt",
    notify: "All done",
  };

  const label = friendlyLabel[step.id] ?? step.label;
  const detail = step.detail ?? (step.status === "queued" ? "Waiting…" : friendlyDetail[step.id] ?? step.description);

  return (
    <div ref={ref} className="flex gap-3 rounded-xl p-2 -mx-2 transition-colors duration-200">
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300",
          bgMap[step.status]
        )}>
          {iconMap[step.status]}
        </div>
        {!isLast && <div className="w-px flex-1 bg-[rgba(255,255,255,0.06)] my-1" style={{ minHeight: "16px" }} />}
      </div>
      <div className="pb-3 min-w-0 pt-0.5">
        <p className={cn(
          "text-[12.5px] font-medium leading-snug",
          step.status === "queued" ? "text-[#3e4155]" : "text-[#e8eaf0]"
        )}>
          {label}
        </p>
        {step.status !== "queued" && (
          <p className="text-[11px] font-mono text-[#8b8fa8] mt-0.5 truncate">{detail}</p>
        )}
      </div>
    </div>
  );
}
