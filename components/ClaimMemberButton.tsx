import React, { useState } from "react";
import { useContract, useAddress } from "@thirdweb-dev/react";
import { parseUnits } from "ethers/lib/utils";

export function ClaimMemberButton() {
  const address = useAddress();
  const { contract: drop,    isLoading: loadingDrop }  = useContract(
    "0xdbDa9CAfD6f19cB11E23158686e6Fc146e5E37bE",
    "edition-drop"
  );
  const { contract: sigma,  isLoading: loadingSigma } = useContract(
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
      setError("⏳ Contracts are still loading…");
      return;
    }

    try {
      setBusy(true);

      // 1) Approve 369k Σ369 if needed
      const price = parseUnits("369000", 18);
      const dropAddr = await drop.getAddress();
      const allowance: any = await sigma.call("allowance", [address, dropAddr]);
      if (allowance.lt(price)) {
        await sigma.call("approve", [dropAddr, price]);
      }

      // 2) Claim tokenId 0, quantity 1
      await (drop as any).claim(0, 1);

      alert("✅ Club Member NFT claimed!");
    } catch (e: any) {
      console.error(e);
      const raw = e?.errorName || e?.reason || e?.message || "";
      const lower = raw.toLowerCase();

      if (
        raw.includes("DropClaimExceedLimit") ||
        lower.includes("exceed limit") ||
        lower.includes("already claimed") ||
        lower.includes("not valid json") ||
        lower.includes("unexpected token")
      ) {
        setError("❌ You have already claimed your Club Member NFT.");
      } else {
        setError(`❌ ${raw}`);
      }
    } finally {
      setBusy(false);
    }
  };

  if (!address) return null;

  return (
    <div className="text-center">
      <button
        onClick={handleClaim}
        disabled={busy || loadingDrop || loadingSigma}
        className="btn-neon"
      >
        {busy ? "Claiming…" : "Claim Member (369k Σ)"}
      </button>
      {error && <p className="mt-2 text-red-400">{error}</p>}
    </div>
  );
}
