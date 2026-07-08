import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import {
  BarChart3, TrendingUp, Users, ShieldCheck,
  Clock, XCircle, CreditCard,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/services/adminApi";
import { Card, CardHeader, CardTitle, CardBody, StatCard, Skeleton } from "@/components/ui";
import { formatXAF, currentAcademicYear, cn } from "@/utils";

const ACADEMIC_YEARS = ["2025/2026", "2024/2025", "2023/2024"];

export function AnalyticsPage() {
  const [year, setYear] = useState(currentAcademicYear());
  const statsRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", year],
    queryFn: () => analyticsApi.getDashboardStats(year).then(r => r.data.data),
  });

  useEffect(() => {
    if (!data || !statsRef.current) return;
    gsap.fromTo(
      statsRef.current.children,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.07, duration: 0.4, ease: "power2.out" }
    );
  }, [data]);

  useEffect(() => {
    if (!data?.revenueByType || !chartRef.current) return;
    const bars = chartRef.current.querySelectorAll(".bar-fill");
    gsap.fromTo(bars,
      { scaleY: 0, transformOrigin: "bottom" },
      { scaleY: 1, stagger: 0.08, duration: 0.5, ease: "power2.out" }
    );
  }, [data]);

  const stats = data;
  const maxRevenue = Math.max(...(stats?.revenueByType?.map(r => r.total) ?? [1]));

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-[#8b8fa8] mt-0.5">Financial overview for {year}</p>
        </div>
        {/* Year selector */}
        <div className="flex gap-2">
          {ACADEMIC_YEARS.map(y => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] font-mono border transition-all",
                year === y
                  ? "bg-[rgba(79,156,249,0.1)] text-[#4f9cf9] border-[rgba(79,156,249,0.25)]"
                  : "text-[#8b8fa8] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.14)]"
              )}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard
            label="Total Revenue"
            value={`${formatXAF(stats?.totalRevenue ?? 0)} CFA`}
            subtext={`${stats?.totalPayments ?? 0} successful payments`}
            accent="green"
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <StatCard
            label="Total Students"
            value={(stats?.totalStudents ?? 0).toString()}
            subtext="Registered accounts"
            accent="blue"
            icon={<Users className="w-4 h-4" />}
          />
          <StatCard
            label="Verified Receipts"
            value={(stats?.verifiedReceipts ?? 0).toString()}
            subtext="Blockchain confirmed"
            accent="green"
            icon={<ShieldCheck className="w-4 h-4" />}
          />
          <StatCard
            label="Pending Verification"
            value={(stats?.pendingVerifications ?? 0).toString()}
            subtext="Awaiting processing"
            accent="amber"
            icon={<Clock className="w-4 h-4" />}
          />
          <StatCard
            label="Failed Payments"
            value={(stats?.failedPayments ?? 0).toString()}
            subtext="Declined or timed out"
            accent="red"
            icon={<XCircle className="w-4 h-4" />}
          />
          <StatCard
            label="Success Rate"
            value={
              stats?.totalPayments
                ? `${Math.round((stats.verifiedReceipts / stats.totalPayments) * 100)}%`
                : "—"
            }
            subtext="Payments confirmed"
            accent="blue"
            icon={<CreditCard className="w-4 h-4" />}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by fee type */}
        <Card>
          <CardHeader>
            <CardTitle icon={<BarChart3 className="w-4 h-4" />}>Revenue by Fee Type</CardTitle>
            <span className="text-[10.5px] font-mono text-[#8b8fa8]">{year}</span>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : (
              <div ref={chartRef} className="flex flex-col gap-3">
                {(stats?.revenueByType ?? []).map((item) => {
                  const pct = Math.round((item.total / maxRevenue) * 100);
                  return (
                    <div key={item._id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12.5px] font-medium capitalize">{item._id}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-[#8b8fa8]">{item.count} payments</span>
                          <span className="text-[12px] font-mono font-bold text-[#00e5a0]">
                            {formatXAF(item.total)} CFA
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-[#141926] rounded-full overflow-hidden">
                        <div
                          className="bar-fill h-full rounded-full bg-gradient-to-r from-[#4f9cf9] to-[#00e5a0]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {(!stats?.revenueByType || stats.revenueByType.length === 0) && (
                  <p className="text-[13px] text-[#3e4155] text-center py-8">No data for this period</p>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Payments by level */}
        <Card>
          <CardHeader>
            <CardTitle icon={<Users className="w-4 h-4" />}>Payments by Year Level</CardTitle>
            <span className="text-[10.5px] font-mono text-[#8b8fa8]">{year}</span>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {(stats?.paymentsByLevel ?? []).map((item) => {
                  const maxLevel = Math.max(...(stats?.paymentsByLevel?.map(l => l.count) ?? [1]));
                  const pct = Math.round((item.count / maxLevel) * 100);
                  return (
                    <div key={item._id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12.5px] font-medium">{item._id}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-[#8b8fa8]">{item.count} payments</span>
                          <span className="text-[12px] font-mono font-bold text-[#4f9cf9]">
                            {formatXAF(item.total)} CFA
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-[#141926] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#4f9cf9]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {(!stats?.paymentsByLevel || stats.paymentsByLevel.length === 0) && (
                  <p className="text-[13px] text-[#3e4155] text-center py-8">No data for this period</p>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
