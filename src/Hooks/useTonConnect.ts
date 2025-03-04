import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { Sender, SenderArguments } from "@ton/core";

export function useTonConnect(): {
  sender: Sender;
  connected: boolean;
  userAddress: string;
} {
  const [tonConnectUI] = useTonConnectUI();
  const TONAddress = useTonAddress(true);

  return {
    sender: {
      send: async (args: SenderArguments) => {
        if (!tonConnectUI) {
          throw new Error("TON Connect UI not initialized");
        }
        try {
          await tonConnectUI.sendTransaction({
            messages: [
              {
                address: args.to.toString(),
                amount: args.value.toString(),
                payload: args.body?.toBoc().toString("base64"),
              },
            ],
            validUntil: Date.now() + 5 * 60 * 1000,
          });
        } catch (err) {
          console.error("Transaction error:", err);
          throw err;
        }
      },
    },
    connected: Boolean(tonConnectUI?.connected),
    userAddress: TONAddress || "",
  };
}
