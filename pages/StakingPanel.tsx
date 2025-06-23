// components/StakingPanel.tsx
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits } from "viem";
import { CONTRACTS, NFT_TYPES } from "../wagmi.config";
import { memberDropABI, stakingABI } from "../abis";
import { useState, useEffect } from "react";

export default function StakingPanel() {
  const { address } = useAccount();
  const [selectedNFT, setSelectedNFT] = useState<"MEMBER" | "VIP">("MEMBER");
  const [error, setError] = useState<string | null>(null);
  if (!address) return;
  const currentNFT = NFT_TYPES[selectedNFT];

  // Check NFT balance for both types
  const { data: memberBalance } = useReadContract({
    address: CONTRACTS.MEMBER_DROP,
    abi: memberDropABI,
    functionName: "balanceOf",
    args: [address, BigInt(0)],
    query: {
      enabled: !!address,
    },
  });

  const { data: vipBalance } = useReadContract({
    address: CONTRACTS.VIP_DROP,
    abi: memberDropABI,
    functionName: "balanceOf",
    args: [address, BigInt(0)],
    query: {
      enabled: !!address,
    },
  });

  // Check if NFT is approved for staking
  const { data: isApproved, refetch: refetchApproval } = useReadContract({
    address: currentNFT.contract,
    abi: memberDropABI,
    functionName: "isApprovedForAll",
    args: address ? [address, currentNFT.stakingContract] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Get staking info for current NFT type
  const { data: stakeInfo, refetch: refetchStakeInfo } = useReadContract({
    address: currentNFT.stakingContract,
    abi: stakingABI,
    functionName: "getUserStakeInfo",
    args: [address, BigInt(currentNFT.tokenId)],
    query: {
      enabled: !!address,
    },
  });

  // Write contract hooks
  const { writeContract: writeApproval, data: approvalHash } =
    useWriteContract();
  const { writeContract: writeStake, data: stakeHash } = useWriteContract();
  const { writeContract: writeUnstake, data: unstakeHash } = useWriteContract();
  const { writeContract: writeClaim, data: claimHash } = useWriteContract();

  // Wait for transactions
  const { isLoading: isApprovalLoading, isSuccess: isApprovalSuccess } =
    useWaitForTransactionReceipt({
      hash: approvalHash,
    });

  const { isLoading: isStakeLoading, isSuccess: isStakeSuccess } =
    useWaitForTransactionReceipt({
      hash: stakeHash,
    });

  const { isLoading: isUnstakeLoading, isSuccess: isUnstakeSuccess } =
    useWaitForTransactionReceipt({
      hash: unstakeHash,
    });

  const { isLoading: isClaimLoading, isSuccess: isClaimSuccess } =
    useWaitForTransactionReceipt({
      hash: claimHash,
    });

  // Determine current NFT balance and ownership
  const currentBalance = selectedNFT === "MEMBER" ? memberBalance : vipBalance;
  const hasNFT = currentBalance && currentBalance > 0;

  // Extract staking data
  const isStaked = stakeInfo ? (stakeInfo as any)[0] || false : false;
  const stakedTime = stakeInfo ? (stakeInfo as any)[1] || 0 : 0;
  const pendingRewards = stakeInfo ? (stakeInfo as any)[2] || 0 : 0;

  // Auto-select NFT type based on what user owns
  useEffect(() => {
    if (
      memberBalance &&
      memberBalance > 0 &&
      (!vipBalance || Number(vipBalance) === 0)
    ) {
      setSelectedNFT("MEMBER");
    } else if (vipBalance && vipBalance > 0) {
      setSelectedNFT("VIP");
    }
  }, [memberBalance, vipBalance]);

  // Refetch data after successful transactions
  useEffect(() => {
    if (
      isApprovalSuccess ||
      isStakeSuccess ||
      isUnstakeSuccess ||
      isClaimSuccess
    ) {
      refetchApproval();
      refetchStakeInfo();
    }
  }, [isApprovalSuccess, isStakeSuccess, isUnstakeSuccess, isClaimSuccess]);

  const handleApproval = async () => {
    if (!address) return;

    try {
      setError(null);
      writeApproval({
        address: currentNFT.contract,
        abi: memberDropABI,
        functionName: "setApprovalForAll",
        args: [currentNFT.stakingContract, true],
      });
    } catch (error: any) {
      console.error("Approval error:", error);
      setError(`❌ ${error.message || "Approval failed"}`);
    }
  };

  const handleStake = async () => {
    if (!address) return;

    try {
      setError(null);
      writeStake({
        address: currentNFT.stakingContract,
        abi: stakingABI,
        functionName: "stake",
        args: [BigInt(currentNFT.tokenId)],
      });
    } catch (error: any) {
      console.error("Staking error:", error);
      setError(`❌ ${error.message || "Staking failed"}`);
    }
  };

  const handleUnstake = async () => {
    if (!address) return;

    try {
      setError(null);
      writeUnstake({
        address: currentNFT.stakingContract,
        abi: stakingABI,
        functionName: "unstake",
        args: [BigInt(currentNFT.tokenId)],
      });
    } catch (error: any) {
      console.error("Unstaking error:", error);
      setError(`❌ ${error.message || "Unstaking failed"}`);
    }
  };

  const handleClaim = async () => {
    if (!address) return;

    try {
      setError(null);
      writeClaim({
        address: currentNFT.stakingContract,
        abi: stakingABI,
        functionName: "claimRewards",
        args: [BigInt(currentNFT.tokenId)],
      });
    } catch (error: any) {
      console.error("Claiming error:", error);
      setError(`❌ ${error.message || "Claiming failed"}`);
    }
  };

  if (!address) return null;

  // Show NFT selection if user has multiple types
  const hasMember = memberBalance && memberBalance > 0;
  const hasVIP = vipBalance && vipBalance > 0;
  const hasMultiple = hasMember && hasVIP;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* NFT Selection (if user has multiple) */}
      {hasMultiple && (
        <div className="card-neon">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Select NFT to Stake
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedNFT("MEMBER")}
              className={`p-4 rounded-lg border transition-all ${
                selectedNFT === "MEMBER"
                  ? "border-purple-400 bg-purple-900/20"
                  : "border-gray-600 hover:border-purple-500/50"
              }`}
            >
              <div className="text-2xl mb-2">🏅</div>
              <div className="text-sm font-semibold">Member NFT</div>
              <div className="text-xs text-gray-400">0.369 PLS/sec</div>
            </button>
            <button
              onClick={() => setSelectedNFT("VIP")}
              className={`p-4 rounded-lg border transition-all ${
                selectedNFT === "VIP"
                  ? "border-pink-400 bg-pink-900/20"
                  : "border-gray-600 hover:border-pink-500/50"
              }`}
            >
              <div className="text-2xl mb-2">👑</div>
              <div className="text-sm font-semibold">VIP NFT</div>
              <div className="text-xs text-gray-400">0.963 PLS/sec</div>
            </button>
          </div>
        </div>
      )}

      {!hasNFT ? (
        <div className="card-neon text-center">
          <div className="text-4xl mb-4">🎁</div>
          <h3 className="text-white text-lg font-semibold mb-2">
            No {currentNFT.name} Found
          </h3>
          <p className="text-gray-400 mb-4">
            You need to own a {currentNFT.name} to stake
          </p>
          <a href="/claim" className="btn-neon inline-block">
            Claim NFT First
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Staking Status */}
          <div className="card-neon">
            <h3 className="text-lg font-semibold mb-4 text-center">
              {currentNFT.name} Staking Status
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl mb-2">{isStaked ? "🔒" : "🔓"}</div>
                <div className="font-semibold">
                  {isStaked ? "Staked" : "Not Staked"}
                </div>
                <div className="text-sm text-gray-400">
                  {isStaked
                    ? `Since ${new Date(
                        Number(stakedTime) * 1000
                      ).toLocaleDateString()}`
                    : "Ready to stake"}
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl mb-2">💰</div>
                <div className="font-semibold">
                  {parseFloat(formatUnits(pendingRewards || 0, 18)).toFixed(4)}{" "}
                  PLS
                </div>
                <div className="text-sm text-gray-400">Pending Rewards</div>
              </div>
            </div>

            {/* Reward Rate Info */}
            <div className="text-center mb-6 p-3 bg-gray-800/50 rounded">
              <div className="text-sm text-gray-400">Earning Rate</div>
              <div className="font-semibold text-green-400">
                {currentNFT.rewardRate} PLS per second
              </div>
              <div className="text-xs text-gray-500">
                ≈ {(parseFloat(currentNFT.rewardRate) * 86400).toLocaleString()}{" "}
                PLS per day
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isApproved && !isApprovalSuccess ? (
                <button
                  onClick={handleApproval}
                  disabled={isApprovalLoading}
                  className="btn neon-purple-outline w-full"
                >
                  {isApprovalLoading ? "Approving…" : "Approve for Staking"}
                </button>
              ) : !isStaked ? (
                <button
                  onClick={handleStake}
                  disabled={isStakeLoading}
                  className="btn neon-purple w-full"
                >
                  {isStakeLoading ? "Staking…" : "Stake NFT"}
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleClaim}
                    disabled={
                      isClaimLoading || !pendingRewards || pendingRewards === 0
                    }
                    className="btn neon-purple"
                  >
                    {isClaimLoading ? "Claiming…" : "Claim Rewards"}
                  </button>
                  <button
                    onClick={handleUnstake}
                    disabled={isUnstakeLoading}
                    className="btn neon-purple-outline"
                  >
                    {isUnstakeLoading ? "Unstaking…" : "Unstake"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Success Messages */}
          {isStakeSuccess && (
            <div className="card-neon border-green-500/50 text-center">
              <p className="text-green-400">
                ✅ NFT staked successfully! You're now earning rewards.
              </p>
            </div>
          )}

          {isClaimSuccess && (
            <div className="card-neon border-green-500/50 text-center">
              <p className="text-green-400">✅ Rewards claimed successfully!</p>
            </div>
          )}

          {isUnstakeSuccess && (
            <div className="card-neon border-yellow-500/50 text-center">
              <p className="text-yellow-400">
                ⚠️ NFT unstaked. You're no longer earning rewards.
              </p>
            </div>
          )}

          {error && (
            <div className="card-neon border-red-500/50 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
