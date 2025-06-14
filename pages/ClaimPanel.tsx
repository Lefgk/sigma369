// components/ClaimPanel.tsx
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseUnits } from "viem";
import { CONTRACTS, NFT_TYPES } from "../wagmi.config";
import { memberDropABI, sigmaTokenABI } from "../abis";
import { useState } from "react";

interface ClaimPanelProps {
  nftType?: "MEMBER" | "VIP";
}

export default function ClaimPanel({ nftType = "MEMBER" }: ClaimPanelProps) {
  const { address } = useAccount();
  const [error, setError] = useState<string | null>(null);

  const currentNFT = NFT_TYPES[nftType];
  const price = parseUnits(currentNFT.price, 18);

  // Check allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.SIGMA_TOKEN,
    abi: sigmaTokenABI,
    functionName: "allowance",
    args: address ? [address, currentNFT.contract] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Check user's Sigma token balance
  const { data: sigmaBalance } = useReadContract({
    address: CONTRACTS.SIGMA_TOKEN,
    abi: sigmaTokenABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
  if (!address) return;
  // Check if user already owns the NFT
  const { data: nftBalance } = useReadContract({
    address: currentNFT.contract,
    abi: memberDropABI,
    functionName: "balanceOf",
    args: [address, BigInt(currentNFT.tokenId)],
    query: {
      enabled: !!address,
    },
  });

  // Write contract hooks
  const { writeContract: writeApprove, data: approveHash } = useWriteContract();
  const { writeContract: writeClaim, data: claimHash } = useWriteContract();

  // Wait for transactions
  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  const { isLoading: isClaimLoading, isSuccess: isClaimSuccess } =
    useWaitForTransactionReceipt({
      hash: claimHash,
    });

  const needsApproval = allowance ? allowance < price : true;
  const hasEnoughTokens = sigmaBalance ? sigmaBalance >= price : false;
  const alreadyOwnsNFT = nftBalance ? nftBalance > 0 : false;

  const handleApprove = async () => {
    if (!address) {
      setError("🔌 Connect your wallet first");
      return;
    }

    if (!hasEnoughTokens) {
      setError(
        `❌ Insufficient Sigma 369 tokens. Need ${currentNFT.price.toLocaleString()}`
      );
      return;
    }

    try {
      setError(null);
      writeApprove({
        address: CONTRACTS.SIGMA_TOKEN,
        abi: sigmaTokenABI,
        functionName: "approve",
        args: [currentNFT.contract, price],
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

    if (!hasEnoughTokens) {
      setError(
        `❌ Insufficient Sigma 369 tokens. Need ${currentNFT.price.toLocaleString()}`
      );
      return;
    }

    if (alreadyOwnsNFT) {
      setError(`❌ You already own a ${currentNFT.name}`);
      return;
    }

    try {
      setError(null);
      writeClaim({
        address: currentNFT.contract,
        abi: memberDropABI,
        functionName: "claim",
        args: [BigInt(currentNFT.tokenId), BigInt(1)], // tokenId, quantity: 1
      });
    } catch (e: any) {
      console.error(e);
      const message = e.message || e.reason || "Unknown error";

      if (
        message.toLowerCase().includes("already claimed") ||
        message.toLowerCase().includes("exceed limit")
      ) {
        setError(`❌ You have already claimed your ${currentNFT.name}.`);
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

  // Show success message if claim was successful
  if (isClaimSuccess) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="card-neon">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-2 text-green-400">Success!</h3>
          <p className="text-green-400 mb-4">
            ✅ {currentNFT.name} claimed successfully!
          </p>
          <p className="text-gray-400 text-sm">
            You can now stake your NFT to earn {currentNFT.rewardRate} PLS per
            second
          </p>
        </div>
      </div>
    );
  }

  // Show if user already owns the NFT
  if (alreadyOwnsNFT) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="card-neon">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold mb-2">Already Claimed!</h3>
          <p className="text-gray-400">You already own a {currentNFT.name}</p>
        </div>
      </div>
    );
  }

  // Show balance info
  const sigmaBalanceFormatted = sigmaBalance
    ? parseFloat(sigmaBalance.toString()) / 1e18
    : 0;

  return (
    <div className="w-full max-w-md mx-auto text-center space-y-4">
      {/* NFT Info Card */}
      <div className="card-neon">
        <h3 className="text-xl font-semibold mb-4">{currentNFT.name}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Price:</span>
            <span className="font-semibold">
              {parseInt(currentNFT.price).toLocaleString()} Σ369
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Reward Rate:</span>
            <span className="font-semibold">
              {currentNFT.rewardRate} PLS/sec
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Your Balance:</span>
            <span
              className={`font-semibold ${
                hasEnoughTokens ? "text-green-400" : "text-red-400"
              }`}
            >
              {sigmaBalanceFormatted.toLocaleString()} Σ369
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!hasEnoughTokens ? (
        <div className="card-neon">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-lg font-semibold mb-2 text-red-400">
            Insufficient Balance
          </h3>
          <p className="text-gray-400 text-sm">
            You need {parseInt(currentNFT.price).toLocaleString()} Sigma 369
            tokens to claim this NFT
          </p>
        </div>
      ) : needsApproval && !isApproveSuccess ? (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">
              First, approve spending{" "}
              {parseInt(currentNFT.price).toLocaleString()} Σ369 tokens
            </p>
          </div>
          <button
            onClick={handleApprove}
            disabled={isApproveLoading}
            className="btn neon-purple-outline w-full"
          >
            {isApproveLoading ? "Approving…" : `Approve Σ369 Tokens`}
          </button>
        </div>
      ) : (
        <button
          onClick={handleClaim}
          disabled={isClaimLoading}
          className="btn neon-purple w-full"
        >
          {isClaimLoading ? "Claiming…" : `Claim ${currentNFT.name}`}
        </button>
      )}

      {error && (
        <div className="card-neon border-red-500/50">
          <p className="text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
