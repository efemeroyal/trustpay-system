import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/store/NotificationContext";
import { wsManager } from "./websocket";

export function useRealtimeUpdates() {
  const queryClient = useQueryClient();
  const { add } = useNotifications();

  useEffect(() => {
    const offPayment = wsManager.on("payment_confirmed", () => {
      queryClient.invalidateQueries(["my-payments"]);
      queryClient.invalidateQueries(["my-receipts"]);
      queryClient.invalidateQueries(["installments"]);
      add({
        type: "success",
        title: "Payment updated",
        message: "Your transaction status has changed.",
      });
    });

    const offMint = wsManager.on("mint_complete", () => {
      queryClient.invalidateQueries(["my-receipts"]);
      add({
        type: "success",
        title: "Receipt minted",
        message: "Your receipt has been confirmed on-chain.",
      });
    });

    const offFail = wsManager.on("tx_failed", () => {
      queryClient.invalidateQueries(["my-payments"]);
      add({
        type: "error",
        title: "Transaction failed",
        message: "A payment or mint transaction failed. Check your receipts.",
      });
    });

    return () => {
      offPayment();
      offMint();
      offFail();
    };
  }, [queryClient, add]);
}
