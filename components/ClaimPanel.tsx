// components/ClaimPanel.tsx
import { useContract, useAddress } from "@thirdweb-dev/react";
import { parseUnits } from "ethers/lib/utils";
import { useState } from "react";

export function ClaimPanel() {
  const address = useAddress();
  const { contract: drop,    isLoading: ld } = useContract(
    "0xdbDa9CAfD6f19cB11E23158686e6Fc146e5E37bE",
    "edition-drop"
  );
  const { contract: sigma, isLoading: ls } = useContract(
    "0x4FfF88B8d2cAe7d0e913198DF18B7f6a02850EC5",
    "token"
  );

  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async () => {
    setError(null);
    if (!address) {
      setError("🔌 Connect your wallet first");
      return;
    }
    if (!drop || !sigma) {
      setError("⏳ Contracts still loading…");
      return;
    }

    try {
      setBusy(true);
      const price = parseUnits("369000", 18);
      const addr  = await drop.getAddress();

      // approve Σ369
      const allowance: any = await sigma.call("allowance", [address, addr]);
      if (allowance.lt(price)) {
        await sigma.call("approve", [addr, price]);
      }

      // high-level claim(tokenId=0, qty=1):
      await (drop as any).claim(0, 1);

      alert("✅ Member NFT claimed!");
    } catch (e: any) {
      console.error(e);
      setError(e.reason || e.message || "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  if (!address) return null;

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <button
        onClick={handleClaim}
        disabled={busy || ld || ls}
        className="btn neon-purple"
      >
        {busy ? "Claiming…" : "Claim Member (369k Σ)"}
      </button>
      {error && <p className="mt-2 text-red-400">{error}</p>}
    </div>
  );
}
