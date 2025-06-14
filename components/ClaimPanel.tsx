// components/ClaimPanel.tsx
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACTS } from "../wagmi.config";
import { useState } from "react";

// Import your ABIs from config folder
// import { memberDropABI, sigmaTokenABI } from "../config/abis";

export function ClaimPanel() {
  const { address } = useAccount();
  const [error, setError] = useState<string | null>(null);

  // Check allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.SIGMA_TOKEN,
    abi: [], // sigmaTokenABI
    functionName: "allowance",
    args: address ? [address, CONTRACTS.MEMBER_DROP] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Write contract hooks
  const { writeContract: writeApprove, data: approveHash } = useWriteContract();
  const { writeContract: writeClaim, data: claimHash } = useWriteContract();

  // Wait for transactions
  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isClaimLoading, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  const price = parseUnits("369000", 18);
  const needsApproval = allowance ? allowance < price : true;

  const handleApprove = async () => {
    if (!address) {
      setError("🔌 Connect your wallet first");
      return;
    }

    try {
      setError(null);
      writeApprove({
        address: CONTRACTS.SIGMA_TOKEN,
        abi: [], // sigmaTokenABI
        functionName: "approve",
        args: [CONTRACTS.MEMBER_DROP, price],
      });
    } catch (e: any) {
      console.error(e);
      setError(`❌ ${e.message || "Approval failed"}`);
    }
  };

  const handleClaim = async () => {
    if (!address) {
      setError("🔌 Connect your wallet first");
      return;
    }

    try {
      setError(null);
      writeClaim({
        address: CONTRACTS.MEMBER_DROP,
        abi: [], // memberDropABI
        functionName: "claim",
        args: [0, 1], // tokenId: 0, quantity: 1
      });
    } catch (e: any) {
      console.error(e);
      const message = e.message || e.reason || "Unknown error";

      if (message.toLowerCase().includes("already claimed") || message.toLowerCase().includes("exceed limit")) {
        setError("❌ You have already claimed your Club Member NFT.");
      } else {
        setError(`❌ ${message}`);
      }
    }
  };

  // Refetch allowance after successful approval
  if (isApproveSuccess) {
    refetchAllowance();
  }

  if (!address) return null;

  if (needsApproval && !isApproveSuccess) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">First, approve spending 369,000 Σ tokens</p>
        </div>
        <button onClick={handleApprove} disabled={isApproveLoading} className="btn neon-purple-outline">
          {isApproveLoading ? "Approving…" : "Approve Σ369 Tokens"}
        </button>
        {error && <p className="mt-2 text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <button onClick={handleClaim} disabled={isClaimLoading} className="btn neon-purple">
        {isClaimLoading ? "Claiming…" : "Claim Member NFT"}
      </button>
      {error && <p className="mt-2 text-red-400">{error}</p>}
      {isClaimSuccess && <p className="mt-2 text-green-400">✅ NFT claimed successfully!</p>}
    </div>
  );
}
