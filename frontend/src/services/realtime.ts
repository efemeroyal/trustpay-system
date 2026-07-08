import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/store/NotificationContext";
import { useAuth } from "@/store/AuthContext";
import { wsManager } from "./websocket";

export function useRealtimeUpdates() {
  const queryClient = useQueryClient();
  const { add } = useNotifications();
  const { user } = useAuth();

  useEffect(() => {
    const offPayment = wsManager.on("payment_confirmed", () => {
      queryClient.invalidateQueries(["my-payments"]);
      queryClient.invalidateQueries(["my-receipts"]);
      queryClient.invalidateQueries(["installments"]);
      queryClient.invalidateQueries(["admin-receipts"]);
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      add({
        type: "success",
        title: "Payment updated",
        message: "Your transaction status has changed.",
      });
    });

    const offMint = wsManager.on("mint_complete", () => {
      queryClient.invalidateQueries(["my-receipts"]);
      queryClient.invalidateQueries(["admin-receipts"]);
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      add({
        type: "success",
        title: "Receipt minted",
        message: "Your receipt has been confirmed on-chain.",
      });
    });

    const offFail = wsManager.on("tx_failed", () => {
      queryClient.invalidateQueries(["my-payments"]);
      queryClient.invalidateQueries(["admin-receipts"]);
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      add({
        type: "error",
        title: "Transaction failed",
        message: "A payment or mint transaction failed. Check your receipts.",
      });
    });

    const offValidated = wsManager.on("receipt_validated", (payload) => {
      const studentId = payload.studentId as string | undefined;
      if (
        user?.role === "admin" ||
        (studentId && user?.studentId && studentId !== user.studentId)
      ) {
        return;
      }
      queryClient.invalidateQueries(["my-receipts"]);
      queryClient.invalidateQueries(["admin-receipts"]);
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      add({
        type: "success",
        title: "Receipt validated",
        message: "Your receipt has been approved by an admin.",
      });
    });

    const offRejected = wsManager.on("receipt_rejected", (payload) => {
      const studentId = payload.studentId as string | undefined;
      if (
        user?.role === "admin" ||
        (studentId && user?.studentId && studentId !== user.studentId)
      ) {
        return;
      }
      queryClient.invalidateQueries(["my-receipts"]);
      queryClient.invalidateQueries(["admin-receipts"]);
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      add({
        type: "error",
        title: "Receipt rejected",
        message:
          "Your receipt was rejected by an admin. Please review the reason.",
      });
    });

    return () => {
      offPayment();
      offMint();
      offFail();
      offValidated();
      offRejected();
    };
  }, [queryClient, add, user?.role, user?.studentId]);
}
